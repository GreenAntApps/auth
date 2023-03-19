import type { APIContext, User, Message } from "../../shared/server/types.ts";

import { createMessage } from "../../shared/server/utils.ts";
import { isAuthorized } from '../../auth/server/auth.service.ts';
import * as UserService from './user.service.ts';

// CREATE USER
export async function POST (ctx: APIContext) : Promise<Response|undefined> {
    return await isAuthorized(ctx, ['user:canCreateUsers'], async () => {
        let response:Response;
        let message:Message
        try {
            message = await UserService.createUser(ctx, ctx.request.data as User);  
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
        catch (e) {
            console.log('UserAPI:POST', e);
            message = createMessage('Exception', { errors: 'UserAPI:POST'});
            return ctx.response.json(message, 500);
        }
        return response;
    })
}

// RETRIEVE USER
export async function GET (ctx: APIContext) : Promise<Response|undefined> {
    return await isAuthorized(ctx, ['user:canViewUsers'], async () => {
        let response:Response;
        let message:Message
        try {
            const id = ctx.request.params.id;
            message = await UserService.retrieveUser(ctx, id);  
            if (message.subject == 'Exception') {
                response = ctx.response.json(message, 500);
            }
            else {
                response = ctx.response.json(message);
            }
        }
        catch (e) {
            console.log('UserAPI:GET', e);
            message = createMessage('Exception', { errors: 'UserAPI:GET'});
            return ctx.response.json(message, 500);
        }    
        return response;
    })
}

// UPDATE USER
export async function PUT (ctx: APIContext) : Promise<Response|undefined> {
    return await isAuthorized(ctx, ['user:canUpdateUsers'], async () => {
        let response:Response;
        let message:Message
        try {
            message = await UserService.updateUser(ctx, ctx.request.data as User);  
            if (message.subject == 'UserNotValid') {
                response = ctx.response.json(message, 400);
            }
            else if (message.subject == 'UserNotFound') {
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
            console.log('UserAPI:PUT', e);
            message = createMessage('Exception', { errors: 'UserAPI:PUT'});
            return ctx.response.json(message, 500);
        }
        return response;
    })
}

// DELETE USER
export async function DELETE (ctx: APIContext) : Promise<Response|undefined> {
    return await isAuthorized(ctx, ['user:canDeleteUsers'], async () => {
        let response:Response;
        let message:Message
        try {
            const id = ctx.request.params.id;
            message = await UserService.deleteUser(ctx, id);  
            if (message.subject == 'Exception') {
                response = ctx.response.json(message, 500);
            }
            else {
                response = ctx.response.json(message);
            }
        }
        catch (e) {
            console.log('UserAPI:DELETE', e);
            message = createMessage('Exception', { errors: 'UserAPI:DELETE'});
            return ctx.response.json(message, 500);
        }
        return response;
    })
}
