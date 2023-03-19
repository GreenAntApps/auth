import type { APIContext, Role, Message } from "../../shared/server/types.ts";

import { createMessage } from "../../shared/server/utils.ts";
import { isAuthorized } from '../../auth/server/auth.service.ts';
import * as RoleService from './role.service.ts';

// CREATE USER
export async function POST (ctx: APIContext) : Promise<Response|undefined> {
    return await isAuthorized(ctx, ['role:canCreateRoles'], async () => {
        let response:Response;
        let message:Message
        try {
            message = await RoleService.createRole(ctx, ctx.request.data as Role);  
            if (message.subject == 'RoleNotValid') {
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
            console.log('RoleAPI:POST', e);
            message = createMessage('Exception', { errors: 'RoleAPI:POST'});
            return ctx.response.json(message, 500);
        }
        return response;
    })
}

// RETRIEVE USER
export async function GET (ctx: APIContext) : Promise<Response|undefined> {
    return await isAuthorized(ctx, ['role:canViewRoles'], async () => {
        let response:Response;
        let message:Message
        try {
            const id = ctx.request.params.id;
            message = await RoleService.retrieveRole(ctx, id);  
            if (message.subject == 'Exception') {
                response = ctx.response.json(message, 500);
            }
            else {
                response = ctx.response.json(message);
            }
        }
        catch (e) {
            console.log('RoleAPI:GET', e);
            message = createMessage('Exception', { errors: 'RoleAPI:GET'});
            return ctx.response.json(message, 500);
        }    
        return response;
    })
}

// UPDATE USER
export async function PUT (ctx: APIContext) : Promise<Response|undefined> {
    return await isAuthorized(ctx, ['role:canUpdateRoles'], async () => {
        let response:Response;
        let message:Message
        try {
            message = await RoleService.updateRole(ctx, ctx.request.data as Role);  
            if (message.subject == 'RoleNotValid') {
                response = ctx.response.json(message, 400);
            }
            else if (message.subject == 'RoleNotFound') {
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
            console.log('RoleAPI:PUT', e);
            message = createMessage('Exception', { errors: 'RoleAPI:PUT'});
            return ctx.response.json(message, 500);
        }
        return response;
    })
}

// DELETE USER
export async function DELETE (ctx: APIContext) : Promise<Response|undefined> {
    return await isAuthorized(ctx, ['role:canDeleteRoles'], async () => {
        let response:Response;
        let message:Message
        try {
            const id = ctx.request.params.id;
            message = await RoleService.deleteRole(ctx, id);  
            if (message.subject == 'Exception') {
                response = ctx.response.json(message, 500);
            }
            else {
                response = ctx.response.json(message);
            }
        }
        catch (e) {
            console.log('RoleAPI:DELETE', e);
            message = createMessage('Exception', { errors: 'RoleAPI:DELETE'});
            return ctx.response.json(message, 500);
        }
        return response;
    })
}
