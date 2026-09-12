//// CLI entry point.
////
//// `gleam run` starts in `harness/`, but every worker session inherits the
//// BEAM's working directory and every path in the DAG is written relative
//// to the repository root — so the first thing `main` does, after resolving
//// the config, is `cd` there.

import argv
import envoy
import gleam/bool
import gleam/int
import gleam/io
import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/result
import gleam/string
import harness/bugs
import harness/claude
import harness/config
import harness/connector
import harness/dag
import harness/dispatch
import harness/index
import harness/log
import harness/reverify
import harness/schedule
import harness/seed
import harness/seeder
import harness/theorist
import harness/writes

pub fn main() {
  case config.load() {
    // Halting here too, not only in `print_outcome`. A config that will not
    // load is the earliest failure there is and was the last one still
    // exiting 0 — found by Rowan asking what my count of the exit-zero call
    // sites had been measured over, which turned out to be two different
    // tokens and this line among them.
    Error(reason) -> {
      io.println_error(reason)
      halt_with(1)
    }
    Ok(cfg) -> {
      let _ = set_cwd(cfg.repo_root)
      run(cfg, argv.load().arguments)
    }
  }
}

fn run(cfg: config.Config, arguments: List(String)) -> Nil {
  case arguments {
    ["spike"] -> spike()
    ["status"] -> print_outcome(dispatch.status(cfg))
    ["prove-one", node_id] ->
      print_outcome(
        dispatch.prove_one(cfg, node_id)
        |> result.map(fn(outcome) {
          "attempt ended: " <> dag.outcome_to_string(outcome)
        }),
      )
    ["reopen", node_id] -> print_outcome(dispatch.reopen(cfg, node_id))
    // `reverify` re-runs the real check against a node already marked
    // proved and brings its **Checked type** block back in step with the
    // seeded statement. Nothing else could rewrite that block, so a captain
    // who changed a statement left every proof under it asserting a
    // signature that was no longer true — in the harness's own voice, and
    // invisibly, because the block is a comment.
    //
    // With a node id it verifies and writes. With `--all` it verifies every
    // proved node and writes NOTHING: a file with no block is either a
    // parser defect or one that predates the annotation, this
    // cannot tell which from the file alone, and a sweep that wrote would
    // backfill all of them in one unreviewable commit.
    ["reverify", "--all"] -> print_outcome(reverify_all(cfg))
    ["reverify", node_id] -> print_outcome(reverify_one(cfg, node_id))
    ["reverify"] -> print_outcome(Error("reverify needs <node-id> or --all"))
    ["run", ..flags] ->
      print_outcome(
        schedule.parse_plan(flags)
        |> result.try(fn(plan) { dispatch.run(cfg, plan) })
        |> result.map(fn(_) { "run ended" }),
      )
    ["bugs", "file", path] -> print_outcome(file_bug(cfg, path))
    ["bugs", "file"] ->
      print_outcome(Error("bugs file needs <path-to-row.json>"))
    ["bugs", "claim", id, "--as", identity] ->
      print_outcome(claim_bug(cfg, id, identity, None))
    ["bugs", "claim", id, "--as", identity, "--session", ref] ->
      print_outcome(claim_bug(cfg, id, identity, Some(ref)))
    ["bugs", "claim", _] ->
      print_outcome(Error("bugs claim needs --as <Identity>"))
    ["bugs", "reopen", id] -> print_outcome(reopen_bug(cfg, id))
    // `bugs search` is the verb a session reaches for when it is SURPRISED,
    // as opposed to `bugs --area`/`--severity`, which are for browsing. It
    // searches bodies and it includes closed rows, because a closed row is
    // the best possible answer to "has anyone seen this before" — it names
    // the sha that fixed it.
    ["bugs", "search", ..terms] ->
      print_outcome(search_bugs(cfg, string.join(terms, " ")))
    ["bugs", "close", id, verdict, "--resolution", text] ->
      print_outcome(close_bug(cfg, id, verdict, text))
    ["bugs", "close", _, _] | ["bugs", "close", _, _, "--resolution"] ->
      print_outcome(Error("bugs close needs --resolution <text>"))
    ["bugs", ..flags] -> print_outcome(bug_board(cfg, flags))
    ["writes"] -> print_outcome(writes.report(cfg))
    // `index` re-renders `blueprint/index.md` from the board as it stands,
    // for a landing done by hand. The dispatcher renders it itself at every
    // close, so this is never needed after a run.
    ["index"] -> print_outcome(index.write(cfg))
    // `seed brief` and `seed check` are read-only and take no build lock —
    // `lake env lean` reads oleans. They are separate verbs rather than
    // stages of one command on purpose: a captain writing a tier by hand
    // wants the check without a session, and a session that has written a
    // proposal wants the check without re-running itself.
    ["seed", "brief"] -> print_outcome(seed.brief_for(cfg))
    ["seed", "brief", "--region", region] ->
      print_outcome(seed.brief_at(
        cfg,
        seed.proposal_path(cfg.repo_root),
        region: Some(region),
      ))
    ["seed", "check"] ->
      print_outcome(seed.check_file(cfg, seed.proposal_path(cfg.repo_root)))
    ["seed", "check", path] -> print_outcome(seed.check_file(cfg, path))
    // `seed` alone starts one seeder session — hand-started, never by the
    // scheduler — and runs `seed check` over its proposal once it ends.
    // `--model M` picks the model (see `seeder.default_model` for why the
    // default is the top of the ladder) and `--region R` aims the pass at
    // one region of the board, in either order.
    ["seed", ..flags] ->
      print_outcome(
        seeder.parse_flags(flags)
        |> result.try(fn(parsed) { seed_session(cfg, parsed) }),
      )
    // `theorise` starts one theorist session — hand-started, never by the
    // scheduler — on a topic, or on the P1 frontier when none is given, as
    // the named theorist or the eldest idle one (minting one when the
    // roster has none), and reports where its attack document is once it
    // ends. `theorize` is the same verb spelt the other way.
    ["theorise", ..flags] | ["theorize", ..flags] ->
      print_outcome(
        theorist.parse_flags(flags)
        |> result.try(fn(parsed) { theorist_session(cfg, parsed) }),
      )
    // `connect` starts one connector session — hand-started, never by the
    // scheduler — on the P1 frontier from a vantage, or from one the
    // connector chooses when none is given, as the named connector or the
    // eldest one (minting one when the roster has none), and reports where
    // its sighting document is once it ends.
    ["connect", ..flags] ->
      print_outcome(
        connector.parse_flags(flags)
        |> result.try(fn(parsed) { connector_session(cfg, parsed) }),
      )
    _ -> io.println(usage())
  }
}

