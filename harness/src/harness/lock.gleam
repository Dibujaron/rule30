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
  /// Give the lock back. Ignored unless `holder` is the current holder, so a
  /// late `Release` from a worker that already lost the lock (by timing out
  /// or by an auto-release) cannot release the wrong holder.
  Release(holder: String)
}

type State {
  State(
    self: Subject(Msg),
    holder: Option(String),
    waiting: List(#(Subject(Bool), String)),
  )
}

/// Start the lock actor, free. A held lock auto-releases after
/// `auto_release_ms` milliseconds.
pub fn start(auto_release_ms: Int) -> Result(Subject(Msg), actor.StartError) {
  let init = fn(self: Subject(Msg)) {
    actor.initialised(State(self:, holder: None, waiting: []))
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
    Error(Nil) -> False
  }
}

/// Give the lock back. A `release` from anyone but the current holder is
/// ignored.
pub fn release(lock: Subject(Msg), holder: String) -> Nil {
  process.send(lock, Release(holder))
}

fn handle(state: State, msg: Msg, auto_release_ms: Int) -> actor.Next(State, Msg) {
  case msg {
    Acquire(reply:, holder:) ->
      handle_acquire(state, reply, holder, auto_release_ms)
    Release(holder:) -> handle_release(state, holder, auto_release_ms)
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
    Some(current) if current == holder -> {
      // This worker already holds the lock — most likely it timed out
      // waiting for an earlier grant and is retrying. Confirming again is
      // harmless and matches what is actually true.
      process.send(reply, True)
      actor.continue(state)
    }
    Some(_) ->
      actor.continue(
        State(
          ..state,
          waiting: list.append(state.waiting, [#(reply, holder)]),
        ),
      )
  }
}

fn handle_release(
  state: State,
  holder: String,
  auto_release_ms: Int,
) -> actor.Next(State, Msg) {
  case state.holder == Some(holder) {
    False -> actor.continue(state)
    True ->
      case state.waiting {
        [] -> actor.continue(State(..state, holder: None))
        [#(next_reply, next_holder), ..rest] ->
          actor.continue(grant(
            State(..state, waiting: rest),
            next_reply,
            next_holder,
            auto_release_ms,
          ))
      }
  }
}

fn grant(
  state: State,
  reply: Subject(Bool),
  holder: String,
  auto_release_ms: Int,
) -> State {
  process.send(reply, True)
  process.send_after(state.self, auto_release_ms, Release(holder))
  State(..state, holder: Some(holder))
}
