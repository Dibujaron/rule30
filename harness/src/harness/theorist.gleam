//// One theorist session, hand-started: `gleam run -- theorise [<topic>]`.
////
//// A theorist is a persona whose deliverable is an argument, fenced to one
//// file. It lives in the roster's `theory` region and is minted through the
//// same naming ceremony a prover is, on first use; its notebook is
//// `agents/<Name>.md`, carried in its brief verbatim and written from its
//// report by the harness, never by the session. It is briefed by `brief` —
//// its notebook, the task text from `docs/theorist-brief.md`, the index,
//// the obstructions, the crystals, the sources, every wall with its
//// description, and the provers' notes — driven by the same turn loop a
//// prover runs in (`worker.drive`), and fenced by `guard.Theorist`: its
//// attack document under `docs/attacks/`, the shared
//// `docs/obstructions.md`, `node <script under explorer/>` and the `lake`
//// grammar. Nothing adjudicates its work after the session, because the
//// deliverable is prose: the summary says whether the document exists and
//// how big it is, and a captain reads it.
////
//// What it never does: write a statement, a proposal, a node, or its own
//// notebook. It cannot reach `blueprint/proposals/next.json`,
//// `Rule30/Statements.lean`, `blueprint/dag.json` or `agents/` — the guard
//// fences all of them and nothing here loosens it. A claim it puts forward
//// reaches the board only through a captain, the crystals list and the
//// seed check, like any other crystal.
////
//// Never started by the scheduler: a theorist's cost is hours, and hours
//// are a captain's decision. And because no scheduler holds it, nothing in
//// this process knows which personas are live: `who` treats every theorist
//// on the roster as idle, and one live session per persona is the captain's
//// restraint here rather than the harness's check.

import gleam/dynamic.{type Dynamic}
import gleam/dynamic/decode
import gleam/float
import gleam/int
import gleam/io
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
import harness/schedule
import harness/seed
import harness/worker
import simplifile

/// The roster region every theorist lives in. Not a region of the DAG —
/// no node carries it — but a region of the roster, so the naming ceremony,
/// `roster.for_region` and the one-persona-per-session rule all work
/// unchanged.
pub const region = "theory"

/// The one session's name, and the guard's lock holder: the directory under
/// `runs/<run-id>/` is `theorist-1` the way a seeder's is `seed-1`.
pub const session_name = "theorist-1"

/// The wall the default topic is, when it is open on the board: the current
/// frontier of P1, named in the connections design. When it is not on the
/// board as an open wall, the default falls back to the first open P1 wall
/// by id (see `default_topic`).
pub const frontier_wall = "centerColumn_other_isEventuallyPeriodic_of_center"

/// What the verb is told beyond the config: the model to spend, the guard's
/// port, the topic — or `None`, meaning the P1 frontier as the board has it
/// today — and the persona to run as, or `None` to take the eldest theorist
/// on the roster or mint one.
pub type Options {
  Options(
    model: String,
    port: Int,
    topic: Option(String),
    persona: Option(String),
  )
}

/// The `theorise` verb's arguments, parsed: an optional bare topic,
/// `--as <Name>` and `--model M`, in any order. The model defaults to the
/// strongest the CLI offers, because a theorist's brief is the whole board
/// and hours of its time, and that is the pass worth spending on.
pub type Flags {
  Flags(model: String, topic: Option(String), persona: Option(String))
}

pub const default_model = "fable"

const usage = "theorise [<topic>] [--as <Name>] [--model M]"

/// Parse the arguments after `theorise`. A bare argument is the topic — one
/// word, or a quoted phrase the shell passes as one argument — and a second
/// bare argument is refused rather than joined, because a topic that was
/// meant as one phrase and arrived as two words would silently attack the
/// first word alone. An unknown flag is refused for the same reason a
/// seeder's is: a misspelt `--model` would spend hours on the wrong model.
pub fn parse_flags(flags: List(String)) -> Result(Flags, String) {
  parse_flags_into(
    flags,
    Flags(model: default_model, topic: None, persona: None),
  )
}

