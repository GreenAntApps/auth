import type { APIContext, User, Message } from "../../shared/server/types.ts";

import { createMessage } from "../../shared/server/utils.ts";
import * as SetupService from './setup.service.ts';

// CREATE ADMIN USER
export async function POST (ctx: APIContext) : Promise<Response|undefined> {
    let response:Response;
    let message:Message
    try {
        const user = ctx.request.data as User;
        if (user.username == 'admin') {
            message = await SetupService.initializeDatabase(ctx, ctx.request.data as User);  
            if (message.subject == 'UserNotValid') {
                response = ctx.response.json(message, 400);
            }
            else if (message.subject == 'Exception') {
                response = ctx.response.json(message, 500);
            }
            else {
                response = ctx.response.json(message);
            }
        }
        else {
            return ctx.response.send('Forbidden', {
                status: 403
            });
        }
    }
    catch (e) {
        console.log('UserAPI:POST', e);
        message = createMessage('Exception', { errors: 'UserAPI:POST'});
        return ctx.response.json(message, 500);
    }
    return response;
}
