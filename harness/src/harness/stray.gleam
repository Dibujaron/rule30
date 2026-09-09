//// What a stray `.lean` file actually assumes.
////
//// `status` lists every `sorry`-free `.lean` under `runs/` and `explorer/`
//// that `Rule30/Proofs.lean` cannot import. That filter separates a stray
//// from noise — an unimported file full of holes is scratch and always will
//// be — and it does not separate a finding from a draft. Of the 31 files
//// listed on 2026-09-09, most were theorist scratch for statements later
//// seeded properly and a handful were real theorems, and nothing on the
//// row said which was which.
////
//// So each file is elaborated and asked what its theorems depend on.
//// `propext`, `Classical.choice` and `Quot.sound` are the three Lean and
//// Mathlib rely on throughout (`verify.allowed_axioms`, the one definition);
//// anything else means the file is resting on something this project does
//// not permit, and no axioms at all means it does not elaborate.
////
//// **What a `clean` verdict means, and the seam that will mislead someone.**
//// It means the file elaborates and its theorems rest only on the permitted
//// three: a real theorem rather than a draft. It does NOT mean the file
//// closes anything. A stray can be perfectly proved and prove a statement no
//// node wants, or a weaker one that merely looks like the node's — which is
//// exactly why `verify.check_source` puts `type_of%` against the *seeded*
//// statement rather than trusting a worker's own theorem. So the verdict
//// promotes a file from "worth opening" to "worth reading", and never to
//// "seed this".
////
//// **Why this is cached rather than run by `status`.** Elaborating one stray
//// took 2.5s, 5.3s, 5.8s, 9.0s and 19.7s across five files measured on
//// 2026-09-09 with warm oleans, so the whole population is minutes and it
//// holds the `lake` lock a live run queues on. A `status` that blocks for
//// minutes is a `status` nobody runs, which would reproduce the very bug
//// this section exists inside (board:
//// `a-reader-s-pre-chosen-output-window-hides-a-finding-whose-meaning-is-in-its-header`).
//// So the sweep runs when a run ends and the lock is already held and free,
//// the verdict is cached against the file's content, and `status` prints
//// what the cache holds. A file the cache has never seen prints as
//// `unchecked`, which is inert and true, rather than as absent.
////
//// The key is a content hash, not an mtime: a checkout, a rebase or a fresh
//// worktree moves every mtime in the tree without changing a byte.

import gleam/dynamic/decode
import gleam/json
import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/result
import gleam/string
import harness/shell
import harness/verify
import simplifile

/// What one stray file's theorems rest on.
pub type Verdict {
  /// Elaborates, and every axiom is one of the permitted three. The theorem
  /// names are carried so the section can say what the file proves without
  /// anyone opening it.
  Clean(theorems: List(String))
  /// Elaborates, and depends on something outside the permitted three.
  Assumes(theorems: List(String), axioms: List(String))
  /// Does not elaborate: a stale proof against a moved statement, a missing
  /// import, a file that was never finished. Ordinary and not a fault.
  Broken(reason: String)
  /// Elaborates and declares no theorem at all — definitions or `example`s
  /// only, so there is nothing to ask `#print axioms` about.
  NoTheorems
}

/// One cached verdict: which file, the content it was computed over, and
/// when. The hash is what makes the entry safe to keep — an entry whose
/// hash no longer matches the file is simply not used.
pub type Entry {
  Entry(path: String, hash: String, verdict: Verdict, checked: String)
}

/// Where the cache lives. Under `harness/build/`, which is gitignored: this
/// is derived data, it costs one sweep to rebuild, and a tracked file would
/// put a churning diff in front of every session and collide between them.
pub fn cache_path(repo_root: String) -> String {
  repo_root <> "/harness/build/strays.json"
}

/// The content hash of a file's bytes, lowercase hex sha256.
@external(erlang, "harness_ffi", "sha256_hex")
pub fn sha256_hex(text: String) -> String

/// The hash of what is on disk at `path`, or `Error` if it cannot be read.
pub fn hash_of(path: String) -> Result(String, String) {
  simplifile.read(path)
  |> result.map(sha256_hex)
  |> result.map_error(fn(e) {
    "could not read `" <> path <> "`: " <> simplifile.describe_error(e)
  })
}

