%% Erlang-side shim for running a line-oriented child process behind a port.
%%
%% Gleam calls these through @external. The port is owned by the calling
%% process, so `recv/2` does a selective receive on that port only, which
%% keeps the Gleam side free of Erlang message-format details.
-module(harness_ffi).
-export([spawn_port/3, port_send/2, port_recv/2, port_close/1,
         run_cmd/4, to_utf8/1, find_executable/1, now_iso/0, run_id/0,
         mono_ms/0, token/0, set_cwd/1, free_port_span/1, sha256_hex/1,
         halt_with/1, port_is_free/1]).

%% ---- Deadlines -------------------------------------------------------------

%% Every timeout here bounds *elapsed* time, not silence. A `receive ... after
%% T` restarts its clock on each message, so a chatty child could hold a
%% caller past any budget by saying something every T-1 ms. So compute the
%% deadline once and pass what is left of it to each `after`.
deadline(TimeoutMs) -> erlang:monotonic_time(millisecond) + TimeoutMs.

remaining(Deadline) -> max(0, Deadline - erlang:monotonic_time(millisecond)).

%% ---- Run a command to completion ------------------------------------------

%% run_cmd(Exe, Args, Cwd, TimeoutMs) -> {run, Status, Output} | timeout
%%   stdout and stderr are interleaved in Output, which is a raw binary: a
%%   compiler's output is not guaranteed to be UTF-8, and the Gleam side
%%   converts it lossily rather than crashing on it.
run_cmd(Exe, Args, Cwd, TimeoutMs) ->
    Port = open_port({spawn_executable, binary_to_list(Exe)},
                     [{args, [binary_to_list(A) || A <- Args]},
                      {cd, binary_to_list(Cwd)},
                      binary, stream, use_stdio, exit_status, stderr_to_stdout, hide]),
    collect(Port, deadline(TimeoutMs), <<>>).

collect(Port, Deadline, Acc) ->
    receive
        {Port, {data, Bin}} -> collect(Port, Deadline, <<Acc/binary, Bin/binary>>);
        {Port, {exit_status, S}} -> {run, S, Acc}
    after remaining(Deadline) ->
        try erlang:port_close(Port) catch _:_ -> false end,
        timeout
    end.

%% to_utf8(Bin) -> Bin'   Valid UTF-8, always.
%%   Output that is already UTF-8 passes through unchanged. Anything else is
%%   reinterpreted as latin1, which is defined for every byte — so a stray
%%   0xFF from a tool that wrote code-page bytes becomes a printable
%%   character instead of taking down the caller.
to_utf8(Bin) ->
    case unicode:characters_to_binary(Bin, utf8) of
        Utf8 when is_binary(Utf8) -> Utf8;
        _ ->
            case unicode:characters_to_binary(Bin, latin1) of
                Latin1 when is_binary(Latin1) -> Latin1;
                _ -> <<>>
            end
    end.

%% find_executable(Name) -> {ok, AbsolutePath} | {error, nil}
find_executable(Name) ->
    case os:find_executable(binary_to_list(Name)) of
        false -> {error, nil};
        Path -> {ok, list_to_binary(Path)}
    end.

%% ---- Clock, ids, cwd -------------------------------------------------------

%% now_iso() -> <<"2026-09-05T21:15:00Z">>
now_iso() ->
    {{Y,Mo,D},{H,Mi,S}} = calendar:universal_time(),
    list_to_binary(io_lib:format("~4..0B-~2..0B-~2..0BT~2..0B:~2..0B:~2..0BZ",
                                 [Y,Mo,D,H,Mi,S])).

%% run_id() -> <<"20260905T211500Z">>
run_id() ->
    {{Y,Mo,D},{H,Mi,S}} = calendar:universal_time(),
    list_to_binary(io_lib:format("~4..0B~2..0B~2..0BT~2..0B~2..0B~2..0BZ",
                                 [Y,Mo,D,H,Mi,S])).

%% mono_ms() -> milliseconds from an arbitrary origin, never going backwards.
%%   For measuring a budget; meaningless as a wall clock.
mono_ms() ->
    erlang:monotonic_time(millisecond).

%% token() -> 32 lowercase hex characters from a CSPRNG.
token() ->
    string:lowercase(binary:encode_hex(crypto:strong_rand_bytes(16))).

%% set_cwd(Dir) -> {ok, nil} | {error, nil}
set_cwd(Dir) ->
    case file:set_cwd(binary_to_list(Dir)) of
        ok -> {ok, nil};
        _ -> {error, nil}
    end.

%% ---- Streaming port for claude -p ------------------------------------------

%% spawn_port(Exe, Args, Env) -> Port
%%   Exe  : binary, absolute path to an executable
%%   Args : list of binaries
%%   Env  : list of {binary, binary}
%% Lines are delimited by \n; a line longer than 16 MiB arrives in pieces.
spawn_port(Exe, Args, Env) ->
    open_port({spawn_executable, binary_to_list(Exe)},
              [{args, [binary_to_list(A) || A <- Args]},
               {env, [{binary_to_list(K), binary_to_list(V)} || {K, V} <- Env]},
               binary,
               {line, 16777216},
               use_stdio,
               exit_status,
               hide]).