/// What `gleam run --` prints for an argument list it does not recognise:
/// every verb, in the shape a captain types it.
pub fn usage() -> String {
  "usage: gleam run -- status | prove-one <node-id> | run [--max-attempts N] [--concurrency K] | reopen <node-id> | reverify <node-id> | reverify --all | bugs [--area A] [--severity S] [--all] | bugs file <path-to-row.json> | bugs claim <id> --as <Identity> [--session <ref>] | bugs reopen <id> | bugs search <text> | bugs close <id> fixed|wontfix --resolution <text> | writes | index | seed [--model M] [--region R] | seed brief [--region R] | seed check [path] | theorise [<topic>] [--as <Name> | --mint] [--model M] | connect [<vantage>] [--as <Name> | --mint] [--model M] | spike"
}

/// One theorist session on the parsed flags' model, topic and persona, on
/// the theorist's own guard port; the summary it returns names who ran,
/// the attack document and whether it exists.
fn theorist_session(
  cfg: config.Config,
  flags: theorist.Flags,
) -> Result(String, String) {
  theorist.run(
    cfg,
    theorist.Options(
      model: flags.model,
      port: theorist.default_port(cfg),
      topic: flags.topic,
      persona: flags.persona,
      mint: flags.mint,
    ),
  )
  |> result.map(fn(session) { session.summary })
}

/// One connector session on the parsed flags' model, vantage and persona,
/// on the connector's own guard port; the summary it returns names who
/// ran, the sighting document and whether it exists.
fn connector_session(
  cfg: config.Config,
  flags: connector.Flags,
) -> Result(String, String) {
  connector.run(
    cfg,
    connector.Options(
      model: flags.model,
      port: connector.default_port(cfg),
      vantage: flags.vantage,
      persona: flags.persona,
      mint: flags.mint,
    ),
  )
  |> result.map(fn(session) { session.summary })
}

