import type { APIContext, ITransaction, AuthConfig, Message } from "../../shared/server/types.ts";

import { createMessage } from "../../shared/server/utils.ts";
import * as AuthConfigManager from './authconfig.manager.ts';

export const createAuthConfig = async (ctx:APIContext, data:AuthConfig) : Promise<Message> => {
    return await ctx.db.writeTransaction(async (tx:ITransaction) : Promise<Message> => {
        const txDateTime = (new Date()).toISOString();
        const message:Message = await createAuthConfigTx(ctx, tx, txDateTime, data);
        if (message.subject != 'AuthConfigCreated') tx.rollback();        
        return message;        
    }) as Message;
}

export const createAuthConfigTx = async (ctx:APIContext, tx:ITransaction, txDateTime:string, authConfig:AuthConfig) : Promise<Message> => {
    let message:Message;
    try {
        message = await AuthConfigManager.createAuthConfig(ctx, tx, txDateTime, authConfig);
    }
    catch (e) {
        console.log('AuthConfigService:createAuthConfig', e);
        message = createMessage('Exception', { errors: 'AuthConfigService:createAuthConfig' });
    }
    return message;
}

export const retrieveAuthConfig = async (ctx:APIContext) : Promise<Message> => {
    let message:Message;
    try {
        message = await AuthConfigManager.retrieveAuthConfig(ctx);  
    }
    catch (e) {
        console.log('AuthConfigService:retrieveAuthConfig', e);
        message = createMessage('Exception', { errors: 'AuthConfigService:retrieveAuthConfig' });
    }
    return message;
}

export const updateAuthConfig = async (ctx:APIContext, authConfig:AuthConfig) : Promise<Message> => {
    return await ctx.db.writeTransaction(async (tx:ITransaction) : Promise<Message> => {
        const txDateTime = (new Date()).toISOString();
        const message:Message = await updateAuthConfigTx(ctx, tx, txDateTime, authConfig);
        if (message.subject != 'AuthConfigUpdated') tx.rollback();
        return message;        
    }) as Message;
}

export const updateAuthConfigTx = async (ctx:APIContext, tx:ITransaction, txDateTime:string, authConfig:AuthConfig) : Promise<Message> => {
    let message:Message;
    try {
        message = await AuthConfigManager.updateAuthConfig(ctx, tx, txDateTime, authConfig);  
    }
    catch (e) {
        console.log('AuthConfigService:updateAuthConfig', e);
        message = createMessage('Exception', { errors: 'AuthConfigService:updateAuthConfig' });
    }
    return message;
}

export const deleteAuthConfig = async (ctx:APIContext, id:string) : Promise<Message> => {
    return await ctx.db.writeTransaction(async (tx:ITransaction) : Promise<Message> => {
        const message:Message = await deleteAuthConfigTx(tx, id);
        if (message.subject != 'AuthConfigDeleted') tx.rollback();        
        return message;        
    }) as Message;
}

export const deleteAuthConfigTx = async (tx:ITransaction, id:string) : Promise<Message> => {
    let message:Message;
    try {
        message = await AuthConfigManager.deleteAuthConfig(tx, id);  
    }
    catch (e) {
        console.log('AuthConfigService:deleteAuthConfig', e);
        message = createMessage('Exception', { errors: 'AuthConfigService:deleteAuthConfig' });
    }
    return message;
}