%% port_send(Port, Line) -> nil   (a newline is appended)
port_send(Port, Line) ->
    try port_command(Port, <<Line/binary, "\n">>)
    catch _:_ -> false
    end,
    nil.

%% port_recv(Port, TimeoutMs) ->
%%   {line, Line} | {exit, Status} | timeout
%% Pieces of an over-long line are reassembled before returning, and
%% TimeoutMs bounds the whole reassembly, not each piece.
port_recv(Port, TimeoutMs) ->
    port_recv(Port, deadline(TimeoutMs), <<>>).

port_recv(Port, Deadline, Acc) ->
    receive
        {Port, {data, {eol, Bin}}} ->
            {line, <<Acc/binary, Bin/binary>>};
        {Port, {data, {noeol, Bin}}} ->
            port_recv(Port, Deadline, <<Acc/binary, Bin/binary>>);
        {Port, {exit_status, Status}} ->
            {exit, Status}
    after remaining(Deadline) ->
        timeout
    end.

%% port_close(Port) -> nil   Kills the child if it is still running.
port_close(Port) ->
    try erlang:port_close(Port)
    catch _:_ -> false
    end,
    nil.

%% ---- Free port allocation (tests) ------------------------------------------

%% free_port_span(N) -> integer()
%%   The base of N consecutive ports on 127.0.0.1 that were all free a moment
%%   ago. Tests need this because the harness itself binds fixed ports: the
%%   dispatcher's guard starts at config.guard_port and counts up one per
%%   attempt, so a test that hardcodes a port races the live run and every
%%   other checkout running the same suite.
%%
%%   Why a *span* and not one port: dispatch advances next_port by one per
%%   attempt, so a run fixture needs a contiguous range, and an OS-assigned
%%   ephemeral port says nothing about its neighbours.
%%
%%   The OS picks the starting hint, so this drifts with whatever is actually
%%   in use rather than trusting a range someone chose once. The span is then
%%   checked by binding every port in it and closing them again. That leaves a
%%   race — free a moment ago is not free now — which is inherent to allocating
%%   a port you do not hold, and is why the caller should still handle a bind
%%   failure rather than assume this succeeded.
free_port_span(N) -> free_port_span(N, 200).

free_port_span(N, 0) ->
    erlang:error({no_free_port_span, N});
free_port_span(N, Tries) ->
    {ok, Hint} = gen_tcp:listen(0, [{ip, {127,0,0,1}}]),
    {ok, Base} = inet:port(Hint),
    gen_tcp:close(Hint),
    case hold_span(Base, N, []) of
        {ok, Socks} ->
            [gen_tcp:close(S) || S <- Socks],
            Base;
        error ->
            free_port_span(N, Tries - 1)
    end.

hold_span(_Base, 0, Held) ->
    {ok, Held};
hold_span(Base, N, Held) ->
    case gen_tcp:listen(Base + N - 1, [{ip, {127,0,0,1}}]) of
        {ok, S} -> hold_span(Base, N - 1, [S | Held]);
        {error, _} ->
            [gen_tcp:close(S) || S <- Held],
            error
    end.

%% ---- Content hashing -------------------------------------------------------

%% A file's content, as lowercase hex sha256. Keyed on content rather than
%% mtime because a checkout, a rebase or a fresh worktree moves every mtime
%% in the tree without changing a byte of it.
sha256_hex(Bin) ->
    string:lowercase(binary:encode_hex(crypto:hash(sha256, Bin))).

%% ---- Exit status -----------------------------------------------------------

%% halt_with(Status) -> no return
%%   Stop the node with an exit status. Every error path in the CLI ends here:
%%   a failed dispatch, a refused board row, a guard that could not bind. A
%%   verb that printed its error and returned would be indistinguishable from
%%   success to anything reading `$?`.
%%
%%   `flush` is left at its default of true rather than turned off for speed:
%%   the whole point of a nonzero exit is that the message explaining it was
%%   read first, and halting before stderr drains would trade one silent
%%   failure for another.
halt_with(Status) -> erlang:halt(Status).

%% port_is_free(Port) -> boolean()
%%   Can 127.0.0.1:Port be bound right now. Binds and closes immediately.
%%
%%   Callers must ask BEFORE starting, never react after failing: `mist.start`
%%   does NOT return an error on a taken port -- it fails to start a
%%   supervised child and EXITS the calling process, so `result.map_error`
%%   never runs and a retry loop around it cannot see the failure at all. A
%%   colliding session prints an Erlang supervisor report and looks like a
%%   crash rather than a refusal.
%%
%%   So a caller that wants to move to another port has to ask BEFORE it
%%   starts, not react afterwards. The answer is "was free a moment ago",
%%   which leaves a race this cannot close -- the same one `free_port_span`
%%   documents -- but it converts the common case from a process exit into a
%%   decision.
port_is_free(Port) ->
    case gen_tcp:listen(Port, [{ip, {127,0,0,1}}, {reuseaddr, false}]) of
        {ok, Sock} -> gen_tcp:close(Sock), true;
        {error, _} -> false
    end.
