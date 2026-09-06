import gleeunit
import harness
import harness/bugs

pub fn main() -> Nil {
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
