//// Everything a worker is told, assembled: the brief appended to its
//// system prompt, the first task message, and the report schema every turn
//// is held to.
////
//// Split out of `worker.gleam` because the turn loop and the prompt text
//// have nothing to say to each other — the loop reasons about events and
//// verdicts, this module only about words.
////
//// The brief carries `CLAUDE.md` whole, the identity's notebook verbatim,
//// and `docs/prover-cookbook.md` whole. None is trimmed or paraphrased: the
//// notebook is that identity's own continuity, and summarising it would be
//// the harness putting words in an agent's mouth; the cookbook is the cast
//// lemmas checked against this Mathlib pin, and a paraphrase would be a
//// second list of names nobody checked.

import gleam/int
import gleam/json
import gleam/list
import gleam/result
import gleam/string
import harness/config
import harness/dag
import harness/roster
import simplifile

/// The `--json-schema` every worker turn is held to.
pub fn report_schema() -> String {
  let string_field = fn(description: String) {
    json.object([
      #("type", json.string("string")),
      #("description", json.string(description)),
    ])
  }
  json.object([
    #("type", json.string("object")),
    #(
      "properties",
      json.object([
        #(
          "outcome",
          json.object([
            #("type", json.string("string")),
            #(
              "enum",
              json.array(["in_progress", "proved", "abandoned"], json.string),
            ),
          ]),
        ),
        #(
          "estimate",
          json.object([
            #("type", json.string("string")),
            #("enum", json.array(["S", "M", "L", "wall"], json.string)),
          ]),
        ),
        #("summary", string_field("one sentence on the state of the proof")),
        #(
          "notebook",
          string_field(
            "what your future self should know: Mathlib lemmas that worked, dead ends, conventions. Empty until the end.",
          ),
        ),
        #(
          "journal",
          string_field(
            "a short written update for Dib, in your own words. Empty until the end.",
          ),
        ),
        #(
          "bugs",
          json.object([
            #("type", json.string("array")),
            #(
              "items",
              json.object([
                #("type", json.string("object")),
                #(
                  "properties",
                  json.object([
                    #("title", json.object([#("type", json.string("string"))])),
                    #(
                      "area",
                      json.object([
                        #("type", json.string("string")),
                        #(
                          "enum",
                          json.array(
                            [
                              "guard", "dispatch", "verify", "brief", "board",
                              "hooks", "docs", "other",
                            ],
                            json.string,
                          ),
                        ),
                      ]),
                    ),
                    #(
                      "severity",
                      json.object([
                        #("type", json.string("string")),
                        #(
                          "enum",
                          json.array(
                            ["blocks", "friction", "papercut"],
                            json.string,
                          ),
                        ),
                      ]),
                    ),
                    #("body", json.object([#("type", json.string("string"))])),
                  ]),
                ),
                #("required", json.array(["title"], json.string)),
              ]),
            ),
            #(
              "description",
              json.string("harness problems that got in your way, if any"),
            ),
          ]),
        ),
        #(
          "proposals",
          json.object([
            #("type", json.string("array")),
            #(
              "items",
              json.object([
                #("type", json.string("object")),
                #(
                  "properties",
                  json.object([
                    #(
                      "name",
                      string_field(
                        "the theorem's Lean name, snake_case, unique on the board",
                      ),
                    ),
                    #(
                      "statement",
                      string_field(
                        "the full declaration exactly as it would be seeded: `theorem <name> ... := by\\n  sorry`, in the vocabulary of Rule30.Basic",
                      ),
                    ),
                    #(
                      "reason",
                      string_field(
                        "one sentence on why a proof of THIS node would cite it",
                      ),
                    ),
                    #(
                      "size",
                      json.object([
                        #("type", json.string("string")),
                        #("enum", json.array(["S", "M", "L"], json.string)),
                      ]),
                    ),
                    #(
                      "disclaims",
                      string_field(
                        "what this does NOT prove; omit when nothing",
                      ),
                    ),
                    #(
                      "route",
                      json.object([
                        #("type", json.string("object")),
                        #(
                          "properties",
                          json.object([
                            #(
                              "tactics",
                              string_field(
                                "a tactic script that closes the statement, if you have one",
                              ),
                            ),
                            #(
                              "imports",
                              json.object([
                                #("type", json.string("array")),
                                #(
                                  "items",
                                  json.object([
                                    #("type", json.string("string")),
                                  ]),
                                ),
                              ]),
                            ),
                          ]),
                        ),
                        #("required", json.array(["tactics"], json.string)),
                      ]),
                    ),
                    #(
                      "witness",
                      json.object([
                        #("type", json.string("object")),
                        #(
                          "properties",
                          json.object([
                            #(
                              "expression",
                              string_field(
                                "a Bool-valued Lean expression over the range that names the statement's own terms",
                              ),
                            ),
                            #(
                              "range",
                              string_field("the bound to check, e.g. `t < 12`"),
                            ),
                            #(
                              "imports",
                              json.object([
                                #("type", json.string("array")),
                                #(
                                  "items",
                                  json.object([
                                    #("type", json.string("string")),
                                  ]),
                                ),
                              ]),
                            ),
                          ]),
                        ),
                        #(
                          "required",
                          json.array(["expression", "range"], json.string),
                        ),
                      ]),
                    ),
                  ]),
                ),
                #(
                  "required",
                  json.array(["name", "statement", "reason"], json.string),
                ),
              ]),
            ),
            #(
              "description",
              json.string(
                "sub-lemmas you would want seeded so this node could be closed; empty until you have one",
              ),
            ),
          ]),
        ),
      ]),
    ),
    #(
      "required",
      json.array(
        ["outcome", "estimate", "summary", "notebook", "journal"],
        json.string,
      ),
    ),
  ])
  |> json.to_string
}

