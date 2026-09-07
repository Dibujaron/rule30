//// The theorem index: `blueprint/index.md`, rendered from the board.
////
//// A connection between two theorems is seen by putting them side by side,
//// and until this file existed nothing in the project let a model do that:
//// the seeder brief carries proof notes in closing order, and what each
//// theorem is *about* was in nobody's head but the captain's. This module
//// renders one entry per theorem, grouped by the object the theorem is about
//// — a node's `object` field — with what it says, its signature, and which
//// proofs cite it.
////
//// Everything here is DERIVED at render time from `blueprint/dag.json`,
//// `Rule30/Statements.lean` and the files under `Rule30/Proofs/`. The file
//// is rewritten at every landing by the same dispatcher step that maintains
//// `Rule30/Proofs.lean`, and by `gleam run -- index` after a hand landing, so
//// it cannot drift from the board. Nothing in it is remembered.
////
//// This module reads the statement file and never writes it.

import gleam/dict
import gleam/int
import gleam/list
import gleam/option.{None, Some}
import gleam/result
import gleam/string
import harness/config
import harness/dag
import harness/seed
import harness/verify
import simplifile

/// A theorem's signature: its binders, one string each, exactly as Lean
/// printed them, and its conclusion. The binders are shown rather than
/// translated: a paraphrase of a hypothesis would be one more proposition
/// the harness appears to stand behind, and a wrong one is a false theorem
/// in a file whose whole job is to be read.
pub type Signature {
  Signature(hypotheses: List(String), conclusion: String)
}

