import type { APIContext, ITransaction, QueryResult, Role, Message, Query } from "../../shared/server/types.ts";

import { createMessage, whereClause } from "../../shared/server/utils.ts";
import { createObject, validateObject } from "../../shared/server/schema-validator.ts";
import { RoleSchema, QuerySchema, QueryFieldMappings } from './role.schema.ts';

export async function createRole (ctx:APIContext, tx:ITransaction, txDateTime:string, role:Role) : Promise<Message> {
    let message:Message;
    try {
        const roleToCreate = createObject(RoleSchema, role) as Role;
        if (!roleToCreate.id) roleToCreate.id = ctx.utils.createId();
        roleToCreate.tenantId = ctx.tenant.tenantId;
        roleToCreate.domainId = ctx.tenant.hostname.split('.')[0];
        roleToCreate.dateTimeCreated = txDateTime;
        roleToCreate.createdBy = ctx.user.userId as string || '00000000-0000-0000-0000-000000000000';
        roleToCreate.dateTimeModified = txDateTime;
        roleToCreate.modifiedBy = ctx.user.userId as string || '00000000-0000-0000-0000-000000000000';
        if (!Array.isArray(roleToCreate.permissions)) roleToCreate.permissions = [];
        const subject = await ruleBeforeCreateRole(ctx, tx, roleToCreate);
        if (subject == 'RuleExecuted') {
            const errors = validateObject(RoleSchema, roleToCreate, []);
            if (errors === null) {
                await tx.run(`CREATE (e:Role $roleToCreate)`, { roleToCreate });
                ruleAfterCreateRole(ctx, tx, roleToCreate);
                message = createMessage('RoleCreated', { role: roleToCreate });
            }
            else message = createMessage('RoleNotValid', { role, errors });
        }
        else message = createMessage(subject, { role });
    }
    catch (e) {
        console.log('RoleManager:createRole', e);
        message = createMessage('Exception', { role, errors: 'RoleManager:createRole' });
    }
    return message;
}

export async function retrieveRole (ctx:APIContext, tx:ITransaction, id:string) : Promise<Message> {
    const role = { id };
    let message:Message;
    try {
        const response = await tx.run(`MATCH (e:Role { id: $id }) RETURN e`, { id: role.id }) as QueryResult;
        if (response.records.length == 0) {
            message = createMessage('RoleNotFound', { role });
        }
        else {
            const role = response.records[0].get('e').properties as Role;
            message = createMessage('RoleRetrieved', { role });
            ruleAfterRetrieveRole(ctx, tx, role);
        }
    }
    catch (e) {
        console.log('RoleManager:retrieveRole', e);
        message = createMessage('Exception', { role, errors: 'RoleManager:retrieveRole' });
    }
    return message;
}

export async function retrieveRoles (ctx:APIContext, tx:ITransaction, query:Query) : Promise<Message> {
    let message:Message;
    try {
        const subject = await ruleBeforeRetrieveRoles(ctx, tx, query);
        if (subject == 'RuleExecuted') {
            const errors = validateObject(QuerySchema, query, []);
            if (errors === null) {
                const response = await tx.run(`
                    MATCH (role:Role) ${whereClause(query, RoleSchema, QueryFieldMappings)}
                    RETURN 
                        role.id as id,
                        role.name as name,
                        role.description as description
                    ${query.orderBy ? 'ORDER BY ' + QueryFieldMappings[query.orderBy] + ' ' + (query.order || '') : ''}
                    ${query.limit ? 'LIMIT ' + query.limit : ''}`, {}) as QueryResult;
                const entities:Array<Role> = [];
                for (const record of response.records) {
                    const role: Record<string, unknown> = {};
                    role.id = record.get('id');
                    for (const field of query.fields) {
                        role[field] = record.get(field);
                    }
                    entities.push(role as Role);
                }
                query.records = entities;
                message = createMessage('RolesRetrieved', { query });
                ruleAfterRetrieveRoles(ctx, tx, query);
            }
            else message = createMessage('QueryNotValid', { query, errors });
        }
        else message = createMessage(subject, { query });
    }
    catch (e) {
        console.log('RoleManager:retrieveRoles', e);
        message = createMessage('Exception', { query, errors: 'RoleManager:retrieveRoles' });
    }
    return message;
}

