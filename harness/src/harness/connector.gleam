//// One connector session, hand-started:
//// `gleam run -- connect [<vantage>] [--as <Name>] [--model M]`.
////
//// A connector is a persona whose deliverable is a sighting — one document
//// that looks at one open problem from every field of mathematics where an
//// object like it has been studied, and says, dictionary by dictionary,
//// what carries over. It lives in the roster's `connect` region and is
//// minted through the naming ceremony a prover is, on first use; its
//// notebook is `agents/<Name>.md`, carried in its brief verbatim and
//// written from its report by the harness, never by the session.
////
//// Briefed thinly on purpose (`brief`): the task text from
//// `docs/connector-brief.md`, its own notebook, the problem's residual
//// paragraph as the board carries it, `docs/obstructions.md`,
//// `docs/sources.md` and the definitions in `Rule30/Basic.lean` — and not
//// the index, the proof notes or the crystals, because the theorist has
//// those and the theorist reaches outside them about twice a session; a
//// connector's whole job is the outside. Driven by the same turn loop a
//// prover runs in (`worker.drive`), fenced by `guard.Connector`: its
//// sighting document under `docs/connections/`, scripts under `explorer/`
//// to write and to run with `node <script>`, the `lake` grammar, and the
//// web read-only through `WebFetch` and `WebSearch`, every URL logged.
////
//// What it never does: write a statement, a proposal, a node, an entry in
//// the obstructions file, or its own notebook. Nothing it writes reaches
//// the board directly: a captain reads its section 5, hands one or two
//// connections to a theorist as topics, and the theorist's falsification
//// and the seed check are the filter.
////
//// Never started by the scheduler, and, like the theorist, nothing in this
//// process knows which connectors are live: `who` treats every connector
//// on the roster as idle, and one live session per persona is the
//// captain's restraint here rather than the harness's check.
////
//// **This module imports `theorist` and calls it, on purpose.** A
//// connector differs from a theorist in its brief, its fence and its
//// report's words, and nowhere else: the naming ceremony (`who`,
//// delegating to `theorist.who`), the document path rule (`sighting_path`
//// and kin, delegating to `theorist.document_path` and kin with
//// `"connections"` where the theorist passes `"attacks"`), the report
//// schema's shape (`report_schema`, delegating to `theorist.report_schema`),
//// and the "who you are" preamble in `render` (`theorist.who_you_are`) are
//// reused rather than copied; `theorist.inlined` likewise. What genuinely
//// differs — `Options`, `Flags`, `Report` (a shared field would lie:
//// `topic` is not `vantage`), `task_message`, `brief`, `render`, and `run`
//// in the next task — is this module's own. The deeper fix, a shared spine
//// module neither kind owns, is
//// `each-new-session-kind-copies-the-last-ones-spine` on the bug board and
//// is not this module's job.

import gleam/dynamic.{type Dynamic}
import gleam/dynamic/decode
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
import harness/theorist
import harness/worker
import simplifile

/// The roster region every connector lives in. Not a region of the DAG —
/// no node carries it — but a region of the roster, so the naming ceremony,
/// `roster.for_region` and the one-persona-per-session rule all work
/// unchanged.
pub const region = "connect"

/// The one session's name, and the guard's lock holder: the directory under
/// `runs/<run-id>/` is `connector-1` the way a theorist's is `theorist-1`.
pub const session_name = "connector-1"

/// What the verb is told beyond the config: the model to spend, the guard's
/// port, the vantage — a field to attack from, or `None`, meaning the
/// connector chooses — and the persona to run as, or `None` to take the
/// eldest connector on the roster or mint one. Not `theorist.Options`: the
/// `vantage` field would be a lie under `topic`'s name.
pub type Options {
  Options(
    model: String,
    port: Int,
    vantage: Option(String),
    persona: Option(String),
  )
}

/// The `connect` verb's arguments, parsed: an optional bare vantage,
/// `--as <Name>` and `--model M`, in any order. The model defaults to the
/// strongest the CLI offers, as a theorist's does: hours of a session's
/// time on one problem is the pass worth spending on. Not
/// `theorist.Flags`, for the same reason as `Options`.
pub type Flags {
  Flags(model: String, vantage: Option(String), persona: Option(String))
}

