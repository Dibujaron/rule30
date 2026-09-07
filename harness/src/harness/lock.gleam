//// A serializing lock for `lake build`, so concurrent workers never run it
//// at once. One holder at a time; everyone else queues in arrival order and
//// is granted the lock when it is released. A held lock is force-released
//// after a fixed delay so a crashed worker cannot wedge the run.

import gleam/erlang/process.{type Subject}
import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/otp/actor
import gleam/result

/// Messages the lock actor understands.
pub type Msg {
  /// Ask for the lock. The actor always eventually replies `True` on
  /// `reply` — `acquire` is what turns a client-side timeout into `False`.
  Acquire(reply: Subject(Bool), holder: String)
  /// Give the lock back, or withdraw a still-queued request. If `holder` is
  /// the current holder, the lock is released (and the next waiter, if any,
  /// is granted it). Otherwise this is a no-op on the current hold, but any
  /// entries queued under `holder`'s name are dropped from `waiting` — this
  /// is how a client that gave up waiting (see `acquire`) withdraws itself,
  /// so a request nobody will ever come back to release cannot later be
  /// promoted and wedge the lock. Either way, a late `Release` from a worker
  /// that already lost the lock (by timing out or by an auto-release) cannot
  /// release the wrong holder.
  Release(holder: String)
  /// Give the lock back only if `holder` currently holds it, and say whether
  /// that happened on `reply`. Unlike `Release`, a `holder` that is NOT the
  /// current holder changes nothing at all — in particular it withdraws no
  /// queued request under that name. This is what the guard sends when a
  /// worker makes a new tool call: a stale hold of that worker's is given
  /// back, but a request that worker has queued (a parallel build waiting
  /// on a sibling) is left to be granted in its turn.
  ReleaseIfHolding(reply: Subject(Bool), holder: String)
}

type State {
  State(
    self: Subject(Msg),
    holder: Option(String),
    // The auto-release timer for the current hold, so it can be cancelled
    // when the hold ends via an explicit `Release` — otherwise a stale timer
    // from an earlier hold can fire after a same-named holder has legitimately
    // re-acquired the lock and release it out from under them.
    timer: Option(process.Timer),
    waiting: List(#(Subject(Bool), String)),
  )
}

/// Start the lock actor, free. A held lock auto-releases after
/// `auto_release_ms` milliseconds.
pub fn start(auto_release_ms: Int) -> Result(Subject(Msg), actor.StartError) {
  let init = fn(self: Subject(Msg)) {
    actor.initialised(State(self:, holder: None, timer: None, waiting: []))
    |> actor.returning(self)
    |> Ok
  }
  actor.new_with_initialiser(1000, init)
  |> actor.on_message(fn(state, msg) { handle(state, msg, auto_release_ms) })
  |> actor.start
  |> result.map(fn(started) { started.data })
}

/// Ask for the lock, blocking up to `timeout_ms`. Returns `True` once
/// granted. Returns `False` on timeout; the caller must not treat that as
/// holding the lock.
pub fn acquire(lock: Subject(Msg), holder: String, timeout_ms: Int) -> Bool {
  let reply = process.new_subject()
  process.send(lock, Acquire(reply:, holder:))
  case process.receive(reply, timeout_ms) {
    Ok(granted) -> granted
    Error(Nil) -> {
      // Withdraw the request we gave up on: if it is still queued, this
      // removes it so a later release cannot promote a caller who has
      // already moved on and will never come back to release it. If it was
      // already granted, this is indistinguishable from a normal release and
      // simply gives the lock back — the caller correctly treats a timeout
      // as "not holding it" either way.
      process.send(lock, Release(holder))
      False
    }
  }
}

/// Give the lock back. A `release` from anyone but the current holder does
/// not affect the current hold (see `Release`).
pub fn release(lock: Subject(Msg), holder: String) -> Nil {
  process.send(lock, Release(holder))
}

/// Give the lock back if `holder` holds it, and return whether it did. A
/// `holder` that is not the current holder changes nothing (see
/// `ReleaseIfHolding`). Waits up to a second for the actor's answer; a lock
/// actor that cannot answer in that time is treated as "did not release".
pub fn release_if_holding(lock: Subject(Msg), holder: String) -> Bool {
  let reply = process.new_subject()
  process.send(lock, ReleaseIfHolding(reply:, holder:))
  case process.receive(reply, 1000) {
    Ok(released) -> released
    Error(Nil) -> False
  }
}

fn handle(
  state: State,
  msg: Msg,
  auto_release_ms: Int,
) -> actor.Next(State, Msg) {
  case msg {
    Acquire(reply:, holder:) ->
      handle_acquire(state, reply, holder, auto_release_ms)
    Release(holder:) -> handle_release(state, holder, auto_release_ms)
    ReleaseIfHolding(reply:, holder:) ->
      case state.holder == Some(holder) {
        True -> {
          process.send(reply, True)
          actor.continue(end_hold(state, auto_release_ms))
        }
        False -> {
          process.send(reply, False)
          actor.continue(state)
        }
      }
  }
}

fn handle_acquire(
  state: State,
  reply: Subject(Bool),
  holder: String,
  auto_release_ms: Int,
) -> actor.Next(State, Msg) {
  case state.holder {
    None -> actor.continue(grant(state, reply, holder, auto_release_ms))
    Some(_) ->
      actor.continue(
        State(..state, waiting: list.append(state.waiting, [#(reply, holder)])),
      )
  }
}

fn handle_release(
  state: State,
  holder: String,
  auto_release_ms: Int,
) -> actor.Next(State, Msg) {
  case state.holder == Some(holder) {
    False ->
      // Not the current holder: either a stale/duplicate release, or a
      // client withdrawing a request it gave up waiting on. Either way,
      // drop any queued entries for this name so a request nobody will ever
      // come back to release cannot later be promoted and wedge the lock.
      actor.continue(
        State(
          ..state,
          waiting: list.filter(state.waiting, fn(entry) { entry.1 != holder }),
        ),
      )
    True -> actor.continue(end_hold(state, auto_release_ms))
  }
}

/// End the current hold: cancel its auto-release timer so it cannot fire
/// later and release whatever/whoever holds the lock next, then grant the
/// lock to the first waiter if there is one.
fn end_hold(state: State, auto_release_ms: Int) -> State {
  cancel_timer(state.timer)
  case state.waiting {
    [] -> State(..state, holder: None, timer: None)
    [#(next_reply, next_holder), ..rest] ->
      grant(
        State(..state, waiting: rest),
        next_reply,
        next_holder,
        auto_release_ms,
      )
  }
}

fn cancel_timer(timer: Option(process.Timer)) -> Nil {
  case timer {
    Some(t) -> {
      process.cancel_timer(t)
      Nil
    }
    None -> Nil
  }
}

fn grant(
  state: State,
  reply: Subject(Bool),
  holder: String,
  auto_release_ms: Int,
) -> State {
  process.send(reply, True)
  let timer = process.send_after(state.self, auto_release_ms, Release(holder))
  State(..state, holder: Some(holder), timer: Some(timer))
}
