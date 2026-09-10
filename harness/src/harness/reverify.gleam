//// Re-run verification against a node that is already marked `Proved`, and
//// rewrite its **Checked type** block from the result.
////
//// The block is described in `CLAUDE.md` as the only sentence in a proof
//// file the harness stands behind. It is written once, by the attempt that
//// closed the node, and until this module existed nothing could rewrite it.
//// So a captain who changed a seeded statement left every proof underneath
//// it asserting, in the harness's own voice, a signature that was no longer
//// the statement — and `lake build` cannot notice, because the block is a
//// comment. That is the failure in its purest form: confident, correctly
//// formatted, attributed to the component with the most authority in the
//// repo, and wrong.
////
//// **"Agrees" here means what the gate means by it.** This re-runs
//// `verify.verify`, so a node that agrees has elaborated against the seeded
//// statement with no axiom beyond `propext`, `Classical.choice` and
//// `Quot.sound`. Merely elaborating is not enough, and a check that settled
//// for it would pass exactly the proofs worth catching.
////
//// **Two scopes, and the split is deliberate.** `one` verifies a single node
//// and writes; `survey` verifies many and writes nothing. A file with no
//// block is either of two unrelated things and this module cannot tell them
//// apart from the file alone: many proof files predate `5ee56fc`, where the
//// annotation landed, and were never annotated at all; others lost their
//// block to a parser defect (see `verify.statement_of`). As measured on
//// 2026-09-10 that was 34 and 2 of 113 — a ratio that moves as nodes close,
//// so treat it as the reason for the split rather than as a current count.
////
//// Writing on a sweep would backfill every one of them in a single
//// unreviewable commit, so a sweep reports and a human then aims `one` at
//// what they meant. Nothing here writes a block that a verification did not
//// just produce.

import gleam/int
import gleam/list
import gleam/option
import gleam/result
import gleam/string
import harness/dag
import harness/verify
import simplifile

/// What re-verifying one node found.
pub type Outcome {
  /// The block already said what Lean prints. Nothing written.
  Agrees(node: dag.Node)
  /// The block disagreed with the current statement and was rewritten.
  /// This is drift repaired, and it is the case the verb exists for.
  Refreshed(node: dag.Node, before: String, after: String)
  /// The block disagrees with the current statement and was LEFT ALONE,
  /// because a survey writes nothing. Distinct from `Refreshed` on purpose:
  /// naming an outcome after a write that did not happen is the exact defect
  /// this module was written to fix, and it would be absurd to reproduce it
  /// here.
  Drifted(node: dag.Node, before: String, after: String)
  /// The file had no block and now has one. Not a fabrication: it carries
  /// the signature from a check that ran a moment ago.
  Annotated(node: dag.Node, statement: String)
  /// The file has no block, and none was written because this was a survey.
  Unannotated(node: dag.Node, would_be: String)
  /// The proof no longer verifies against its seeded statement. The block is
  /// left exactly as it was: a stale block is misleading, but replacing it
  /// on the strength of a failed check would be worse.
  Failed(node: dag.Node, verdict: verify.Verdict)
  /// Verified, but the check printed no signature to write. A harness
  /// defect rather than the proof's fault — and the one that caused this
  /// module to be written.
  NoStatement(node: dag.Node)
  /// Verified, the block needed writing, and the write refused.
  NotWritten(node: dag.Node, reason: String)
}

/// The node this outcome is about.
pub fn node_of(o: Outcome) -> dag.Node {
  case o {
    Agrees(node:) -> node
    Refreshed(node:, ..) -> node
    Drifted(node:, ..) -> node
    Annotated(node:, ..) -> node
    Unannotated(node:, ..) -> node
    Failed(node:, ..) -> node
    NoStatement(node:) -> node
    NotWritten(node:, ..) -> node
  }
}

/// Is this an outcome a reader has to do something about? `Agrees` and
/// `Unannotated` are not: the first is the healthy case and the second is a
/// survey declining to write, which is what a survey is for.
pub fn needs_attention(o: Outcome) -> Bool {
  case o {
    Agrees(..) | Unannotated(..) -> False
    _ -> True
  }
}

/// Verification and file access, injected for the reason `dispatch.Env` is:
/// the real verifier runs `lake`, so a test wired to it would elaborate this
/// checkout's own proofs against whatever toolchain the test config names.
pub type Env {
  Env(
    verifier: fn(dag.Node) -> verify.Verdict,
    read: fn(dag.Node) -> Result(String, String),
    annotate: fn(dag.Node, String) -> Result(Nil, String),
  )
}