export async function updateRole (ctx:APIContext, tx:ITransaction, txDateTime:string, role:Role) : Promise<Message> {
    let message:Message;
    try {
        role.tenantId = ctx.tenant.tenantId;
        const response = await tx.run(`MATCH (e:Role { id: $id}) RETURN e`, { id: role.id }) as QueryResult;
        if (response.records.length == 0) {
            message = createMessage('RoleNotFound', { role });
        }
        else {
            const roleToUpdate = response.records[0].get('e').properties as Role;
            if (roleToUpdate.dateTimeModified! == role.dateTimeModified!) {
                delete role.tenantId;
                delete role.domainId;
                delete role.dateTimeCreated;
                delete role.createdBy;
                const subject = await ruleBeforeUpdateRole(ctx, tx, role);
                if (subject == 'RuleExecuted') {
                    role.dateTimeModified = txDateTime;
                    role.modifiedBy = ctx.user.userId as string || '00000000-0000-0000-0000-000000000000';
                    Object.assign(roleToUpdate, role);
                    const errors = validateObject(RoleSchema, roleToUpdate, []);
                    if (errors === null) {
                        await tx.run(`MATCH (e:Role { id: $e.id }) SET e = $e RETURN e`, { e: roleToUpdate });
                        message = createMessage('RoleUpdated', { role: roleToUpdate });
                        ruleAfterUpdateRole(ctx, tx, roleToUpdate);
                    }
                    else message = createMessage('RoleNotValid', { role, errors });
                }
                else message = createMessage(subject, { role }); 
            }
            else message = createMessage('RoleModified', { role, dataTimeModified: roleToUpdate.dateTimeModified });
        }
    }
    catch (e) {
        console.log('RoleManager:updateRole', e);
        message = createMessage('Exception', { role, errors: 'RoleManager:updateRole' });
    }
    return message;
}

export async function deleteRole (tx:ITransaction, id:string) : Promise<Message> {
    const role = { id };
    let message:Message;
    try {
        await tx.run(`MATCH (e:Role { id: $id }) DETACH DELETE e`, { id: role.id });
        message = createMessage('RoleDeleted', { role });
    }
    catch (e) {
        console.log('RoleManager:deleteRole', e);
        message = createMessage('Exception', { role, errors: 'RoleManager:deleteRole' });
    }
    return message;
}

// ---------------------- BEFORE AND AFTER RULES ----------------------

// deno-lint-ignore no-unused-vars
async function ruleBeforeCreateRole (ctx:APIContext, tx:ITransaction, role:Role) : Promise<string> {
    let subject = 'RuleExecuted';
    const response = await tx.run(`MATCH (e:Role { name: $name }) RETURN e`, { name: role.name }) as QueryResult;
    if (response.records.length > 0) {
        subject = 'DuplicateRole';
    }
    return subject;
}

// deno-lint-ignore no-unused-vars
function ruleAfterCreateRole (ctx:APIContext, tx:ITransaction, role:Role) : string {
    return 'RuleExecuted'
}

// deno-lint-ignore no-unused-vars
function ruleAfterRetrieveRole (ctx:APIContext, tx:ITransaction, role:Role) : string {
    return 'RuleExecuted'
}

// deno-lint-ignore no-unused-vars
function ruleBeforeRetrieveRoles (ctx:APIContext, tx:ITransaction, query:Query) : string {
    return 'RuleExecuted'
}

// deno-lint-ignore no-unused-vars
function ruleAfterRetrieveRoles (ctx:APIContext, tx:ITransaction, query:Query) : string {
    return 'RuleExecuted'
}

// deno-lint-ignore no-unused-vars
function ruleBeforeUpdateRole (ctx:APIContext, tx:ITransaction, role:Role) : string {
    return 'RuleExecuted'
}

// deno-lint-ignore no-unused-vars
function ruleAfterUpdateRole (ctx:APIContext, tx:ITransaction, role:Role) : string {
    return 'RuleExecuted'
}

