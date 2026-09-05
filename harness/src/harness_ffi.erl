%% Erlang-side shim for running a line-oriented child process behind a port.
%%
%% Gleam calls these through @external. The port is owned by the calling
%% process, so `recv/2` does a selective receive on that port only, which
%% keeps the Gleam side free of Erlang message-format details.
-module(harness_ffi).
-export([spawn_port/3, port_send/2, port_recv/2, port_close/1]).

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
