//// The connector's rule set: the theorist's with three changes, separate
//// from the prover's, the seeder's and the theorist's.
////
//// A connector writes one sighting document under `docs/connections/`; like
//// a theorist it writes and runs scripts under `explorer/` and keeps the
//// `lake` grammar; unlike a theorist it cannot add to `docs/obstructions.md`
//// — its dead ends go in the document's own section 4 — and it may reach
//// the web, read-only, through `WebFetch` and `WebSearch`. The tests that
//// matter are the negative ones: the obstructions file, the attack
//// directory, the proposal file, the statement file.

import gleam/dynamic/decode
import gleam/erlang/process.{type Subject}
import gleam/json
import gleam/list
import gleam/option.{None, Some}
import gleam/result
import gleam/string
import harness/guard.{type Rules, Rules}
import harness/guard_event
import harness/lock
import harness/log
import harness/shell
import ports
import simplifile

const connector = Rules(
  repo_root: "C:\\r",
  role: guard.Connector(
    sighting_path: "C:\\r\\docs\\connections\\2026-09-07-ergodic-theory.md",
  ),
  holder: "connector-1",
)

fn write(path: String) -> String {
  "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"Write\",\"tool_input\":{\"file_path\":\""
  <> path
  <> "\"}}"
}

fn edit(path: String) -> String {
  "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"Edit\",\"tool_input\":{\"file_path\":\""
  <> path
  <> "\"}}"
}

fn bash(command: String) -> String {
  "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\""
  <> command
  <> "\"}}"
}

// --- what a connector may do --------------------------------------------------

pub fn connector_may_write_its_sighting_document_test() {
  assert guard.decide(
      connector,
      write("c:/r/docs/connections/2026-09-07-ergodic-theory.md"),
    )
    == guard.Allow
  assert guard.decide(
      connector,
      edit("C:\\\\r\\\\docs\\\\connections\\\\2026-09-07-ergodic-theory.md"),
    )
    == guard.Allow
}

pub fn connector_may_write_and_run_scripts_under_explorer_test() {
  assert guard.decide(connector, write("c:/r/explorer/probe.mjs"))
    == guard.Allow
  assert guard.decide(connector, edit("explorer/sub/scan.mjs")) == guard.Allow
  assert guard.decide(connector, bash("node explorer/probe.mjs")) == guard.Allow
}

pub fn connector_keeps_the_lake_grammar_test() {
  assert guard.decide(connector, bash("lake build Rule30.Basic"))
    == guard.AcquireBuild
  assert guard.decide(connector, bash("lake env lean explorer/probe.lean"))
    == guard.Allow
}

// --- the fence ----------------------------------------------------------------

/// The one file the design takes away from this role relative to a
/// theorist: a connector's dead ends go in its own section 4, and a captain
/// moves any that is a real obstruction.
pub fn connector_cannot_write_the_obstructions_file_test() {
  let assert guard.Deny(reason:, ..) =
    guard.decide(connector, edit("c:/r/docs/obstructions.md"))
  assert string.contains(reason, "sighting document")
  assert string.contains(reason, "explorer")
  assert string.contains(reason, "section 4")
  let assert guard.Deny(..) =
    guard.decide(connector, write("c:/r/docs/obstructions.md"))
}

pub fn connector_cannot_write_an_attack_document_or_another_sighting_test() {
  let assert guard.Deny(..) =
    guard.decide(connector, write("c:/r/docs/attacks/2026-09-07-x.md"))
  let assert guard.Deny(..) =
    guard.decide(connector, write("c:/r/docs/connections/2026-09-07-other.md"))
  let assert guard.Deny(..) =
    guard.decide(
      connector,
      write("c:/r/docs/connections/2026-09-07-ergodic-theory-2.md"),
    )
}

pub fn connector_cannot_write_the_proposal_the_statements_or_the_dag_test() {
  let assert guard.Deny(..) =
    guard.decide(connector, write("c:/r/blueprint/proposals/next.json"))
  let assert guard.Deny(..) =
    guard.decide(connector, write("c:/r/Rule30/Statements.lean"))
  let assert guard.Deny(..) =
    guard.decide(connector, write("c:/r/blueprint/dag.json"))
  let assert guard.Deny(..) =
    guard.decide(connector, write("c:/r/agents/Keel.md"))
}

