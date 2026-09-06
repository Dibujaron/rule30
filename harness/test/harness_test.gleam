import gleeunit
import harness
import harness/bugs
import suite_size

/// `gleeunit.main` reports how many tests passed and never how many there
/// were, so a runner that dies partway prints a well-formed summary that
/// reads like a smaller suite passing. `announce` puts the on-disk total in
/// the same output, immediately above it. See `suite_size`.
pub fn main() -> Nil {
  suite_size.announce("test")
  gleeunit.main()
}

// gleeunit test functions end in `_test`
pub fn hello_world_test() {
  let name = "Joe"
  let greeting = "Hello, " <> name <> "!"

  assert greeting == "Hello, Joe!"
}

/// A bare trailing `--area` (no value) must error, not silently return
/// `None` and show the unfiltered board — that is exactly the failure the
/// function's own doc comment warns against.
pub fn flag_value_errors_on_a_bare_trailing_area_flag_test() {
  assert harness.flag_value(["--area"], "--area", bugs.area_from_string, "area")
    == Error("--area needs a value")
}

/// Same failure mode, for `--severity`.
pub fn flag_value_errors_on_a_bare_trailing_severity_flag_test() {
  assert harness.flag_value(
      ["--severity"],
      "--severity",
      bugs.severity_from_string,
      "severity",
    )
    == Error("--severity needs a value")
}
