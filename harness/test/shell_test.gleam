import gleam/string
import harness/shell

pub fn run_captures_output_and_status_test() {
  let assert Ok(node) = shell.which("node")
  let assert Ok(r) =
    shell.run(node, ["-e", "console.log('hi'); process.exit(3)"], ".", 20_000)
  assert r.status == 3
  assert string.trim(r.output) == "hi"
}

pub fn run_times_out_test() {
  let assert Ok(node) = shell.which("node")
  let assert Error(msg) =
    shell.run(node, ["-e", "setTimeout(()=>{}, 5000)"], ".", 500)
  assert string.starts_with(msg, "timeout")
}
