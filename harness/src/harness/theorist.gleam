//// One theorist session, hand-started: `gleam run -- theorise [<topic>]`.
////
//// A theorist is a role whose deliverable is an argument, fenced to one
//// file. It is briefed by `brief` — the task text from
//// `docs/theorist-brief.md`, the index, the obstructions, the crystals, the
//// sources, every wall with its description, and the provers' notes — driven
//// by the same turn loop a prover runs in (`worker.drive`), and fenced by
//// `guard.Theorist`: its attack document under `docs/attacks/`, the shared
//// `docs/obstructions.md`, `node <script under explorer/>` and the `lake`
//// grammar. Nothing adjudicates its work after the session, because the
//// deliverable is prose: the summary says whether the document exists and
//// how big it is, and a captain reads it.
////
//// What it never does: write a statement, a proposal or a node. It cannot
//// reach `blueprint/proposals/next.json`, `Rule30/Statements.lean` or
//// `blueprint/dag.json` — the guard fences all three and nothing here loosens
//// it. A claim it puts forward reaches the board only through a captain, the
//// crystals list and the seed check, like any other crystal.
////
//// Never started by the scheduler: a theorist's cost is hours, and hours are
//// a captain's decision.

import gleam/dynamic.{type Dynamic}
import gleam/dynamic/decode
import gleam/int
import gleam/json
import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/result
import gleam/string
import harness/config
import harness/dag
import harness/guard
import harness/lock
import harness/log
import harness/roster
import harness/seed
import harness/worker
import simplifile

/// The name the session runs under. The roster has no theorist identity and
/// this verb does not mint one, so no notebook is written for it; its record
/// is the run directory.
pub const identity = "Theorist"

/// The one session's name, and the guard's lock holder: the directory under
/// `runs/<run-id>/` is `theorist-1` the way a seeder's is `seed-1`.
pub const session_name = "theorist-1"

/// The wall the default topic is, when it is open on the board: the current
/// frontier of P1, named in the connections design. When it is not on the
/// board as an open wall, the default falls back to the first open P1 wall
/// by id (see `default_topic`).
pub const frontier_wall = "centerColumn_other_isEventuallyPeriodic_of_center"

/// What the verb is told beyond the config: the model to spend, the guard's
/// port, and the topic — or `None`, meaning the P1 frontier as the board
/// has it today.
pub type Options {
  Options(model: String, port: Int, topic: Option(String))
}

/// The `theorise` verb's arguments, parsed: an optional bare topic and
/// `--model M`, in either order. The model defaults to the strongest the
/// CLI offers, because a theorist's brief is the whole board and hours of
/// its time, and that is the pass worth spending on.
pub type Flags {
  Flags(model: String, topic: Option(String))
}

pub const default_model = "fable"

/// Parse the arguments after `theorise`. A bare argument is the topic — one
/// word, or a quoted phrase the shell passes as one argument — and a second
/// bare argument is refused rather than joined, because a topic that was
/// meant as one phrase and arrived as two words would silently attack the
/// first word alone. An unknown flag is refused for the same reason a
/// seeder's is: a misspelt `--model` would spend hours on the wrong model.
pub fn parse_flags(flags: List(String)) -> Result(Flags, String) {
  parse_flags_into(flags, Flags(model: default_model, topic: None))
}

fn parse_flags_into(flags: List(String), acc: Flags) -> Result(Flags, String) {
  case flags {
    [] -> Ok(acc)
    ["--model", model, ..rest] -> parse_flags_into(rest, Flags(..acc, model:))
    ["--model"] -> Error("--model needs a value")
    [arg, ..rest] ->
      case string.starts_with(arg, "--"), acc.topic {
        True, _ ->
          Error(
            "theorise does not take `"
            <> arg
            <> "`: theorise [<topic>] [--model M]",
          )
        False, None -> parse_flags_into(rest, Flags(..acc, topic: Some(arg)))
        False, Some(first) ->
          Error(
            "theorise takes one topic, and got `"
            <> first
            <> "` and `"
            <> arg
            <> "`: quote a phrase so the shell passes it as one argument",
          )
      }
  }
}

/// The port a hand-started theorist's guard listens on: two hundred above
/// the run base, clear of any run (which counts up from the base) and of
/// a seeder started beside it (a hundred above).
pub fn default_port(cfg: config.Config) -> Int {
  cfg.guard_port + 200
}

// --- the topic ------------------------------------------------------------------

