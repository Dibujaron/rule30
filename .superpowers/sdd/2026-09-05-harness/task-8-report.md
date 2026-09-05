# Task 8 report: config, roster, worker, dispatcher, CLI

> Written to the worktree path
> `.claude/worktrees/agent-a55a3f5397977bf75/.superpowers/sdd/2026-09-05-harness/task-8-report.md`
> because worktree isolation refused a write to the shared checkout's
> `.superpowers/`.

**Status:** DONE_WITH_CONCERNS
**Branch:** `worktree-agent-a55a3f5397977bf75`

## Commits

| SHA | Subject |
|---|---|
| `f11d18c` | Harness: config and model ladder |
| `7514860` | Harness: roster, notebooks, naming ceremony |
| `cd3ed19` | Harness: worker turn loop |
| `ab63fcf` | Harness: prove-one dispatcher and CLI |
| `bf5e347` | Merge branch 'harness' (guard fail-closed + lock fixes) |
| `3fae013` | Harness: teach the brief the guard's exact Bash grammar |
| `a50b135` | Harness: ensure_identity returns only the identity |

`gleam test`: **75 passed, no failures.** Output pristine apart from the
pre-existing `mist`/`gramps` deprecation warnings and mist's own
`Listening on http://127.0.0.1:4130` line from `guard_test`.

## What was built

### 8a — `harness/src/harness/config.gleam`

`Config` exactly as briefed. `load()` reads every `HARNESS_*` override with
the briefed defaults, treats an empty variable as unset, and resolves
`repo_root` to the parent of the cwd when the cwd's last segment is
`harness` (which is what `gleam run` gives us). Every other path is derived
from `repo_root` and joined with `/`.

Two small judgement calls, both noted rather than hidden:

- **`load` fails only on a missing `lake`.** It is the one thing without
  which nothing can be verified, and an unverifiable run is not worth
  starting. I added an `HARNESS_LAKE` escape hatch, not in the brief, for
  the same reason `HARNESS_NODE` exists.
- **`repo_root` is normalised to forward slashes** and every path is joined
  with `/`, including `guard.Rules.allowed_write` where the brief wrote
  `<> "\\" <>`. `guard.normalise_path` compares both forms, so the two are
  equivalent; one separator throughout is easier to read in a log.

`ladder`/`model_for` are as briefed, `model_for` being
`ladder |> list.drop(failed) |> list.first`.

### 8b — `harness/src/harness/roster.gleam`

`Identity`, `Roster`, `load`/`save`/`for_region`/`add`, `notebook_path`,
`read_notebook`, `append_notebook`, `Scorecard`, `scorecard`,
`scorecard_text`, plus `naming_prompt` and `region_description` with the
spec's exact wording.

- `load` of a missing file is `Ok(Roster([]))`, not an error: a fresh
  checkout has nobody on the roster yet, and that is not a failure.
- `append_notebook` writes `# <name>\n\n<opening>\n` only on the first
  write, then appends `## <heading>\n\n<entry>\n` each time.
- `scorecard_text` formats money to the cent through a `usd` helper
  (`2.1 → "2.10"`), since `float.to_string` gives `"2.1"` and Erlang's
  `float_to_binary` gives `"2.10000000000000008882e+00"`. `usd` is public
  because the dispatcher's summary needs the same formatting.

Additions the brief implies but does not list: `check_name` (the
`[A-Z][A-Za-z]{1,19}` + collision rule, returning the reason so the re-ask
can quote it), `naming_schema`, and `Naming` + `naming_from_dynamic` for
decoding the ceremony's `structured_output`. The ceremony's *session* lives
in `worker.gleam` as briefed; only its data shape lives here.

### 8c — `harness/src/harness/worker.gleam` + `harness/src/harness/worker/brief.gleam`

