import type { APIContext, ITransaction, QueryResult, User, Message, Query } from "../../shared/server/types.ts";

import { createMessage, whereClause } from "../../shared/server/utils.ts";
import { createObject, validateObject } from "../../shared/server/schema-validator.ts";
import { UserSchema, QuerySchema, QueryFieldMappings } from './user.schema.ts'

export async function createUser (ctx:APIContext, tx:ITransaction, txDateTime:string, user:User) : Promise<Message> {
    let message:Message;
    try {
        const userToCreate = createObject(UserSchema, user) as User;
        if (!userToCreate.id) userToCreate.id = ctx.utils.createId();
        userToCreate.tenantId = ctx.tenant.tenantId;
        userToCreate.domainId = ctx.tenant.hostname.split('.')[0];
        userToCreate.dateTimeCreated = txDateTime;
        userToCreate.createdBy = ctx.user.userId as string || '00000000-0000-0000-0000-000000000000';
        userToCreate.dateTimeModified = txDateTime;
        userToCreate.modifiedBy = ctx.user.userId as string || '00000000-0000-0000-0000-000000000000';
        const subject = await ruleBeforeCreateUser(ctx, tx, userToCreate);
        if (subject == 'RuleExecuted') {
            const errors = validateObject(UserSchema, userToCreate, []);
            if (errors === null) {
                await tx.run(`
                    MATCH (r:Role) WHERE r.id = $userToCreate.roleId
                    CREATE (e:User $userToCreate)-[:HAS_ROLE]->(r)
                `, { userToCreate });
                ruleAfterCreateUser(ctx, tx, userToCreate);
                message = createMessage('UserCreated', { user: userToCreate });
            }
            else message = createMessage('UserNotValid', { user, errors });
        }
        else message = createMessage(subject, { user });
    }
    catch (e) {
        console.log('UserManager:createUser', e);
        message = createMessage('Exception', { user, errors: 'UserManager:createUser' });
    }
    return message;
}

export async function retrieveUser (ctx:APIContext, tx:ITransaction, id:string) : Promise<Message> {
    const user = { id };
    let message:Message;
    try {
        const response = await tx.run(`MATCH (e:User { id: $id }) RETURN e`, { id: user.id }) as QueryResult;
        if (response.records.length == 0) {
            message = createMessage('UserNotFound', { user });
        }
        else {
            const user = response.records[0].get('e').properties as User;
            message = createMessage('UserRetrieved', { user });
            ruleAfterRetrieveUser(ctx, tx, user);
        }
    }
    catch (e) {
        console.log('UserManager:retrieveUser', e);
        message = createMessage('Exception', { user, errors: 'UserManager:retrieveUser' });
    }
    return message;
}

export async function retrieveUsers (ctx:APIContext, tx:ITransaction, query:Query) : Promise<Message> {
    let message:Message;
    try {
        const subject = await ruleBeforeRetrieveEntities(ctx, tx, query);
        if (subject == 'RuleExecuted') {
            const errors = validateObject(QuerySchema, query, []);
            if (errors === null) {
                const response = await tx.run(`
                    MATCH (user:User) -- (role:Role) ${whereClause(query, UserSchema, QueryFieldMappings)}
                    RETURN 
                        user.id as id,
                        user.firstName as firstName,
                        user.lastName as lastName,
                        user.username as username,
                        user.email as email,
                        user.isActive as isActive,
                        user.roleId as roleId,
                        role.name as role
                    ${query.orderBy ? 'ORDER BY ' + QueryFieldMappings[query.orderBy] + ' ' + (query.order || '') : ''}
                    ${query.limit ? 'LIMIT ' + query.limit : ''}`, {}) as QueryResult;
                const entities:Array<User> = [];
                for (const record of response.records) {
                    const user: Record<string, unknown> = {};
                    user.id = record.get('id');
                    for (const field of query.fields) {
                        user[field] = record.get(field);
                    }
                    entities.push(user as User);
                }
                query.records = entities;
                message = createMessage('UsersRetrieved', { query });
                ruleAfterRetrieveEntities(ctx, tx, query);
            }
            else message = createMessage('QueryNotValid', { query, errors });
        }
        else message = createMessage(subject, { query });
    }
    catch (e) {
        console.log('UserManager:retrieveUsers', e);
        message = createMessage('Exception', { query, errors: 'UserManager:retrieveUsers' });
    }
    return message;
}

