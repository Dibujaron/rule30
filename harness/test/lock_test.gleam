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
