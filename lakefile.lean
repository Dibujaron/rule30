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

-- Not a default target: the A051023 oracle check is expensive (`3 ^ t` per
-- term) and should not be paid on every agent rebuild. Run `lake build Oracle`.
lean_lib «Oracle» where
  srcDir := "test"