export async function updateUser (ctx:APIContext, tx:ITransaction, txDateTime:string, user:User) : Promise<Message> {
    let message:Message;
    try {
        user.tenantId = ctx.tenant.tenantId;
        const response = await tx.run(`MATCH (e:User { id: $id}) RETURN e `, { id: user.id }) as QueryResult;
        if (response.records.length == 0) {
            message = createMessage('UserNotFound', { user });
        }
        else {
            const userToUpdate = response.records[0].get('e').properties as User;
            if (userToUpdate.dateTimeModified! == user.dateTimeModified!) {
                delete user.tenantId;
                delete user.domainId;
                delete user.dateTimeCreated;
                delete user.createdBy;
                const subject = await ruleBeforeUpdateUser(ctx, tx, user);
                if (subject == 'RuleExecuted') {
                    user.dateTimeModified = txDateTime;
                    user.modifiedBy = ctx.user.userId as string || '00000000-0000-0000-0000-000000000000';
                    Object.assign(userToUpdate, user);
                    const errors = validateObject(UserSchema, userToUpdate, []);
                    if (errors === null) {
                        await tx.run(`MATCH (e:User { id: $e.id }) SET e = $e RETURN e`, { e: userToUpdate });
                        message = createMessage('UserUpdated', { user: userToUpdate });
                        ruleAfterUpdateUser(ctx, tx, userToUpdate);
                    }
                    else message = createMessage('UserNotValid', { user, errors });
                }
                else message = createMessage(subject, { user }); 
            }
            else message = createMessage('UserModified', { user, dataTimeModified: userToUpdate.dateTimeModified });
        }
    }
    catch (e) {
        console.log('UserManager:updateUser', e);
        message = createMessage('Exception', { user, errors: 'UserManager:updateUser' });
    }
    return message;
}

export async function deleteUser (tx:ITransaction, id:string) : Promise<Message> {
    const user = { id };
    let message:Message;
    try {
        await tx.run(`MATCH (e:User { id: $id }) DETACH DELETE e`, { id: user.id });
        message = createMessage('UserDeleted', { user });
    }
    catch (e) {
        console.log('UserManager:deleteUser', e);
        message = createMessage('Exception', { user, errors: 'UserManager:deleteUser' });
    }
    return message;
}

// ---------------------- BEFORE AND AFTER RULES ----------------------

async function ruleBeforeCreateUser (ctx:APIContext, tx:ITransaction, user:User) : Promise<string> {
    let subject = 'RuleExecuted';
    const response = await tx.run(`MATCH (e:User { username: $username }) RETURN e`, { username: user.username }) as QueryResult;
    if (response.records.length > 0) {
        delete user.password;
        subject = 'DuplicateUser';
    }
    else {
        if (user.password) user.password = await ctx.utils.createHash(user.password);
    }
    return subject;
}

function ruleAfterCreateUser (_ctx:APIContext, _tx:ITransaction, user:User) : string {
    delete user.password;
    return 'RuleExecuted'
}

function ruleAfterRetrieveUser (_ctx:APIContext, _tx:ITransaction, user:User) : string {
    delete user.password;
    return 'RuleExecuted'
}

function ruleBeforeRetrieveEntities (_ctx:APIContext, _tx:ITransaction, _query:Query) : string {
    return 'RuleExecuted'
}

function ruleAfterRetrieveEntities (_ctx:APIContext, _tx:ITransaction, _query:Query) : string {
    return 'RuleExecuted'
}

async function ruleBeforeUpdateUser (ctx:APIContext, _tx:ITransaction, user:User) : Promise<string> {
    delete user.username;
    if (user.password) user.password = await ctx.utils.createHash(user.password);
    else delete user.password;
    return 'RuleExecuted'
}

function ruleAfterUpdateUser (_ctx:APIContext, _tx:ITransaction, user:User) : string {
    delete user.password;
    return 'RuleExecuted'
}

