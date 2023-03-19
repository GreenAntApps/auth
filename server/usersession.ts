import type { APIContext, UserSession, UserCredentials, Message } from "../../shared/server/types.ts";

import { createMessage } from "../../shared/server/utils.ts";
import * as UserSessionService from './usersession.service.ts';

// CREATE A USERSESSION
export async function POST(ctx: APIContext) : Promise<Response|undefined> {
    let response:Response;
    let message:Message;
    try {
        message = await UserSessionService.createUserSession(ctx, ctx.request.data as UserCredentials, '') as Message;  
        if (message.subject == 'UserNotFound') {
            response = ctx.response.json(message, 401);
        }
        else if (message.subject == 'Exception') {
            response = ctx.response.json(message, 500);
        }
        else {
            const userSession = message.data.userSession as UserSession;
            // message.data = {}
            response = ctx.response.send(JSON.stringify(message), {
                status: 200,
                headers: {
                    'content-type': 'application/json',
                    'set-cookie': `sessionId=${userSession.id};path=/`,
                }
            })
        }
    }
    catch (e) {
        console.log('UserSessionAPI:POST', e);
        message = createMessage('Exception', { errors: 'UserSessionAPI:POST'});
        return ctx.response.json(message, 500);
    }
    return response;
}

// RETRIEVE A USERSESSION
export async function GET (ctx: APIContext) : Promise<Response|undefined> {
    let response:Response;
    let message:Message;
    try {
        message = await UserSessionService.retrieveUserSession(ctx);  
        if (message.subject == 'UserSessionNotFound') {
            response = ctx.response.json(message, 200);
        }
        else if (message.subject == 'Exception') {
            response = ctx.response.json(message, 500);
        }
        else {
            response = ctx.response.json(message);
        }
    }
    catch (e) {
        console.log('UserSessionAPI:GET', e);
        message = createMessage('Exception', { errors: 'UserSessionAPI:GET'});
        return ctx.response.json(message, 500);
    }
    return response;
}

// DELETE USERSESSION
export async function DELETE (ctx: APIContext) : Promise<Response|undefined> {
    let response:Response;
    let message:Message;
    try {
        message = await UserSessionService.deleteUserSession(ctx);  
        if (message.subject == 'Exception') {
            response = ctx.response.json(message, 500);
        }
        else {
            response = ctx.response.send(JSON.stringify(message), {
                status: 200,
                headers: {
                    'content-type': 'application/json',
                    'set-cookie': `sessionId=;path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`,
                }
            })
        }
    }
    catch (e) {
        console.log('UserSessionAPI:DELETE', e);
        message = createMessage('Exception', { errors: 'UserSessionAPI:DELETE'});
        return ctx.response.json(message, 500);
    }
    return response;
}