// --- the brief ---------------------------------------------------------------

/// The text appended to a worker's system prompt: who it is, what the
/// project is, what it may touch, what is already proved, what was already
/// tried here, and how to report — in that order, each under a `##`
/// heading.
pub fn text(
  cfg: config.Config,
  d: dag.Dag,
  node: dag.Node,
  identity: roster.Identity,
  notebook: String,
) -> String {
  string.join(
    [
      who_you_are(node, identity, notebook),
      the_project(cfg),
      your_constraints(cfg, node),
      cast_cookbook(cfg),
      served_lemmas(d),
      prior_attempts(node),
      how_to_report(),
    ],
    "\n\n",
  )
}

fn who_you_are(
  node: dag.Node,
  identity: roster.Identity,
  notebook: String,
) -> String {
  let book = case string.trim(notebook) {
    "" -> "Your notebook is empty: this is its first entry-worthy session."
    _ -> notebook
  }
  "## Who you are\n\nYou are "
  <> identity.name
  <> ", the specialist for region "
  <> node.region
  <> ": "
  <> roster.region_description(node.region)
  <> ".\n\nYour notebook, verbatim — you wrote all of it, and nothing else has:\n\n"
  <> book
}

fn the_project(cfg: config.Config) -> String {
  let claude_md =
    simplifile.read(cfg.repo_root <> "/CLAUDE.md")
    |> result.unwrap("")
  "## The project\n\nThis is `CLAUDE.md` from the repository root, whole:\n\n"
  <> claude_md
}

/// `cfg` is the configuration this attempt runs under — the research
/// ceilings at the top rung of a research node, the ordinary ones
/// otherwise (`config.for_attempt`) — so the ceiling the worker is told is
/// the one its session was launched with.
fn your_constraints(cfg: config.Config, node: dag.Node) -> String {
  "## Your constraints\n\n- This attempt has at most "
  <> int.to_string(cfg.max_turns)
  <> " turns and a budget of $"
  <> roster.usd(cfg.max_budget_usd)
  <> "; the session ends at whichever ceiling comes first, so leave the file building before it does.\n"
  <> "- The only file you may edit is `"
  <> dag.proof_path(node)
  <> "`. Every other write is denied by a hook, not by convention. In particular, never edit `Rule30/Proofs.lean`, the index of closed proofs: the harness adds your import there when the node closes.\n"
  <> "- To read a file use the Read tool; to search use Grep or Glob. Bash `cat`, `grep`, `find`, `head` and `ls` are denied — not because reading is forbidden, but because Bash is allowed for exactly two commands: `lake build "
  <> dag.proof_module(node)
  <> "` and `lake env lean "
  <> dag.proof_path(node)
  <> "` (one file, no flags). One bare command per Bash call — no `|`, `;`, `&&`, `2>&1`, backticks, `$`, `>`, `<`, heredocs or redirection. `lake build` output can be long; read its tail from the tool result rather than piping to `head`. There is no `--run`: to try a quick Lean snippet, put it in your proof file and build.\n"
  <> "- Never `import Rule30.Statements`. The harness checks your proof against the statement file from outside your session, so the two must never see each other.\n"
  <> "- No `sorry`, and no axiom beyond `propext`, `Classical.choice`, `Quot.sound`.\n"
  <> "- The harness verifies with a generated check theorem — `theorem harness_check : type_of% Statements."
  <> node.lean_name
  <> " := "
  <> node.lean_name
  <> "` — against the captain's statement. So your theorem must be named exactly `"
  <> node.lean_name
  <> "` and have exactly the stated type. A weakened or generalized restatement fails, even one you could prove."
}

