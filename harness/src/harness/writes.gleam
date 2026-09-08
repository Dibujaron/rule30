//// Which files the harness writes, and which lines of source write them.
////
//// A freeze list — the set of files that are unsafe to touch while a run is
//// in flight — used to be written by hand and announced per run. It drifted
//// twice in one afternoon, and both times the person maintaining the list was
//// the person who had added the writer. That is structural rather than
//// careless: the list and the code are separate artefacts and nothing forces
//// them to agree.
////
//// So the answer here is derived at run time by scanning `harness/src`, not
//// remembered. `blueprint/bugs.json` became dispatcher-written the day
//// `auto_file_signals` landed; nobody updated any list, and `gleam run --
//// writes` would have said so on the next invocation without being told.
////
//// **What is still maintained by hand, stated plainly rather than hidden:**
//// the mapping from a file to the *names* of the functions that write it —
//// `blueprint/dag.json` is written by `dag.save`, and so on. That mapping is
//// small, changes about once a quarter, and cannot silently disagree with the
//// code the way a list of files could, because the call sites are looked up
//// fresh every time. What it can still miss is a brand-new writer that goes
//// through none of the known functions, and `unaccounted` below exists for
//// exactly that: it reports raw `simplifile` writes sitting in a module that
//// is not a declared writer implementation, which is what a new one looks
//// like on its first day.

import gleam/int
import gleam/list
import gleam/result
import gleam/string
import harness/config
import simplifile

/// One file (or family of files) the harness writes, the functions that write
/// it, and where it lives.
pub type Written {
  Written(
    /// Repo-relative, as a human would say it in a freeze announcement.
    what: String,
    /// Why touching it during a run is unsafe, in one line.
    risk: String,
    /// Source tokens to look for: `dag.save`, `bugs.save`, and so on.
    writers: List(String),
  )
}

/// One call site found in the source.
pub type Site {
  Site(module: String, line: Int, writer: String)
}

/// The modules that are *allowed* to contain a raw `simplifile` write: the
/// implementations behind the names in `declared`, plus the two that write
/// only into `harness/build/`, which is gitignored scratch and cannot be the
/// subject of a freeze. A raw write anywhere else is a writer nobody declared.
pub const implementations = [
  "bugs.gleam", "dag.gleam", "roster.gleam", "log.gleam", "guard.gleam",
  "dispatch.gleam", "worker.gleam", "verify.gleam", "seed.gleam", "index.gleam",
]

