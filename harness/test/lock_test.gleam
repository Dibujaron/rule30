import gleam/erlang/process
import harness/lock

pub fn second_acquire_waits_for_release_test() {
  let assert Ok(l) = lock.start(60_000)
  assert lock.acquire(l, "a", 1000)
  assert lock.acquire(l, "b", 200) == False
  // times out while a holds it
  lock.release(l, "a")
  assert lock.acquire(l, "b", 1000)
}

pub fn auto_release_test() {
  let assert Ok(l) = lock.start(200)
  assert lock.acquire(l, "a", 1000)
  assert lock.acquire(l, "b", 2000)
  // granted after auto-release
}

pub fn non_holder_release_is_ignored_test() {
  let assert Ok(l) = lock.start(60_000)
  assert lock.acquire(l, "a", 1000)
  // "z" never held the lock; this must be a no-op.
  lock.release(l, "z")
  // "a" still holds it, so a second acquirer times out.
  assert lock.acquire(l, "b", 200) == False
}

pub fn cancelled_auto_release_does_not_evict_new_hold_test() {
  let assert Ok(l) = lock.start(500)
  assert lock.acquire(l, "a", 1000)
  lock.release(l, "a")
  process.sleep(300)
  // "a" re-acquires. A fresh auto-release timer (T2) is armed now; the first
  // grant's timer (T1) must have been cancelled by the release above.
  assert lock.acquire(l, "a", 1000)
  process.sleep(350)
  // ~650ms have now passed since the FIRST grant (> the 500ms
  // auto_release_ms), which is exactly when an uncancelled T1 would fire and
  // release "a"'s second hold out from under it. Only ~350-400ms will have
  // passed since the SECOND grant by the time this probe's own short timeout
  // elapses, comfortably short of T2's 500ms, so T2 cannot have fired
  // naturally either. If T1 was cancelled, "a" is still the legitimate
  // holder and "b" must still time out.
  assert lock.acquire(l, "b", 50) == False
}

pub fn withdrawn_timeout_does_not_wedge_queue_test() {
  let assert Ok(l) = lock.start(60_000)
  assert lock.acquire(l, "a", 1000)
  // "b" times out while "a" holds the lock and withdraws its request; "b"
  // never retries.
  assert lock.acquire(l, "b", 200) == False
  lock.release(l, "a")
  // A different holder must be able to acquire promptly — the withdrawn "b"
  // request must not have been left in the queue to wedge things up.
  assert lock.acquire(l, "c", 1000)
}