pub fn connector_cannot_escape_explorer_with_dot_dot_test() {
  let assert guard.Deny(..) =
    guard.decide(connector, write("c:/r/explorer/../Rule30/Statements.lean"))
  let assert guard.Deny(..) =
    guard.decide(connector, write("c:/r/explorer_evil/probe.mjs"))
  let assert guard.Deny(..) =
    guard.decide(connector, bash("node explorer/../evil.mjs"))
}

pub fn connector_cannot_pass_node_an_argument_or_use_shell_operators_test() {
  let assert guard.Deny(..) =
    guard.decide(connector, bash("node explorer/probe.mjs 4000"))
  let assert guard.Deny(..) =
    guard.decide(connector, bash("node explorer/a.mjs | tee out.txt"))
  let assert guard.Deny(..) =
    guard.decide(connector, bash("curl https://arxiv.org/abs/1"))
}

// --- no role may message a session ---------------------------------------------

pub fn a_connector_cannot_send_a_message_either_test() {
  let send =
    "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"SendMessage\",\"tool_input\":{\"to\":\"Rowan\",\"message\":\"hi\"}}"
  let assert guard.Deny(reason:, ..) = guard.decide(connector, send)
  assert reason == guard.message_deny_reason
}

// --- the web, read-only, and every URL on the record ------------------------------

const theorist = Rules(
  repo_root: "C:\\r",
  role: guard.Theorist(
    attack_path: "C:\\r\\docs\\attacks\\2026-09-07-the-transients.md",
    obstructions_path: "C:\\r\\docs\\obstructions.md",
  ),
  holder: "theorist-1",
)

fn fetch(url: String) -> String {
  "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"WebFetch\",\"tool_input\":{\"url\":\""
  <> url
  <> "\",\"prompt\":\"quote the abstract\"}}"
}

fn search(query: String) -> String {
  "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"WebSearch\",\"tool_input\":{\"query\":\""
  <> query
  <> "\"}}"
}

pub fn connector_may_fetch_over_http_and_https_and_may_search_test() {
  assert guard.decide(connector, fetch("https://arxiv.org/abs/2001.00001"))
    == guard.Allow
  assert guard.decide(connector, fetch("http://example.org/paper.pdf"))
    == guard.Allow
  assert guard.decide(connector, search("rule 30 expansivity Kopra"))
    == guard.Allow
}

/// The grant is a GET to the web and nothing wider: a `file:` or `ftp:` URL,
/// or one with no scheme, is refused with a reason that says what is allowed.
pub fn connector_cannot_fetch_anything_but_http_test() {
  let assert guard.Deny(kind: guard_event.NotPermitted, reason:) =
    guard.decide(connector, fetch("file:///C:/r/Rule30/Statements.lean"))
  assert reason == guard.web_deny_reason
  let assert guard.Deny(..) = guard.decide(connector, fetch("ftp://x.org/a"))
  let assert guard.Deny(..) = guard.decide(connector, fetch("arxiv.org/abs/1"))
  let assert guard.Deny(..) = guard.decide(connector, fetch(""))
}

/// The web is the connector's alone: the guard refuses it to every other
/// role even though the CLI allowlist already leaves the tools off theirs.
pub fn the_other_roles_cannot_reach_the_web_test() {
  let refused =
    guard.Deny(guard_event.NotPermitted, guard.web_other_role_deny_reason)
  assert guard.decide(theorist, fetch("https://arxiv.org/abs/2001.00001"))
    == refused
  assert guard.decide(theorist, search("rule 30 expansivity")) == refused
  // All three, not just the theorist: the roles share one `case` arm today,
  // so a test that names only one of them stays green if the arm is split
  // and a role lands on `Allow`. The question this test exists to answer is
  // whether the denial is total.
  assert guard.decide(prover, fetch("https://arxiv.org/abs/2001.00001"))
    == refused
  assert guard.decide(prover, search("rule 30 expansivity")) == refused
  assert guard.decide(seeder, fetch("https://arxiv.org/abs/2001.00001"))
    == refused
  assert guard.decide(seeder, search("rule 30 expansivity")) == refused
}

const prover = Rules(
  repo_root: "C:\\r",
  role: guard.Prover(allowed_write: "C:\\r\\Rule30\\Proofs\\X.lean"),
  holder: "prover-1",
)

const seeder = Rules(
  repo_root: "C:\\r",
  role: guard.Seeder(proposal_path: "C:\\r\\blueprint\\proposals\\next.json"),
  holder: "seeder-1",
)