**Split, per the style rule.** With everything in one file `worker.gleam`
was 800 lines, so the prompt assembly moved to
`harness/src/harness/worker/brief.gleam` (275 lines); `worker.gleam` is now
524. The functions the brief named `worker.report_schema`, `worker.brief`
and `worker.task_message` are therefore `brief.report_schema`,
`brief.text` and `brief.task_message`. I did **not** leave forwarding
wrappers in `worker.gleam` — nothing outside the tests consumes them, and
four one-line delegations would be noise. Flagging it because it is a
deviation from the interface the brief spelled out.

`brief.text` has the six `##` sections in the briefed order. **Who you are**
carries the notebook verbatim. **The project** reads `CLAUDE.md` at runtime
and includes it whole. **Your constraints** names the one editable file, the
`lake` grammar, the no-`Statements`-import rule, the no-`sorry` rule, and
quotes the generated `type_of%` check theorem so the worker can see exactly
what it is being held to. **Served lemmas** lists `dag.served`. **Prior
attempts** reproduces each attempt's notes verbatim, or `none`. **How to
report** explains the three channels.

`brief.signature` finds the line opening `theorem <lean_name>` (rejecting
`theorem foo_bar` when asked for `foo`) and takes lines to the first
`:= by`, replaced by `:=`. `task_message` reads `Rule30/Statements.lean`
relative to the cwd, which `main` has already set to the repo root;
`task_message_from` is the pure half so it can be tested without one.

The turn loop threads a single `Turn` record (cfg, node, log, session,
tally, rounds, rate_limited) rather than seven positional arguments. It
handles: timeout → `TimedOut` + kill; `Exited` before a result → `TimedOut`;
rate-limit ceiling hit → `RateLimited` with the session id in the notes;
`is_error` on the result → `BudgetExhausted`; `proved` → verify, and either
`Closed` or the verdict sent straight back; `abandoned` → `GaveUp`;
`in_progress` or a missing report → one more message, counted against
`max_verify_rounds`. Rounds exhausted becomes `BudgetExhausted`. Always
`finish`, drain to `Exited` within 30 s, else `kill`.

Verifier output goes into `attempt.notes` clipped to 2000 characters — the
full text is already in `events.jsonl`, so nothing the verifier produced is
lost. Nothing an *agent* wrote is ever clipped.

### 8d — `harness/src/harness/dispatch.gleam`, `harness/src/harness.gleam`

`prove_one` and `status` as briefed. `main` calls `config.load()` then
`harness_ffi:set_cwd(repo_root)` before dispatching; `spike` is kept.

Two ordering/semantic deviations, both deliberate:

- **The guard is started before the naming ceremony.** The brief orders
  identity (step 3) before the guard (step 6), but the ceremony needs
  `guard.settings_path` for its `--settings` (that is what suppresses user
  plugins). So the order is: log → lock → guard → settings → identity →
  dispatch event → claim → attempt.