fn parse_flags_into(flags: List(String), acc: Flags) -> Result(Flags, String) {
  case flags {
    [] -> Ok(acc)
    ["--model", model, ..rest] -> parse_flags_into(rest, Flags(..acc, model:))
    ["--as", name, ..rest] ->
      parse_flags_into(rest, Flags(..acc, persona: Some(name)))
    [flag] if flag == "--model" || flag == "--as" ->
      Error(flag <> " needs a value")
    [arg, ..rest] ->
      case string.starts_with(arg, "--"), acc.topic {
        True, _ -> Error("theorise does not take `" <> arg <> "`: " <> usage)
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

// --- who runs -------------------------------------------------------------------

/// Who the session runs as. With a name: that persona, if it is on the
/// roster in the `theory` region — a name in another region is refused, not
/// borrowed, because a prover's notebook in a theorist's brief would be a
/// differently-briefed agent wearing the name. Without one: the eldest
/// theorist on the roster, or the decision to mint one.
///
/// `busy` is empty on purpose. A dispatched prover is held busy by the
/// scheduler's in-flight list; a hand-started session has no scheduler, and
/// nothing outside this process records which theorists are live, so this
/// cannot tell an idle persona from one whose session is running in another
/// window. The captain who starts two theorists at once names the second
/// with `--as`.
pub fn who(
  roster_: roster.Roster,
  persona: Option(String),
) -> Result(schedule.Who, String) {
  case persona {
    None -> Ok(schedule.who_for(roster_, region, busy: []))
    Some(name) ->
      case list.find(roster_.identities, fn(i) { i.name == name }) {
        Ok(identity) if identity.region == region ->
          Ok(schedule.Existing(identity))
        Ok(identity) ->
          Error(
            "harness/theorist: "
            <> name
            <> " is on the roster for region "
            <> identity.region
            <> ", not "
            <> region
            <> "; a theorist runs only as a theorist",
          )
        Error(Nil) ->
          Error(
            "harness/theorist: no theorist named "
            <> name
            <> " on the roster"
            <> case roster.for_region(roster_, region) {
              [] ->
                "; the theory region is empty, so leave --as off to mint one"
              some ->
                "; the theorists are "
                <> string.join(list.map(some, fn(i) { i.name }), ", ")
            },
          )
      }
  }
}

/// The identity the session runs as, given `who`'s decision. A mint runs
/// the naming ceremony under the session's guard settings: the newcomer is
/// saved to the roster, its notebook is opened with the paragraph it wrote
/// about itself, and the `naming` event says why — the same three writes,
/// in the same order, that the dispatcher makes for a minted prover.
fn ensure_identity(
  cfg: config.Config,
  roster_: roster.Roster,
  who_: schedule.Who,
  model: String,
  g: guard.Guard,
  l: log.Log,
) -> Result(roster.Identity, String) {
  case who_ {
    schedule.Existing(identity) -> Ok(identity)
    schedule.Mint(region: r, busy:) -> {
      use #(identity, color_reason) <- result.try(worker.name_identity(
        cfg,
        roster_,
        r,
        model,
        g.settings_path,
        l,
      ))
      let roster_ = roster.add(roster_, identity)
      use _ <- result.try(roster.save(roster_, cfg.roster_path))
      use _ <- result.try(
        roster.append_notebook(
          cfg.agents_dir,
          identity,
          identity.created <> " — named for " <> r,
          case identity.color, color_reason {
            Some(color), Some(reason) ->
              identity.naming_reason
              <> "\n\nColour: "
              <> color
              <> " — "
              <> reason
            _, _ -> identity.naming_reason
          },
        ),
      )
      log.event(l, "naming", [
        #("name", json.string(identity.name)),
        #("region", json.string(identity.region)),
        #("reason", json.string(identity.naming_reason)),
        #(
          "because",
          json.string(case busy {
            [] -> "region empty"
            names -> "all busy: " <> string.join(names, ", ")
          }),
        ),
      ])
      Ok(identity)
    }
  }
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
        "harness/theorist: no open wall in P1 to default the topic to; give one: "
        <> usage,
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
/// and never a verdict on the topic. `notebook` is for its future self and
/// `journal` for Dib; the harness writes both to disk verbatim, which is
/// why the session itself has no write access to `agents/`. `next_topic`
/// is the "Next topic" paragraph of the document, repeated here so a
/// captain's queue can be read off the summaries without opening every
/// document. No size estimate and no bugs: a theorist has no node to price.
pub type Report {
  Report(
    outcome: String,
    summary: String,
    notebook: String,
    journal: String,
    next_topic: String,
  )
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
          "notebook",
          string_field(
            "an entry for your own notebook, for your future self: what you tried on this topic, what died and at what depth, which sources you searched, what you would try next. Empty until the end.",
          ),
        ),
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
      json.array(
        ["outcome", "summary", "notebook", "journal", "next_topic"],
        json.string,
      ),
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
  use notebook <- decode.optional_field("notebook", "", decode.string)
  use journal <- decode.optional_field("journal", "", decode.string)
  use next_topic <- decode.optional_field("next_topic", "", decode.string)
  decode.success(Report(outcome:, summary:, notebook:, journal:, next_topic:))
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
  <> "`. Your brief is in your system prompt: read the task text near its top before anything else, then the obstructions, the walls and the notes, and explore with scripts under explorer/ and `lake env lean` on files there where a claim needs checking.\n\n"
  <> "Write your attack document to `"
  <> attack_path
  <> "`, with the sections the brief lists, in that order. You may add an entry to `"
  <> obstructions_path
  <> "`; add at the end and change nothing above it.\n\n"
  <> "End every turn with the structured report. Set `outcome` to `attacked` only once the document is written and you are done, `in_progress` while you are still working, and `abandoned` if you give up; fill in `notebook`, `journal` and `next_topic` at the end. The harness writes your notebook from the report — you cannot write agents/ yourself."
}

