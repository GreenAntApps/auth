import type { APIContext, ITransaction, Role, Message, Query } from "../../shared/server/types.ts";

import { createMessage } from "../../shared/server/utils.ts";
import * as RoleManager from './role.manager.ts';

export async function createRole (ctx:APIContext, role:Role) : Promise<Message> {
    return await ctx.db.writeTransaction(async (tx:ITransaction) : Promise<Message> => {
        const txDateTime = (new Date()).toISOString();
        const message = await createRoleTx(ctx, tx, txDateTime, role);
        if (message.subject != 'RoleCreated') tx.rollback();        
        return message;        
    }) as Message;
}

export async function createRoleTx (ctx:APIContext, tx:ITransaction, txDateTime:string, role:Role) : Promise<Message> {
    let message:Message;
    try {
        delete role.id;
        message = await RoleManager.createRole(ctx, tx, txDateTime, role);
    }
    catch (e) {
        console.log('RoleService:createRole', e);
        message = createMessage('Exception', { errors: 'RoleService:createRole' });
    }
    return message;
}

export async function retrieveRole (ctx:APIContext, id:string) : Promise<Message> {
    return await ctx.db.readTransaction(async (tx:ITransaction) : Promise<Message> => {
        const message:Message = await retrieveRoleTx(ctx, tx, id);
        if (message.subject != 'RoleRetrieved') tx.rollback();        
        return message;        
    }) as Message;
}

export async function retrieveRoleTx (ctx:APIContext, tx:ITransaction, id:string) : Promise<Message> {
    let message:Message;
    try {
        message = await RoleManager.retrieveRole(ctx, tx, id);  
    }
    catch (e) {
        console.log('RoleService:retrieveRole', e);
        message = createMessage('Exception', { errors: 'RoleService:retrieveRole' });
    }
    return message;
}

export async function retrieveRoles (ctx:APIContext, query:Query) : Promise<Message> {
    return await ctx.db.readTransaction(async (tx:ITransaction) : Promise<Message> => {
        const message:Message = await retrieveRolesTx(ctx, tx, query);
        if (message.subject != 'RolesRetrieved') tx.rollback();        
        return message;        
    }) as Message;
}

export async function retrieveRolesTx (ctx:APIContext, tx:ITransaction, query:Query) : Promise<Message> {
    let message:Message;
    try {
        message = await RoleManager.retrieveRoles(ctx, tx, query);
    }
    catch (e) {
        console.log('RoleService:retrieveRoles', e);
        message = createMessage('Exception', { errors: 'RoleService:retrieveRoles' });
    }
    return message;
}

export async function updateRole (ctx:APIContext, role:Role) : Promise<Message> {
    return await ctx.db.writeTransaction(async (tx:ITransaction) : Promise<Message> => {
        const txDateTime = (new Date()).toISOString();
        const message:Message = await updateRoleTx(ctx, tx, txDateTime, role);
        if (message.subject != 'RoleUpdated') tx.rollback();
        return message;        
    }) as Message;
}

export async function updateRoleTx (ctx:APIContext, tx:ITransaction, txDateTime:string, role:Role) : Promise<Message> {
    let message = null;
    try {
        message = await RoleManager.updateRole(ctx, tx, txDateTime, role);  
    }
    catch (e) {
        console.log('RoleService:updateRole', e);
        message = createMessage('Exception', { errors: 'RoleService:updateRole' });
    }
    return message;
}

export async function deleteRole (ctx:APIContext, id:string) : Promise<Message> {
    return await ctx.db.writeTransaction(async (tx:ITransaction) : Promise<Message> => {
        const message:Message = await deleteRoleTx(tx, id);
        if (message.subject != 'RoleDeleted') tx.rollback();        
        return message;        
    }) as Message;
}

export async function deleteRoleTx (tx:ITransaction, id:string) : Promise<Message> {
    let message:Message;
    try {
        message = await RoleManager.deleteRole(tx, id);  
    }
    catch (e) {
        console.log('RoleService:deleteRole', e);
        message = createMessage('Exception', { errors: 'RoleService:deleteRole' });
    }
    return message;
}
