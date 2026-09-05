import Lake
open Lake DSL

package «rule30» where
  -- Matches the Prove2Me server, which elaborates with auto-implicits off.
  -- Every type variable must be declared explicitly.
  leanOptions := #[⟨`autoImplicit, false⟩]

require mathlib from git
  "https://github.com/leanprover-community/mathlib4.git" @
  "0df444a360eaa60ab8c11dca51a86af692955474"

@[default_target]
lean_lib «Rule30» where
