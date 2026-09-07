/-
The Lean project the harness's toolchain-dependent tests run against.

`verify_test` and `seed_test` need a real `lake`, a real `lean`, and a project
whose `Rule30.Basic` and `Rule30.Statements` build — but nothing they check
needs Mathlib. The real project's `.lake` is 7.4 GB of compiled Mathlib and
exists only in the live checkout, so tests that ran there wrote fixture proof
files next to real ones. This project has no dependencies, builds from
nothing in seconds, and is where those tests write instead.

It mirrors the real project's layout exactly (`Rule30/Basic.lean`,
`Rule30/Statements.lean`, `Rule30/Proofs/`, `Rule30/Proofs.lean`), because
`verify.verify` and `seed` derive every path from a repo root and the
tests exercise those paths as they are.
-/
import Lake
open Lake DSL

package «rule30-fixture» where
  -- As the real project: auto-implicits off, every type variable declared.
  leanOptions := #[⟨`autoImplicit, false⟩]

@[default_target]
lean_lib «Rule30» where