/// What the renderer reads: the board, the statement file's text, and every
/// proof file under `Rule30/Proofs/` as `#(file name, text)`.
pub type Sources {
  Sources(d: dag.Dag, statements: String, proofs: List(#(String, String)))
}

/// Where the index lives, relative to the repository root.
pub const index_path = "blueprint/index.md"

/// The sources under a repository root. The statement file is required:
/// an index rendered without it would print every open node as
/// "(no statement found)" and look like a board with no statements rather
/// than a renderer pointed at the wrong tree. `Rule30/Proofs` is not: a
/// missing directory renders with no proofs — a tree that has not closed
/// anything yet, not a wrong root — but any other error reading it
/// (permissions, say, or a file sitting where the directory should be)
/// propagates rather than being silently swallowed.
pub fn sources_in(
  repo_root: String,
  dag_path: String,
) -> Result(Sources, String) {
  use d <- result.try(dag.load(dag_path))
  let statements_path = repo_root <> "/Rule30/Statements.lean"
  use statements <- result.try(
    simplifile.read(statements_path)
    |> result.map_error(fn(e) {
      "could not read "
      <> statements_path
      <> ": "
      <> simplifile.describe_error(e)
    }),
  )
  let dir = repo_root <> "/Rule30/Proofs"
  use entries <- result.try(case simplifile.read_directory(dir) {
    Ok(names) -> Ok(names)
    Error(simplifile.Enoent) -> Ok([])
    Error(e) ->
      Error("could not read " <> dir <> ": " <> simplifile.describe_error(e))
  })
  let proofs =
    entries
    |> list.filter(string.ends_with(_, ".lean"))
    |> list.sort(string.compare)
    |> list.filter_map(fn(name) {
      simplifile.read(dir <> "/" <> name)
      |> result.map(fn(text) { #(name, text) })
      |> result.replace_error(Nil)
    })
  Ok(Sources(d:, statements:, proofs:))
}

/// Render the index from the repository at `repo_root` and write it to
/// `blueprint/index.md` there. `Ok` is a one-line summary with its
/// denominator, for the CLI.
pub fn write_in(repo_root: String, dag_path: String) -> Result(String, String) {
  use sources <- result.try(sources_in(repo_root, dag_path))
  let path = repo_root <> "/" <> index_path
  use _ <- result.try(
    simplifile.write(path, render(sources))
    |> result.map_error(fn(e) {
      "could not write " <> path <> ": " <> simplifile.describe_error(e)
    }),
  )
  let total = list.length(sources.d.nodes)
  let without = list.count(sources.d.nodes, fn(n) { n.object == None })
  Ok(
    "wrote "
    <> index_path
    <> ": "
    <> int.to_string(total)
    <> " theorems, "
    <> int.to_string(without)
    <> " of "
    <> int.to_string(total)
    <> " without an object",
  )
}

/// `write_in` at the configured repository.
pub fn write(cfg: config.Config) -> Result(String, String) {
  write_in(cfg.repo_root, cfg.dag_path)
}

/// The object vocabulary in the order the spec fixes, each with the heading
/// it renders under. A node whose `object` is outside this list is grouped
/// under the value verbatim, after these; a node with none goes under
/// "Unclassified". Both are printed rather than hidden so the omission is
/// visible to the captain who sets the field.
pub const objects = [
  #("configuration", "Configuration"),
  #("row", "Row"),
  #("column", "Column"),
  #("leftDiagonal", "Left diagonal"),
  #("rightDiagonal", "Right diagonal"),
  #("machine", "One-bit machine"),
  #("bookkeeping", "Bookkeeping"),
  #("prize", "Prize"),
]

const unclassified = "Unclassified"

/// The whole of `blueprint/index.md`.
pub fn render(sources: Sources) -> String {
  let Sources(d:, statements:, proofs:) = sources
  let citers = cited_by(d, proofs)
  let wall_name = wall_name_in(d)
  let groups = grouped(d.nodes)
  let sections =
    groups
    |> list.map(fn(group) {
      let #(heading, nodes) = group
      "## "
      <> heading
      <> "\n\n"
      <> {
        nodes
        |> list.sort(fn(a, b) { string.compare(a.lean_name, b.lean_name) })
        |> list.map(entry(_, statements, proofs, citers, wall_name))
        |> string.join("\n")
      }
    })
  header(d) <> "\n" <> string.join(sections, "\n") <> "\n"
}

/// The groups in render order: the vocabulary's non-empty groups in spec
/// order, then any unknown object values sorted, then the unclassified.
fn grouped(nodes: List(dag.Node)) -> List(#(String, List(dag.Node))) {
  let known = list.map(objects, fn(pair) { pair.0 })
  let with = fn(pred: fn(dag.Node) -> Bool) { list.filter(nodes, pred) }
  let vocabulary =
    objects
    |> list.filter_map(fn(pair) {
      case with(fn(n) { n.object == Some(pair.0) }) {
        [] -> Error(Nil)
        ns -> Ok(#(pair.1, ns))
      }
    })
  let unknown =
    nodes
    |> list.filter_map(fn(n) {
      case n.object {
        Some(o) ->
          case list.contains(known, o) {
            True -> Error(Nil)
            False -> Ok(o)
          }
        None -> Error(Nil)
      }
    })
    |> list.unique
    |> list.sort(string.compare)
    |> list.map(fn(o) { #(o, with(fn(n) { n.object == Some(o) })) })
  let none = case with(fn(n) { n.object == None }) {
    [] -> []
    ns -> [#(unclassified, ns)]
  }
  list.flatten([vocabulary, unknown, none])
}

fn header(d: dag.Dag) -> String {
  let total = list.length(d.nodes)
  let count = fn(status) { list.count(d.nodes, fn(n) { n.status == status }) }
  let without = list.count(d.nodes, fn(n) { n.object == None })
  "# Theorem index\n\n"
  <> "Generated by the harness from `blueprint/dag.json`, `Rule30/Statements.lean` "
  <> "and the notes under `Rule30/Proofs/`; rewritten at every landing and by "
  <> "`gleam run -- index`. Do not edit: the next landing overwrites it.\n\n"
  <> "One entry per theorem, grouped by the object the theorem is about. "
  <> "**What this says** is the sentence a person wrote — the proof note's, or "
  <> "the statement's docstring lead for a node still open. The hypotheses and "
  <> "conclusion are the checked signature as Lean printed it, where the "
  <> "harness wrote one; for a proof that predates the checked-type block, "
  <> "the statement text from `Rule30/Statements.lean`, marked as verified; "
  <> "for an open node, the declaration as seeded, marked as not yet checked. They "
  <> "are shown, not paraphrased. **Cited by** is read from `import` lines, "
  <> "so it is what `lake build` compiled and not what the board planned.\n\n"
  <> int.to_string(total)
  <> " theorems on the board: "
  <> int.to_string(count(dag.Proved))
  <> " proved, "
  <> int.to_string(count(dag.Open))
  <> " open, "
  <> int.to_string(count(dag.Claimed))
  <> " claimed, "
  <> int.to_string(count(dag.Blocked))
  <> " blocked, "
  <> int.to_string(count(dag.Abandoned))
  <> " abandoned. "
  <> int.to_string(without)
  <> " of "
  <> int.to_string(total)
  <> " without an object.\n"
}

fn entry(
  node: dag.Node,
  statements: String,
  proofs: List(#(String, String)),
  citers: fn(dag.Node) -> List(String),
  wall_name: fn(String) -> String,
) -> String {
  let proof =
    list.find(proofs, fn(pair) { pair.0 == file_name(node) })
    |> result.map(fn(pair) { pair.1 })
  let says =
    proof
    |> result.try(seed.note_of)
    |> result.try(what_it_says)
    |> result.lazy_or(fn() { docstring_lead(statements, node.lean_name) })
    |> result.unwrap(one_line(node.description))
  let #(sig, provenance) = case result.try(proof, checked_type) {
    Ok(text) -> #(signature(text), "")
    Error(Nil) ->
      case seed.declaration_without_proof(statements, node.lean_name) {
        Ok(text) -> #(signature(text), fallback_provenance(node.status))
        Error(Nil) -> #(Signature([], ""), " (no statement found)")
      }
  }
  let hypotheses = case sig.hypotheses {
    [] -> "**Hypotheses.** none" <> provenance <> "\n"
    hs ->
      "**Hypotheses.**"
      <> provenance
      <> "\n"
      <> string.join(list.map(hs, fn(h) { "- `" <> h <> "`" }), "\n")
      <> "\n"
  }
  let conclusion = case sig.conclusion {
    "" -> ""
    c -> "**Conclusion.** `" <> c <> "`\n"
  }
  let cited = case citers(node) {
    [] -> "nothing yet"
    names -> string.join(names, ", ")
  }
  // The wall this node was seeded to attack, from the board's `under`
  // field and nothing else. It is captain-set because `deps` cannot carry
  // it: `deps` means "must be proved first" and a wall, never dispatched,
  // has none — so the walls whose transitive deps reach a node was the
  // right computation of the wrong relation, and rendered on no node.
  let wall = case node.under {
    None -> ""
    Some(w) -> ", under the wall " <> wall_name(w)
  }
  "### "
  <> node.lean_name
  <> "\n\n**What this says.** "
  <> says
  <> "\n"
  <> hypotheses
  <> conclusion
  <> "**Cited by.** "
  <> cited
  <> "\n**Status.** "
  <> dag.status_to_string(node.status)
  <> ", size "
  <> dag.size_to_string(node.size)
  <> wall
  <> "\n"
}

/// The provenance suffix for a signature that fell back to the seeded
/// declaration because no Checked type block was found. A proved node in
/// this state is not doubtful — it predates the harness writing that block
/// — so its label says verified rather than repeating the open-node wording
/// that would read as doubt beside `**Status.** proved`.
fn fallback_provenance(status: dag.Status) -> String {
  case status {
    dag.Proved ->
      " (verified; statement text from Statements.lean, this proof "
      <> "predates the checked-type block)"
    _ -> " (seeded statement; not yet checked)"
  }
}

/// The sentence after `**What this says.**` in a proof note, joined onto
/// one line. `Error(Nil)` when the note has no such heading.
pub fn what_it_says(note: String) -> Result(String, Nil) {
  use #(_, after) <- result.try(string.split_once(note, "**What this says.**"))
  let body = case string.split_once(after, "\n**") {
    Ok(#(body, _)) -> body
    Error(Nil) -> after
  }
  Ok(one_line(body))
}

/// The bold lead of the docstring directly above `theorem <lean_name>` in
/// the statement file: the text between the first `**` pair of the `/--`
/// block that ends on the line before the declaration. A declaration with
/// no docstring of its own gets `Error(Nil)`, never a neighbour's.
pub fn docstring_lead(
  statements: String,
  lean_name: String,
) -> Result(String, Nil) {
  let lines = string.split(statements, "\n")
  use at <- result.try(
    lines
    |> list.index_map(fn(line, i) { #(i, line) })
    |> list.find(fn(pair) { seed.declares(pair.1, lean_name) })
    |> result.map(fn(pair) { pair.0 }),
  )
  let above = list.take(lines, at) |> list.reverse
  // The docstring must END on the line just above the declaration; anything
  // else between them means the block belongs to something else.
  let ends_just_above = case above {
    [first, ..] -> string.ends_with(string.trim_end(first), "-/")
    [] -> False
  }
  case ends_just_above {
    False -> Error(Nil)
    True -> {
      use #(opener, block) <- result.try(find_opener(above))
      case string.contains(opener, "/--") {
        False -> Error(Nil)
        True -> {
          let text = string.join([opener, ..block], "\n")
          use #(_, after) <- result.try(string.split_once(text, "**"))
          use #(lead, _) <- result.try(string.split_once(after, "**"))
          Ok(one_line(lead))
        }
      }
    }
  }
}

/// Walk `above` — lines above the declaration, nearest first — for the
/// opener of the block whose close is `above`'s first line, and the lines
/// between them in file order (the closing line last). `Error(Nil)` when a
/// line strictly between the close and the opener contains `-/` of its
/// own: that is another block's close, so the walk has stepped past the
/// end of whatever is directly above the declaration rather than finding
/// its start. This is what keeps a `/-! ... -/` section header — or any
/// other block that closes just above a declaration but is not that
/// declaration's own docstring — from letting the search walk on to a
/// neighbour's `/--` block.
fn find_opener(above: List(String)) -> Result(#(String, List(String)), Nil) {
  case above {
    [] -> Error(Nil)
    [closer, ..rest] ->
      case string.contains(closer, "/--") || string.contains(closer, "/-!") {
        // A one-line block: the close is its own opener.
        True -> Ok(#(closer, []))
        False -> scan_for_opener(rest, [closer])
      }
  }
}

/// `seen` is built by prepending each line as the walk moves upward through
/// `above`, one line further from the declaration each time — which is
/// already file order: the first line prepended is the closer (nearest the
/// declaration, so last in the file among these), and each line prepended
/// after it sits earlier in the file, ending up ahead of the closer rather
/// than behind it. So `seen` is returned as built, not reversed; reversing
/// it here put the closer first and the content last, splicing a stray
/// `-/` into the middle of a docstring that wraps more than one line.
fn scan_for_opener(
  lines: List(String),
  seen: List(String),
) -> Result(#(String, List(String)), Nil) {
  case lines {
    [] -> Error(Nil)
    [line, ..rest] ->
      case string.contains(line, "/--") || string.contains(line, "/-!") {
        True -> Ok(#(line, seen))
        False ->
          case string.contains(line, "-/") {
            True -> Error(Nil)
            False -> scan_for_opener(rest, [line, ..seen])
          }
      }
  }
}

/// The signature inside the fenced `lean` block the harness wrote under
/// `verify.annotation_heading`, as Lean printed it. `Error(Nil)` for a
/// proof file that was never annotated — the 34 that predate the block.
pub fn checked_type(proof: String) -> Result(String, Nil) {
  use #(_, after) <- result.try(string.split_once(
    proof,
    verify.annotation_heading,
  ))
  use #(_, fenced) <- result.try(string.split_once(after, "```lean\n"))
  use #(body, _) <- result.try(string.split_once(fenced, "```"))
  case string.trim(body) {
    "" -> Error(Nil)
    text -> Ok(text)
  }
}

/// Binders and conclusion out of a signature, whether it came from the
/// harness's checked block (`Statements.name (x : T) : C`) or from the
/// seeded declaration (`theorem name (x : T) : C := by`). The split is at
/// the first `:` at bracket depth zero after the name; a `:` inside a binder
/// or a `∀` never counts. The name itself is dropped: the entry already
/// carries it.
pub fn signature(text: String) -> Signature {
  let text =
    text
    |> string.trim
    |> strip_prefix("theorem ")
    |> strip_suffix(":= by")
    |> string.trim
  // Drop the leading name: everything up to the first space or `(`.
  let rest = case string.split_once(text, " ") {
    Ok(#(_, rest)) -> rest
    Error(Nil) -> ""
  }
  let #(binders, conclusion) = split_at_top_level_colon(rest)
  Signature(
    hypotheses: top_level_groups(binders),
    conclusion: one_line(conclusion),
  )
}

fn strip_prefix(text: String, prefix: String) -> String {
  case string.starts_with(text, prefix) {
    True -> string.drop_start(text, string.length(prefix))
    False -> text
  }
}

fn strip_suffix(text: String, suffix: String) -> String {
  case string.ends_with(text, suffix) {
    True -> string.drop_end(text, string.length(suffix))
    False -> text
  }
}

/// `(before, after)` around the first `:` at depth zero over `()`, `{}` and
/// `[]`. A text with no such colon is all conclusion.
fn split_at_top_level_colon(text: String) -> #(String, String) {
  scan_colon(string.to_graphemes(text), 0, [])
}

fn scan_colon(
  chars: List(String),
  depth: Int,
  acc: List(String),
) -> #(String, String) {
  case chars {
    [] -> #("", string.join(list.reverse(acc), ""))
    [":", ..rest] ->
      case depth {
        0 -> #(string.join(list.reverse(acc), ""), string.join(rest, ""))
        _ -> scan_colon(rest, depth, [":", ..acc])
      }
    [c, ..rest] -> {
      let depth = case c {
        "(" | "{" | "[" -> depth + 1
        ")" | "}" | "]" -> depth - 1
        _ -> depth
      }
      scan_colon(rest, depth, [c, ..acc])
    }
  }
}

/// The bracketed groups of a binder list, each with its brackets, in order.
/// Text between groups — whitespace and line breaks — is dropped.
fn top_level_groups(text: String) -> List(String) {
  scan_groups(string.to_graphemes(text), 0, [], [])
}

fn scan_groups(
  chars: List(String),
  depth: Int,
  current: List(String),
  done: List(String),
) -> List(String) {
  case chars {
    [] -> list.reverse(done)
    [c, ..rest] -> {
      let opens = c == "(" || c == "{" || c == "["
      let closes = c == ")" || c == "}" || c == "]"
      case opens, closes, depth {
        True, _, _ -> scan_groups(rest, depth + 1, [c, ..current], done)
        _, True, 1 -> {
          let group = string.join(list.reverse([c, ..current]), "")
          scan_groups(rest, 0, [], [one_line(group), ..done])
        }
        _, True, _ -> scan_groups(rest, depth - 1, [c, ..current], done)
        _, _, 0 -> scan_groups(rest, 0, current, done)
        _, _, _ -> scan_groups(rest, depth, [c, ..current], done)
      }
    }
  }
}

/// Whitespace runs, line breaks included, collapsed to one space.
fn one_line(text: String) -> String {
  text
  |> string.split("\n")
  |> list.map(string.trim)
  |> list.filter(fn(s) { s != "" })
  |> string.join(" ")
}

/// The modules a proof file imports, from its `import` lines, in file order.
pub fn imports_of(proof: String) -> List(String) {
  proof
  |> string.split("\n")
  |> list.filter_map(fn(line) {
    case string.trim(line) {
      "import " <> module -> Ok(string.trim(module))
      _ -> Error(Nil)
    }
  })
}

/// For a node, the `lean_name`s of every node whose proof file imports this
/// node's module, sorted. A citation is an `import` line in a file `lake
/// build` compiled, not an entry in `deps`, which is a plan rather than a
/// fact. `proofs` pairs a file name under `Rule30/Proofs/` with its text.
pub fn cited_by(
  d: dag.Dag,
  proofs: List(#(String, String)),
) -> fn(dag.Node) -> List(String) {
  // file name → node, so an importing file can be named as a theorem.
  let by_file =
    d.nodes
    |> list.map(fn(n) { #(file_name(n), n) })
    |> dict.from_list
  // module → lean_names of the files importing it.
  let citations =
    proofs
    |> list.flat_map(fn(pair) {
      let #(file, text) = pair
      case dict.get(by_file, file) {
        Ok(citer) ->
          imports_of(text)
          |> list.map(fn(module) { #(module, citer.lean_name) })
        Error(Nil) -> []
      }
    })
    |> list.fold(dict.new(), fn(acc, pair) {
      dict.upsert(acc, pair.0, fn(existing) {
        case existing {
          Some(names) -> [pair.1, ..names]
          None -> [pair.1]
        }
      })
    })
  fn(node) {
    dict.get(citations, dag.proof_module(node))
    |> result.unwrap([])
    |> list.unique
    |> list.sort(string.compare)
  }
}

/// `EvolveLeftEdge.lean`: the last `/`-segment of `dag.proof_path(node)`
/// (`Rule30/Proofs/EvolveLeftEdge.lean`), so there is one source of truth
/// for where a node's proof file lives rather than a second derivation from
/// its module name.
fn file_name(node: dag.Node) -> String {
  let path = dag.proof_path(node)
  string.split(path, "/") |> list.last |> result.unwrap(path)
}

/// How a wall named in a node's `under` field is printed: by the
/// `lean_name` of the node with that id — the name headings and "Cited by"
/// already use, not the board's internal id — or, for an `under` that
/// names no node on the board, the value verbatim. The field is
/// captain-set and unvalidated, so a wrong one is shown rather than hidden:
/// this is where it shows up.
pub fn wall_name_in(d: dag.Dag) -> fn(String) -> String {
  fn(id: String) {
    case dag.get(d, id) {
      Ok(wall) -> wall.lean_name
      Error(Nil) -> id
    }
  }
}