pub const default_model = "fable"

const usage = "connect [<vantage>] [--as <Name>] [--model M]"

/// Parse the arguments after `connect`. A bare argument is the vantage —
/// one word, or a quoted phrase the shell passes as one argument — and a
/// second bare argument is refused rather than joined, because a vantage
/// meant as one phrase and arrived as two words would silently attack from
/// the first word alone. An unknown flag is refused for the same reason a
/// theorist's is: a misspelt `--model` would spend hours on the wrong
/// model. The shape is `theorist.parse_flags`'s exactly, but it is not
/// reused: it is built on `Flags`, which is this module's own type.
pub fn parse_flags(flags: List(String)) -> Result(Flags, String) {
  parse_flags_into(
    flags,
    Flags(model: default_model, vantage: None, persona: None),
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
      case string.starts_with(arg, "--"), acc.vantage {
        True, _ -> Error("connect does not take `" <> arg <> "`: " <> usage)
        False, None -> parse_flags_into(rest, Flags(..acc, vantage: Some(arg)))
        False, Some(first) ->
          Error(
            "connect takes one vantage, and got `"
            <> first
            <> "` and `"
            <> arg
            <> "`: quote a phrase so the shell passes it as one argument",
          )
      }
  }
}

/// The port a hand-started connector's guard listens on: three hundred
/// above the run base, clear of any run (which counts up from the base), of
/// a seeder started beside it (a hundred above) and of a theorist (two
/// hundred above).
pub fn default_port(cfg: config.Config) -> Int {
  cfg.guard_port + 300
}

// --- who runs -------------------------------------------------------------------

/// Who the session runs as: `theorist.who`, told this region and this
/// role's word. See `theorist.who` for the rule (a name in another region
/// is refused, not borrowed; `busy` is empty on purpose).
pub fn who(
  roster_: roster.Roster,
  persona: Option(String),
) -> Result(schedule.Who, String) {
  theorist.who(roster_, region, "connector", persona)
}

// --- the problem and the file -----------------------------------------------------

/// The problem: always the current P1 frontier as the board has it, the
/// same wall `theorist.default_topic` names — reused as-is, since it hard-
/// codes nothing role-specific — returned whole because the brief carries
/// its description verbatim. A captain who wants a different wall names it
/// inside the vantage text; the vantage never changes which node this is.
pub fn problem(d: dag.Dag) -> Result(dag.Node, String) {
  use id <- result.try(
    theorist.default_topic(d)
    |> result.replace_error(
      "harness/connector: no open wall in P1 to be the problem; the connector sights the P1 frontier and the board has none",
    ),
  )
  list.find(d.nodes, fn(n) { n.id == id })
  |> result.replace_error("harness/connector: the board has no node " <> id)
}

/// What the sighting file is named for: the vantage when one was given,
/// else the problem's id — so two connectors on the frontier with no
/// vantage today are `<date>-<problem>.md` and `<date>-<problem>-2.md`.
pub fn named_for(problem_id: String, vantage: Option(String)) -> String {
  case vantage {
    Some(v) -> v
    None -> problem_id
  }
}

/// This role's directory under `docs/`, the one thing that distinguishes
/// its documents from a theorist's `document_path` family in
/// `theorist.document_path` and kin.
const sighting_dir = "connections"

/// Where the sighting goes when nothing is there yet:
/// `docs/connections/<date>-<slug>.md` under the repository root — delegates
/// to `theorist.document_path` with this role's directory. Pure;
/// `free_sighting_path` is what a session is actually fenced to.
pub fn sighting_path(repo_root: String, date: String, named: String) -> String {
  theorist.document_path(repo_root, date, named, sighting_dir)
}

/// `sighting_path` with an ordinal — delegates to `theorist.numbered_document_path`.
pub fn numbered_sighting_path(
  repo_root: String,
  date: String,
  named: String,
  n: Int,
) -> String {
  theorist.numbered_document_path(repo_root, date, named, sighting_dir, n)
}

