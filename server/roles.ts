import type { APIContext, Message, Query } from "../../shared/server/types.ts";

import { createMessage } from "../../shared/server/utils.ts";
// import { isAuthorized } from '../../auth/server/auth.service.ts';
import * as RoleService from './role.service.ts';

// RETRIEVE ROLES
export const POST = async (ctx: APIContext) : Promise<Response|undefined> => {
    // return await isAuthorized(ctx, ['role:canViewRoles'], async () => {
        let response:Response;
        let message:Message
        try {
            message = await RoleService.retrieveRoles(ctx, ctx.request.data as Query);  
            if (message.subject == 'Exception') {
                response = ctx.response.json(message, 500);
            }
            else {
                response = ctx.response.json(message);
            }
        }
        catch (e) {
            console.log('RolesAPI:POST', e);
            message = createMessage('Exception', { errors: 'RolesAPI:POST'});
            return ctx.response.json(message, 500);
        }
        return response;
    // })
}
