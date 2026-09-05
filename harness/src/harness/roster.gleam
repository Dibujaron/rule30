//// Identities: who is working, and what they remember.
////
//// An identity is **a notebook bound to a region of the DAG**, not a
//// process. Instances are ephemeral and models come and go up the ladder;
//// `agents/<name>.md` is the continuity. The roster
//// (`agents/roster.json`) is only the index — name, region, when it was
//// created, and the name it chose for itself along with its stated reason.
////
//// Nothing here summarises anything an agent wrote. The opening paragraph
//// and every later notebook entry are appended verbatim, exactly as the
//// worker reported them.

import gleam/dynamic.{type Dynamic}
import gleam/dynamic/decode
import gleam/float
import gleam/int
import gleam/json
import gleam/list
import gleam/option.{type Option}
import gleam/result
import gleam/string
import harness/dag
import simplifile

/// One identity: its self-chosen name, the region it specialises in, and
/// the words it used when it chose.
pub type Identity {
  Identity(
    name: String,
    region: String,
    created: String,
    naming_reason: String,
    opening: String,
  )
}

/// Every identity known to the run.
pub type Roster {
  Roster(identities: List(Identity))
}

/// Parse a `Roster` from its JSON text representation.
pub fn decode(text: String) -> Result(Roster, String) {
  json.parse(from: text, using: roster_decoder())
  |> result.map_error(string.inspect)
}

/// Render a `Roster` to its JSON text representation.
pub fn encode(roster: Roster) -> String {
  json.object([
    #("identities", json.array(roster.identities, identity_to_json)),
  ])
  |> json.to_string
}

/// Read and decode a `Roster` from a file. A missing file is an empty
/// roster: the first run of a fresh checkout has nobody on it yet.
pub fn load(path: String) -> Result(Roster, String) {
  case simplifile.read(path) {
    Error(simplifile.Enoent) -> Ok(Roster([]))
    Error(err) -> Error(simplifile.describe_error(err))
    Ok(text) -> decode(text)
  }
}

/// Encode and write a `Roster` to a file, one trailing newline.
pub fn save(roster: Roster, path: String) -> Result(Nil, String) {
  simplifile.write(path, encode(roster) <> "\n")
  |> result.map_error(simplifile.describe_error)
}

/// The identity that specialises in `region`, if one has been named yet.
pub fn for_region(roster: Roster, region: String) -> Option(Identity) {
  roster.identities
  |> list.find(fn(i) { i.region == region })
  |> option.from_result
}

/// Add an identity to the roster.
pub fn add(roster: Roster, identity: Identity) -> Roster {
  Roster(list.append(roster.identities, [identity]))
}

/// Where this identity's notebook lives: `<agents_dir>/<name>.md`.
pub fn notebook_path(agents_dir: String, identity: Identity) -> String {
  agents_dir <> "/" <> identity.name <> ".md"
}

/// This identity's notebook, or `""` when it has not written one yet.
pub fn read_notebook(agents_dir: String, identity: Identity) -> String {
  simplifile.read(notebook_path(agents_dir, identity))
  |> result.unwrap("")
}

/// Append one dated section to the notebook, verbatim. The first write
/// creates the file with the identity's own opening paragraph as its
/// header, so a notebook always starts in its owner's voice.
pub fn append_notebook(
  agents_dir: String,
  identity: Identity,
  heading: String,
  entry: String,
) -> Result(Nil, String) {
  let path = notebook_path(agents_dir, identity)
  let preamble = case simplifile.is_file(path) {
    Ok(True) -> ""
    _ -> "# " <> identity.name <> "\n\n" <> identity.opening <> "\n"
  }
  let section = "\n## " <> heading <> "\n\n" <> entry <> "\n"
  simplifile.append(to: path, contents: preamble <> section)
  |> result.map_error(simplifile.describe_error)
}

/// What an identity's record actually shows, computed from the DAG rather
/// than written anywhere — so a name carries evidence, not vibes.
///
/// `calibration` counts the attempts whose own size estimate matched the
/// node's recorded size: an identity that consistently calls an `M` an `S`
/// is telling you something about both.
pub type Scorecard {
  Scorecard(
    name: String,
    closed: Int,
    abandoned: Int,
    cost_usd: Float,
    calibration_hits: Int,
    calibration_total: Int,
  )
}

/// Walk every attempt this identity made, across every node.
pub fn scorecard(dag_: dag.Dag, name: String) -> Scorecard {
  dag_.nodes
  |> list.fold(Scorecard(name, 0, 0, 0.0, 0, 0), fn(acc, node) {
    node.attempts
    |> list.filter(fn(a) { a.identity == name })
    |> list.fold(acc, fn(acc, attempt) { tally(acc, node, attempt) })
  })
}

fn tally(acc: Scorecard, node: dag.Node, attempt: dag.Attempt) -> Scorecard {
  let closed = case attempt.outcome {
    dag.Closed -> acc.closed + 1
    _ -> acc.closed
  }
  let abandoned = case attempt.outcome {
    dag.GaveUp | dag.BudgetExhausted -> acc.abandoned + 1
    _ -> acc.abandoned
  }
  let hits = case attempt.estimate == node.size {
    True -> acc.calibration_hits + 1
    False -> acc.calibration_hits
  }
  Scorecard(
    name: acc.name,
    closed:,
    abandoned:,
    cost_usd: acc.cost_usd +. attempt.cost_usd,
    calibration_hits: hits,
    calibration_total: acc.calibration_total + 1,
  )
}

