//// One seeder session, hand-started: `gleam run -- seed`.
////
//// A seeder is a role with a fence, not a prover. It is briefed by
//// `seed.brief_for`, driven by the same turn loop a prover runs in
//// (`worker.drive`), fenced by `guard.Seeder` — anything under `explorer/`
//// plus one proposal file, and `node <script under explorer/>` beside the
//// `lake` grammar — and adjudicated AFTER the session by `seed.check_file`
//// over the proposal, so a captain's review starts from checked claims
//// rather than from prose.
////
//// What it never does: write `Rule30/Statements.lean` or `blueprint/dag.json`
//// (the guard fences both, and nothing here loosens it), write the board or
//// the roster, or record its ending as a verdict on the tier. A seeded node
//// is good only in retrospect — when it closes cheaply and later proofs cite
//// it — so the session's ending is reported in words, and the check report
//// printed under it is the only adjudication there is.
////
//// Not scheduler-triggered, on purpose: an empty board should report itself,
//// not reseed itself.

import gleam/dynamic.{type Dynamic}
import gleam/dynamic/decode
import gleam/float
import gleam/int
import gleam/json
import gleam/option.{type Option, None, Some}
import gleam/result
import gleam/string
import harness/config
import harness/guard
import harness/lock
import harness/log
import harness/roster
import harness/seed
import harness/worker

/// The name the session runs under. The roster has no seeder identity and
/// this verb does not mint one: the naming ceremony keeps a human checkpoint
/// permanently (see the seeder design), so until a name has been chosen the
/// session runs under the plain role name, and no notebook is written for
/// it. Its record is the run directory.
pub const identity = "Seeder"

/// The one session's name, and the guard's lock holder: the directory under
/// `runs/<run-id>/` is `seed-1` the way a prover's is `<node>-<n>`.
pub const session_name = "seed-1"

/// What the verb is told beyond the config: the model to spend, the guard's
/// port, where the proposal goes — which is also the one file outside
/// `explorer/` the guard lets the session write — and the region of the
/// board the tier is for, or `None` for the whole board.
pub type Options {
  Options(
    model: String,
    port: Int,
    proposal_path: String,
    region: Option(String),
  )
}

/// The `seed` verb's flags, parsed: `--model M` and `--region R`, in either
/// order, either one absent. The model defaults to the top of the ladder
/// because the brief is where the quality lives and a seeding pass is the
/// part worth spending on; the region defaults to none, which is the whole
/// board.
pub type Flags {
  Flags(model: String, region: Option(String))
}

pub const default_model = "opus"

/// Parse the arguments after `seed`. An unknown flag or a flag without its
/// value is refused, because a session started with a misspelt `--region`
/// silently briefs the whole board and spends the pass on the wrong region.
pub fn parse_flags(flags: List(String)) -> Result(Flags, String) {
  parse_flags_into(flags, Flags(model: default_model, region: None))
}

fn parse_flags_into(flags: List(String), acc: Flags) -> Result(Flags, String) {
  case flags {
    [] -> Ok(acc)
    ["--model", model, ..rest] -> parse_flags_into(rest, Flags(..acc, model:))
    ["--region", region, ..rest] ->
      parse_flags_into(rest, Flags(..acc, region: Some(region)))
    [flag] if flag == "--model" || flag == "--region" ->
      Error(flag <> " needs a value")
    [other, ..] ->
      Error(
        "seed does not take `" <> other <> "`: seed [--model M] [--region R]",
      )
  }
}

/// The port a hand-started seeder's guard listens on. A run's guards count
/// up from `cfg.guard_port` one per attempt, and `mist` cannot report a bind
/// failure as an error — it takes the process down — so a seeder started
/// beside a live run must not land on a port the run may reach. A hundred
/// above is clear of any run this project has had.
pub fn default_port(cfg: config.Config) -> Int {
  cfg.guard_port + 100
}

/// What a seeder reports at the end of every turn. `outcome` is the seeder's
/// claim about its file — `proposed` once the proposal is written — and
/// never a claim about the tier. No size estimate, no notebook and no bugs:
/// a seeder has no node to price, no roster entry to keep a
/// notebook under, and its one voice outside the session is the journal.
pub type Report {
  Report(outcome: String, summary: String, journal: String)
}

