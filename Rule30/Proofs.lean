/-
# Rule30.Proofs

Every closed node's proof module, in one import list, so that `lake build`
from the repository root builds the proofs as well as the statements. Without
this file nothing imports `Rule30/Proofs/`, and a proof that stopped
compiling — because Mathlib moved, or because a statement was edited — would
go unnoticed until the next worker was dispatched at it.

**The dispatcher maintains this file.** `harness/src/harness/dispatch.gleam`
appends one `import` line here when a node closes, keeping the list sorted
and skipping a line that is already present. Edit it by hand only to remove a
module whose node has been retired.
-/
import Rule30.Proofs.BoolDrivenEventuallyTwoPeriodic
import Rule30.Proofs.BoolDrivenPeriodicFromOfReset
import Rule30.Proofs.BoolDrivenPeriodicFromOfReturn
import Rule30.Proofs.BoolMapIterateThree
import Rule30.Proofs.BoolXorDrivenPeriodicFrom
import Rule30.Proofs.CenterColumnCountSandwich
import Rule30.Proofs.CenterColumnCountSucc
import Rule30.Proofs.CenterColumnDensityLeOne
import Rule30.Proofs.CenterColumnDensityNonneg
import Rule30.Proofs.CenterColumnDensitySucc
import Rule30.Proofs.CenterColumnDensityTendstoHalfIffExcess
import Rule30.Proofs.CenterColumnExcessInterpolate
import Rule30.Proofs.CenterColumnNotEventuallyPeriodicOfAnyOther
import Rule30.Proofs.CenterColumnNotEventuallyPeriodicOfRight
import Rule30.Proofs.CenterColumnRightNotBothIsEventuallyPeriodic
import Rule30.Proofs.CenterColumnSuccOfBlack
import Rule30.Proofs.CenterColumnZero
import Rule30.Proofs.ColumnOneOfWhite
import Rule30.Proofs.ColumnSettledConfigEq
import Rule30.Proofs.ColumnSuccOfBlack
import Rule30.Proofs.ConfigEqOfRightAndColumn
import Rule30.Proofs.EvolveEqFalseOfOutsideCone
import Rule30.Proofs.EvolveFromEqOfAgreeOnWindow
import Rule30.Proofs.EvolveFromLeftPermutive
import Rule30.Proofs.EvolveHalfLeftEqColumn
import Rule30.Proofs.EvolveHalfRightEqColumn
import Rule30.Proofs.EvolveIsEventuallyPeriodicOfBetween
import Rule30.Proofs.EvolveLeftDiagonalIsEventuallyPeriodicStep
import Rule30.Proofs.EvolveLeftDiagonalRecurrence
import Rule30.Proofs.EvolveLeftDiagonalsIsEventuallyPeriodic
import Rule30.Proofs.EvolveLeftEdge
import Rule30.Proofs.EvolveLeftFifthDiagonal
import Rule30.Proofs.EvolveLeftFourthDiagonal
import Rule30.Proofs.EvolveLeftFourthDiagonalIsEventuallyPeriodic
import Rule30.Proofs.EvolveLeftSecondDiagonal
import Rule30.Proofs.EvolveLeftThirdDiagonal
import Rule30.Proofs.EvolvePeriodSub
import Rule30.Proofs.EvolvePeriodSubOne
import Rule30.Proofs.EvolveRightEdge
import Rule30.Proofs.EvolveRightSecondDiagonal
import Rule30.Proofs.EvolveSubOneEqXor
import Rule30.Proofs.IsEventuallyPeriodicColumnUnique
import Rule30.Proofs.IsEventuallyPeriodicCommonPeriod
import Rule30.Proofs.IsEventuallyPeriodicOfPeriodicStep
import Rule30.Proofs.IsEventuallyPeriodicShift
import Rule30.Proofs.LeftDiagonalBlackAfterWhite
import Rule30.Proofs.LeftDiagonalComplAfterBlack
import Rule30.Proofs.LeftDiagonalMulPowEqSettledCenter
import Rule30.Proofs.LeftDiagonalPairNeverEventuallyShifted
import Rule30.Proofs.LeftDiagonalPeriodUnbounded
import Rule30.Proofs.LeftDiagonalPeriodUnboundedLe
import Rule30.Proofs.LeftDiagonalPeriodicFromPow
import Rule30.Proofs.LeftDiagonalPeriodicFromStep
import Rule30.Proofs.LeftDiagonalPeriodicFromStepOfBlack
import Rule30.Proofs.LeftDiagonalRecurrence
import Rule30.Proofs.LeftDiagonalStepOnsetDichotomy
import Rule30.Proofs.LeftDiagonalStepPeriodDichotomy
import Rule30.Proofs.LeftDiagonalWhiteOfShift
import Rule30.Proofs.LeftSolveEqColumn
import Rule30.Proofs.NotEvolvePeriodAdjacent
import Rule30.Proofs.NotIsEventuallyPeriodicAdjacent
import Rule30.Proofs.NotIsEventuallyPeriodicPair
import Rule30.Proofs.PeriodicFromMul
import Rule30.Proofs.RightDiagonalIsEventuallyPeriodic
import Rule30.Proofs.RightDiagonalPeriodicFromPow
import Rule30.Proofs.RightDiagonalPeriodicFromStep
import Rule30.Proofs.RightDiagonalRecurrence
import Rule30.Proofs.RightmostDifferenceMovesRight
import Rule30.Proofs.RowCellEqEvolve
import Rule30.Proofs.Rule30LeftLocalLaw
import Rule30.Proofs.Rule30LeftPermutive
import Rule30.Proofs.Rule30NeOfLeftNe
import Rule30.Proofs.SidewaysInverse
import Rule30.Proofs.StripEventuallyPeriodic
import Rule30.Proofs.StripSucc
import Rule30.Proofs.WindowCountHalf
