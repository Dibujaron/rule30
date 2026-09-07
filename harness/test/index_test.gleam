import gleam/int
import gleam/list
import gleam/option.{None, Some}
import gleam/string
import harness/dag.{type Node, Dag, Node}
import harness/index.{Signature}
import harness/verify
import simplifile

const note = "**What this says.** The left edge is black at every time.
**Why it is true.** Its left neighbour is outside the cone.
**Where the work is.** Nowhere; two rewrites."

pub fn what_it_says_takes_the_first_sentence_of_the_note_test() {
  assert index.what_it_says(note) == Ok("The left edge is black at every time.")
}

pub fn what_it_says_joins_a_wrapped_sentence_onto_one_line_test() {
  let wrapped =
    "**What this says.** A one-bit machine whose drivers
repeat with period `p` itself repeats with period `2p`.
**Why it is true.** One cycle is a self-map of Bool."
  assert index.what_it_says(wrapped)
    == Ok(
      "A one-bit machine whose drivers repeat with period `p` itself repeats with period `2p`.",
    )
}

pub fn what_it_says_is_absent_from_a_note_without_the_heading_test() {
  assert index.what_it_says("Some prose with no headings.") == Error(Nil)
}

const statements = "namespace Statements

/-- **Outside the light cone, nothing happens.** After `t` steps every cell
farther than `t` from the origin is still white. -/
theorem evolve_eq_false_of_outside_cone (t : ℕ) (i : ℤ) (h : (t : ℤ) < |i|) :
    evolve t i = false := by
  sorry

/-- **The left edge is always black.** -/
theorem evolve_left_edge (t : ℕ) : evolve t (-(t : ℤ)) = true := by
  sorry

theorem undocumented : True := by
  sorry
"

pub fn docstring_lead_is_the_bold_sentence_above_the_declaration_test() {
  assert index.docstring_lead(statements, "evolve_left_edge")
    == Ok("The left edge is always black.")
  assert index.docstring_lead(statements, "evolve_eq_false_of_outside_cone")
    == Ok("Outside the light cone, nothing happens.")
}

pub fn docstring_lead_does_not_borrow_a_neighbours_docstring_test() {
  // `undocumented` has no `/--` block of its own; the one above
  // `evolve_left_edge` must not be read as its lead.
  assert index.docstring_lead(statements, "undocumented") == Error(Nil)
}

pub fn docstring_lead_matches_the_whole_name_test() {
  assert index.docstring_lead(statements, "evolve_left") == Error(Nil)
}

const statements_with_a_section_header = "/-- **Lead A.** -/
theorem a : True := by
  sorry

/-!
## Section
-/
theorem b : True := by
  sorry
"

/// A `/-! ... -/` section header directly above a declaration is not that
/// declaration's docstring, and the search for one must not be allowed to
/// walk past it to whatever `/--` block happens to sit above the header —
/// here, `a`'s. `a` itself is unaffected: its own docstring is found the
/// same as ever.
pub fn docstring_lead_does_not_walk_past_a_section_header_test() {
  assert index.docstring_lead(statements_with_a_section_header, "b")
    == Error(Nil)
  assert index.docstring_lead(statements_with_a_section_header, "a")
    == Ok("Lead A.")
}

const statements_with_a_wrapped_lead = "/-- **Lead part one
continued lead.**
-/
theorem foo : True := by
  sorry
"

/// A docstring whose block is opener, then a content line, then a `-/` of
/// its own on the closing line — three lines, the shortest shape where the
/// opener and closer are not the same line and there is more than one line
/// of content between them. The assembled text must keep the closer last,
/// not splice it between the two content lines.
pub fn docstring_lead_keeps_a_wrapped_lead_in_order_test() {
  assert index.docstring_lead(statements_with_a_wrapped_lead, "foo")
    == Ok("Lead part one continued lead.")
}

const checked_proof = "import Rule30.Basic

