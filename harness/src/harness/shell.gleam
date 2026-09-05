//// Run an external command to completion behind an Erlang port.
////
//// `harness_ffi:run_cmd/4` spawns the child, blocks the calling process
//// until it exits or a timeout elapses, and returns stdout and stderr
//// interleaved in one binary. This module decodes that result and exposes
//// `os:find_executable/1` as `which`.
////
//// The output is decoded as bytes and converted lossily, because it is not
//// guaranteed to be UTF-8: `lake` inherits whatever a Windows console
//// codepage put in front of it, and one stray byte used to take the whole
//// run down with a failed `let assert`.

import gleam/dynamic.{type Dynamic}
import gleam/dynamic/decode
import gleam/erlang/atom
import gleam/int
import gleam/result
import gleam/string

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

/// Run `exe` with `args` in `cwd`. `timeout_ms` bounds the command's whole
/// run, not the gap between two lines of its output: a chatty child cannot
/// hold the caller past the budget by saying something every so often.
/// `output` is stdout and stderr interleaved, converted to valid UTF-8 —
/// lossily if it has to be. On timeout the port is closed and
/// `Error("timeout after <timeout_ms> ms")` is returned.
pub fn run(
  exe: String,
  args: List(String),
  cwd: String,
  timeout_ms: Int,
) -> Result(Run, String) {
  use raw <- result.try(
    decode.run(run_cmd_ffi(exe, args, cwd, timeout_ms), raw_decoder())
    |> result.map_error(fn(errors) {
      "harness/shell: run_cmd returned an unrecognised shape: "
      <> string.inspect(errors)
    }),
  )
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
  use output <- decode.subfield([2], decode.bit_array)
  decode.success(RawRun(status:, output: to_utf8(output)))
}

/// Bytes to a `String`, reinterpreting anything that is not UTF-8 as latin1
/// — which is defined for every byte, so this cannot fail.
@external(erlang, "harness_ffi", "to_utf8")
fn to_utf8(bits: BitArray) -> String

fn timeout_decoder() -> decode.Decoder(Raw) {
  use tag <- decode.then(atom.decoder())
  case atom.to_string(tag) {
    "timeout" -> decode.success(RawTimeout)
    _ -> decode.failure(RawTimeout, "timeout")
  }
}