- **A node whose ladder is exhausted is marked `Abandoned` at the end of
  the attempt**, not left `Open` until the next call errors. The brief's
  wording ("`Abandoned` only when `model_for` returns `Error` on the next
  call") uses the same predicate; evaluating it now keeps a node that
  nothing can ever be dispatched at out of `dag.open_leaves`, which is what
  the spec means by an open leaf.

`write_channels` writes the notebook entry, the journal entry and the post
events straight from the report, verbatim, and only when non-empty.

## Smoke run

`HARNESS_REPO_ROOT=C:\Users\dibuj\dev\rule30 gleam run -- prove-one centerColumn_zero`,
from the worktree's `harness/`. One run, as budgeted.

```
node      centerColumn_zero
identity  Emmy
model     haiku
outcome   proved
cost      $0.11         (0.108113 exactly)
turns     9
estimate  S             (calibration hit: node size is S)
session   a3985ae1-b2c7-4b7f-9e38-66ae94a41618
log       C:/Users/dibuj/dev/rule30/runs/20260905T213244Z
verifier  VERIFIED. Axioms: propext
```

**The naming ceremony produced a name and a notebook.** The P2 identity
named itself `Emmy` on the first ask — no re-ask needed — for Noether, and
its stated reason names where the analogy breaks without being asked to,
which is the teaching contract showing up in an agent that only ever saw
`CLAUDE.md`. Its opening paragraph is in `agents/Emmy.md`; the notebook now
has three sections (opening, naming reason, and the `centerColumn_zero`
entry) and the journal entry is in the run's `journal.md`.

The guard did real work: three denials in six decisions — two `cd …`
attempts and one `Write` to `C:\Users\dibuj\dev\rule30\test_axioms.lean`.
The worker recovered from each and closed the node anyway. `lake build`
took the build lock and released it.

The proof it wrote:

```lean
import Rule30.Basic

theorem centerColumn_zero : centerColumn 0 = true := by
  unfold centerColumn evolve initialConfig
  simp
```

### What the run left in the main checkout

I could not revert these from an isolated worktree, and would not want to —
two of them are things an agent wrote.

- `Rule30/Proofs/CentercolumnZero.lean` (new)
- `blueprint/dag.json` — `centerColumn_zero` now `proved`, with the attempt
- `agents/roster.json` — Emmy added; `agents/Emmy.md` (new)
- `runs/20260905T213244Z/` — events.jsonl (90 KB), journal.md,
  settings.json, briefs/centerColumn_zero-1.md

**Task 9 therefore starts with `centerColumn_zero` closed and Emmy already
on the roster.** If Task 9 wants a cold start, revert those four paths
first; if it wants to demonstrate a notebook being *reused*, this is a
better starting state than a cold one.

## Concerns

1. **`dag.proof_path` mangles camelCase ids.** `dag.pascal_case` splits on
   `_` and applies `string.capitalise`, which lowercases the rest of each
   part — so `centerColumn_zero` becomes `CentercolumnZero`, not
   `CenterColumnZero`. It is internally consistent (path and module agree)
   so nothing breaks, but it violates the repo's own `UpperCamelCase`
   module convention. Worse: `harness/test/verify_test.gleam` hard-codes
   `CenterColumnZero.lean` and only passes because Windows filesystems are
   case-insensitive. This is Task 3's file and outside my remit, but it
   should be fixed before the DAG has many camelCase ids.
2. **`verify_test.gleam` writes to the main checkout by absolute path** and
   deletes the file afterwards. Two agents running `gleam test` at once
   race on it — I saw exactly that failure once. Likewise `guard_test`
   binds a fixed port 4130, and I saw `Eaddrinuse` several times while the
   concurrent guard-fix agent was running. Both are test-isolation gaps,
   not product bugs, but they make "the suite is green" a flaky claim in a
   parallel-agent workflow.
3. **`prove_one` marks a node `Claimed` and saves before the attempt.** A
   crash mid-attempt leaves it `Claimed` forever with no recovery path.
   Briefed behaviour, but it needs a `harness reset <node>` or a
   crash-recovery sweep before an unattended multi-node run.
4. **Rate-limit parking records the session id in `notes` only.** Nothing
   reads it back yet — resume is not implemented, as the brief intended,
   but a later `--resume` will want it in a typed field rather than parsed
   out of prose.
5. **`config_test`'s defaults test asserts `guard_port == 4130` etc.** It
   fails if someone has `HARNESS_GUARD_PORT` exported. Acceptable for a
   defaults test; worth knowing.
6. **The worker session's `--settings` and the guard's are the same file**
   (`<log.dir>/settings.json`), which the merged guard now writes per run
   rather than into `<repo>/.claude/settings.json`. Before that merge this
   code would have clobbered the repository's own settings file. It does
   not now, but the coupling is worth remembering.

## Verification evidence

- `gleam test` → `75 passed, no failures` (final run, post-merge).
- `gleam run -- status` prints all nine nodes and the open leaves ranked
  cone-lemma-first (unblocks 2), then the S nodes.
- The smoke run above, verified end to end by `verify.verify`, not by
  assertion.
