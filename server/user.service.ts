import type { APIContext, ITransaction, User, Message, Query } from "../../shared/server/types.ts";

import { createMessage } from "../../shared/server/utils.ts";
import * as UserManager from './user.manager.ts';

export async function createUser (ctx:APIContext, user:User) : Promise<Message> {
    return await ctx.db.writeTransaction(async (tx:ITransaction) : Promise<Message> => {
        const txDateTime = (new Date()).toISOString();
        const message:Message = await createUserTx(ctx, tx, txDateTime, user);
        if (message.subject != 'UserCreated') tx.rollback();        
        return message;        
    }) as Message;
}

export async function createUserTx (ctx:APIContext, tx:ITransaction, txDateTime:string, user:User) : Promise<Message> {
    let message:Message;
    try {
        delete user.id;
        message = await UserManager.createUser(ctx, tx, txDateTime, user);
    }
    catch (e) {
        console.log('UserService:createUser', e);
        message = createMessage('Exception', { errors: 'UserService:createUser' });
    }
    return message;
}

export async function retrieveUser (ctx:APIContext, id:string) : Promise<Message> {
    return await ctx.db.readTransaction(async (tx:ITransaction) : Promise<Message> => {
        const message:Message = await retrieveUserTx(ctx, tx, id);
        if (message.subject != 'UserRetrieved') tx.rollback();        
        return message;        
    }) as Message;
}

export async function retrieveUserTx (ctx:APIContext, tx:ITransaction, id:string) : Promise<Message> {
    let message:Message;
    try {
        message = await UserManager.retrieveUser(ctx, tx, id);  
    }
    catch (e) {
        console.log('UserService:retrieveUser', e);
        message = createMessage('Exception', { errors: 'UserService:retrieveUser' });
    }
    return message;
}

export async function retrieveUsers (ctx:APIContext, query:Query) : Promise<Message> {
    return await ctx.db.readTransaction(async (tx:ITransaction) : Promise<Message> => {
        const message:Message = await retrieveUsersTx(ctx, tx, query);
        if (message.subject != 'UsersRetrieved') tx.rollback();        
        return message;        
    }) as Message;
}

export async function retrieveUsersTx (ctx:APIContext, tx:ITransaction, query:Query) : Promise<Message> {
    let message:Message;
    try {
        message = await UserManager.retrieveUsers(ctx, tx, query);
    }
    catch (e) {
        console.log('UserService:retrieveUsers', e);
        message = createMessage('Exception', { errors: 'UserService:retrieveUsers' });
    }
    return message;
}

export async function updateUser (ctx:APIContext, user:User) : Promise<Message> {
    return await ctx.db.writeTransaction(async (tx:ITransaction) : Promise<Message> => {
        const txDateTime = (new Date()).toISOString();
        const message:Message = await updateUserTx(ctx, tx, txDateTime, user);
        if (message.subject != 'UserUpdated') tx.rollback();
        return message;        
    }) as Message;
}

export async function updateUserTx (ctx:APIContext, tx:ITransaction, txDateTime:string, user:User) : Promise<Message> {
    let message = null;
    try {
        message = await UserManager.updateUser(ctx, tx, txDateTime, user);  
    }
    catch (e) {
        console.log('UserService:updateUser', e);
        message = createMessage('Exception', { errors: 'UserService:updateUser' });
    }
    return message;
}

export async function deleteUser (ctx:APIContext, id:string) : Promise<Message> {
    return await ctx.db.writeTransaction(async (tx:ITransaction) : Promise<Message> => {
        const message:Message = await deleteUserTx(tx, id);
        if (message.subject != 'UserDeleted') tx.rollback();        
        return message;        
    }) as Message;
}

export async function deleteUserTx (tx:ITransaction, id:string) : Promise<Message> {
    let message:Message;
    try {
        message = await UserManager.deleteUser(tx, id);  
    }
    catch (e) {
        console.log('UserService:deleteUser', e);
        message = createMessage('Exception', { errors: 'UserService:deleteUser' });
    }
    return message;
}
