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
import gleam/option.{type Option, None, Some}
import gleam/result
import gleam/string
import harness/config
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
    color: Option(String),
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

/// Every identity that specialises in `region`, in roster order — which is
/// creation order, so the eldest comes first.
pub fn for_region(roster: Roster, region: String) -> List(Identity) {
  list.filter(roster.identities, fn(i) { i.region == region })
}

/// The eldest identity for `region` whose name is not in `busy`: a persona
/// is a resource with capacity one, and this is the free one. `None` when
/// every persona for the region is busy, or the region has none.
pub fn idle_for_region(
  roster: Roster,
  region: String,
  busy busy: List(String),
) -> Option(Identity) {
  for_region(roster, region)
  |> list.find(fn(i) { !list.contains(busy, i.name) })
  |> option.from_result
}

/// Add an identity to the roster.
pub fn add(roster: Roster, identity: Identity) -> Roster {
  Roster(list.append(roster.identities, [identity]))
}

/// Replace the identity with this name, if one is on the roster. Used to
/// write back an identity a later ceremony has updated in place, such as
/// backfilling a colour.
pub fn replace(roster: Roster, identity: Identity) -> Roster {
  Roster(
    list.map(roster.identities, fn(i) {
      case i.name == identity.name {
        True -> identity
        False -> i
      }
    }),
  )
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

/// Append one dated section to the notebook. The first write creates the
/// file with the identity's own opening paragraph as its header, so a
/// notebook always starts in its owner's voice. The entry is kept verbatim
/// except for a title line it may open with — the dated heading is the
/// section's title, and a prover that supplies its own would otherwise
/// leave the notebook saying the same thing twice.
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
  let section = "\n## " <> heading <> "\n\n" <> drop_own_heading(entry) <> "\n"
  simplifile.append(to: path, contents: preamble <> section)
  |> result.map_error(simplifile.describe_error)
}

/// An entry minus any Markdown heading it opens with, and the blank lines
/// after it.
fn drop_own_heading(entry: String) -> String {
  let trimmed = string.trim_start(entry)
  case string.starts_with(trimmed, "#") {
    False -> entry
    True ->
      case string.split_once(trimmed, "\n") {
        Ok(#(_, rest)) -> string.trim_start(rest)
        Error(Nil) -> ""
      }
  }
}

/// What an identity's record actually shows, computed from the DAG rather
/// than written anywhere — so a name carries evidence, not vibes.
///
/// `calibration` counts the attempts whose own size estimate matched the
/// node's recorded size: an identity that consistently calls an `M` an `S`
/// is telling you something about both. Only attempts that actually carried
/// a report are counted — an attempt with no report has the node's own size
/// copied into `estimate`, and scoring that would be marking an identity's
/// homework against a number it never wrote.
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

/// Fold one attempt into the scorecard.
///
/// Calibration — did the identity's re-pricing agree with the node's size —
/// is scored for a reported attempt that closed the node at any rung or was
/// made on the top rung of its ladder (`config.ladder`), and never for one
/// the harness itself broke. The ladder is a cost optimiser: it tries the
/// cheapest model first because a cheap success is a bargain, not because a
/// cheap failure means anything. A haiku that closes an `S` node confirms
/// (or over-prices) the estimate exactly as an opus close would; a haiku
/// that dies there is a probe that missed, and scoring its estimate would
/// let the cheapest model on the ladder set the number the overseer prices
/// every future node with. Cost is summed regardless: a probe still had to
/// be paid for.
fn tally(acc: Scorecard, node: dag.Node, attempt: dag.Attempt) -> Scorecard {
  let closed = case attempt.outcome {
    dag.Closed -> acc.closed + 1
    _ -> acc.closed
  }
  let abandoned = case attempt.outcome {
    dag.GaveUp | dag.BudgetExhausted -> acc.abandoned + 1
    _ -> acc.abandoned
  }
  let evidence =
    attempt.reported
    && attempt.outcome != dag.HarnessFailed
    && { on_top_rung(node, attempt) || attempt.outcome == dag.Closed }
  let hits = case evidence && attempt.estimate == node.size {
    True -> acc.calibration_hits + 1
    False -> acc.calibration_hits
  }
  let total = case evidence {
    True -> acc.calibration_total + 1
    False -> acc.calibration_total
  }
  Scorecard(
    name: acc.name,
    closed:,
    abandoned:,
    cost_usd: acc.cost_usd +. attempt.cost_usd,
    calibration_hits: hits,
    calibration_total: total,
  )
}

/// Was this attempt made with the last model on the node's ladder — the
/// one whose failure the scheduler has nothing left to escalate to. A
/// `Wall` node has no ladder, so nothing made there is on its top rung.
fn on_top_rung(node: dag.Node, attempt: dag.Attempt) -> Bool {
  list.last(config.ladder(node.size)) == Ok(attempt.model)
}

/// One line for the dispatcher's summary, e.g.
/// `"Thessaly: closed 3, abandoned 1, $2.10, calibration 3/4"`, or, once an
/// identity has chosen a colour, `"Emmy (#7b2d8e): closed 2, ..."`.
pub fn scorecard_text(s: Scorecard, color: Option(String)) -> String {
  s.name
  <> case color {
    Some(c) -> " (" <> c <> ")"
    None -> ""
  }
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
    "framework" ->
      "the harness itself: the dispatcher, the guard, the verifier and the board every prover runs inside"
    "theory" ->
      "the whole board at once: what would have to be true for a wall to fall, which routes are already dead, and which claims survive the engine — an argument, never a proof"
    other -> other
  }
}

