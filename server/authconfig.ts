import type { APIContext, AuthConfig, Message } from "../../shared/server/types.ts";

import { createMessage } from "../../shared/server/utils.ts";
import { isAuthorized } from './auth.service.ts';
import * as AuthConfigService from './authconfig.service.ts';

// CREATE ROLE
export async function POST (ctx: APIContext) : Promise<Response|undefined> {
    return await isAuthorized(ctx, ['sso:canCreateAuthConfig'], async () => {
        let response:Response;
        let message:Message
        try {
            message = await AuthConfigService.createAuthConfig(ctx, ctx.request.data as AuthConfig);  
            if (message.subject == 'AuthConfigNotValid') {
                response = ctx.response.json(message, 400);
            }
            else if (message.subject == 'Exception') {
                response = ctx.response.json(message, 500);
            }
            else {
                response = ctx.response.json(message);
            }
        }
        catch (e) {
            console.log('AuthConfigAPI:POST', e);
            message = createMessage('Exception', { errors: 'AuthConfigAPI:POST'});
            return ctx.response.json(message, 500);
        }
        return response;
    })
}

// RETRIEVE ROLE
export async function GET (ctx: APIContext) : Promise<Response|undefined> {
    return await isAuthorized(ctx, ['role:canViewAuthConfig'], async () => {
        let response:Response;
        let message:Message
        try {
            message = await AuthConfigService.retrieveAuthConfig(ctx);  
            if (message.subject == 'Exception') {
                response = ctx.response.json(message, 500);
            }
            else {
                response = ctx.response.json(message);
            }
        }
        catch (e) {
            console.log('AuthConfigAPI:GET', e);
            message = createMessage('Exception', { errors: 'AuthConfigAPI:GET'});
            return ctx.response.json(message, 500);
        }
        return response;
    })
}

// UPDATE ROLE
export async function PUT (ctx: APIContext) : Promise<Response|undefined> {
    return await isAuthorized(ctx, ['role:canUpdateAuthConfig'], async () => {
        let response:Response;
        let message:Message
        try {
            message = await AuthConfigService.updateAuthConfig(ctx, ctx.request.data as AuthConfig);  
            if (message.subject == 'AuthConfigNotValid') {
                response = ctx.response.json(message, 400);
            }
            else if (message.subject == 'AuthConfigNotFound') {
                response = ctx.response.json(message, 404);
            }
            else if (message.subject == 'Exception') {
                response = ctx.response.json(message, 500);
            }
            else {
                response = ctx.response.json(message);
            }
        }
        catch (e) {
            console.log('AuthConfigAPI:PUT', e);
            message = createMessage('Exception', { errors: 'AuthConfigAPI:PUT'});
            return ctx.response.json(message, 500);
        }
        return response;
    })
}

// DELETE ROLE
export async function DELETE (ctx: APIContext) : Promise<Response|undefined> {
    return await isAuthorized(ctx, ['role:canDeleteAuthConfig'], async () => {
        let response:Response;
        let message:Message
        try {
            const id = ctx.request.params.id;
            message = await AuthConfigService.deleteAuthConfig(ctx, id);  
            if (message.subject == 'Exception') {
                response = ctx.response.json(message, 500);
            }
            else {
                response = ctx.response.json(message);
            }
        }
        catch (e) {
            console.log('AuthConfigAPI:DELETE', e);
            message = createMessage('Exception', { errors: 'AuthConfigAPI:DELETE'});
            return ctx.response.json(message, 500);
        }
        return response;
    })
}