// --- the check ----------------------------------------------------------------

/// The top-level theorem and lemma names in a Lean source, in order.
///
/// Deliberately shallow: a line whose trimmed form begins `theorem` or
/// `lemma`, after any of the modifiers Lean allows in front of one. A name
/// this misses costs a `#print axioms` line and nothing else, because a
/// verdict is computed from the axioms actually printed — so the failure
/// mode is a file reported with fewer theorems than it has, never a file
/// reported clean that is not.
pub fn theorem_names(source: String) -> List(String) {
  source
  |> code_lines
  |> list.filter_map(fn(line) {
    let trimmed = string.trim(line)
    let bare =
      ["private ", "protected ", "noncomputable ", "@[simp] ", "@[simp]\n"]
      |> list.fold(trimmed, fn(acc, prefix) {
        case string.starts_with(acc, prefix) {
          True -> string.drop_start(acc, string.length(prefix))
          False -> acc
        }
      })
    case string.starts_with(bare, "theorem "), string.starts_with(bare, "lemma ") {
      True, _ -> name_after(bare, "theorem ")
      _, True -> name_after(bare, "lemma ")
      _, _ -> Error(Nil)
    }
  })
}

/// The lines of a source that are code, with comments removed.
///
/// Without this, a doc comment is scanned for declarations -- and prose
/// wraps. `Rule30/Statements.lean` contains the line "theorem needs only
/// *some* failure, while this says which one", inside a `/-! -/` block,
/// which reads as a declaration named `needs` to anything matching on the
/// first word. That exact line produced a phantom declaration in the
/// hand-written scan that measured this section on 2026-09-09, and here it
/// would cost more than a wrong count: a `#print axioms needs` against a
/// name that does not exist fails the elaboration, so a file that is
/// perfectly fine gets reported as one that does not compile. A false
/// negative that reads as authoritative is worse than no verdict at all.
///
/// Block comments nest in Lean, so the depth is counted rather than
/// toggled. A declaration sharing a line with a comment close is not found,
/// which costs a `#print axioms` line and never a wrong verdict.
fn code_lines(source: String) -> List(String) {
  source
  |> string.split("\n")
  |> list.fold(#([], 0), fn(acc, line) {
    let #(kept, depth) = acc
    let code = case string.split_once(line, "--"), depth {
      Ok(#(before, _)), 0 -> before
      _, _ -> line
    }
    let next = depth + occurrences(code, "/-") - occurrences(code, "-/")
    let kept = case depth {
      0 -> [code, ..kept]
      _ -> kept
    }
    #(kept, case next < 0 {
      True -> 0
      False -> next
    })
  })
  |> fn(acc) { acc.0 }
  |> list.reverse
}

/// How many times `needle` appears in `text`.
fn occurrences(text: String, needle: String) -> Int {
  list.length(string.split(text, needle)) - 1
}


