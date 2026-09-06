//// Everything a worker is told, assembled: the brief appended to its
//// system prompt, the first task message, and the report schema every turn
//// is held to.
////
//// Split out of `worker.gleam` because the turn loop and the prompt text
//// have nothing to say to each other — the loop reasons about events and
//// verdicts, this module only about words.
////
//// The brief carries `CLAUDE.md` whole and the identity's notebook
//// verbatim. Neither is trimmed or paraphrased: the notebook is that
//// identity's own continuity, and summarising it would be the harness
//// putting words in an agent's mouth.

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
          "posts",
          json.object([
            #("type", json.string("array")),
            #("items", json.object([#("type", json.string("string"))])),
            #("description", json.string("messages for named peers, if any")),
          ]),
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
      your_constraints(node),
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

fn your_constraints(node: dag.Node) -> String {
  "## Your constraints\n\n- The only file you may edit is `"
  <> dag.proof_path(node)
  <> "`. Every other write is denied by a hook, not by convention.\n"
  <> "- The only shell commands you may run are `lake build "
  <> dag.proof_module(node)
  <> "` and `lake env lean <file>`. Everything else is denied, and so is any shell operator — no `;`, `&&`, `|`, backticks, `$`, `>` or `<`. One bare command per Bash call.\n"
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

fn how_to_report() -> String {
  "## How to report\n\n"
  <> "Every turn ends with the structured report the harness asked for. Set `outcome` to `proved` only after `lake build` of your own module has actually succeeded — the harness then verifies your claim independently, and sends you the verdict if it fails. Set `outcome` to `in_progress` while you are still working. When you give up, set `outcome` to `abandoned` and fill in `notebook` and `journal`.\n\n"
  <> "`notebook` is for your future self: Mathlib lemmas that worked, dead ends worth not repeating, conventions. `journal` is a short written update for Dib, in your own words. `posts` are messages for named peers. Leave `notebook` and `journal` empty until the attempt ends, then write them properly — the harness writes those files from your report verbatim, so they are the only voice you have outside this session.\n\n"
  <> "A bug is the **harness** getting in your way: a command the guard refused that you needed, a brief that told you something untrue, a verifier message you could not act on, a lemma the brief said was served that was not. Lean being difficult is not a bug. A proof you could not find is not a bug. If the obstacle would still exist for a human doing this by hand in an editor, it is not the harness's. The framework agents maintain the harness and read these; file what actually cost you turns, and leave the array empty otherwise."
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
    <> "`.",
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