/// `docs/prover-cookbook.md` inlined, or one line saying it is absent. Read
/// from `cfg.repo_root` at render time rather than pasted into source, so
/// the brief carries whatever the checkout's cookbook says today. It sits
/// right after the constraints because it is what a worker needs while
/// writing tactics, and before the served list because a lemma name from
/// the cookbook is checked against the pin where a guessed one is not.
fn cast_cookbook(cfg: config.Config) -> String {
  let heading =
    "## Casts and names, checked against this pin

"
  case
    simplifile.read(cfg.repo_root <> "/" <> cookbook_file)
    |> result.replace_error(Nil)
  {
    Ok(text) ->
      heading
      <> "This is `"
      <> cookbook_file
      <> "` from the repository root, whole. Read it before writing any cast, absolute value or `omega` call: the lemma names in it are real for this project's Mathlib pin, and a name that is not in it is worth one `exact?` before it is worth a second guess.

"
      <> text
    Error(Nil) -> heading <> "(no " <> cookbook_file <> " in this checkout)"
  }
}

const cookbook_file = "docs/prover-cookbook.md"

fn served_lemmas(d: dag.Dag) -> String {
  let lines =
    dag.served(d)
    |> list.map(fn(n) {
      "- `"
      <> n.lean_name
      <> "` in `"
      <> dag.proof_module(n)
      <> "` — "
      <> n.description
    })
  case lines {
    [] ->
      "## Served lemmas\n\nNothing is proved yet. You are working from `Rule30.Basic` alone."
    _ ->
      "## Served lemmas\n\nAlready proved, and importable. Use these rather than reproving them:\n\n"
      <> string.join(lines, "\n")
  }
}

fn prior_attempts(node: dag.Node) -> String {
  let entries =
    node.attempts
    |> list.index_map(fn(a, i) {
      "### Attempt "
      <> int.to_string(i + 1)
      <> " — "
      <> a.model
      <> ", "
      <> dag.outcome_to_string(a.outcome)
      <> "\n\n"
      <> a.notes
    })
  case entries {
    [] -> "## Prior attempts on this node\n\nnone"
    _ -> "## Prior attempts on this node\n\n" <> string.join(entries, "\n\n")
  }
}

/// `how_to_report`'s text, exposed so the brief's wording is testable the
/// way the seeder's is.
pub fn how_to_report_text() -> String {
  how_to_report()
}

fn how_to_report() -> String {
  "## How to report\n\n"
  <> "Every turn ends with the structured report the harness asked for. Set `outcome` to `proved` only after `lake build` of your own module has actually succeeded — the harness then verifies your claim independently, and sends you the verdict if it fails. Set `outcome` to `in_progress` while you are still working. When you give up, set `outcome` to `abandoned` and fill in `notebook` and `journal`.\n\n"
  <> "`notebook` is for your future self: Mathlib lemmas that worked, dead ends worth not repeating, conventions. `journal` is a short written update for Dib, in your own words. Leave both empty until the attempt ends, then write them properly — the harness writes those files from your report verbatim, and they are the only voice you have outside this session: there is no channel to a peer, so anything another identity should know goes in the notebook, and anything Dib should know goes in the journal.\n\n"
  <> "A bug is the **harness** getting in your way: a command the guard refused that you needed, a brief that told you something untrue, a verifier message you could not act on, a lemma the brief said was served that was not. Lean being difficult is not a bug. A proof you could not find is not a bug. If the obstacle would still exist for a human doing this by hand in an editor, it is not the harness's. The framework agents maintain the harness and read these; file what actually cost you turns, and leave the array empty otherwise."
  <> "\n\n`proposals` is your decomposition. When you can see a lemma that would let this node close but that is not on the board, propose it: a Lean name, the full declaration exactly as it would be seeded (`theorem <name> ... := by` and a `sorry` line, in the vocabulary of `Rule30.Basic` — a seeded statement cannot import a proof file; name any further import in `route.imports`), one sentence on why a proof of this node would cite it, and a size. Add a `route` if you have tactics that close it and a `witness` (a Bool-valued expression over a range that names the statement's own terms) if it can be checked by computation; both are checked by the harness after your attempt ends and reported to the captain, who lands what survives. A proposal is not a claim that the node is hard, and it is weighed by the check and not by which model made it — propose from any rung. A proposal that restates this node under another name, or weakens it, is the one thing the check cannot catch and the captain will; do not send one. Leave the array empty when you have nothing to propose. Proposals are read from the report that ends your attempt; one sent in an earlier turn's report is not kept, so restate it in the last one."
}

