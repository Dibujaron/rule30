//// Run an external command to completion behind an Erlang port.
////
//// `harness_ffi:run_cmd/4` spawns the child, blocks the calling process
//// until it exits or a timeout elapses, and returns stdout and stderr
//// interleaved in one binary. This module decodes that result and exposes
//// `os:find_executable/1` as `which`.

import gleam/dynamic.{type Dynamic}
import gleam/dynamic/decode
import gleam/erlang/atom
import gleam/int

/// The result of a command that ran to completion.
pub type Run {
  Run(status: Int, output: String)
}

/// The Erlang side reports either `{run, Status, Output}` or the bare atom
/// `timeout`; this is the intermediate shape `run_cmd_ffi`'s `Dynamic`
/// return decodes into before `run` turns it into `Result(Run, String)`.
type Raw {
  RawRun(status: Int, output: String)
  RawTimeout
}

@external(erlang, "harness_ffi", "run_cmd")
fn run_cmd_ffi(
  exe: String,
  args: List(String),
  cwd: String,
  timeout_ms: Int,
) -> Dynamic

/// Run `exe` with `args` in `cwd`, waiting up to `timeout_ms` milliseconds.
/// `output` is stdout and stderr interleaved. On timeout the port is closed
/// and `Error("timeout after <timeout_ms> ms")` is returned.
pub fn run(
  exe: String,
  args: List(String),
  cwd: String,
  timeout_ms: Int,
) -> Result(Run, String) {
  let assert Ok(raw) =
    decode.run(run_cmd_ffi(exe, args, cwd, timeout_ms), raw_decoder())
  case raw {
    RawRun(status:, output:) -> Ok(Run(status:, output:))
    RawTimeout -> Error("timeout after " <> int.to_string(timeout_ms) <> " ms")
  }
}

/// The absolute path to `name` on `PATH`, via `os:find_executable/1`. Note
/// that a `.cmd` shim (as npm installs some tools as on Windows) cannot be
/// spawned by `run`; `which` will still find it, but `run` will fail on it.
@external(erlang, "harness_ffi", "find_executable")
pub fn which(name: String) -> Result(String, Nil)

fn raw_decoder() -> decode.Decoder(Raw) {
  decode.one_of(run_decoder(), or: [timeout_decoder()])
}

fn run_decoder() -> decode.Decoder(Raw) {
  use status <- decode.subfield([1], decode.int)
  use output <- decode.subfield([2], decode.string)
  decode.success(RawRun(status:, output:))
}

fn timeout_decoder() -> decode.Decoder(Raw) {
  use tag <- decode.then(atom.decoder())
  case atom.to_string(tag) {
    "timeout" -> decode.success(RawTimeout)
    _ -> decode.failure(RawTimeout, "timeout")
  }
}