/// A URL scheme is case-insensitive, so `HTTPS://` is a real https URL and
/// denying it would contradict the denial text, which names `https://` as
/// exactly what a connector may fetch.
pub fn the_scheme_check_is_case_insensitive_test() {
  assert guard.decide(connector, fetch("HTTPS://arxiv.org/abs/2001.00001"))
    == guard.Allow
  assert guard.decide(connector, fetch("Http://example.org/paper.pdf"))
    == guard.Allow
}

/// Every `http://` or `https://` token in a hook body, once each, trailing
/// punctuation dropped, JSON quoting ignored.
pub fn urls_in_finds_every_http_token_once_test() {
  assert guard.urls_in(
      "{\"url\":\"https://a.org/x\",\"prompt\":\"see https://a.org/x, and http://b.org/y).\"}",
    )
    == ["https://a.org/x", "http://b.org/y"]
  assert guard.urls_in("no links here") == []
  assert guard.urls_in("ftp://x.org and mailto:a@b.c") == []
}

/// `start_on_free_port_as` and `post_hook` as `guard_test` has them; private
/// there, so copied here.
fn start_as(
  as_rules: Rules,
  lock_actor: Subject(lock.Msg),
  run_log: log.Log,
  attempts: Int,
) -> guard.Guard {
  case
    guard.start_with(
      as_rules,
      lock_actor,
      run_log,
      ports.span(1),
      guard.build_lock_wait_ms,
    ),
    attempts
  {
    Ok(started), _ -> started
    Error(_), n if n > 1 -> start_as(as_rules, lock_actor, run_log, n - 1)
    Error(e), _ ->
      panic as { "guard.start found no free port in 8 attempts: " <> e }
  }
}

fn post_hook(started: guard.Guard, body: String) -> String {
  let assert Ok(curl) = shell.which("curl")
  let assert Ok(r) =
    shell.run(
      curl,
      [
        "-s",
        "-X",
        "POST",
        "-H",
        "x-harness-token: " <> started.token,
        "--data",
        body,
        "http://127.0.0.1:" <> string.inspect(started.port) <> "/hook",
      ],
      ".",
      5000,
    )
  r.output
}

fn row_kind(line: String) -> Result(String, Nil) {
  json.parse(line, decode.at([log.kind_key], decode.string))
  |> result.replace_error(Nil)
}

