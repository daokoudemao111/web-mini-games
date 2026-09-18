export class GameInputError extends Error {}
export function check(ok: unknown, message = '这个操作现在不能进行'): asserts ok {
    if (!ok) throw new GameInputError(message);
}
// Validation is terminal; storage outages/contention must remain retryable.
export function inputErrorStatus(error:unknown){
    return error instanceof GameInputError || error instanceof SyntaxError ? 400 : 503;
}
