import type { APIContext, Message } from "../../shared/server/types.ts";

import { createMessage } from "../../shared/server/utils.ts";

// RETRIEVE A USERSESSION
// deno-lint-ignore require-await
export async function GET (ctx: APIContext) : Promise<Response|undefined> {
    let response:Response;
    let message:Message;
    try {
        const sessionId = ctx.utils.createId();
        response = ctx.response.send('', {
            status: 200,
            headers: {
                'set-cookie': `sessionId=${sessionId};path=/`,
            }
        });
    }
    catch (e) {
        console.log('SessionIdAPI:GET', e);
        message = createMessage('Exception', { errors: 'SessionIdAPI:GET'});
        return ctx.response.json(message, 500);
    }
    return response;
}