/// Over the wire: a fetch and a search each leave a `guard` row whose
/// `attempted` is the URL or the query, and a `web` row carrying the URL,
/// the query and every URL in the body — so a citation in the sighting can
/// be matched against a fetch that actually happened. A refused fetch is
/// still on the record, because it is still a URL the session reached for.
pub fn every_web_call_is_logged_over_the_wire_test() {
  let dir = "build/test-runs/connector-web"
  let _ = simplifile.delete(dir)
  let assert Ok(lock_actor) = lock.start(60_000)
  let assert Ok(run_log) = log.open(dir, "run")
  let started = start_as(connector, lock_actor, run_log, 8)

  assert post_hook(started, fetch("https://arxiv.org/abs/2001.00001")) == "{}"
  assert post_hook(started, search("Mahler powers of rational rule 30")) == "{}"
  let refused = post_hook(started, fetch("file:///C:/r/secret"))
  assert string.contains(refused, "\"permissionDecision\":\"deny\"")

  let rows = guard_event.read(run_log, "connector-1")
  assert list.map(rows, fn(r) { #(r.tool, r.attempted, r.denial) })
    == [
      #("WebFetch", "https://arxiv.org/abs/2001.00001", None),
      #("WebSearch", "Mahler powers of rational rule 30", None),
      #("WebFetch", "file:///C:/r/secret", Some(guard_event.NotPermitted)),
    ]

  let assert Ok(events) = simplifile.read(run_log.dir <> "/events.jsonl")
  let web =
    string.split(events, "\n")
    |> list.filter(fn(line) { row_kind(line) == Ok(guard.web_kind) })
  assert list.length(web) == 3
  let assert [first, second, third] = web
  assert string.contains(first, "\"tool\":\"WebFetch\"")
  assert string.contains(first, "\"url\":\"https://arxiv.org/abs/2001.00001\"")
  assert string.contains(
    first,
    "\"urls\":[\"https://arxiv.org/abs/2001.00001\"]",
  )
  assert string.contains(first, "\"node\":\"connector-1\"")
  assert string.contains(second, "\"tool\":\"WebSearch\"")
  assert string.contains(
    second,
    "\"query\":\"Mahler powers of rational rule 30\"",
  )
  assert string.contains(second, "\"urls\":[]")
  assert string.contains(third, "\"url\":\"file:///C:/r/secret\"")
  let assert Ok(_) = simplifile.delete(dir)
}

/// R2: a `WebFetch` that never completes is still a row on the record — the
/// `event` field is `PostToolUseFailure`, not `PreToolUse`, which is what
/// tells a captain the fetch never actually finished.
pub fn a_fetch_that_never_completes_still_leaves_a_web_row_test() {
  let dir = "build/test-runs/connector-web-failure"
  let _ = simplifile.delete(dir)
  let assert Ok(lock_actor) = lock.start(60_000)
  let assert Ok(run_log) = log.open(dir, "run")
  let started = start_as(connector, lock_actor, run_log, 8)

  let body =
    "{\"hook_event_name\":\"PostToolUseFailure\",\"tool_name\":\"WebFetch\",\"tool_input\":{\"url\":\"https://example.org/x\"},\"error\":\"timeout\"}"
  let _ = post_hook(started, body)

  let assert Ok(events) = simplifile.read(run_log.dir <> "/events.jsonl")
  let web =
    string.split(events, "\n")
    |> list.filter(fn(line) { row_kind(line) == Ok(guard.web_kind) })
  let assert [only] = web
  assert string.contains(only, "\"event\":\"PostToolUseFailure\"")
  assert string.contains(only, "\"url\":\"https://example.org/x\"")
  let assert Ok(_) = simplifile.delete(dir)
}

/// R2's other half, and the one that was untested: a fetch that DID return
/// content writes its own row, headed `PostToolUse`. Without this the
/// `PostToolUse` arm of `web_row` could be deleted and nothing would fail —
/// and that arm is the positive half of telling a real citation from a
/// failed fetch followed by a confident quote.
pub fn a_fetch_that_completes_leaves_a_post_row_test() {
  let dir = "build/test-runs/connector-web-completed"
  let _ = simplifile.delete(dir)
  let assert Ok(lock_actor) = lock.start(60_000)
  let assert Ok(run_log) = log.open(dir, "run")
  let started = start_as(connector, lock_actor, run_log, 9)

  let body =
    "{\"hook_event_name\":\"PostToolUse\",\"tool_name\":\"WebFetch\",\"tool_input\":{\"url\":\"https://example.org/ok\"}}"
  let _ = post_hook(started, body)

  let assert Ok(events) = simplifile.read(run_log.dir <> "/events.jsonl")
  let web =
    string.split(events, "
")
    |> list.filter(fn(line) { row_kind(line) == Ok(guard.web_kind) })
  let assert [only] = web
  assert string.contains(only, "\"event\":\"PostToolUse\"")
  assert string.contains(only, "\"url\":\"https://example.org/ok\"")
  let assert Ok(_) = simplifile.delete(dir)
}

/// The Bash denial must describe the role's actual grammar. A connector,
/// seeder and theorist may all run `node <script>` under explorer/, and the
/// denial used to say only the two `lake` forms were permitted — true about
/// everything it named and wrong about the set. Rowan's connector hit this
/// on its first two calls: a session that reads the message carefully
/// concludes it has no computational tool and writes a document with no run
/// tests, which is where the previous round's value almost entirely was.
pub fn the_bash_denial_names_node_for_the_roles_that_have_it_test() {
  let ls = "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\"ls docs/\"}}"
  let assert guard.Deny(reason: c, ..) = guard.decide(connector, ls)
  assert string.contains(c, "node <script>")
  assert string.contains(c, "explorer/")
  assert string.contains(c, "lake build")
  let assert guard.Deny(reason: t, ..) = guard.decide(theorist, ls)
  assert string.contains(t, "node <script>")
  let assert guard.Deny(reason: s, ..) = guard.decide(seeder, ls)
  assert string.contains(s, "node <script>")
  // A prover genuinely has only the two lake forms, so its message must not
  // offer a tool the guard would then deny it.
  let assert guard.Deny(reason: p, ..) = guard.decide(prover, ls)
  assert !string.contains(p, "node")
  assert string.contains(p, "lake build")
}

/// The same must hold for a command refused on shell operators rather than
/// on grammar — that is the arm Rowan's connector actually hit.
pub fn the_shell_operator_denial_also_names_the_roles_grammar_test() {
  let piped = "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\"ls docs/ 2>/dev/null; echo hi\"}}"
  let assert guard.Deny(reason: c, ..) = guard.decide(connector, piped)
  assert string.contains(c, "node <script>")
  assert string.contains(c, "no shell operators")
}
