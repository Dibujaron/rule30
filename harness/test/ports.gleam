//// Free port allocation for tests.
////
//// The harness binds fixed ports in production: the dispatcher's guard starts
//// at `config.guard_port` (4130) and counts up one per attempt. A test that
//// hardcodes a port therefore races a live run and every other checkout
//// running the same suite — and it loses badly, because `mist.start` binds
//// inside a linked `OneForOne` child, so a bind failure takes the calling
//// process down instead of returning an `Error`. The runner dies, the module
//// it died in stops counting, and the summary still reads like a suite that
//// ran. Ports here come from the OS instead.

/// The base of `n` consecutive ports that were free a moment ago. Use `1` for
/// a single guard; a `dispatch.run_with` fixture needs one port per attempt,
/// since `next_port` advances by one each time an attempt starts.
///
/// Free a moment ago is not free now: this hands back ports it no longer
/// holds, so it narrows the race rather than closing it. A caller that can
/// retry should still retry.
@external(erlang, "harness_ffi", "free_port_span")
pub fn span(n: Int) -> Int
