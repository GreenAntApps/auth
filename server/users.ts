import type { APIContext, Message, Query } from "../../shared/server/types.ts";

import { createMessage } from "../../shared/server/utils.ts";
// import { isAuthorized } from '../../auth/server/auth.service.ts';
import * as UserService from './user.service.ts';

// RETRIEVE USERS
export async function POST (ctx: APIContext) : Promise<Response|undefined> {
//    return await isAuthorized(ctx, [], async () => {
        let response:Response;
        let message:Message
        try {
            message = await UserService.retrieveUsers(ctx, ctx.request.data as Query);  
            if (message.subject == 'Exception') {
                response = ctx.response.json(message, 500);
            }
            else {
                response = ctx.response.json(message);
            }
        }
        catch (e) {
            console.log('UsersAPI:POST', e);
            message = createMessage('Exception', { errors: 'UsersAPI:POST'});
            return ctx.response.json(message, 500);
        }
        return response;
//    })
}