/// The declaration name following `keyword`, ended by whatever Lean allows
/// to follow one.
fn name_after(line: String, keyword: String) -> Result(String, Nil) {
  let rest = string.drop_start(line, string.length(keyword))
  let name =
    [" ", "(", "{", "[", ":", "\r"]
    |> list.fold(rest, fn(acc, stop) {
      case string.split_once(acc, stop) {
        Ok(#(before, _)) -> before
        Error(_) -> acc
      }
    })
    |> string.trim
  case name {
    "" -> Error(Nil)
    _ -> Ok(name)
  }
}

/// The file to elaborate: the stray's own source, then one `#print axioms`
/// per theorem it declares.
///
/// A *copy* is elaborated and never the file itself. The harness does not
/// write to a stray — it is somebody's parked proof or a theorist's working
/// scratch, and appending to it would edit a file whose author may still be
/// holding it open. `verify.check_source` uses the same shape for the same
/// reason.
pub fn check_source(source: String, names: List(String)) -> String {
  source
  <> "\n"
  <> {
    names
    |> list.map(fn(n) { "#print axioms " <> n })
    |> string.join("\n")
  }
  <> "\n"
}

/// Elaborate one stray file and say what it rests on. `lake` is an absolute
/// path from `shell.which`, and `repo_root` is the working directory the
/// Lean toolchain is invoked from.
pub fn check(repo_root: String, lake: String, path: String) -> Verdict {
  case simplifile.read(path) {
    Error(e) -> Broken("could not read: " <> simplifile.describe_error(e))
    Ok(source) ->
      case theorem_names(source) {
        [] -> NoTheorems
        names -> run_check(repo_root, lake, source, names)
      }
  }
}

fn run_check(
  repo_root: String,
  lake: String,
  source: String,
  names: List(String),
) -> Verdict {
  let dir = repo_root <> "/harness/build/strays"
  let text = check_source(source, names)
  let copy = dir <> "/" <> sha256_hex(text) <> ".lean"
  let _ = simplifile.create_directory_all(dir)
  case simplifile.write(copy, text) {
    Error(e) -> Broken("could not write the copy: " <> simplifile.describe_error(e))
    Ok(Nil) ->
      case shell.run(lake, ["env", "lean", copy], repo_root, 600_000) {
        Error(msg) -> Broken(msg)
        Ok(shell.Run(status:, output:)) if status != 0 -> Broken(first_error(output))
        Ok(shell.Run(output:, ..)) -> judge(names, parse_axioms(output))
      }
  }
}

/// The verdict for a file whose `#print axioms` output has been parsed.
fn judge(names: List(String), axioms: List(String)) -> Verdict {
  case list.all(axioms, list.contains(verify.allowed_axioms, _)) {
    True -> Clean(names)
    False -> Assumes(names, axioms)
  }
}

/// Every axiom named anywhere in `#print axioms` output, deduplicated.
///
/// Unlike `verify`'s parser this reads *every* line rather than the one
/// naming `harness_check`, because a stray declares its own names and there
/// may be many. `'x' does not depend on any axioms` contributes nothing and
/// is not an error: a theorem proved without choice is the good case.
pub fn parse_axioms(output: String) -> List(String) {
  output
  |> string.split("\n")
  |> list.flat_map(fn(line) {
    case string.split_once(line, "depends on axioms: [") {
      Error(_) -> []
      Ok(#(_, after)) ->
        after
        |> string.split_once("]")
        |> result.map(fn(pair) { pair.0 })
        |> result.unwrap("")
        |> string.split(",")
        |> list.map(string.trim)
        |> list.filter(fn(s) { s != "" })
    }
  })
  |> list.unique
}

/// The Lean error a broken stray failed on, as one short line.
///
/// Matches on `error` and not `error:`, because this toolchain does not
/// print the second one. Lean 4.33 tags its diagnostics:
///
///     <path>:1:31: error(lean.unknownIdentifier): Unknown identifier `x`
///
/// A matcher written against `error:` finds nothing there and falls back to
/// the whole output, whose first 120 characters are the absolute path of
/// the hashed copy under `harness/build/strays/` — so the verdict read as a
/// path and named no error at all. Caught by the fixture test rather than
/// by review, which is the argument for that test running real Lean.
///
/// The location is dropped and the message kept, for the same reason: a
/// verdict a reader cannot act on is not a verdict. The full output belongs
/// in a log, not in a status table.
fn first_error(output: String) -> String {
  let line =
    output
    |> string.split("\n")
    |> list.find(fn(line) { string.contains(line, "error") })
    |> result.unwrap(string.trim(output))
  case string.split_once(line, "error") {
    Ok(#(_, message)) -> "error" <> truncate(string.trim(message), 110)
    Error(_) -> truncate(string.trim(line), 110)
  }
}

fn truncate(s: String, at: Int) -> String {
  case string.length(s) > at {
    True -> string.slice(s, 0, at) <> "…"
    False -> s
  }
}

// --- the cache ----------------------------------------------------------------

/// The cached verdict for `path`, but only if it was computed over the
/// bytes that are there now. A hash that no longer matches is a stale
/// entry, and a stale entry is treated as no entry — the inert failure
/// rather than the dangerous one.
pub fn lookup(cache: List(Entry), path: String, hash: String) -> Option(Verdict) {
  case
    list.find(cache, fn(e) { e.path == path && e.hash == hash })
  {
    Ok(e) -> Some(e.verdict)
    Error(_) -> None
  }
}

/// `cache` with `entry` in it, replacing any earlier entry for the same path.
pub fn put(cache: List(Entry), entry: Entry) -> List(Entry) {
  [entry, ..list.filter(cache, fn(e) { e.path != entry.path })]
}

/// Read the cache, or an empty one. A cache that cannot be read or does not
/// decode is not an error: it is derived data and the sweep rebuilds it.
pub fn load(path: String) -> List(Entry) {
  case simplifile.read(path) {
    Error(_) -> []
    Ok(text) ->
      case json.parse(text, decode.list(entry_decoder())) {
        Ok(entries) -> entries
        Error(_) -> []
      }
  }
}

/// Write the cache, creating its directory.
pub fn save(cache: List(Entry), path: String) -> Result(Nil, String) {
  let dir = case string.split_once(reverse(path), "/") {
    Ok(#(_, rest)) -> reverse(rest)
    Error(_) -> "."
  }
  let _ = simplifile.create_directory_all(dir)
  simplifile.write(path, encode(cache) <> "\n")
  |> result.map_error(simplifile.describe_error)
}

fn reverse(s: String) -> String {
  s |> string.to_graphemes |> list.reverse |> string.join("")
}

/// The cache as JSON.
pub fn encode(cache: List(Entry)) -> String {
  cache
  |> list.map(fn(e) {
    json.object([
      #("path", json.string(e.path)),
      #("hash", json.string(e.hash)),
      #("checked", json.string(e.checked)),
      #("verdict", json.string(verdict_tag(e.verdict))),
      #("theorems", json.array(theorems_of(e.verdict), json.string)),
      #("axioms", json.array(axioms_of(e.verdict), json.string)),
      #("reason", json.string(reason_of(e.verdict))),
    ])
  })
  |> json.preprocessed_array
  |> json.to_string
}

fn entry_decoder() -> decode.Decoder(Entry) {
  use path <- decode.field("path", decode.string)
  use hash <- decode.field("hash", decode.string)
  use checked <- decode.field("checked", decode.string)
  use tag <- decode.field("verdict", decode.string)
  use theorems <- decode.field("theorems", decode.list(decode.string))
  use axioms <- decode.field("axioms", decode.list(decode.string))
  use reason <- decode.field("reason", decode.string)
  decode.success(Entry(path:, hash:, checked:, verdict: case tag {
    "clean" -> Clean(theorems)
    "assumes" -> Assumes(theorems, axioms)
    "no_theorems" -> NoTheorems
    _ -> Broken(reason)
  }))
}

/// The one-word name of a verdict, for a log line or the cache.
pub fn verdict_tag(v: Verdict) -> String {
  case v {
    Clean(..) -> "clean"
    Assumes(..) -> "assumes"
    Broken(..) -> "broken"
    NoTheorems -> "no_theorems"
  }
}

fn theorems_of(v: Verdict) -> List(String) {
  case v {
    Clean(theorems) -> theorems
    Assumes(theorems, _) -> theorems
    _ -> []
  }
}

fn axioms_of(v: Verdict) -> List(String) {
  case v {
    Assumes(_, axioms) -> axioms
    _ -> []
  }
}

fn reason_of(v: Verdict) -> String {
  case v {
    Broken(reason) -> reason
    _ -> ""
  }
}

// --- what a reader sees -------------------------------------------------------

/// One stray, as one line that survives being read out of context.
///
/// The header of this section sits dozens of lines above its rows, and a
/// reader piping `status` through `tail -6` sees the rows without it — which
/// is exactly how a $0.83 proof sat unread in a four-line window for an
/// evening. So every row names itself: `stray:` first, then the verdict,
/// then the path.
pub fn row(path: String, verdict: Option(Verdict)) -> String {
  "  stray: " <> verdict_text(verdict) <> "  " <> path
}

fn verdict_text(verdict: Option(Verdict)) -> String {
  case verdict {
    None -> "unchecked"
    Some(Clean([one])) -> "proves " <> one
    Some(Clean(names)) ->
      "proves " <> int_text(list.length(names)) <> ": " <> string.join(names, ", ")
    Some(Assumes(_, axioms)) -> "ASSUMES " <> string.join(axioms, ", ")
    Some(Broken(reason)) -> "does not elaborate (" <> reason <> ")"
    Some(NoTheorems) -> "no theorems"
  }
}

fn int_text(n: Int) -> String {
  case n {
    2 -> "two"
    3 -> "three"
    _ -> "many"
  }
}