/// The first sighting path for `named` today that nothing is at — delegates
/// to `theorist.free_document_path`. Read off the disk at session start,
/// once, and then fixed for the session's life — the guard, the brief, the
/// first message, the dispatch row and the summary all name the one path
/// this returns.
pub fn free_sighting_path(
  repo_root: String,
  date: String,
  named: String,
) -> String {
  theorist.free_document_path(repo_root, date, named, sighting_dir)
}

// --- the report -----------------------------------------------------------------

/// What a connector reports at the end of every turn. `outcome` is the
/// connector's claim about its document — `sighted` once it is written —
/// and never a verdict on the problem. `notebook` is for its future self
/// and `journal` for Dib; the harness writes both to disk verbatim, which is
/// why the session has no write access to `agents/`. `next_vantage` is the
/// document's section 6, repeated here so a captain's next round can be read
/// off the summaries. No size estimate and no bugs: a connector has no node.
/// Not `theorist.Report`: `next_vantage` would lie under `next_topic`'s
/// name, and the two `outcome` enums differ (`sighted` vs `attacked`).
pub type Report {
  Report(
    outcome: String,
    summary: String,
    notebook: String,
    journal: String,
    next_vantage: String,
  )
}

/// The `--json-schema` every connector turn is held to: `theorist.report_schema`
/// with this role's outcome word and field wording.
pub fn report_schema() -> String {
  theorist.report_schema(
    "sighted",
    "an entry for your own notebook, for your future self: what you were wrong about, which field you should have looked at sooner, which resemblances died and at which seam. Empty until the end.",
    "a short written update for Dib, in your own words: which fields you sighted, which dictionaries survived to section 5 and which died in section 4. Empty until the end.",
    "next_vantage",
    "the Next vantage paragraph of your document, verbatim: which field the next connector should attack from and why. Empty until the end.",
  )
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
  use next_vantage <- decode.optional_field("next_vantage", "", decode.string)
  decode.success(Report(outcome:, summary:, notebook:, journal:, next_vantage:))
}

