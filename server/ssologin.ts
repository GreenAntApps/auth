import type { APIContext, Message } from "../../shared/server/types.ts";

import { createMessage } from "../../shared/server/utils.ts";
import * as UserSessionService from './usersession.service.ts';

// REQUEST SSO FROM IDP
export async function GET (ctx: APIContext) : Promise<Response|undefined> {
    let response:Response;
    let message:Message;
    try {
        message = await UserSessionService.retrieveSsoRequestUrl(ctx);  
        if (message.subject == 'SsoRequestUrl') {
            response = ctx.response.redirect(message.data.url as string, 302);
        }
        else {
            response = ctx.response.json(message, 500);
        }
    }
    catch (e) {
        console.log('SsoLoginAPI:GET', e);
        message = createMessage('Exception', { errors: 'SsoLoginAPI:GET'});
        return ctx.response.json(message, 500);
    }    
    return response;
}

// CREATE SSO USERSESSION
export async function POST (ctx: APIContext) : Promise<Response|undefined> {
    let response:Response;
    let message:Message;
    try {
        await UserSessionService.createSsoUserSession(ctx);
        response = ctx.response.send('', {
            status: 302,
            headers: {
                'location': `${(ctx.tenant.hostname == 'localhost') ? 'http://' : 'https://'}${ctx.tenant.hostname}`
            }
        })
    }
    catch (e) {
        console.log('SsoLoginAPI:POST', e);
        message = createMessage('Exception', { errors: 'SsoLoginAPI:POST'});
        return ctx.response.json(message, 500);
    }    
    return response;
}