// --- the brief ------------------------------------------------------------------

/// The two sentences a session is briefed with when `docs/theorist-brief.md`
/// is not in the checkout: the task as the connections design states it.
/// The full text belongs in that file, not here.
pub const fallback_task = "For this topic, state what would have to be true for the residual to follow; say why each known route fails, citing the obstructions file and adding to it; and list candidate claims, each with an engine falsification run to a stated depth and its result, and each with a sentence on what it would imply if true. Most claims are expected to die; a claim that survives to depth a million is the deliverable, and the document is read by a captain and by other theorists, not by a prover."

/// The brief, assembled from the repository as it stands right now, for
/// `identity` on `topic`, fenced to `attack_path`. Everything is read from
/// disk at render time — the notebook, the task text, the index, the
/// obstructions, the crystals, the sources, the walls, the notes — so a
/// brief cannot carry a fact the tree has moved on from. Only this
/// identity's notebook is read: another theorist's is not this one's
/// memory, and putting it here would make two personas one.
pub fn brief(
  cfg: config.Config,
  identity: roster.Identity,
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
    identity: identity,
    notebook: roster.read_notebook(cfg.agents_dir, identity),
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
/// checkout. Section order is the order a session should read in: who it
/// is and what it remembers, the task, then the topic and its fence, then
/// the four files that say what is known and what is dead, then the walls
/// and the notes, and last the shape of the document it owes.
pub fn render(
  identity identity: roster.Identity,
  notebook notebook: String,
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
      who_you_are(identity, notebook),
      "",
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
      "proposal, no statement, no node, and not your own notebook — the",
      "harness writes that from your report. You may run `node <one path",
      "under explorer/>`, `lake build [modules]` and `lake env lean <file>`,",
      "one bare command per call with no shell operators.",
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

/// The section a prover's brief opens with, in the theorist's terms: the
/// name, the region, and the notebook verbatim. The same shape on purpose —
/// an identity is a notebook, and the notebook is what spans sessions,
/// whatever the role.
fn who_you_are(identity: roster.Identity, notebook: String) -> String {
  let book = case string.trim(notebook) {
    "" -> "Your notebook is empty: this is its first entry-worthy session."
    _ -> notebook
  }
  "## Who you are\n\nYou are "
  <> identity.name
  <> ", a theorist for region "
  <> region
  <> ": "
  <> roster.region_description(region)
  <> ".\n\nYour notebook, verbatim — you wrote all of it, and nothing else has:\n\n"
  <> book
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
/// guard it ran under, its record directory, who ran it, and the topic and
/// attack path it was fenced to.
pub type Session {
  Session(
    summary: String,
    guard: guard.Guard,
    dir: String,
    identity: roster.Identity,
    topic: String,
    attack_path: String,
  )
}

/// Start one theorist session, wait for it to end, then look at what it
/// left.
///
/// The order is the contract: the topic (from the flags or the board) and
/// who runs (from the flags or the roster) are settled before anything is
/// written, so a bad `--as` costs nothing; then the record directory, the
/// guard and its settings; then the ceremony if a persona is being minted,
/// which needs the guard's settings and writes its `naming` row into the
/// session's own log; then the brief (no brief, no session) and the
/// session — and only once the session is closed, the notebook and journal
/// from its report and the look at the file it was fenced to write. There
/// is no check to run over prose; what the summary says is whether the
/// document is there, how big it is, and what the theorist said should
/// come next. A session that reported `attacked` with no document on disk
/// is recorded as abandoned, whatever it claimed.
pub fn run(cfg: config.Config, options: Options) -> Result(Session, String) {
  use topic <- result.try(case options.topic {
    Some(t) -> Ok(t)
    None -> dag.load(cfg.dag_path) |> result.try(default_topic)
  })
  use roster_ <- result.try(roster.load(cfg.roster_path))
  use who_ <- result.try(who(roster_, options.persona))
  let attack = attack_path(cfg.repo_root, today(), topic)
  let obstructions = obstructions_path(cfg.repo_root)
  use run_log <- result.try(log.open(cfg.runs_root, log.new_run_id()))
  use l <- result.try(log.open(run_log.dir, session_name))
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
  use identity <- result.try(ensure_identity(
    cfg,
    roster_,
    who_,
    options.model,
    g,
    l,
  ))
  use brief_text <- result.try(brief(cfg, identity, topic, attack))
  use brief_path <- result.try(worker.write_brief(l, session_name, brief_text))
  // The theorist's ceilings, not the prover's: `worker.launch` reads
  // `max_turns` and `max_budget_usd` from whatever config it is handed.
  let session_cfg = config.for_theorist(cfg)
  log.event(l, "dispatch", [
    #("role", json.string("theorist")),
    #("identity", json.string(identity.name)),
    #("model", json.string(options.model)),
    #("port", json.int(options.port)),
    #("topic", json.string(topic)),
    #("attack", json.string(attack)),
    #("max_turns", json.int(session_cfg.max_turns)),
    #("max_budget_usd", json.float(session_cfg.max_budget_usd)),
    #("log", json.string(l.dir)),
  ])

  let #(tally, ending) =
    worker.drive(
      session_cfg,
      l,
      worker.launch(session_cfg, options.model, g, brief_path, report_schema()),
      task_message(topic, attack, obstructions),
      role(),
    )

  let size = document_size(attack)
  write_channels(cfg, run_log, identity, topic, options.model, ending, size)
  let summary =
    summary(
      options,
      session_cfg,
      identity,
      topic,
      attack,
      l,
      tally,
      ending,
      size,
    )
  log.summary(run_log, summary)
  Ok(Session(
    summary:,
    guard: g,
    dir: l.dir,
    identity:,
    topic:,
    attack_path: attack,
  ))
}

/// The theorist's two channels, each written from the report exactly as
/// the theorist wrote it: the notebook under `agents/<Name>.md`, headed
/// with the time, the topic, the model and how the session ended; and the
/// journal under the run. A failed notebook write is printed, not fatal —
/// the session happened and its summary must still be written.
fn write_channels(
  cfg: config.Config,
  run_log: log.Log,
  identity: roster.Identity,
  topic: String,
  model: String,
  ending: worker.Ending(Report),
  size: Option(Int),
) -> Nil {
  case ending.report {
    None -> Nil
    Some(r) -> {
      case string.trim(r.notebook) {
        "" -> Nil
        _ -> {
          let heading =
            log.now_iso()
            <> " — "
            <> topic
            <> " ("
            <> model
            <> ", "
            <> end_word(ending.end, size)
            <> ")"
          case
            roster.append_notebook(
              cfg.agents_dir,
              identity,
              heading,
              r.notebook,
            )
          {
            Ok(Nil) -> Nil
            Error(reason) -> io.println_error("harness/theorist: " <> reason)
          }
        }
      }
      case string.trim(r.journal) {
        "" -> Nil
        text -> log.journal(run_log, identity.name, session_name, text)
      }
    }
  }
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

/// The summary a captain reads: who ran, the topic and where the document
/// is, whether it exists, how the session ended in words that never call
/// an argument proved, the ceilings it ran under, what it cost, and the
/// next topic the theorist named.
fn summary(
  options: Options,
  cfg: config.Config,
  identity: roster.Identity,
  topic: String,
  attack: String,
  l: log.Log,
  tally: worker.Tally,
  ending: worker.Ending(Report),
  size: Option(Int),
) -> String {
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
      "theorist  " <> identity.name,
      "model     " <> options.model,
      "topic     " <> topic,
      "attack    " <> attack,
      "document  "
        <> case size {
        Some(bytes) -> "exists, " <> int.to_string(bytes) <> " bytes"
        None -> "MISSING — nothing is at that path"
      },
      "ended     " <> ended_words(ending.end, size),
      "ceilings  " <> ceilings(cfg),
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

/// How the session ended, in one word, for the notebook heading.
fn end_word(end: worker.End, size: Option(Int)) -> String {
  case end, size {
    worker.Finished, Some(_) -> "attacked"
    worker.Finished, None -> "abandoned"
    worker.Abandoned, _ -> "abandoned"
    worker.TimedOut, _ -> "timed_out"
    worker.BudgetExhausted, _ -> "budget_exhausted"
    worker.RateLimited, _ -> "rate_limited"
  }
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
    // The loop's `BudgetExhausted` does not say which ceiling: the CLI's
    // turn ceiling, its dollar ceiling, or the harness's round budget. The
    // notes carry the CLI's own result line when it was the CLI.
    worker.BudgetExhausted, _ ->
      "stopped at a ceiling — turns, dollars or the harness's rounds; the notes below say which"
    worker.RateLimited, _ -> "rate limited"
  }
}

/// The two ceilings a session ran under, for the summary line.
fn ceilings(cfg: config.Config) -> String {
  int.to_string(cfg.max_turns)
  <> " turns, $"
  <> float.to_string(cfg.max_budget_usd)
}