/// The connector's role in the turn loop. `sighted` finishes the session
/// and `abandoned` ends it; anything else is a turn that ended early and
/// gets sent back round. Whether the document exists is checked in `run`,
/// after the session, because it is a fact about the file and not about
/// the turn. Not reused from `theorist.role`: both pattern-match their own
/// concrete `Report` type, which Gleam cannot make generic over here.
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
            "the connector stopped reporting",
          )
        Some(r) ->
          case r.outcome {
            "sighted" -> #(
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
/// knowledge and the task; this names the problem, the vantage and the file
/// again, because the first message is what a session reads last before
/// acting.
pub fn task_message(
  problem_id: String,
  vantage: Option(String),
  sighting_path: String,
) -> String {
  "Sight the problem `"
  <> problem_id
  <> "`"
  <> case vantage {
    Some(v) -> " from the vantage `" <> v <> "`"
    None -> ", choosing your own vantage"
  }
  <> ". Your brief is in your system prompt: read the task text near its top before anything else, then the residual, the obstructions, the sources and the definitions.\n\n"
  <> "Write your sighting document to `"
  <> sighting_path
  <> "`, with the six sections the brief lists, in that order. You may write scripts under explorer/ and run them with `node <script>`, and `lake env lean <file>` where a claim needs checking. You may read the web with WebFetch and WebSearch — GET only, no login, no form — and every URL you reach with those two tools is recorded, so cite by fetching or mark the claim UNVERIFIED. Do not fetch from a script: `node` can reach the network and the harness cannot see it, so a URL reached that way is absent from the record and a citation resting on it is indistinguishable from one you invented. If you fetched it with a script, it is UNVERIFIED. You may not add to docs/obstructions.md: dead ends go in your section 4.\n\n"
  <> "End every turn with the structured report. Set `outcome` to `sighted` only once the document is written and you are done, `in_progress` while you are still working, and `abandoned` if you give up; fill in `notebook`, `journal` and `next_vantage` at the end. The harness writes your notebook from the report — you cannot write agents/ yourself."
}

// --- the brief ------------------------------------------------------------------

/// The sentences a session is briefed with when `docs/connector-brief.md`
/// is not in the checkout: the task as the connector design states it. The
/// full text belongs in that file, not here.
pub const fallback_task = "Look at this problem from every region of mathematics where an object like it has been studied and say what carries over. Write one sighting document with six sections: the problem seen from outside, the fields sighted, three to seven connections each with a dictionary mapping this project's objects to the other field's row by row with its seams, what each leans on with a fetched quote and URL or UNVERIFIED, one test that would kill it, and what it would give; what died in translation; what to hand the theorist; and the next vantage. Nine in ten connections are expected to die. Cite by fetching, or mark it."

/// The brief, assembled from the repository as it stands right now, for
/// `identity` on `problem` from `vantage`, fenced to `sighting_path`.
/// Everything is read from disk at render time. Only this identity's
/// notebook is read: another connector's is not this one's memory, and a
/// theorist's would make the connector think in the theorist's vocabulary.
/// The index, the crystals and the proof notes are not read at all — that
/// is the whole point of this role, and it is why `brief`/`render` are not
/// shared with the theorist's, which reads all three.
pub fn brief(
  cfg: config.Config,
  identity: roster.Identity,
  problem: dag.Node,
  vantage: Option(String),
  sighting_path: String,
) -> Result(String, String) {
  let read = fn(relative: String) {
    simplifile.read(cfg.repo_root <> "/" <> relative)
    |> result.replace_error(Nil)
  }
  Ok(render(
    identity: identity,
    notebook: roster.read_notebook(cfg.agents_dir, identity),
    task: read("docs/connector-brief.md"),
    problem: problem,
    vantage: vantage,
    sighting_path: sighting_path,
    obstructions: read("docs/obstructions.md"),
    sources: read("docs/sources.md"),
    basic: read("Rule30/Basic.lean"),
  ))
}

/// The brief from its parts. The pure half, so it can be tested without a
/// checkout. Section order is the order a session should read in: who it is
/// and what it remembers (`theorist.who_you_are`, told this role's word),
/// the task, the problem with its residual and the fence, the three files
/// that say what is dead, what is held and what the words mean (each
/// inlined with `theorist.inlined`), and last the shape of the document it
/// owes.
pub fn render(
  identity identity: roster.Identity,
  notebook notebook: String,
  task task: Result(String, Nil),
  problem problem: dag.Node,
  vantage vantage: Option(String),
  sighting_path sighting_path: String,
  obstructions obstructions: Result(String, Nil),
  sources sources: Result(String, Nil),
  basic basic: Result(String, Nil),
) -> String {
  string.join(
    [
      theorist.who_you_are(identity, notebook, region, "connector"),
      "",
      "## The task (docs/connector-brief.md)",
      case task {
        Ok(text) -> text
        Error(Nil) ->
          "(docs/connector-brief.md is absent from this checkout)\n\n"
          <> fallback_task
      },
      "",
      "## The problem, your vantage, your file and your fence",
      "Problem: " <> problem.id,
      "",
      case vantage {
        Some(v) -> "Vantage: " <> v
        None ->
          "Vantage: none given — choose one, name it in section 1, and say in section 6 why you chose it"
      },
      "",
      "Sighting document: " <> sighting_path,
      "",
      "You may write exactly one file outside explorer/: the sighting document",
      "above, and not docs/obstructions.md — your dead ends go in section 4, and",
      "a captain moves any that is a real obstruction. Under explorer/ you may",
      "write and edit scripts freely, and run one with `node <one path under",
      "explorer/>`; `lake build [modules]` and `lake env lean <file>` are",
      "permitted, one bare command per call with no shell operators. You may",
      "read the web with WebFetch and WebSearch — GET only, no login, no form,",
      "no POST — and every URL is recorded in the run's log, so a citation in",
      "your document is checked against a fetch that happened. Every other",
      "write is denied by a hook, not by convention: no proposal, no statement,",
      "no node, and not your own notebook — the harness writes that from your",
      "report.",
      "",
      "The residual paragraph, as the board carries it:",
      "",
      seed.open_section([problem]),
      "",
      "## The obstructions (docs/obstructions.md)",
      theorist.inlined(obstructions, "docs/obstructions.md"),
      "",
      "## The sources (docs/sources.md)",
      theorist.inlined(sources, "docs/sources.md"),
      "",
      "## The definitions (Rule30/Basic.lean)",
      theorist.inlined(basic, "Rule30/Basic.lean"),
      "",
      "## What the document must contain",
      "In this order, each under its own heading, a section with nothing in",
      "it still present with one sentence saying so:",
      "",
      "1. The problem, seen from outside.",
      "2. Fields sighted.",
      "3. Connections — three to seven, each with the claim, the dictionary",
      "   and its seams, what it leans on (fetched quote and URL, or",
      "   UNVERIFIED), the test, and what it would give.",
      "4. Died in translation.",
      "5. What to hand the theorist.",
      "6. Next vantage.",
      "",
      "Nine in ten connections are expected to die. A dictionary a theorist",
      "can attack is the deliverable. The document is read by a captain,",
      "beside sightings of the same problem from other vantages.",
    ],
    "\n",
  )
}

// --- the session ----------------------------------------------------------------

/// The two tools a connector has that no other role does, added to
/// `worker.default_tools` on its command line. Granted here and fenced in
/// the guard (`guard.decide_web`): the CLI refuses a tool that is not on
/// its allowlist before any hook fires, so this list is where the grant
/// lives and the guard is where its limits do.
pub const web_tools = ["WebFetch", "WebSearch"]

/// What one connector session left behind: the summary a captain reads,
/// the guard it ran under, its record directory, who ran it, the problem,
/// the vantage and the sighting path it was fenced to. Not `theorist.Session`:
/// `problem`/`vantage`/`sighting_path` would lie under `topic`/`attack_path`'s
/// names.
pub type Session {
  Session(
    summary: String,
    guard: guard.Guard,
    dir: String,
    identity: roster.Identity,
    problem: String,
    vantage: Option(String),
    sighting_path: String,
  )
}

/// Start one connector session, wait for it to end, then look at what it
/// left. The order mirrors `theorist.run`'s, because the contract is the
/// same contract: the problem and who runs are settled before anything is
/// written, so a bad `--as` costs nothing; then the sighting path, chosen
/// once as the first free `<date>-<slug>[-n].md`; then the record
/// directory, the guard and its settings — fenced to that path; then the
/// ceremony if a persona is being minted (`theorist.ensure_identity`); then
/// the brief (no brief, no session) and the session, launched with the two
/// web tools on its allowlist — and only once the session is closed, the
/// notebook and journal from its report and the look at the file it was
/// fenced to write. A session that reported `sighted` with no document on
/// disk is recorded as abandoned, whatever it claimed.
pub fn run(cfg: config.Config, options: Options) -> Result(Session, String) {
  use d <- result.try(dag.load(cfg.dag_path))
  use wall <- result.try(problem(d))
  use roster_ <- result.try(roster.load(cfg.roster_path))
  use who_ <- result.try(who(roster_, options.persona))
  let sighting =
    free_sighting_path(
      cfg.repo_root,
      theorist.today(),
      named_for(wall.id, options.vantage),
    )
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
      role: guard.Connector(sighting_path: sighting),
      holder: session_name,
    ),
    lock_actor,
    l,
    options.port,
  ))
  use _ <- result.try(guard.write_settings(g, g.settings_path))
  use identity <- result.try(theorist.ensure_identity(
    cfg,
    roster_,
    who_,
    options.model,
    g,
    l,
  ))
  use brief_text <- result.try(brief(
    cfg,
    identity,
    wall,
    options.vantage,
    sighting,
  ))
  use brief_path <- result.try(worker.write_brief(l, session_name, brief_text))
  // The connector's ceilings, not the prover's: `worker.launch_with_tools`
  // reads `max_turns` and `max_budget_usd` from whatever config it is handed.
  let session_cfg = config.for_connector(cfg)
  log.event(l, "dispatch", [
    #("role", json.string("connector")),
    #("identity", json.string(identity.name)),
    #("model", json.string(options.model)),
    #("port", json.int(options.port)),
    #("problem", json.string(wall.id)),
    #("vantage", json.string(option.unwrap(options.vantage, ""))),
    #("sighting", json.string(sighting)),
    #("max_turns", json.int(session_cfg.max_turns)),
    #("max_budget_usd", json.float(session_cfg.max_budget_usd)),
    #("log", json.string(l.dir)),
  ])

  let #(tally, ending) =
    worker.drive(
      session_cfg,
      l,
      worker.launch_with_tools(
        session_cfg,
        options.model,
        g,
        brief_path,
        report_schema(),
        list.append(worker.default_tools, web_tools),
      ),
      task_message(wall.id, options.vantage, sighting),
      role(),
    )

  let size = theorist.document_size(sighting)
  write_channels(
    cfg,
    run_log,
    identity,
    wall.id,
    options.vantage,
    options.model,
    ending,
    size,
  )
  let summary_text =
    summary(
      options,
      session_cfg,
      identity,
      wall.id,
      sighting,
      l,
      tally,
      ending,
      size,
    )
  log.summary(run_log, summary_text)
  Ok(Session(
    summary: summary_text,
    guard: g,
    dir: l.dir,
    identity:,
    problem: wall.id,
    vantage: options.vantage,
    sighting_path: sighting,
  ))
}

