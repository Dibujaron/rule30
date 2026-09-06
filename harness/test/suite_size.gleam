//// How many tests the suite *should* run, counted off disk before it runs.
////
//// `gleeunit` prints how many tests passed. It never prints how many there
//// were, and the two are not the same number: a module that dies during its
//// own setup is reported by `gleeunit_progress:handle_cancel/3` as exactly
//// **one** failure attributed to `gleeunit.main`, no matter how many tests
//// were inside it. So `106 passed, 3 failures` and `191 passed, no failures`
//// are the same shape of line, and only one of them ran the suite.
////
//// The fix is a denominator. `announce` prints the on-disk count before
//// `gleeunit.main` starts, so the numerator and the denominator end up in the
//// same output and a reader — or a grep — can tell the two cases apart.
//// `passed + failures + skipped` should equal the announced total; anything
//// less means tests were cancelled rather than run.
////
//// **The shortfall is a lower bound on what was lost, not a count of it.**
//// Measured by killing a module of five tests on purpose: the announced
//// total was 202, the summary read `197 passed, 3 failures`, and the three
//// failures were the cancelled test, its cancelled module and the cancelled
//// top-level group — three rows standing in for five vanished tests, all
//// three attributed to `gleeunit.main`. So the sum was short by two while
//// the loss was five. A shortfall of zero is the only reading that means the
//// suite ran whole.
////
//// A counter that can be quietly wrong is worth less than no counter, since
//// it would be the very failure it exists to catch. So `count` refuses to
//// return a number it cannot stand behind: an unreadable directory, an
//// `.erl` test module (`gleeunit` runs those and this scanner cannot read
//// them), or an EUnit `_test_` generator (one function, many tests, no way
//// to know how many without running it) all produce an `Error` naming the
//// cause rather than a plausible integer.

import gleam/int
import gleam/io
import gleam/list
import gleam/result
import gleam/string
import simplifile

/// A count of the suite as it sits on disk: how many `.gleam` modules were
/// scanned, and how many arity-zero `*_test` functions they export.
pub type Expected {
  Expected(modules: Int, tests: Int)
}

/// Count the tests in `dir` without running anything.
///
/// Returns `Error(reason)` rather than a number whenever the count would be a
/// guess. See the module note for the three cases; each one is a way this
/// scanner could report a well-formed total that is too low, which is exactly
/// the defect it is here to make visible.
pub fn count(dir: String) -> Result(Expected, String) {
  use entries <- result.try(
    simplifile.read_directory(dir)
    |> result.map_error(fn(e) {
      "cannot read " <> dir <> ": " <> simplifile.describe_error(e)
    }),
  )

  use _ <- result.try(case list.filter(entries, string.ends_with(_, ".erl")) {
    [] -> Ok(Nil)
    erl ->
      Error(
        "EUnit runs Erlang test modules too and this scanner does not read "
        <> "them, so the total would be too low: "
        <> string.join(erl, ", "),
      )
  })

  let modules = list.filter(entries, string.ends_with(_, ".gleam"))

  use counts <- result.try(
    list.try_map(modules, fn(name) { count_module(dir <> "/" <> name) }),
  )

  Ok(Expected(modules: list.length(modules), tests: int.sum(counts)))
}

/// Count one module's arity-zero `*_test` functions, or refuse.
fn count_module(path: String) -> Result(Int, String) {
  use source <- result.try(
    simplifile.read(path)
    |> result.map_error(fn(e) {
      "cannot read " <> path <> ": " <> simplifile.describe_error(e)
    }),
  )

  let names =
    source
    |> string.split("\n")
    |> list.filter_map(declared_name)

  use _ <- result.try(case list.filter(names, string.ends_with(_, "_test_")) {
    [] -> Ok(Nil)
    generators ->
      Error(
        "EUnit expands a `_test_` generator into an unknown number of tests, "
        <> "so no honest total exists for "
        <> path
        <> ": "
        <> string.join(generators, ", "),
      )
  })

  Ok(list.count(names, string.ends_with(_, "_test")))
}

/// The function name declared on this line, if it declares a public arity-zero
/// function. `pub fn foo() -> Nil {` yields `foo`; anything taking an argument
/// yields nothing, because EUnit only runs `*_test/0`.
fn declared_name(line: String) -> Result(String, Nil) {
  use rest <- result.try(case string.starts_with(line, "pub fn ") {
    True -> Ok(string.drop_start(line, 7))
    False -> Error(Nil)
  })
  case string.split_once(rest, "(") {
    Ok(#(name, after)) ->
      case string.starts_with(after, ")") {
        True -> Ok(name)
        False -> Error(Nil)
      }
    Error(Nil) -> Error(Nil)
  }
}

/// Print the denominator, immediately before `gleeunit.main` prints the
/// numerator. Never fails the run on its own — a suite that will not start
/// because its own bookkeeping is unhappy is worse than an unanchored count —
/// but says loudly, in place of a number, when it has no number to give.
pub fn announce(dir: String) -> Nil {
  case count(dir) {
    Ok(Expected(modules:, tests:)) ->
      io.println(
        "expecting "
        <> int.to_string(tests)
        <> " tests in "
        <> int.to_string(modules)
        <> " modules; passed + failures + skipped below must add up to this, "
        <> "and a shortfall means tests were cancelled rather than run",
      )
    Error(reason) ->
      io.println(
        "WARNING: cannot say how many tests to expect, so the summary below "
        <> "is unanchored and a partial run will look like a whole one: "
        <> reason,
      )
  }
}

// --- tests -----------------------------------------------------------------

/// The real suite, counted off the real directory. Not pinned to a number:
/// a constant here would have to be edited by every author who adds a test,
/// and would be wrong between the addition and the edit.
pub fn count_finds_the_real_suite_test() {
  let assert Ok(Expected(modules:, tests:)) = count("test")
  // Sixteen `_test.gleam` modules plus `ports.gleam` and this file at the
  // time of writing; the point of the assertion is that the scan is finding
  // a directory full of modules rather than an empty one.
  assert modules > 10
  assert tests > 100
}

pub fn count_errors_on_a_directory_that_is_not_there_test() {
  let assert Error(reason) = count("test/no-such-directory")
  assert string.contains(reason, "cannot read")
}

pub fn declared_name_reads_an_arity_zero_declaration_test() {
  assert declared_name("pub fn evolve_left_edge_test() {")
    == Ok("evolve_left_edge_test")
  assert declared_name("pub fn evolve_left_edge_test() -> Nil {")
    == Ok("evolve_left_edge_test")
}

/// EUnit runs `*_test/0` and nothing else, so a function that takes an
/// argument must not be counted however it is named.
pub fn declared_name_ignores_a_function_that_takes_arguments_test() {
  assert declared_name("pub fn helper_test(x: Int) {") == Error(Nil)
}

pub fn declared_name_ignores_a_private_function_test() {
  assert declared_name("fn helper_test() {") == Error(Nil)
}

pub fn declared_name_ignores_a_line_that_is_not_a_declaration_test() {
  assert declared_name("  let x = f()") == Error(Nil)
}