/// The real thing, against `repo_root` with `lake`.
pub fn live_env(repo_root: String, lake: String) -> Env {
  Env(
    verifier: fn(node) { verify.verify(repo_root, lake, node) },
    read: fn(node) {
      let path = repo_root <> "/" <> dag.proof_path(node)
      simplifile.read(path)
      |> result.map_error(fn(e) {
        "could not read " <> path <> ": " <> simplifile.describe_error(e)
      })
    },
    annotate: fn(node, statement) {
      verify.annotate(repo_root, node, statement)
    },
  )
}

/// Re-verify one node and bring its block up to date.
pub fn one(env: Env, node: dag.Node) -> Outcome {
  decide(env, node, write: True)
}

/// Re-verify one node and report what its block says, writing nothing.
pub fn survey_one(env: Env, node: dag.Node) -> Outcome {
  decide(env, node, write: False)
}

fn decide(env: Env, node: dag.Node, write write: Bool) -> Outcome {
  case env.verifier(node) {
    verify.Verified(statement:, ..) ->
      case string.trim(statement) {
        "" -> NoStatement(node)
        found -> reconcile(env, node, found, write)
      }
    other -> Failed(node, other)
  }
}

fn reconcile(
  env: Env,
  node: dag.Node,
  statement: String,
  write: Bool,
) -> Outcome {
  case env.read(node) {
    Error(reason) -> NotWritten(node, reason)
    Ok(source) ->
      case verify.annotation_in(source) {
        option.Some(recorded) if recorded == statement -> Agrees(node)
        option.Some(recorded) ->
          case write {
            False -> Drifted(node, recorded, statement)
            True ->
              case env.annotate(node, statement) {
                Ok(Nil) -> Refreshed(node, recorded, statement)
                Error(reason) -> NotWritten(node, reason)
              }
          }
        option.None ->
          case write {
            False -> Unannotated(node, statement)
            True ->
              case env.annotate(node, statement) {
                Ok(Nil) -> Annotated(node, statement)
                Error(reason) -> NotWritten(node, reason)
              }
          }
      }
  }
}

/// Re-verify every node in `nodes`, writing nothing. Each elaborates, so
/// this is minutes rather than seconds and belongs nowhere near a run.
pub fn survey(env: Env, nodes: List(dag.Node)) -> List(Outcome) {
  list.map(nodes, fn(n) { survey_one(env, n) })
}

/// One line per outcome, then a count. Drift is named `DRIFTED` rather than
/// anything softer because it is the only line here that means a proof file
/// is currently asserting something untrue.
pub fn report(outcomes: List(Outcome)) -> String {
  let lines = list.map(outcomes, line)
  let attention = list.filter(outcomes, needs_attention)
  let tally =
    int.to_string(list.length(outcomes))
    <> " node(s) re-verified, "
    <> int.to_string(list.length(attention))
    <> " needing attention"
  string.join(list.append(lines, [tally]), "\n")
}

fn line(o: Outcome) -> String {
  let id = node_of(o).id
  case o {
    Agrees(..) -> "  agrees      " <> id
    Refreshed(before:, after:, ..) ->
      "  DRIFTED     "
      <> id
      <> " (block rewritten)\n      was: "
      <> one_line(before)
      <> "\n      now: "
      <> one_line(after)
    Drifted(before:, after:, ..) ->
      "  DRIFTED     "
      <> id
      <> " (NOT rewritten — this was a survey)\n      was: "
      <> one_line(before)
      <> "\n      now: "
      <> one_line(after)
    Annotated(statement:, ..) ->
      "  annotated   " <> id <> "\n      now: " <> one_line(statement)
    Unannotated(..) ->
      "  unannotated " <> id <> " (no block; none written by a survey)"
    Failed(verdict:, ..) ->
      "  FAILED      " <> id <> "\n      " <> verify.verdict_text(verdict)
    NoStatement(..) ->
      "  NO SIGNATURE "
      <> id
      <> " (verified, but the check printed no #check line — a harness defect)"
    NotWritten(reason:, ..) -> "  NOT WRITTEN " <> id <> "\n      " <> reason
  }
}

/// A signature with its wrapped continuation lines folded onto one, so a
/// report stays one finding per row. The block itself keeps Lean's layout.
fn one_line(statement: String) -> String {
  statement
  |> string.split("\n")
  |> list.map(string.trim)
  |> list.filter(fn(s) { s != "" })
  |> string.join(" ")
}