/// The hand-maintained half, and the only hand-maintained half.
pub fn declared() -> List(Written) {
  [
    Written(
      what: "blueprint/dag.json",
      risk: "the dispatcher's source of truth; a save rewrites the whole board from the Dag it loaded, so an edit arriving in between is lost",
      writers: ["dag.save"],
    ),
    Written(
      what: "blueprint/bugs.json",
      risk: "dispatcher-written since auto_file_signals; same whole-file rewrite, and any agent may also be editing it by hand",
      writers: ["bugs.save"],
    ),
    Written(
      what: "agents/roster.json",
      risk: "rewritten whole on a persona mint and on a colour backfill, so a hand-added row can vanish between the load and the save",
      writers: ["roster.save"],
    ),
    Written(
      what: "agents/<Name>.md",
      risk: "the dispatcher appends a notebook entry from a worker's report, `theorise` from a theorist's and `connect` from a connector's; an identity's notebook is not exclusively its own during a run",
      writers: ["roster.append_notebook"],
    ),
    Written(
      what: "Rule30/Proofs.lean",
      risk: "an import line is added for every node that closes",
      writers: ["write_index"],
    ),
    Written(
      what: "blueprint/index.md",
      risk: "rewritten whole from the board at every landing and by `gleam run -- index`; derived, so an edit arriving before the next render is lost",
      writers: ["write_in", "index.write"],
    ),
    Written(
      what: "runs/<run-id>/**",
      risk: "events, journal, briefs, the generated settings.json and archived transcripts; every attempt and every guard writes here continuously",
      writers: [
        "log.event", "log.raw", "log.summary", "log.journal", "write_brief",
        "guard.write_settings", "archive_transcript",
      ],
    ),
    Written(
      what: "runs/<run-id>/<attempt>/proposals.json",
      risk: "a worker's proposed sub-lemmas in the seeder's shape; written once per attempt from the report, so an edit landing between the write and the check below would be checked against bytes nobody wrote",
      writers: ["write_proposals"],
    ),
    Written(
      what: "Rule30/Proofs/<Node>.lean",
      risk: "written only by the worker inside its guard; the harness touches it once, to move an unclosed attempt's file out at attempt end, so that between attempts the directory holds exactly the closed nodes' files",
      writers: ["park_proof_file"],
    ),
    Written(
      what: "runs/<run-id>/<attempt>/<Node>.lean",
      risk: "an unclosed attempt's proof file, moved here from Rule30/Proofs/ at attempt end and never rewritten; the next brief on the node names this path, so an edit here is what the next worker reads",
      writers: ["park_proof_file"],
    ),
    Written(
      what: "runs/<run-id>/<attempt>/proposals-check.txt",
      risk: "seed.check_file_in's report over the proposals.json beside it; derived from that file and rewritten only by a re-run of the check over the same attempt directory, which nothing in the harness does automatically — an attempt directory is never revisited by a later attempt",
      writers: ["run_check"],
    ),
  ]
}

