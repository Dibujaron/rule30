%% Erlang-side shim for running a line-oriented child process behind a port.
%%
%% Gleam calls these through @external. The port is owned by the calling
%% process, so `recv/2` does a selective receive on that port only, which
%% keeps the Gleam side free of Erlang message-format details.
-module(harness_ffi).
-export([spawn_port/3, port_send/2, port_recv/2, port_close/1,
         run_cmd/4, find_executable/1, now_iso/0, run_id/0, token/0, set_cwd/1]).

%% ---- Run a command to completion ------------------------------------------

%% run_cmd(Exe, Args, Cwd, TimeoutMs) -> {run, Status, Output} | timeout
%%   stdout and stderr are interleaved in Output.
run_cmd(Exe, Args, Cwd, TimeoutMs) ->
    Port = open_port({spawn_executable, binary_to_list(Exe)},
                     [{args, [binary_to_list(A) || A <- Args]},
                      {cd, binary_to_list(Cwd)},
                      binary, stream, use_stdio, exit_status, stderr_to_stdout, hide]),
    collect(Port, TimeoutMs, <<>>).

collect(Port, TimeoutMs, Acc) ->
    receive
        {Port, {data, Bin}} -> collect(Port, TimeoutMs, <<Acc/binary, Bin/binary>>);
        {Port, {exit_status, S}} -> {run, S, Acc}
    after TimeoutMs ->
        try erlang:port_close(Port) catch _:_ -> false end,
        timeout
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
%% Pieces of an over-long line are reassembled before returning.
port_recv(Port, TimeoutMs) ->
    port_recv(Port, TimeoutMs, <<>>).

port_recv(Port, TimeoutMs, Acc) ->
    receive
        {Port, {data, {eol, Bin}}} ->
            {line, <<Acc/binary, Bin/binary>>};
        {Port, {data, {noeol, Bin}}} ->
            port_recv(Port, TimeoutMs, <<Acc/binary, Bin/binary>>);
        {Port, {exit_status, Status}} ->
            {exit, Status}
    after TimeoutMs ->
        timeout
    end.

%% port_close(Port) -> nil   Kills the child if it is still running.
port_close(Port) ->
    try erlang:port_close(Port)
    catch _:_ -> false
    end,
    nil.
