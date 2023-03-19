import type { APIContext, UserSession, Message } from "../../shared/server/types.ts";

import * as UserSessionService from './usersession.service.ts';

export async function isAuthorized(ctx: APIContext, permissions: Array<string>, func: () => Promise<Response|undefined>) : Promise<Response|undefined> {
    const message:Message = await UserSessionService.retrieveUserSession(ctx);
    if (message.subject == 'UserSessionRetrieved') {
        const userSession = message.data.userSession as UserSession;
        let hasPermission = userSession.isAdmin;
        if (!hasPermission) {
            for (const permission of permissions) {
                const userPermissions = userSession.permissions as Record<string, boolean>
                if (userPermissions && userPermissions[permission]) {
                    hasPermission = true;
                    break;
                }
            }
        }
        if (hasPermission) {
            ctx.user = userSession;
            return await func();
        }
        else {
            return ctx.response.json({ subject: 'NotAuthorized' }, 403);
        }
    }
    else {
        return ctx.response.json({ subject: 'NotAuthenticated' }, 401);
    }
}