/// The `--json-schema` every seeder turn is held to.
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
              json.array(["in_progress", "proposed", "abandoned"], json.string),
            ),
          ]),
        ),
        #("summary", string_field("one sentence on the state of the proposal")),
        #(
          "journal",
          string_field(
            "a short written update for Dib, in your own words: what you looked at, what you proposed and why, what you could not check. Empty until the end.",
          ),
        ),
      ]),
    ),
    #("required", json.array(["outcome", "summary", "journal"], json.string)),
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
  decode.success(Report(outcome:, summary:, journal:))
}

/// The seeder's role in the turn loop. `proposed` finishes the session and
/// `abandoned` ends it; anything else is a turn that ended early and gets
/// sent back round. Nothing is adjudicated here — the check runs over the
/// file after the session, in `run`, because it is a check of the file and
/// not of the session — so a rate-limited turn is simply parked.
pub fn role() -> worker.Role(Report) {
  worker.Role(
    // Identity: there is no artifact here a machine can adjudicate. A
    // prover salvages an ending by asking `lake` whether the proof on disk
    // is real; a seeder produces prose, so its `Finished` has always
    // meant "it says it wrote something" and nothing else can be checked.
    salvage: fn(_l, ending) { ending },
    decode: report_from_dynamic,
    act: fn(t, report) {
      case report {
        None ->
          worker.nudge(
            t,
            report,
            "Your turn carried no structured report. End every turn with the report the harness asked for.",
            "the seeder stopped reporting",
          )
        Some(r) ->
          case r.outcome {
            "proposed" -> #(
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
/// knowledge; this carries the task and the exact file shape, because
/// `seed.decode_proposals` is loud on a malformed file and a session that
/// guesses the field names writes a proposal nothing can check.
///
/// With a `region`, the task says the tier is for that region and nothing
/// else. A proposal carries no `region` field — the captain lands it under
/// the region the pass was for — so the fence is stated in words here and
/// in the brief, and not as a field the decoder would then have to check.
pub fn task_message(proposal_path: String, region: Option(String)) -> String {
  "Propose the next tier. Your brief is in your system prompt: read the closed table and the provers' notes before writing anything, and explore with scripts under explorer/ and `lake env lean` on files there where a claim needs checking.\n\n"
  <> case region {
    None -> ""
    Some(r) ->
      "This tier is for region "
      <> r
      <> " and nothing else: every proposal must be a node of "
      <> r
      <> ", and the captain lands it under that region. A proposal outside "
      <> r
      <> " will not be landed, however true or cheap it is.\n\n"
  }
  <> "Write your proposal to `"
  <> proposal_path
  <> "` as one JSON document of this exact shape:\n\n"
  <> "```json\n"
  <> "{\"proposals\": [\n"
  <> "  {\"id\": \"<node id>\", \"lean_name\": \"<theorem name>\",\n"
  <> "   \"statement\": \"theorem <theorem name> ... := by\\n  sorry\",\n"
  <> "   \"reason\": \"<why it is true, in English>\",\n"
  <> "   \"disclaims\": \"<what it does NOT prove; empty for most nodes>\",\n"
  <> "   \"route\": {\"tactics\": \"<tactic block>\", \"imports\": []},\n"
  <> "   \"witness\": {\"expression\": \"<Bool-valued Lean expression>\", \"imports\": [], \"range\": \"<the finite range it covers>\"}}\n"
  <> "]}\n"
  <> "```\n\n"
  <> "`id`, `lean_name`, `statement` and `reason` are required; `disclaims`, `route` and `witness` are optional and a missing one claims nothing. "
  <> "The harness checks every route and witness after this session ends, and a captain reads the check before the proposal.\n\n"
  <> "End every turn with the structured report. Set `outcome` to `proposed` only once the file is written and you are done, `in_progress` while you are still working, and `abandoned` if you give up; fill in `journal` at the end."
}

/// What one seeder session left behind: the summary a captain reads, the
/// guard it ran under, and its record directory.
pub type Session {
  Session(summary: String, guard: guard.Guard, dir: String)
}

/// Start one seeder session, wait for it to end, then check its proposal.
///
/// The order is the contract: brief first (no brief, no session), then the
/// record directory, the guard and its settings, then the session, and only
/// once the session is closed the check — over the file the session was
/// fenced to write, whether or not it wrote one. A check that cannot run
/// (no file, no `.lake`) is part of the summary rather than an error from
/// this function, because the session happened and its record must say so.
pub fn run(cfg: config.Config, options: Options) -> Result(Session, String) {
  use brief_text <- result.try(seed.brief_at(
    cfg,
    options.proposal_path,
    region: options.region,
  ))
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
      role: guard.Seeder(proposal_path: options.proposal_path),
      holder: session_name,
    ),
    lock_actor,
    l,
    options.port,
  ))
  use _ <- result.try(guard.write_settings(g, g.settings_path))
  // The seeder's ceilings, not the prover's: `worker.launch` reads
  // `max_turns` and `max_budget_usd` from whatever config it is handed.
  let session_cfg = config.for_seeder(cfg)
  log.event(l, "dispatch", [
    #("role", json.string("seeder")),
    #("identity", json.string(identity)),
    #("model", json.string(options.model)),
    #("port", json.int(options.port)),
    #("proposal", json.string(options.proposal_path)),
    #("region", json.nullable(options.region, json.string)),
    #("max_turns", json.int(session_cfg.max_turns)),
    #("max_budget_usd", json.float(session_cfg.max_budget_usd)),
    #("log", json.string(l.dir)),
  ])

  let #(tally, ending) =
    worker.drive(
      session_cfg,
      l,
      worker.launch(session_cfg, options.model, g, brief_path, report_schema()),
      task_message(options.proposal_path, options.region),
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

  let check = case seed.check_file(cfg, options.proposal_path) {
    Ok(report) -> report
    Error(reason) -> "the check could not run: " <> reason
  }
  let summary = summary(options, session_cfg, l, tally, ending, check)
  log.summary(run_log, summary)
  Ok(Session(summary:, guard: g, dir: l.dir))
}

/// The summary a captain reads: how the session ended, in words that never
/// call a seeding session proved; the ceilings it ran under; what it cost;
/// where its record is; and the check report under it.
fn summary(
  options: Options,
  cfg: config.Config,
  l: log.Log,
  tally: worker.Tally,
  ending: worker.Ending(Report),
  check: String,
) -> String {
  string.join(
    [
      "",
      "seeder    " <> identity,
      "model     " <> options.model,
      "region    " <> option.unwrap(options.region, "(whole board)"),
      "ended     " <> ended_words(cfg, ending.end),
      "ceilings  "
        <> int.to_string(cfg.max_turns)
        <> " turns, $"
        <> float.to_string(cfg.max_budget_usd),
      "cost      $" <> roster.usd(tally.cost_usd),
      "turns     " <> int.to_string(tally.turns),
      "session   " <> tally.session_id,
      "log       " <> l.dir,
      "proposal  " <> options.proposal_path,
      "",
      ending.notes,
      "",
      "check of " <> options.proposal_path <> ":",
      check,
    ],
    "\n",
  )
}

/// How the session ended, for the summary. `Finished` is worded as what it
/// is — the seeder's claim that its file is written — because the only
/// verdict a seeding session can get is the check under it, and a line
/// reading `proved` here would be inventing a signal that does not exist.
/// A ceiling is named with its value from the config the session ran
/// under: the seeder's own ceilings, not the prover's.
fn ended_words(cfg: config.Config, end: worker.End) -> String {
  case end {
    worker.Finished ->
      "finished — the seeder reported its proposal written; that is its claim about the file, and the check below is the only adjudication"
    worker.Abandoned -> "abandoned by the seeder"
    worker.TimedOut -> "timed out"
    worker.BudgetExhausted(ceiling) ->
      "stopped at " <> worker.ceiling_words(cfg, ceiling)
    worker.RateLimited -> "rate limited"
    worker.Refused(category) ->
      "refused by the API ("
      <> category
      <> ") — nothing was attempted, and the same brief on a different model is the move"
  }
}