/// One seeder session on the parsed flags' model, aimed at their region if
/// one was given, fenced to the default proposal path, on the seeder's own
/// guard port; the summary it returns ends with the check report over that
/// proposal.
fn seed_session(
  cfg: config.Config,
  flags: seeder.Flags,
) -> Result(String, String) {
  seeder.run(
    cfg,
    seeder.Options(
      model: flags.model,
      port: seeder.default_port(cfg),
      proposal_path: seed.proposal_path(cfg.repo_root),
      region: flags.region,
    ),
  )
  |> result.map(fn(session) { session.summary })
}

/// The bug board, rendered. Open and claimed bugs newest first, unless
/// `--all` also asks for the settled ones.
fn bug_board(
  cfg: config.Config,
  flags: List(String),
) -> Result(String, String) {
  use area <- result.try(flag_value(
    flags,
    "--area",
    bugs.area_from_string,
    "area",
  ))
  use severity <- result.try(flag_value(
    flags,
    "--severity",
    bugs.severity_from_string,
    "severity",
  ))
  use board <- result.try(bugs.load(cfg.bugs_path))
  let all = list.contains(flags, "--all")
  case bugs.filtered(board, area, severity, all) {
    [] -> Ok("no bugs match")
    matched -> Ok(string.join(list.map(matched, bug_line), "\n"))
  }
}

/// Put a hand-written row on the board, once the board's own decoder has
/// accepted it. The row is validated before anything is written, so a word
/// outside an enum is refused here — naming the field, the word and the
/// valid set — instead of refusing the whole board at the next load.
/// Re-verify one proved node and bring its **Checked type** block back in
/// step with the seeded statement.
///
/// Refuses a node that is not `Proved`: re-verification is a statement about
/// a closed node, and running it against an open one would either fail for
/// the ordinary reason (there is no proof yet) or, worse, succeed against a
/// proof file an abandoned attempt happened to leave behind.
fn reverify_one(cfg: config.Config, node_id: String) -> Result(String, String) {
  use node <- result.try(proved_node(cfg, node_id))
  let env = reverify.live_env(cfg.repo_root, cfg.lake)
  Ok(reverify.report([reverify.one(env, node)]))
}

/// Re-verify every proved node, writing nothing. Every node elaborates, so
/// this is minutes and takes the build lock nowhere near a live run.
fn reverify_all(cfg: config.Config) -> Result(String, String) {
  use d <- result.try(dag.load(cfg.dag_path))
  let proved = list.filter(d.nodes, fn(n) { n.status == dag.Proved })
  let env = reverify.live_env(cfg.repo_root, cfg.lake)
  Ok(reverify.report(reverify.survey(env, proved)))
}

fn proved_node(
  cfg: config.Config,
  node_id: String,
) -> Result(dag.Node, String) {
  use d <- result.try(dag.load(cfg.dag_path))
  use node <- result.try(
    dag.get(d, node_id)
    |> result.replace_error("no node `" <> node_id <> "` in " <> cfg.dag_path),
  )
  case node.status {
    dag.Proved -> Ok(node)
    other ->
      Error(
        "`"
        <> node_id
        <> "` is "
        <> dag.status_to_string(other)
        <> ", not proved; reverify only re-checks a node that is already closed",
      )
  }
}

/// Find rows by what a session actually has in hand — an error string, a
/// number, a `file:line` — rather than by the axes used for browsing.
fn search_bugs(cfg: config.Config, needle: String) -> Result(String, String) {
  use <- bool.guard(
    string.trim(needle) == "",
    Error("bugs search needs some text to look for"),
  )
  use board <- result.try(bugs.load(cfg.bugs_path))
  case bugs.search(board, needle) {
    [] -> Ok("no row mentions `" <> needle <> "`")
    hits ->
      Ok(
        string.join(
          list.map(hits, fn(hit) {
            let #(b, line) = hit
            "  " <> bugs.status_to_string(b.status) <> "  " <> b.id <> "
      " <> line
          }),
          "
",
        )
        <> "
"
        <> int.to_string(list.length(hits))
        <> " row(s) mention `"
        <> needle
        <> "` (closed rows included on purpose)",
      )
  }
}

fn file_bug(cfg: config.Config, path: String) -> Result(String, String) {
  use bug <- result.try(bugs.file_at(
    board_path: cfg.bugs_path,
    row_path: path,
    now: log.now_iso(),
  ))
  Ok(
    "`"
    <> bug.id
    <> "` is now "
    <> bugs.status_to_string(bug.status)
    <> " on the board, filed by "
    <> bug.reported_by
    <> " at "
    <> bug.filed,
  )
}

