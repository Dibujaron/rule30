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

import gleam/list
import gleam/result
import gleam/string
import harness/verify

/// A theorem's signature: its binders, one string each, exactly as Lean
/// printed them, and its conclusion. The binders are shown rather than
/// translated: a paraphrase of a hypothesis would be one more proposition
/// the harness appears to stand behind, and a wrong one is a false theorem
/// in a file whose whole job is to be read.
pub type Signature {
  Signature(hypotheses: List(String), conclusion: String)
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
    |> list.find(fn(pair) { declares(pair.1, lean_name) })
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
      let block =
        above
        |> list.take_while(fn(line) { !string.contains(line, "/--") })
        |> list.reverse
      let opener =
        above
        |> list.find(fn(line) { string.contains(line, "/--") })
        |> result.unwrap("")
      let text = string.join([opener, ..block], "\n")
      use #(_, after) <- result.try(string.split_once(text, "**"))
      use #(lead, _) <- result.try(string.split_once(after, "**"))
      Ok(one_line(lead))
    }
  }
}

/// `theorem <lean_name>` followed by a delimiter, so `evolve_left_edge`
/// never matches `evolve_left_edge_two`. The same rule `seed` uses.
fn declares(line: String, lean_name: String) -> Bool {
  let head = "theorem " <> lean_name
  case string.starts_with(line, head) {
    False -> False
    True ->
      case string.drop_start(line, string.length(head)) {
        "" -> True
        rest -> list.any([" ", "(", "{", "[", ":"], string.starts_with(rest, _))
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