/// The single message the naming ceremony sends. Names are self-chosen: the
/// first instance of an identity is told its region and asked to name
/// itself, and both the name and its stated reason go in the log. When the
/// region already has provers, the newcomer is told their names, so it can
/// place itself beside them and cannot pick one of them.
pub fn naming_prompt(
  region: String,
  region_description: String,
  siblings: List(String),
) -> String {
  "You are about to join a small team of provers formalizing Wolfram's Rule 30 in Lean 4. You will be "
  <> case siblings {
    [] -> "the specialist"
    _ -> "a specialist"
  }
  <> " for the region \""
  <> region
  <> "\": "
  <> region_description
  <> ". "
  <> sibling_sentence(siblings)
  <> "Your work on this region will persist across many sessions through a notebook that only you write. Choose a name for yourself. It must be a name, not a job title, and not the name of a living person"
  <> case siblings {
    [] -> ""
    _ -> ", and a name none of them has"
  }
  <> ". Then write the opening paragraph of your notebook: who you are, in your own words. Reply with a JSON object with exactly these five fields, all required:\n- \"name\": the name you choose (a single capitalised word, letters only)\n- \"reason\": one paragraph on why\n- \"opening\": the opening paragraph of your notebook — who you are, in your own words, three to six sentences\n- \"color\": a hex colour that is yours, written #rrggbb\n- \"color_reason\": one sentence on why"
}

fn sibling_sentence(siblings: List(String)) -> String {
  case siblings {
    [] -> ""
    [one] ->
      "This region already has a prover named "
      <> one
      <> ". They keep a notebook of their own, as you will; you are joining them, not replacing them. "
    many -> {
      let assert Ok(last) = list.last(many)
      let init = list.take(many, list.length(many) - 1)
      "This region already has provers named "
      <> string.join(init, ", ")
      <> " and "
      <> last
      <> ". Each keeps a notebook of their own, as you will; you are joining them, not replacing them. "
    }
  }
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
        #("color", json.object([#("type", json.string("string"))])),
        #("color_reason", json.object([#("type", json.string("string"))])),
      ]),
    ),
    #(
      "required",
      json.array(
        ["name", "reason", "opening", "color", "color_reason"],
        json.string,
      ),
    ),
  ])
  |> json.to_string
}

/// What the ceremony session answers with: the name it chose, why, the
/// opening paragraph of its notebook, and the colour it chose along with its
/// stated reason.
pub type Naming {
  Naming(
    name: String,
    reason: String,
    opening: String,
    color: String,
    color_reason: String,
  )
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
  use color <- decode.field("color", decode.string)
  use color_reason <- decode.field("color_reason", decode.string)
  decode.success(Naming(name:, reason:, opening:, color:, color_reason:))
}

/// What a standalone colour ceremony (the backfill, for an identity that was
/// named before colours existed) answers with.
pub type ColorChoice {
  ColorChoice(color: String, color_reason: String)
}

/// Decode a colour ceremony answer out of a turn's `structured_output`.
pub fn color_choice_from_dynamic(dyn: Dynamic) -> Result(ColorChoice, String) {
  decode.run(dyn, color_choice_decoder())
  |> result.map_error(string.inspect)
}

fn color_choice_decoder() -> decode.Decoder(ColorChoice) {
  use color <- decode.field("color", decode.string)
  use color_reason <- decode.field("color_reason", decode.string)
  decode.success(ColorChoice(color:, color_reason:))
}

/// The `--json-schema` the standalone colour ceremony asks for.
pub fn color_schema() -> String {
  json.object([
    #("type", json.string("object")),
    #(
      "properties",
      json.object([
        #("color", json.object([#("type", json.string("string"))])),
        #("color_reason", json.object([#("type", json.string("string"))])),
      ]),
    ),
    #("required", json.array(["color", "color_reason"], json.string)),
  ])
  |> json.to_string
}

/// The single message the standalone colour ceremony sends, for an identity
/// that was named before colours existed.
pub fn color_prompt(name: String, opening: String) -> String {
  "You are "
  <> name
  <> ". "
  <> opening
  <> " Choose a hex colour that is yours, written #rrggbb, and say in one sentence why. Reply with a JSON object with exactly these two fields, all required:\n- \"color\": a hex colour that is yours, written #rrggbb\n- \"color_reason\": one sentence on why"
}

/// Is this a usable colour: `#` followed by exactly six hex digits,
/// case-insensitive.
pub fn valid_color(s: String) -> Bool {
  case string.to_graphemes(s) {
    [hash, ..rest] ->
      hash == "#" && list.length(rest) == 6 && list.all(rest, is_hex_digit)
    [] -> False
  }
}

fn is_hex_digit(g: String) -> Bool {
  case string.lowercase(g) {
    "0"
    | "1"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "8"
    | "9"
    | "a"
    | "b"
    | "c"
    | "d"
    | "e"
    | "f" -> True
    _ -> False
  }
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
    #(
      "color",
      json.nullable(option.map(identity.color, string.lowercase), json.string),
    ),
  ])
}

fn identity_decoder() -> decode.Decoder(Identity) {
  use name <- decode.field("name", decode.string)
  use region <- decode.field("region", decode.string)
  use created <- decode.field("created", decode.string)
  use naming_reason <- decode.field("naming_reason", decode.string)
  use opening <- decode.field("opening", decode.string)
  use color <- decode.optional_field(
    "color",
    None,
    decode.optional(decode.string),
  )
  decode.success(Identity(
    name:,
    region:,
    created:,
    naming_reason:,
    opening:,
    color:,
  ))
}

fn roster_decoder() -> decode.Decoder(Roster) {
  use identities <- decode.field("identities", decode.list(identity_decoder()))
  decode.success(Roster(identities:))
}
