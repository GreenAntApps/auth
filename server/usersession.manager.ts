import type { APIContext, ITransaction, QueryResult, User, Role, UserCredentials, UserSession, Message } from "../../shared/server/types.ts";

import { createMessage } from "../../shared/server/utils.ts";
import { validateObject } from "../../shared/server/schema-validator.ts";
import { UserCredentialsSchema } from './usersession.schema.ts'

export async function retrieveUser (tx:ITransaction, userCredentials:UserCredentials) : Promise<Message> {
    let message:Message;
    try {
        const errors = validateObject(UserCredentialsSchema, userCredentials, []);
        if (errors === null) {
            const response = await tx.run(`
                MATCH (u:User { username: $username, password: $password, isLogin: true, isActive: true })--(r:Role) RETURN u,r
            `, userCredentials) as QueryResult;
            if (response.records.length == 0) {
                message = createMessage('UserNotFound', {});
            }
            else {
                const user = response.records[0].get('u').properties as User;
                const role = response.records[0].get('r').properties as Role;
                user.isAdmin = (role.name == 'Admin');
                user.permissions = role.permissions;
                message = createMessage('UserRetrieved', { user });
            }
        }
        else {
            message = createMessage('UserNotValid', { userCredentials, errors });
        }
    }
    catch (e) {
        console.log('UserSessionManager:retrieveUser', e);
        message = createMessage('Exception', { user: { username: userCredentials.username }, errors: 'UserSessionManager:retrieveUser' });
    }
    return message;
}

export async function retrieveSsoUser (tx:ITransaction, userCredentials:UserCredentials) : Promise<Message> {
    let message:Message;
    try {
        const errors = validateObject(UserCredentialsSchema, userCredentials, ['ssoUser']);
        if (errors === null) {
            const response = await tx.run(`
                MATCH (u:User { username: $username, isLogin: true, isActive: true })--(r:Role) RETURN u,r
            `, userCredentials) as QueryResult;
            if (response.records.length == 0) {
                message = createMessage('UserNotFound', {});
            }
            else {
                const user = response.records[0].get('u').properties as User;
                const role = response.records[0].get('r').properties as Role;
                user.isAdmin = (role.name == 'Admin');
                user.permissions = role.permissions;
                message = createMessage('UserRetrieved', { user });
            }
        }
        else {
            message = createMessage('UserNotValid', { userCredentials, errors });
        }
    }
    catch (e) {
        console.log('UserSessionManager:retrieveSsoUser', e);
        message = createMessage('Exception', { user: { username: userCredentials.username }, errors: 'UserSessionManager:retrieveSsoUser' });
    }
    return message;
}

export async function  createUserSession (ctx:APIContext, tx:ITransaction, txDateTime:string, user:User, sessionId:string) : Promise<Message> {
    let message:Message;
    try {
        const userSession:UserSession = {
            id: sessionId || ctx.utils.createId(),
            tenantId: ctx.tenant.tenantId,
            dateTimeCreated: txDateTime,
            userId: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin,
            permissions: user.permissions
        }
        await tx.run(`MATCH (us:UserSession { userId: $id }) DETACH DELETE us`, { id: user.id });
        await tx.run(`CREATE (us:UserSession $userSession)`, { userSession });
        message = createMessage('UserSessionCreated', { userSession });
    }
    catch (e) {
        console.log('UserSessionManager:createUserSession', e);
        message = createMessage('Exception', { userSession: { username: user.username }, errors: 'UserSessionManager:createUserSession' });
    }
    return message;
}


export async function retrieveUserSession (ctx:APIContext, sessionId:string) : Promise<Message> {
    let message:Message;
    try {
        const response = await ctx.db.run(`
            MATCH (us:UserSession { id: $sessionId }) RETURN us.userId, us.firstName, us.lastName, us.username, us.email, us.isAdmin, us.permissions
        `, {sessionId}) as QueryResult;
        if (response.records.length == 0) {
            message = createMessage('UserSessionNotFound', {});
        }
        else {
            const userSession = {
                id: sessionId,
                userId: response.records[0].get('us.userId'),
                firstName: response.records[0].get('us.firstName'),
                lastName: response.records[0].get('us.lastName'),
                username: response.records[0].get('us.username'),
                email: response.records[0].get('us.email'),
                isAdmin: response.records[0].get('us.isAdmin'),
                permissions: {} as Record<string, boolean>
            }
            const permissions = response.records[0].get('us.permissions');
            for (const permission of permissions) userSession.permissions[permission] = true;
            message = createMessage('UserSessionRetrieved', { userSession });
        }
    }
    catch (e) {
        console.log('UserSessionManager:retrieveUserSession', e);
        message = createMessage('Exception', { userSession: { id: sessionId }, errors: 'UserSessionManager:retrieveUserSession' });
    }
    return message;
}

export async function deleteUserSession (tx:ITransaction, sessionId:string) : Promise<Message> {
    let message:Message;
    try {
        await tx.run(`MATCH (us:UserSession { id: $sessionId }) DETACH DELETE us`, { sessionId });
        message = createMessage('UserSessionDeleted', { userSession: { id: sessionId } });
    }
    catch (e) {
        console.log('UserSessionManager:deleteUserSession', e);
        message = createMessage('Exception', { userSession: { id: sessionId }, errors: 'UserSessionManager:deleteUserSession' });
    }
    return message;
}