/// Take a bug for `identity`, stamping the claim with the time so the next
/// reader can tell a live holder from a dead one, and with the session ref
/// when given so they can check `ListAgents` rather than ask.
fn claim_bug(
  cfg: config.Config,
  id: String,
  identity: String,
  ref: Option(String),
) -> Result(String, String) {
  use board <- result.try(bugs.load(cfg.bugs_path))
  let now = log.now_iso()
  use claimed <- result.try(bugs.claim(board, id, identity, ref, now))
  use _ <- result.try(bugs.save(claimed, cfg.bugs_path))
  Ok(
    "`"
    <> id
    <> "` is now claimed by "
    <> identity
    <> " since "
    <> now
    <> case ref {
      None -> ""
      Some(r) -> " (session " <> r <> ")"
    },
  )
}

/// Put a claimed bug back on the board. The bug module's `reopen` refuses
/// anything but `Claimed`; this only adds who was holding it to the message.
fn reopen_bug(cfg: config.Config, id: String) -> Result(String, String) {
  use board <- result.try(bugs.load(cfg.bugs_path))
  use before <- result.try(
    bugs.get(board, id)
    |> result.replace_error("no bug `" <> id <> "` on the board"),
  )
  use reopened <- result.try(bugs.reopen(board, id))
  use _ <- result.try(bugs.save(reopened, cfg.bugs_path))
  let held = case before.claimed_by, before.claimed_at {
    Some(who), Some(when) -> "was claimed by " <> who <> " since " <> when
    Some(who), None -> "was claimed by " <> who
    None, _ -> "was claimed by hand, with no holder recorded,"
  }
  Ok(
    "`"
    <> id
    <> "` "
    <> held
    <> " and is now open. A claim outlives the session that made it, so "
    <> "this is how a dead session's bug gets back on the board.",
  )
}

/// Settle a bug with a verdict and the reason for it. The verdict is parsed
/// here so a typo is refused before the board is even loaded.
fn close_bug(
  cfg: config.Config,
  id: String,
  verdict: String,
  resolution: String,
) -> Result(String, String) {
  use status <- result.try(case bugs.status_from_string(verdict) {
    Ok(bugs.Fixed) -> Ok(bugs.Fixed)
    Ok(bugs.Wontfix) -> Ok(bugs.Wontfix)
    _ -> Error("bugs close takes fixed or wontfix")
  })
  use board <- result.try(bugs.load(cfg.bugs_path))
  use closed <- result.try(bugs.close(
    board,
    id,
    status,
    resolution,
    log.now_iso(),
  ))
  use _ <- result.try(bugs.save(closed, cfg.bugs_path))
  Ok(
    "`"
    <> id
    <> "` is now "
    <> bugs.status_to_string(status)
    <> ": "
    <> resolution,
  )
}

fn bug_line(bug: bugs.Bug) -> String {
  string.join(
    [
      pad(bugs.severity_to_string(bug.severity), 9),
      pad(bugs.area_to_string(bug.area), 9),
      pad(bugs.status_to_string(bug.status), 8),
      pad(bug.id, 40),
      bug.title,
      case bug.occurrences {
        1 -> ""
        n -> " (x" <> int.to_string(n) <> ")"
      },
      "  — " <> bug.reported_by,
      case bug.claimed_by {
        None -> ""
        Some(who) ->
          "  [claimed by "
          <> who
          <> " since "
          <> option.unwrap(bug.claimed_at, "?")
          <> case bug.claimed_ref {
            None -> ""
            Some(ref) -> ", session " <> ref
          }
          <> "]"
      },
    ],
    "",
  )
}

fn pad(text: String, width: Int) -> String {
  string.pad_end(text, width, " ") <> " "
}

/// Read `--flag value` out of the argument list, parsing it with `parse`. An
/// absent flag is `None`; a present flag with an unparseable value is an
/// error, because silently ignoring a typo'd filter shows the wrong board.
pub fn flag_value(
  flags: List(String),
  name: String,
  parse: fn(String) -> Result(a, Nil),
  label: String,
) -> Result(Option(a), String) {
  case flags {
    [flag, value, ..] if flag == name ->
      parse(value)
      |> result.map(Some)
      |> result.replace_error("unknown " <> label <> " `" <> value <> "`")
    [flag] if flag == name -> Error(name <> " needs a value")
    [_, ..rest] -> flag_value(rest, name, parse, label)
    [] -> Ok(None)
  }
}