/// The topic when none is given: the P1 frontier as the board has it. The
/// wall named in the connections design (`frontier_wall`) when it is an
/// open wall in P1; otherwise the first open P1 wall by id; otherwise an
/// error, because a theorist with no wall to attack has no residual to
/// state and the captain should name a topic.
///
/// Derived from the board rather than remembered, so the day that wall
/// falls the default moves on its own.
pub fn default_topic(d: dag.Dag) -> Result(String, String) {
  let open_walls =
    d.nodes
    |> list.filter(fn(n) {
      n.region == "P1" && n.size == dag.Wall && n.status == dag.Open
    })
    |> list.map(fn(n) { n.id })
    |> list.sort(string.compare)
  case list.contains(open_walls, frontier_wall), open_walls {
    True, _ -> Ok(frontier_wall)
    False, [first, ..] -> Ok(first)
    False, [] ->
      Error(
        "harness/theorist: no open wall in P1 to default the topic to; give one: theorise <topic>",
      )
  }
}

/// A topic as a file name: lowercase, every run of characters that is not
/// a letter or digit collapsed to one dash, no dash at either end. So
/// `centerColumn_other_isEventuallyPeriodic_of_center` becomes
/// `centercolumn-other-iseventuallyperiodic-of-center` and `the transients
/// of the left diagonals` becomes `the-transients-of-the-left-diagonals`.
pub fn slug(topic: String) -> String {
  topic
  |> string.lowercase
  |> string.to_graphemes
  |> list.map(fn(g) {
    case string.contains(alnum, g) {
      True -> g
      False -> "-"
    }
  })
  |> string.join("")
  |> collapse_dashes
  |> trim_dashes
}

const alnum = "abcdefghijklmnopqrstuvwxyz0123456789"

fn collapse_dashes(s: String) -> String {
  case string.contains(s, "--") {
    True -> collapse_dashes(string.replace(s, "--", "-"))
    False -> s
  }
}

fn trim_dashes(s: String) -> String {
  let s = case string.starts_with(s, "-") {
    True -> string.drop_start(s, 1)
    False -> s
  }
  case string.ends_with(s, "-") {
    True -> string.drop_end(s, 1)
    False -> s
  }
}

/// Where the attack document goes: `docs/attacks/<date>-<slug>.md` under
/// the repository root, `date` as `YYYY-MM-DD`. The one file outside
/// `docs/obstructions.md` the guard lets the session write.
pub fn attack_path(repo_root: String, date: String, topic: String) -> String {
  repo_root <> "/docs/attacks/" <> date <> "-" <> slug(topic) <> ".md"
}

/// Where the shared list of dead ends lives, which the session may add to.
pub fn obstructions_path(repo_root: String) -> String {
  repo_root <> "/docs/obstructions.md"
}

/// Today, as `YYYY-MM-DD`, off the same clock the log stamps rows with.
pub fn today() -> String {
  string.slice(log.now_iso(), 0, 10)
}

// --- the report -----------------------------------------------------------------

/// What a theorist reports at the end of every turn. `outcome` is the
/// theorist's claim about its document — `attacked` once it is written —
/// and never a verdict on the topic. `next_topic` is the "Next topic"
/// paragraph of the document, repeated here so a captain's queue can be
/// read off the summaries without opening every document. No size
/// estimate, no notebook and no bugs: a theorist has no node to price and
/// no roster entry to keep a notebook under.
pub type Report {
  Report(outcome: String, summary: String, journal: String, next_topic: String)
}

/// The `--json-schema` every theorist turn is held to.
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
              json.array(["in_progress", "attacked", "abandoned"], json.string),
            ),
          ]),
        ),
        #("summary", string_field("one sentence on the state of the document")),
        #(
          "journal",
          string_field(
            "a short written update for Dib, in your own words: what you attacked, what died, what survived and to what depth. Empty until the end.",
          ),
        ),
        #(
          "next_topic",
          string_field(
            "the Next topic paragraph of your document, verbatim: at least one sentence naming what should be attacked next and why. Empty until the end.",
          ),
        ),
      ]),
    ),
    #(
      "required",
      json.array(["outcome", "summary", "journal", "next_topic"], json.string),
    ),
  ])
  |> json.to_string
}

/// Decode a `Report` out of a turn's `structured_output`.
pub fn report_from_dynamic(dyn: Dynamic) -> Result(Report, String) {
  decode.run(dyn, report_decoder())
  |> result.map_error(string.inspect)
}

