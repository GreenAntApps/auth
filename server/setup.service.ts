import type { APIContext, ITransaction, User, Role, Message, AuthConfig } from "../../shared/server/types.ts";

import { createMessage } from "../../shared/server/utils.ts";
import * as UserManager from './user.manager.ts';
import * as RoleManager from './role.manager.ts';
import * as AuthConfigManager from './authconfig.manager.ts';

export async function initializeDatabase (ctx:APIContext, user:User) : Promise<Message> {
    return await ctx.db.writeTransaction(async (tx:ITransaction) : Promise<Message> => {
        let message:Message;
        const txDateTime = (new Date()).toISOString();
        let role:Role = { id: '00000000-0000-0000-0000-000000000000', name: 'Admin', description: 'Full access' };
        message = await RoleManager.createRole(ctx, tx, txDateTime, role);
        if (message.subject == 'RoleCreated') {
            role = message.data.role as Role;
            user.id = '00000000-0000-0000-0000-000000000000';
            user.roleId = role.id;
            message = await UserManager.createUser(ctx, tx, txDateTime, user);
        }
        if (message.subject == 'UserCreated') {
            const authConfig = {
                ssoEnabled: false,
                ssoIdentityProvider: '',
                ssoRequestUrl: ''
            } as AuthConfig;
            message = await AuthConfigManager.createAuthConfig(ctx, tx, txDateTime, authConfig);
        }
        if (message.subject == 'AuthConfigCreated') {
            message = createMessage('SetupCompleted', {});
        }
        else {
            tx.rollback();
            message = createMessage('SetupFailed', {});
        }
        return message;        
    }) as Message;
}