/// The connector's two channels, each written from the report exactly as
/// the connector wrote it: the notebook under `agents/<Name>.md`, headed
/// with the time, the problem, the vantage, the model and how the session
/// ended; and the journal under the run. A failed notebook write is
/// printed, not fatal — the session happened and its summary must still be
/// written. Not reused from `theorist.write_channels`: the heading text
/// carries the vantage, which a theorist's has no field for, and the two
/// functions close over their own `Report` type.
fn write_channels(
  cfg: config.Config,
  run_log: log.Log,
  identity: roster.Identity,
  problem_id: String,
  vantage: Option(String),
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
            <> problem_id
            <> case vantage {
              Some(v) -> " from " <> v
              None -> ""
            }
            <> " ("
            <> model
            <> ", "
            <> theorist.end_word(ending.end, size, "sighted")
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
            Error(reason) -> io.println_error("harness/connector: " <> reason)
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

/// The summary a captain reads: who ran, the problem, the vantage, where
/// the document is, whether it exists, how the session ended in words that
/// never call a connection proved, the ceilings it ran under, what it cost,
/// and the next vantage the connector named. Not reused from
/// `theorist.summary`: the table has an extra `vantage` line and closes
/// over the connector's own `Report`, but `theorist.ceilings` and
/// `theorist.ended_words` do the two lines that are genuinely shared.
fn summary(
  options: Options,
  cfg: config.Config,
  identity: roster.Identity,
  problem_id: String,
  sighting: String,
  l: log.Log,
  tally: worker.Tally,
  ending: worker.Ending(Report),
  size: Option(Int),
) -> String {
  let next_vantage = case ending.report {
    Some(r) ->
      case string.trim(r.next_vantage) {
        "" -> "(no next vantage reported)"
        text -> text
      }
    None -> "(no report, so no next vantage)"
  }
  string.join(
    [
      "",
      "connector  " <> identity.name,
      "model      " <> options.model,
      "problem    " <> problem_id,
      "vantage    "
        <> case options.vantage {
        Some(v) -> v
        None -> "(none given; the connector chose its own, see section 1)"
      },
      "sighting   " <> sighting,
      "document   "
        <> case size {
        Some(bytes) -> "exists, " <> int.to_string(bytes) <> " bytes"
        None -> "MISSING — nothing is at that path"
      },
      "ended      "
        <> theorist.ended_words(cfg, ending.end, size, "connector", "sighting"),
      "ceilings   " <> theorist.ceilings(cfg),
      "cost       $" <> roster.usd(tally.cost_usd),
      "turns      " <> int.to_string(tally.turns),
      "session    " <> tally.session_id,
      "log        " <> l.dir,
      "",
      ending.notes,
      "",
      "next vantage, in the connector's words:",
      next_vantage,
    ],
    "\n",
  )
}
