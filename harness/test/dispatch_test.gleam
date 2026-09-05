import gleam/string
import harness/config
import harness/dispatch

fn cfg() -> config.Config {
  let assert Ok(c) = config.load()
  c
}

pub fn status_lists_every_node_and_the_open_leaves_test() {
  let assert Ok(text) = dispatch.status(cfg())
  assert string.contains(text, "centerColumn_zero")
  assert string.contains(text, "evolve_eq_false_of_outside_cone")
  assert string.contains(text, "attempts=")
  assert string.contains(text, "Open leaves, in dispatch order:")
  // The cone lemma unblocks two others, so it leads; centerColumn_zero is
  // an S with nothing depending on it, so it does not.
  let assert Ok(#(_, leaves)) =
    string.split_once(text, "Open leaves, in dispatch order:\n")
  assert string.starts_with(
    string.trim(leaves),
    "evolve_eq_false_of_outside_cone",
  )
}

pub fn prove_one_refuses_an_unknown_node_test() {
  let assert Error(reason) = dispatch.prove_one(cfg(), "no_such_node")
  assert string.contains(reason, "no node `no_such_node`")
}

pub fn prove_one_refuses_a_node_whose_deps_are_open_test() {
  // evolve_left_edge depends on the cone lemma, which is still open.
  let assert Error(reason) = dispatch.prove_one(cfg(), "evolve_left_edge")
  assert string.contains(reason, "is not an open leaf")
  assert string.contains(reason, "evolve_eq_false_of_outside_cone=open")
}