fn report_decoder() -> decode.Decoder(Report) {
  use outcome <- decode.field("outcome", decode.string)
  use summary <- decode.optional_field("summary", "", decode.string)
  use journal <- decode.optional_field("journal", "", decode.string)
  use next_topic <- decode.optional_field("next_topic", "", decode.string)
  decode.success(Report(outcome:, summary:, journal:, next_topic:))
}

/// The theorist's role in the turn loop. `attacked` finishes the session
/// and `abandoned` ends it; anything else is a turn that ended early and
/// gets sent back round. Nothing is adjudicated here: whether the document
/// exists is checked in `run`, after the session, because it is a fact
/// about the file and not about the turn.
pub fn role() -> worker.Role(Report) {
  worker.Role(
    decode: report_from_dynamic,
    act: fn(t, report) {
      case report {
        None ->
          worker.nudge(
            t,
            report,
            "Your turn carried no structured report. End every turn with the report the harness asked for.",
            "the theorist stopped reporting",
          )
        Some(r) ->
          case r.outcome {
            "attacked" -> #(
              t.tally,
              worker.Ending(worker.Finished, r.summary, Some(r), False),
            )
            "abandoned" -> #(
              t.tally,
              worker.Ending(worker.Abandoned, r.summary, Some(r), False),
            )
            _ ->
              worker.nudge(
                t,
                report,
                "Continue.",
                "still in progress when the round budget ran out: " <> r.summary,
              )
          }
      }
    },
    park: fn(t, report) { worker.parked(t, report, "") },
  )
}

/// The first user turn. The brief in the system prompt carries the
/// knowledge and the task; this names the topic and the two files again,
/// because the first message is what a session reads last before acting.
pub fn task_message(
  topic: String,
  attack_path: String,
  obstructions_path: String,
) -> String {
  "Attack the topic `"
  <> topic
  <> "`. Your brief is in your system prompt: read the task text at its top before anything else, then the obstructions, the walls and the notes, and explore with scripts under explorer/ and `lake env lean` on files there where a claim needs checking.\n\n"
  <> "Write your attack document to `"
  <> attack_path
  <> "`, with the sections the brief lists, in that order. You may add an entry to `"
  <> obstructions_path
  <> "`; add at the end and change nothing above it.\n\n"
  <> "End every turn with the structured report. Set `outcome` to `attacked` only once the document is written and you are done, `in_progress` while you are still working, and `abandoned` if you give up; fill in `journal` and `next_topic` at the end."
}

// --- the brief ------------------------------------------------------------------

/// The two sentences a session is briefed with when `docs/theorist-brief.md`
/// is not in the checkout: the task as the connections design states it.
/// The full text belongs in that file, not here.
pub const fallback_task = "For this topic, state what would have to be true for the residual to follow; say why each known route fails, citing the obstructions file and adding to it; and list candidate claims, each with an engine falsification run to a stated depth and its result, and each with a sentence on what it would imply if true. Most claims are expected to die; a claim that survives to depth a million is the deliverable, and the document is read by a captain and by other theorists, not by a prover."

/// The brief, assembled from the repository as it stands right now, for
/// `topic`, fenced to `attack_path`. Everything is read from disk at render
/// time — the task text, the index, the obstructions, the crystals, the
/// sources, the walls, the notes — so a brief cannot carry a fact the tree
/// has moved on from.
pub fn brief(
  cfg: config.Config,
  topic: String,
  attack_path: String,
) -> Result(String, String) {
  use d <- result.try(dag.load(cfg.dag_path))
  let walls = list.filter(d.nodes, fn(n) { n.size == dag.Wall })
  let read = fn(relative: String) {
    simplifile.read(cfg.repo_root <> "/" <> relative)
    |> result.replace_error(Nil)
  }
  Ok(render(
    task: read("docs/theorist-brief.md"),
    topic: topic,
    attack_path: attack_path,
    obstructions_path: obstructions_path(cfg.repo_root),
    index: read("blueprint/index.md"),
    obstructions: read("docs/obstructions.md"),
    crystals: read("blueprint/crystals.md"),
    sources: read("docs/sources.md"),
    walls: walls,
    notes: seed.proof_notes(cfg.repo_root),
  ))
}