// --- the task ----------------------------------------------------------------

/// The first user turn, or the reason there cannot be one. Reads
/// `Rule30/Statements.lean` under `cfg.repo_root`.
pub fn task_message(
  cfg: config.Config,
  node: dag.Node,
) -> Result(String, String) {
  let path = cfg.repo_root <> "/" <> statements_file
  use source <- result.try(
    simplifile.read(path)
    |> result.map_error(fn(e) {
      "cannot read " <> path <> ": " <> simplifile.describe_error(e)
    }),
  )
  task_message_from(node, source)
}

/// `task_message` with the statement file's text supplied — the pure half,
/// so it can be tested without a working directory.
pub fn task_message_from(
  node: dag.Node,
  statements_source: String,
) -> Result(String, String) {
  use sig <- result.try(signature(statements_source, node.lean_name))
  Ok(
    "Prove `"
    <> node.lean_name
    <> "` in `"
    <> dag.proof_path(node)
    <> "`. The statement to prove, exactly:\n\n```lean\n"
    <> sig
    <> "\n```\n\nDescription: "
    <> node.description
    <> ". Estimated size: "
    <> dag.size_to_string(node.size)
    <> ". Start by creating the file with the imports you need (`import Rule30.Basic`, plus any served module), then iterate with `lake build "
    <> dag.proof_module(node)
    <> "`. If `"
    <> dag.proof_path(node)
    <> "` already exists it is a previous attempt's work on this node: read it first and keep whatever builds.",
  )
}

const statements_file = "Rule30/Statements.lean"

/// The theorem's signature, copied out of `Rule30/Statements.lean`: from the
/// line starting `theorem <lean_name>` up to and including the first
/// `:= by`, with that `:= by` cut back to `:=` so the worker is handed a
/// hole to fill rather than a tactic block to continue.
///
/// `Error` when the file declares no such theorem. That is not a shrug: a
/// node whose `lean_name` is in no statement file cannot be dispatched at
/// all, and handing a worker an empty ```lean block instead would be the
/// harness lying quietly.
pub fn signature(
  statements_source: String,
  lean_name: String,
) -> Result(String, String) {
  case
    statements_source
    |> string.split("\n")
    |> list.drop_while(fn(line) { !declares(line, lean_name) })
  {
    [] ->
      Error(
        "no `theorem "
        <> lean_name
        <> "` in "
        <> statements_file
        <> ": a node's lean_name must name a statement the captain wrote",
      )
    lines ->
      Ok(
        lines
        |> list.take(40)
        |> take_to_assignment([])
        |> string.join("\n"),
      )
  }
}

/// Does this line open the declaration of `lean_name` — matching
/// `theorem foo` but not `theorem foo_bar`.
fn declares(line: String, lean_name: String) -> Bool {
  case string.split_once(line, "theorem " <> lean_name) {
    Ok(#("", rest)) ->
      case string.pop_grapheme(rest) {
        Ok(#(next, _)) -> !is_name_char(next)
        Error(Nil) -> True
      }
    _ -> False
  }
}

fn is_name_char(g: String) -> Bool {
  g == "_" || string.lowercase(g) != string.uppercase(g) || is_digit(g)
}

fn is_digit(g: String) -> Bool {
  list.contains(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"], g)
}

fn take_to_assignment(lines: List(String), acc: List(String)) -> List(String) {
  case lines {
    [] -> list.reverse(acc)
    [line, ..rest] ->
      case string.split_once(line, ":= by") {
        Ok(#(before, _)) ->
          list.reverse([string.trim_end(before) <> " :=", ..acc])
        Error(Nil) -> take_to_assignment(rest, [line, ..acc])
      }
  }
}