/// Every call site of `writer` under `src_root`, as `Site` rows.
pub fn sites(src_root: String, writer: String) -> Result(List(Site), String) {
  use files <- result.try(gleam_sources(src_root))
  list.try_map(files, fn(path) {
    use source <- result.try(
      simplifile.read(src_root <> "/" <> path)
      |> result.map_error(fn(e) {
        "cannot read " <> path <> ": " <> simplifile.describe_error(e)
      }),
    )
    Ok(
      source
      |> string.split("\n")
      |> list.index_map(fn(line, i) { #(i + 1, line) })
      |> list.filter(fn(pair) { is_call_site(pair.1, writer) })
      |> list.map(fn(pair) { Site(module: path, line: pair.0, writer:) }),
    )
  })
  |> result.map(list.flatten)
}

/// Raw `simplifile` writes in modules that are not declared implementations —
/// the shape a brand-new, undeclared writer has on its first day.
pub fn unaccounted(src_root: String) -> Result(List(Site), String) {
  use files <- result.try(gleam_sources(src_root))
  list.try_map(files, fn(path) {
    let base = base_name(path)
    case list.contains(implementations, base) {
      True -> Ok([])
      False -> {
        use source <- result.try(
          simplifile.read(src_root <> "/" <> path)
          |> result.map_error(fn(e) {
            "cannot read " <> path <> ": " <> simplifile.describe_error(e)
          }),
        )
        Ok(
          source
          |> string.split("\n")
          |> list.index_map(fn(line, i) { #(i + 1, line) })
          |> list.filter(fn(pair) { is_raw_write(pair.1) })
          |> list.map(fn(pair) {
            Site(module: path, line: pair.0, writer: "simplifile")
          }),
        )
      }
    }
  })
  |> result.map(list.flatten)
}

fn is_raw_write(line: String) -> Bool {
  case is_prose(line) {
    True -> False
    False ->
      list.any(
        ["simplifile.write", "simplifile.append", "simplifile.write_bits"],
        fn(token) { string.contains(line, token) },
      )
  }
}

/// A line that *calls* `writer`, as opposed to one that declares it or talks
/// about it. Without this the scan reports a function's own `fn` line and
/// every doc comment that names it, and a report padded with rows that are
/// not call sites is one nobody will read closely enough to notice a real one
/// appearing.
fn is_call_site(line: String, writer: String) -> Bool {
  let trimmed = string.trim(line)
  case
    is_prose(line)
    || string.starts_with(trimmed, "fn ")
    || string.starts_with(trimmed, "pub fn ")
  {
    True -> False
    False -> string.contains(line, writer <> "(")
  }
}

/// A comment, or a line that only quotes a name inside a string. This module
/// names every writer as data, so without the second test it reports itself
/// as an undeclared writer — which it did, on its first run.
///
/// A line that opens with `["` is such a data line unless it is a match arm
/// over a list of strings, which is what every arm of the CLI's `case` over
/// argv is: `["index"] -> index.write(cfg)` is a call site, and the `] ->`
/// is what tells it from `["write_in", "index.write"],` two screens up.
fn is_prose(line: String) -> Bool {
  let trimmed = string.trim(line)
  string.starts_with(trimmed, "//")
  || string.starts_with(trimmed, "\"")
  || { string.starts_with(trimmed, "[\"") && !string.contains(trimmed, "] ->") }
}

/// Every `.gleam` file under `src_root`, one level of nesting deep, which is
/// as deep as this project's source goes. Returns paths relative to
/// `src_root`.
fn gleam_sources(src_root: String) -> Result(List(String), String) {
  use entries <- result.try(
    simplifile.read_directory(src_root)
    |> result.map_error(fn(e) {
      "cannot read " <> src_root <> ": " <> simplifile.describe_error(e)
    }),
  )
  list.try_map(entries, fn(entry) {
    case string.ends_with(entry, ".gleam") {
      True -> Ok([entry])
      False ->
        case simplifile.read_directory(src_root <> "/" <> entry) {
          Error(_) -> Ok([])
          Ok(inner) ->
            Ok(
              inner
              |> list.filter(string.ends_with(_, ".gleam"))
              |> list.map(fn(f) { entry <> "/" <> f }),
            )
        }
    }
  })
  |> result.map(list.flatten)
}

fn base_name(path: String) -> String {
  string.split(path, "/") |> list.last |> result.unwrap(path)
}

/// The report `gleam run -- writes` prints.
pub fn report(cfg: config.Config) -> Result(String, String) {
  report_from(cfg.repo_root <> "/harness/src")
}

/// The report, against any source tree. Split out so the tests can point it
/// at a fixture without standing up a `Config`, and so `report` has nothing
/// in it but the path.
pub fn report_from(src_root: String) -> Result(String, String) {
  use blocks <- result.try(
    list.try_map(declared(), fn(w) {
      use found <- result.try(
        list.try_map(w.writers, fn(writer) { sites(src_root, writer) })
        |> result.map(list.flatten),
      )
      Ok(string.join(
        [
          w.what,
          "  " <> w.risk,
          ..case found {
            [] -> [
              "  NO CALL SITES FOUND — either this entry is stale or a writer was renamed",
            ]
            _ -> list.map(found, fn(s) { "  " <> describe(s) })
          }
        ],
        "\n",
      ))
    }),
  )
  use loose <- result.try(unaccounted(src_root))
  let tail = case loose {
    [] ->
      "No undeclared writers: every raw simplifile write in harness/src is\nin a module this file already accounts for."
    _ ->
      string.join(
        [
          "UNDECLARED WRITERS — a module outside the declared implementations",
          "writes to disk. Add it to `declared` in harness/src/harness/writes.gleam",
          "before the next run, or a freeze will not name the file it touches:",
          ..list.map(loose, fn(s) { "  " <> describe(s) })
        ],
        "\n",
      )
  }
  Ok(string.join(
    [
      "Files the harness writes, and the source lines that write them.",
      "Scanned from " <> src_root <> " just now, not remembered.",
      "Freeze all of these while a run is in flight.",
      "",
      ..list.append(blocks, ["", tail])
    ],
    "\n",
  ))
}

fn describe(s: Site) -> String {
  s.writer <> "  src/" <> s.module <> ":" <> int.to_string(s.line)
}