/// One line for the dispatcher's summary, e.g.
/// `"Thessaly: closed 3, abandoned 1, $2.10, calibration 3/4"`.
pub fn scorecard_text(s: Scorecard) -> String {
  s.name
  <> ": closed "
  <> int.to_string(s.closed)
  <> ", abandoned "
  <> int.to_string(s.abandoned)
  <> ", $"
  <> usd(s.cost_usd)
  <> ", calibration "
  <> int.to_string(s.calibration_hits)
  <> "/"
  <> int.to_string(s.calibration_total)
}

/// A dollar amount to the cent: `2.1` renders as `"2.10"`, not `"2.1"` and
/// certainly not `float_to_binary`'s `"2.10000000000000008882e+00"`.
pub fn usd(amount: Float) -> String {
  let cents = float.round(amount *. 100.0)
  int.to_string(cents / 100)
  <> "."
  <> string.pad_start(int.to_string(cents % 100), 2, "0")
}

/// What a region is about, in the words the naming ceremony uses. P3 is
/// absent on purpose: it is the prize conjectures, and nothing is ever
/// dispatched there.
pub fn region_description(region: String) -> String {
  case region {
    "P1" ->
      "the geometry of the light cone and its edges, where periodicity provably holds"
    "P2" ->
      "the density bookkeeping behind the balance conjecture: counting black cells and bounding ratios in ℝ"
    other -> other
  }
}

/// The single message the naming ceremony sends. Names are self-chosen: the
/// first instance of an identity is told its region and asked to name
/// itself, and both the name and its stated reason go in the log.
pub fn naming_prompt(region: String, region_description: String) -> String {
  "You are about to join a small team of provers formalizing Wolfram's Rule 30 in Lean 4. You will be the specialist for the region \""
  <> region
  <> "\": "
  <> region_description
  <> ". Your work on this region will persist across many sessions through a notebook that only you write. Choose a name for yourself. It must be a name, not a job title, and not the name of a living person. Then write the opening paragraph of your notebook: who you are, in your own words. Reply with a JSON object with exactly these three fields, all required:\n- \"name\": the name you choose (a single capitalised word, letters only)\n- \"reason\": one paragraph on why\n- \"opening\": the opening paragraph of your notebook — who you are, in your own words, three to six sentences"
}

/// The `--json-schema` the naming ceremony asks for.
pub fn naming_schema() -> String {
  json.object([
    #("type", json.string("object")),
    #(
      "properties",
      json.object([
        #("name", json.object([#("type", json.string("string"))])),
        #("reason", json.object([#("type", json.string("string"))])),
        #("opening", json.object([#("type", json.string("string"))])),
      ]),
    ),
    #("required", json.array(["name", "reason", "opening"], json.string)),
  ])
  |> json.to_string
}

/// What the ceremony session answers with: the name it chose, why, and the
/// opening paragraph of its notebook.
pub type Naming {
  Naming(name: String, reason: String, opening: String)
}

/// Decode a ceremony answer out of a turn's `structured_output`.
pub fn naming_from_dynamic(dyn: Dynamic) -> Result(Naming, String) {
  decode.run(dyn, naming_decoder())
  |> result.map_error(string.inspect)
}

fn naming_decoder() -> decode.Decoder(Naming) {
  use name <- decode.field("name", decode.string)
  use reason <- decode.field("reason", decode.string)
  use opening <- decode.field("opening", decode.string)
  decode.success(Naming(name:, reason:, opening:))
}

/// Is this a usable name: `[A-Z][A-Za-z]{1,19}`, and not already taken.
/// `Error` carries the reason, which is what the second ask quotes back.
pub fn check_name(roster: Roster, name: String) -> Result(Nil, String) {
  case well_formed(name) {
    False ->
      Error(
        "\""
        <> name
        <> "\" is not a name I can use: it must start with a capital letter, be 2 to 20 letters long, and contain only letters.",
      )
    True ->
      case list.any(roster.identities, fn(i) { i.name == name }) {
        True -> Error("\"" <> name <> "\" is already taken by another prover.")
        False -> Ok(Nil)
      }
  }
}

fn well_formed(name: String) -> Bool {
  let graphemes = string.to_graphemes(name)
  let length = list.length(graphemes)
  case graphemes {
    [first, ..rest] ->
      length >= 2
      && length <= 20
      && is_upper_letter(first)
      && list.all(rest, is_letter)
    [] -> False
  }
}

fn is_upper_letter(g: String) -> Bool {
  is_letter(g) && string.uppercase(g) == g
}

fn is_letter(g: String) -> Bool {
  string.lowercase(g) != string.uppercase(g)
}

fn identity_to_json(identity: Identity) -> json.Json {
  json.object([
    #("name", json.string(identity.name)),
    #("region", json.string(identity.region)),
    #("created", json.string(identity.created)),
    #("naming_reason", json.string(identity.naming_reason)),
    #("opening", json.string(identity.opening)),
  ])
}

fn identity_decoder() -> decode.Decoder(Identity) {
  use name <- decode.field("name", decode.string)
  use region <- decode.field("region", decode.string)
  use created <- decode.field("created", decode.string)
  use naming_reason <- decode.field("naming_reason", decode.string)
  use opening <- decode.field("opening", decode.string)
  decode.success(Identity(name:, region:, created:, naming_reason:, opening:))
}

fn roster_decoder() -> decode.Decoder(Roster) {
  use identities <- decode.field("identities", decode.list(identity_decoder()))
  decode.success(Roster(identities:))
}