/-!
**What this says.** The left edge is black at every time.
**Why it is true.** Its left neighbour is outside the cone.
**Where the work is.** Nowhere.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.evolve_left_edge (t : ℕ) : evolve t (-↑t) = true
```
-/

theorem evolve_left_edge (t : ℕ) : evolve t (-(t : ℤ)) = true := by
  sorry
"

pub fn checked_type_is_the_fenced_block_under_the_harness_heading_test() {
  assert index.checked_type(checked_proof)
    == Ok("Statements.evolve_left_edge (t : ℕ) : evolve t (-↑t) = true")
}

pub fn checked_type_is_absent_from_an_unannotated_proof_test() {
  assert index.checked_type(
      "import Rule30.Basic\n\n/-!\n**What this says.** x\n-/\n",
    )
    == Error(Nil)
}

pub fn signature_splits_binders_from_the_conclusion_test() {
  assert index.signature(
      "Statements.evolve_eq_false_of_outside_cone (t : ℕ) (i : ℤ) (h : ↑t < |i|) : evolve t i = false",
    )
    == Signature(
      hypotheses: ["(t : ℕ)", "(i : ℤ)", "(h : ↑t < |i|)"],
      conclusion: "evolve t i = false",
    )
}

pub fn signature_keeps_a_colon_inside_a_binder_out_of_the_split_test() {
  // Lean wraps a long checked signature; the split is on the first `:`
  // at bracket depth zero, not the first `:` anywhere.
  assert index.signature(
      "Statements.bool_driven (a b x : ℕ → Bool) (p N j : ℕ)\n  (hrec : ∀ (i : ℕ), x (i + 1) = (a i ^^ (b i || x i))) (hNj : N ≤ j) : PeriodicFrom x p (j + 1)",
    )
    == Signature(
      hypotheses: [
        "(a b x : ℕ → Bool)", "(p N j : ℕ)",
        "(hrec : ∀ (i : ℕ), x (i + 1) = (a i ^^ (b i || x i)))", "(hNj : N ≤ j)",
      ],
      conclusion: "PeriodicFrom x p (j + 1)",
    )
}

pub fn signature_of_a_seeded_declaration_drops_the_proof_opener_test() {
  // `seed.declaration_without_proof` yields `theorem name ... := by`; the
  // signature is the same shape once `theorem ` and `:= by` are gone.
  assert index.signature(
      "theorem evolve_left_edge (t : ℕ) : evolve t (-(t : ℤ)) = true := by",
    )
    == Signature(
      hypotheses: ["(t : ℕ)"],
      conclusion: "evolve t (-(t : ℤ)) = true",
    )
}

pub fn signature_with_no_binders_has_no_hypotheses_test() {
  assert index.signature("Statements.harness_probe : True")
    == Signature(hypotheses: [], conclusion: "True")
}

fn node(id: String, deps: List(String), size: dag.Size) -> Node {
  Node(
    id:,
    region: "P1",
    lean_name: id,
    description: "d " <> id,
    deps:,
    status: dag.Proved,
    size:,
    proof_file: None,
    attempts: [],
    verified: None,
    claimed_by: None,
    claimed_at: None,
    claimed_run: None,
    object: None,
  )
}

pub fn imports_of_lists_every_import_line_test() {
  assert index.imports_of(
      "import Rule30.Basic\nimport Rule30.Proofs.EvolveLeftEdge\n\n/-! x -/\ntheorem t : True := by trivial\n",
    )
    == ["Rule30.Basic", "Rule30.Proofs.EvolveLeftEdge"]
}

pub fn cited_by_names_the_nodes_whose_proofs_import_this_one_test() {
  let d =
    Dag([
      node("evolve_left_edge", [], dag.S),
      node("evolve_left_second_diagonal", ["evolve_left_edge"], dag.S),
      node("evolve_left_third_diagonal", ["evolve_left_edge"], dag.S),
    ])
  let proofs = [
    #("EvolveLeftEdge.lean", "import Rule30.Basic\n"),
    #(
      "EvolveLeftSecondDiagonal.lean",
      "import Rule30.Basic\nimport Rule30.Proofs.EvolveLeftEdge\n",
    ),
    #(
      "EvolveLeftThirdDiagonal.lean",
      "import Rule30.Basic\nimport Rule30.Proofs.EvolveLeftEdge\n",
    ),
  ]
  let citers = index.cited_by(d, proofs)
  let assert Ok(edge) = dag.get(d, "evolve_left_edge")
  let assert Ok(second) = dag.get(d, "evolve_left_second_diagonal")
  assert citers(edge)
    == ["evolve_left_second_diagonal", "evolve_left_third_diagonal"]
  assert citers(second) == []
}

pub fn cited_by_ignores_a_dep_that_is_declared_but_not_imported_test() {
  // A citation is an `import` line in a proof file, not an entry in `deps`:
  // the file is what `lake build` checked.
  let d = Dag([node("a", [], dag.S), node("b", ["a"], dag.S)])
  let citers =
    index.cited_by(d, [#("A.lean", ""), #("B.lean", "import Rule30.Basic\n")])
  let assert Ok(a) = dag.get(d, "a")
  assert citers(a) == []
}

pub fn walls_over_lists_the_walls_a_node_sits_under_transitively_test() {
  // `wall_a`'s id and `lean_name` are made to differ, so a `walls_over`
  // that returned ids by mistake would fail this test rather than pass it
  // by coincidence the way `node`'s `id == lean_name` fixtures otherwise
  // would.
  let d =
    Dag([
      node("leaf", [], dag.S),
      node("middle", ["leaf"], dag.M),
      Node(..node("wall_a", ["middle"], dag.Wall), lean_name: "wall_a_name"),
      node("wall_b", ["leaf"], dag.Wall),
      node("elsewhere", [], dag.S),
    ])
  let walls = index.walls_over(d)
  let assert Ok(leaf) = dag.get(d, "leaf")
  let assert Ok(middle) = dag.get(d, "middle")
  let assert Ok(elsewhere) = dag.get(d, "elsewhere")
  let assert Ok(wall_a) = dag.get(d, "wall_a")
  assert walls(leaf) == ["wall_a_name", "wall_b"]
  assert walls(middle) == ["wall_a_name"]
  assert walls(elsewhere) == []
  // A wall does not sit under itself.
  assert walls(wall_a) == []
}

fn classified(id: String, object: String) -> Node {
  Node(..node(id, [], dag.S), object: Some(object))
}

pub fn render_groups_by_object_in_spec_order_with_unclassified_last_test() {
  let d =
    Dag([
      classified("two_period", "machine"),
      classified("density_le_one", "bookkeeping"),
      classified("evolve_left_edge", "leftDiagonal"),
      node("no_object_yet", [], dag.S),
      classified("window_count", "configuration"),
    ])
  let text = index.render(index.Sources(d:, statements: "", proofs: []))
  let heading_order =
    [
      "## Configuration", "## Left diagonal", "## One-bit machine",
      "## Bookkeeping", "## Unclassified",
    ]
    |> list.map(fn(h) { position(text, h) })
  assert heading_order == list.sort(heading_order, int.compare)
  // Groups with nothing in them are not printed.
  assert !string.contains(text, "## Row")
  assert !string.contains(text, "## Prize")
}

pub fn render_puts_an_unknown_object_in_its_own_group_after_the_vocabulary_test() {
  let d = Dag([classified("a", "bookkeeping"), classified("b", "widget")])
  let text = index.render(index.Sources(d:, statements: "", proofs: []))
  assert position(text, "## Bookkeeping") < position(text, "## widget")
}

pub fn render_entry_carries_what_it_says_signature_citers_status_and_wall_test() {
  let d =
    Dag([
      Node(..classified("evolve_left_edge", "leftDiagonal"), deps: []),
      Node(..classified("evolve_left_second_diagonal", "leftDiagonal"), deps: [
        "evolve_left_edge",
      ]),
      Node(
        ..classified("the_residual", "column"),
        deps: ["evolve_left_second_diagonal"],
        size: dag.Wall,
        status: dag.Open,
      ),
    ])
  let proofs = [
    #(
      "EvolveLeftEdge.lean",
      "import Rule30.Basic\n\n/-!\n**What this says.** The left edge is black at every time.\n**Why it is true.** y\n**Where the work is.** z\n\n"
        <> verify.annotation_heading
        <> "\n```lean\nStatements.evolve_left_edge (t : ℕ) : evolve t (-↑t) = true\n```\n-/\n",
    ),
    #(
      "EvolveLeftSecondDiagonal.lean",
      "import Rule30.Basic\nimport Rule30.Proofs.EvolveLeftEdge\n\n/-!\n**What this says.** The second diagonal is black.\n-/\n",
    ),
  ]
  let statements =
    "/-- **The residual.** -/\ntheorem the_residual (t : ℕ) : centerColumn t = true := by\n  sorry\n"
  let text = index.render(index.Sources(d:, statements:, proofs:))
  let entry =
    between(text, "### evolve_left_edge", "### evolve_left_second_diagonal")
  assert string.contains(
    entry,
    "**What this says.** The left edge is black at every time.",
  )
  assert string.contains(entry, "- `(t : ℕ)`")
  assert string.contains(entry, "**Conclusion.** `evolve t (-↑t) = true`")
  assert string.contains(entry, "**Cited by.** evolve_left_second_diagonal")
  assert string.contains(
    entry,
    "**Status.** proved, size S, under the wall the_residual",
  )
  // An open node with no proof file reads its lead from the statement file
  // and its signature from the seeded declaration, and says so.
  let residual = between(text, "### the_residual", "\n## ")
  assert string.contains(residual, "**What this says.** The residual.")
  assert string.contains(residual, "**Conclusion.** `centerColumn t = true`")
  assert string.contains(residual, "(seeded statement; not yet checked)")
  assert string.contains(residual, "**Cited by.** nothing yet")
  assert string.contains(residual, "**Status.** open, size wall")
}

pub fn render_header_states_every_count_with_its_denominator_test() {
  let d =
    Dag([
      classified("a", "row"),
      Node(..classified("b", "row"), status: dag.Open),
      node("c", [], dag.S),
    ])
  let text = index.render(index.Sources(d:, statements: "", proofs: []))
  assert string.contains(
    text,
    "3 theorems on the board: 2 proved, 1 open, 0 claimed, 0 blocked, 0 abandoned",
  )
  assert string.contains(text, "1 of 3 without an object")
}

pub fn render_is_deterministic_test() {
  let d = Dag([classified("b", "row"), classified("a", "row")])
  let s = index.Sources(d:, statements: "", proofs: [])
  assert index.render(s) == index.render(s)
  assert position(index.render(s), "### a") < position(index.render(s), "### b")
}

pub fn entry_folds_a_multi_line_dag_description_onto_one_line_test() {
  // No proof file, no docstring: the fallback is the DAG's own `description`,
  // and it must be joined onto one line like the other two sources are.
  let d = Dag([node("no_source", [], dag.S)])
  let assert Ok(n) = dag.get(d, "no_source")
  let d = dag.update(d, dag.Node(..n, description: "line one\nline two"))
  let text = index.render(index.Sources(d:, statements: "", proofs: []))
  assert string.contains(text, "**What this says.** line one line two\n")
}

pub fn write_in_renders_the_index_from_a_repository_root_test() {
  let root = "test/tmp/index-root"
  let _ = simplifile.delete(root)
  let assert Ok(Nil) = simplifile.create_directory_all(root <> "/Rule30/Proofs")
  let assert Ok(Nil) = simplifile.create_directory_all(root <> "/blueprint")
  let assert Ok(Nil) =
    simplifile.write(
      root <> "/Rule30/Statements.lean",
      "/-- **The probe.** -/\ntheorem harness_probe : True := by\n  sorry\n",
    )
  let assert Ok(Nil) =
    simplifile.write(
      root <> "/Rule30/Proofs/HarnessProbe.lean",
      "import Rule30.Basic\n\n/-!\n**What this says.** True is true.\n**Why it is true.** By `trivial`.\n**Where the work is.** Nowhere.\n-/\n\ntheorem harness_probe : True := by\n  trivial\n",
    )
  let assert Ok(Nil) =
    simplifile.write(
      root <> "/blueprint/dag.json",
      "{\"nodes\": [{\"id\": \"harness_probe\", \"region\": \"P1\", \"lean_name\": \"harness_probe\", \"description\": \"d\", \"deps\": [], \"status\": \"proved\", \"size\": \"S\", \"proof_file\": \"Rule30/Proofs/HarnessProbe.lean\", \"attempts\": [], \"verified\": null, \"claimed_by\": null, \"claimed_at\": null, \"claimed_run\": null, \"object\": \"bookkeeping\"}]}",
    )
  let assert Ok(summary) = index.write_in(root, root <> "/blueprint/dag.json")
  assert string.contains(summary, "blueprint/index.md")
  assert string.contains(summary, "1 theorems")
  let assert Ok(text) = simplifile.read(root <> "/blueprint/index.md")
  assert string.contains(text, "## Bookkeeping")
  assert string.contains(text, "**What this says.** True is true.")
  assert string.contains(text, "**Conclusion.** `True`")
  assert string.contains(text, "(seeded statement; not yet checked)")
  // Rendering again is byte-identical: nothing in the file is a clock.
  let assert Ok(_) = index.write_in(root, root <> "/blueprint/dag.json")
  let assert Ok(again) = simplifile.read(root <> "/blueprint/index.md")
  assert again == text
}

pub fn write_in_refuses_a_root_with_no_statement_file_test() {
  let root = "test/tmp/index-empty"
  let _ = simplifile.delete(root)
  let assert Ok(Nil) = simplifile.create_directory_all(root <> "/blueprint")
  let assert Ok(Nil) =
    simplifile.write(root <> "/blueprint/dag.json", "{\"nodes\": []}")
  let assert Error(reason) = index.write_in(root, root <> "/blueprint/dag.json")
  assert string.contains(reason, "Statements.lean")
}

/// A tree that has not proved anything yet has no `Rule30/Proofs`
/// directory at all — `sources_in` must render that as "no proofs", not
/// refuse the root the way a missing `Statements.lean` does.
pub fn write_in_renders_with_no_proofs_directory_test() {
  let root = "test/tmp/index-no-proofs"
  let _ = simplifile.delete(root)
  let assert Ok(Nil) = simplifile.create_directory_all(root <> "/Rule30")
  let assert Ok(Nil) = simplifile.create_directory_all(root <> "/blueprint")
  let assert Ok(Nil) =
    simplifile.write(
      root <> "/Rule30/Statements.lean",
      "/-- **The probe.** -/\ntheorem harness_probe : True := by\n  sorry\n",
    )
  let assert Ok(Nil) =
    simplifile.write(
      root <> "/blueprint/dag.json",
      "{\"nodes\": [{\"id\": \"harness_probe\", \"region\": \"P1\", \"lean_name\": \"harness_probe\", \"description\": \"d\", \"deps\": [], \"status\": \"open\", \"size\": \"S\", \"proof_file\": null, \"attempts\": [], \"verified\": null, \"claimed_by\": null, \"claimed_at\": null, \"claimed_run\": null}]}",
    )
  let assert Ok(_) = index.write_in(root, root <> "/blueprint/dag.json")
  let assert Ok(text) = simplifile.read(root <> "/blueprint/index.md")
  assert string.contains(text, "(seeded statement; not yet checked)")
  assert simplifile.is_directory(root <> "/Rule30/Proofs") == Ok(False)
}

/// A `Rule30/Proofs` that is a plain file rather than a directory is not a
/// tree with no proofs — it is a wrong tree — so `sources_in` must
/// propagate `read_directory`'s error rather than swallowing it the way it
/// swallows a merely-absent directory.
///
/// This is the one portable way found to force a non-`Enoent` error out of
/// `simplifile.read_directory` from a test on Windows: a genuinely
/// unreadable directory needs an ACL change this suite cannot make
/// portably, but "not a directory" (`Enotdir`) is available on every
/// platform by putting a file where the directory is expected.
pub fn write_in_propagates_a_non_missing_read_directory_error_test() {
  let root = "test/tmp/index-proofs-is-a-file"
  let _ = simplifile.delete(root)
  let assert Ok(Nil) = simplifile.create_directory_all(root <> "/Rule30")
  let assert Ok(Nil) = simplifile.create_directory_all(root <> "/blueprint")
  let assert Ok(Nil) =
    simplifile.write(
      root <> "/Rule30/Statements.lean",
      "/-- **The probe.** -/\ntheorem harness_probe : True := by\n  sorry\n",
    )
  let assert Ok(Nil) = simplifile.write(root <> "/Rule30/Proofs", "not a dir")
  let assert Ok(Nil) =
    simplifile.write(root <> "/blueprint/dag.json", "{\"nodes\": []}")
  let assert Error(reason) = index.write_in(root, root <> "/blueprint/dag.json")
  assert string.contains(reason, "Rule30/Proofs")
  assert !string.contains(reason, "Statements.lean")
}

fn position(text: String, needle: String) -> Int {
  case string.split_once(text, needle) {
    Ok(#(before, _)) -> string.length(before)
    Error(Nil) -> panic as { "missing from the rendered index: " <> needle }
  }
}

fn between(text: String, from: String, to: String) -> String {
  let assert Ok(#(_, after)) = string.split_once(text, from)
  case string.split_once(after, to) {
    Ok(#(body, _)) -> body
    Error(Nil) -> after
  }
}