/// Print a verb's result and, on failure, EXIT NONZERO.
///
/// The exit status is the contract. Every error path here halts: an
/// unresolvable node, a board row the decoder refused, a guard that could not
/// bind. A verb that prints an error and returns is indistinguishable from
/// success to anything reading `$?`.
///
/// **The reader is the weak link and this cannot fix it.** A caller that
/// pipes — `gleam run -- prove-one x | tail -3` — reads `tail`'s status, not
/// this one, so the exit code is sent and never received. Use
/// `${PIPESTATUS[0]}`, or no pipe and `; echo "EXIT=$?"`.
fn print_outcome(outcome: Result(String, String)) -> Nil {
  case outcome {
    Ok(text) -> io.println(text)
    Error(reason) -> {
      io.println_error("harness: " <> reason)
      halt_with(1)
    }
  }
}

/// Stop the node with an exit status. See `harness_ffi:halt_with/1` for why
/// stderr is flushed first.
@external(erlang, "harness_ffi", "halt_with")
fn halt_with(status: Int) -> Nil

@external(erlang, "harness_ffi", "set_cwd")
fn set_cwd(dir: String) -> Result(Nil, Nil)

fn spike() {
  let node =
    envoy.get("HARNESS_NODE")
    |> result.unwrap("C:\\Program Files\\nodejs\\node.exe")
  let exe =
    envoy.get("HARNESS_CLAUDE")
    |> result.unwrap(
      "C:\\Users\\dibuj\\AppData\\Roaming\\npm\\node_modules\\@anthropic-ai\\claude-code\\bin\\claude.exe",
    )
  let shim = "C:\\Users\\dibuj\\dev\\rule30\\harness\\shim\\claude_shim.mjs"
  let launch =
    claude.Launch(
      node:,
      shim:,
      exe:,
      args: [
        "-p",
        "--input-format",
        "stream-json",
        "--output-format",
        "stream-json",
        "--verbose",
        "--model",
        "sonnet",
        "--max-turns",
        "2",
      ],
      env: [],
    )
  let session = claude.start(launch)
  claude.send(session, "Remember the number 42. Reply with just OK.")
  let assert Ok(#(session, r1, seen1)) = claude.read_turn(session, 120_000)
  report("turn 1", r1, seen1)
  claude.send(session, "What number did I ask you to remember? Digits only.")
  let assert Ok(#(session, r2, seen2)) = claude.read_turn(session, 120_000)
  report("turn 2", r2, seen2)
  claude.finish(session)
  let assert Ok(#(_, last, _)) = claude.read_turn(session, 30_000)
  case last {
    claude.Exited(status) -> io.println("exited " <> int.to_string(status))
    _ -> io.println("unexpected: no exit after EOF")
  }
  case session.session_id {
    Some(id) -> io.println("session " <> id)
    None -> io.println("no session id seen")
  }
}

fn report(label: String, result: claude.Event, seen: List(claude.Event)) {
  io.println(
    "== " <> label <> ": " <> int.to_string(list.length(seen)) <> " events",
  )
  list.each(seen, fn(e) {
    case e {
      claude.Assistant(raw) ->
        io.println("assistant: " <> claude.assistant_text(raw))
      claude.RateLimit(u, _, _, _) ->
        io.println("rate limit five_hour utilization " <> float_to_string(u))
      claude.Init(id, _) -> io.println("init " <> id)
      claude.ApiRetry(err, n, _) ->
        io.println("api_retry " <> err <> " #" <> int.to_string(n))
      _ -> Nil
    }
  })
  case result {
    claude.TurnResult(session_id:, total_cost_usd:, num_turns:, ..) ->
      io.println(
        "result session="
        <> session_id
        <> " cost="
        <> float_to_string(total_cost_usd)
        <> " turns="
        <> int.to_string(num_turns),
      )
    claude.Exited(s) -> io.println("exited early " <> int.to_string(s))
    _ -> Nil
  }
}

@external(erlang, "erlang", "float_to_binary")
fn float_to_string(f: Float) -> String