/// The brief from its parts. The pure half, so it can be tested without a
/// checkout. Section order is the order a session should read in: the task
/// first, then the topic and its fence, then the four files that say what
/// is known and what is dead, then the walls and the notes, and last the
/// shape of the document it owes.
pub fn render(
  task task: Result(String, Nil),
  topic topic: String,
  attack_path attack_path: String,
  obstructions_path obstructions_path: String,
  index index: Result(String, Nil),
  obstructions obstructions: Result(String, Nil),
  crystals crystals: Result(String, Nil),
  sources sources: Result(String, Nil),
  walls walls: List(dag.Node),
  notes notes: List(#(String, String)),
) -> String {
  string.join(
    [
      "## The task (docs/theorist-brief.md)",
      case task {
        Ok(text) -> text
        Error(Nil) ->
          "(docs/theorist-brief.md is absent from this checkout)\n\n"
          <> fallback_task
      },
      "",
      "## Your topic, your file, and your fence",
      "Topic: " <> topic,
      "",
      "Attack document: " <> attack_path,
      "",
      "You may write exactly two files: the attack document above, and",
      obstructions_path <> ",",
      "to which you may add an entry at the end and change nothing above it —",
      "the guard permits the write and a captain's diff checks that it was",
      "an addition. Every other write is denied by a hook, not by convention:",
      "no script under explorer/ (put a script's text in the document), no",
      "proposal, no statement, no node. You may run `node <one path under",
      "explorer/>`, `lake build [modules]` and `lake env lean <file>`, one",
      "bare command per call with no shell operators.",
      "",
      "## The index (blueprint/index.md)",
      inlined(index, "blueprint/index.md"),
      "",
      "## The obstructions (docs/obstructions.md)",
      inlined(obstructions, "docs/obstructions.md"),
      "",
      "## Literature seeds (blueprint/crystals.md)",
      inlined(crystals, "blueprint/crystals.md"),
      "",
      "## The sources (docs/sources.md)",
      inlined(sources, "docs/sources.md"),
      "",
      "## The walls",
      "Every wall on the board, with its description verbatim. A wall is a",
      "node the scheduler never dispatches: not a task but a target, and its",
      "description says what a decomposition must imply and what has been",
      "measured.",
      "",
      seed.open_section(walls),
      "",
      "## Why the closed proofs worked, in the provers' own words",
      notes_section(notes),
      "",
      "## What the document must contain",
      "In this order, each under its own heading, a section with nothing in",
      "it still present with one sentence saying so:",
      "",
      "1. What would have to be true for the residual to follow.",
      "2. Why each known route fails, citing docs/obstructions.md and adding",
      "   to it where you found a new dead end.",
      "3. Candidate claims, each with an engine falsification run to a stated",
      "   depth and its result, and each with a sentence on what it would",
      "   imply if true.",
      "4. Next topic: one paragraph naming what should be attacked next and",
      "   why.",
      "",
      "Most claims are expected to die. A claim that survives to depth a",
      "million is the deliverable. The document is read by a captain and by",
      "other theorists, not by a prover.",
    ],
    "\n",
  )
}

/// A file inlined whole, or one line saying it is not in the checkout.
fn inlined(file: Result(String, Nil), relative: String) -> String {
  case file {
    Ok(text) -> text
    Error(Nil) -> "(no " <> relative <> " in this checkout)"
  }
}

fn notes_section(notes: List(#(String, String))) -> String {
  case notes {
    [] -> "(no proof notes under Rule30/Proofs/)"
    _ ->
      notes
      |> list.map(fn(pair) { "### " <> pair.0 <> "\n" <> pair.1 })
      |> string.join("\n\n")
  }
}

// --- the session ----------------------------------------------------------------

/// What one theorist session left behind: the summary a captain reads, the
/// guard it ran under, its record directory, and the topic and attack path
/// it was fenced to.
pub type Session {
  Session(
    summary: String,
    guard: guard.Guard,
    dir: String,
    topic: String,
    attack_path: String,
  )
}

/// Start one theorist session, wait for it to end, then look at what it
/// left.
///
/// The order is the contract: the topic (from the flags or the board), the
/// brief (no brief, no session), the record directory, the guard and its
/// settings, then the session — and only once the session is closed, the
/// look at the file it was fenced to write. There is no check to run over
/// prose; what the summary says is whether the document is there, how big
/// it is, and what the theorist said should come next. A session that
/// reported `attacked` with no document on disk is recorded as abandoned,
/// whatever it claimed.
pub fn run(cfg: config.Config, options: Options) -> Result(Session, String) {
  use topic <- result.try(case options.topic {
    Some(t) -> Ok(t)
    None -> dag.load(cfg.dag_path) |> result.try(default_topic)
  })
  let attack = attack_path(cfg.repo_root, today(), topic)
  let obstructions = obstructions_path(cfg.repo_root)
  use brief_text <- result.try(brief(cfg, topic, attack))
  use run_log <- result.try(log.open(cfg.runs_root, log.new_run_id()))
  use l <- result.try(log.open(run_log.dir, session_name))
  use brief_path <- result.try(worker.write_brief(l, session_name, brief_text))
  use lock_actor <- result.try(
    lock.start(240_000)
    |> result.map_error(fn(e) {
      "could not start the build lock: " <> string.inspect(e)
    }),
  )
  use g <- result.try(guard.start(
    guard.Rules(
      repo_root: cfg.repo_root,
      role: guard.Theorist(attack_path: attack, obstructions_path: obstructions),
      holder: session_name,
    ),
    lock_actor,
    l,
    options.port,
  ))
  use _ <- result.try(guard.write_settings(g, g.settings_path))
  log.event(l, "dispatch", [
    #("role", json.string("theorist")),
    #("identity", json.string(identity)),
    #("model", json.string(options.model)),
    #("port", json.int(options.port)),
    #("topic", json.string(topic)),
    #("attack", json.string(attack)),
    #("log", json.string(l.dir)),
  ])

  let #(tally, ending) =
    worker.drive(
      cfg,
      l,
      worker.launch(cfg, options.model, g, brief_path, report_schema()),
      task_message(topic, attack, obstructions),
      role(),
    )

  case ending.report {
    Some(r) ->
      case string.trim(r.journal) {
        "" -> Nil
        text -> log.journal(run_log, identity, session_name, text)
      }
    None -> Nil
  }

  let summary = summary(options, topic, attack, l, tally, ending)
  log.summary(run_log, summary)
  Ok(Session(summary:, guard: g, dir: l.dir, topic:, attack_path: attack))
}

/// The attack document as it sits on disk after the session: its size in
/// bytes, or nothing.
fn document_size(path: String) -> Option(Int) {
  case simplifile.file_info(path) {
    Ok(info) ->
      case simplifile.file_info_type(info) {
        simplifile.File -> Some(info.size)
        _ -> None
      }
    Error(_) -> None
  }
}

/// The summary a captain reads: the topic and where the document is,
/// whether it exists, how the session ended in words that never call an
/// argument proved, what it cost, and the next topic the theorist named.
fn summary(
  options: Options,
  topic: String,
  attack: String,
  l: log.Log,
  tally: worker.Tally,
  ending: worker.Ending(Report),
) -> String {
  let size = document_size(attack)
  let next_topic = case ending.report {
    Some(r) ->
      case string.trim(r.next_topic) {
        "" -> "(no next topic reported)"
        text -> text
      }
    None -> "(no report, so no next topic)"
  }
  string.join(
    [
      "",
      "theorist  " <> identity,
      "model     " <> options.model,
      "topic     " <> topic,
      "attack    " <> attack,
      "document  "
        <> case size {
        Some(bytes) -> "exists, " <> int.to_string(bytes) <> " bytes"
        None -> "MISSING — nothing is at that path"
      },
      "ended     " <> ended_words(ending.end, size),
      "cost      $" <> roster.usd(tally.cost_usd),
      "turns     " <> int.to_string(tally.turns),
      "session   " <> tally.session_id,
      "log       " <> l.dir,
      "",
      ending.notes,
      "",
      "next topic, in the theorist's words:",
      next_topic,
    ],
    "\n",
  )
}

/// How the session ended, for the summary. `Finished` is the theorist's
/// claim that its document is written, and it is believed exactly as far as
/// the file on disk supports it: with no document there the line says
/// abandoned, because a report about a file that does not exist is not a
/// report about the topic.
fn ended_words(end: worker.End, size: Option(Int)) -> String {
  case end, size {
    worker.Finished, Some(_) ->
      "finished — the theorist reported its attack written; that is its claim about the document, and a captain's reading is the only adjudication"
    worker.Finished, None ->
      "abandoned — the theorist reported its attack written, but no document exists at the attack path, so the claim is recorded as abandoned"
    worker.Abandoned, _ -> "abandoned by the theorist"
    worker.TimedOut, _ -> "timed out"
    worker.BudgetExhausted, _ -> "budget exhausted"
    worker.RateLimited, _ -> "rate limited"
  }
}
