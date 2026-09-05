import gleam/string
import harness/shell

pub fn run_captures_output_and_status_test() {
  let assert Ok(node) = shell.which("node")
  let assert Ok(r) =
    shell.run(node, ["-e", "console.log('hi'); process.exit(3)"], ".", 20_000)
  assert r.status == 3
  assert string.trim(r.output) == "hi"
}

pub fn run_survives_output_that_is_not_utf8_test() {
  // `lake` on Windows can emit whatever the console codepage handed it. A
  // stray 0xFF used to fail a `let assert` and take the whole run down.
  let assert Ok(node) = shell.which("node")
  let assert Ok(r) =
    shell.run(
      node,
      ["-e", "process.stdout.write(Buffer.from([0xff,0xfe,0x41]))"],
      ".",
      20_000,
    )
  assert r.status == 0
  // Byte-for-byte latin1: 0xFF 0xFE 0x41 -> "ÿþA".
  assert r.output == "ÿþA"
}

pub fn run_times_out_test() {
  let assert Ok(node) = shell.which("node")
  let assert Error(msg) =
    shell.run(node, ["-e", "setTimeout(()=>{}, 5000)"], ".", 500)
  assert string.starts_with(msg, "timeout")
}
