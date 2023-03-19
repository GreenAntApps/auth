import type { APIContext, ITransaction, QueryResult, AuthConfig, Message } from "../../shared/server/types.ts";

import { createMessage } from "../../shared/server/utils.ts";
import { createObject, validateObject } from "../../shared/server/schema-validator.ts";
import { AuthConfigSchema } from './authconfig.schema.ts';

export async function createAuthConfig (ctx:APIContext, tx:ITransaction, txDateTime:string, authConfig:AuthConfig) : Promise<Message> {
    let message:Message;
    try {
        const authConfigToCreate = createObject(AuthConfigSchema, authConfig) as AuthConfig;
        authConfigToCreate.tenantId = ctx.tenant.tenantId;
        authConfigToCreate.domainId = ctx.tenant.hostname.split('.')[0];
        authConfigToCreate.dateTimeCreated = txDateTime;
        authConfigToCreate.createdBy = ctx.user.userId as string || '00000000-0000-0000-0000-000000000000';
        authConfigToCreate.dateTimeModified = txDateTime;
        authConfigToCreate.modifiedBy = ctx.user.userId as string || '00000000-0000-0000-0000-000000000000';
        const errors = validateObject(AuthConfigSchema, authConfigToCreate as Record<string, unknown>, []);
        if (errors === null) {
            await tx.run(`CREATE (ac:AuthConfig $authConfigToCreate)`, { authConfigToCreate });
            message = createMessage('AuthConfigCreated', { authConfig: authConfigToCreate });
        }
        else message = createMessage('AuthConfigNotValid', { authConfig, errors });
    }
    catch (e) {
        console.log('AuthConfigManager:createAuthConfig', e);
        message = createMessage('Exception', { authConfig, errors: 'AuthConfigManager:createAuthConfig' });
    }
    return message;
}

export async function retrieveAuthConfig (ctx: APIContext) : Promise<Message> {
    let message:Message;
    const domainId = ctx.tenant.hostname.split('.')[0];
    try {
        const response = await ctx.db.run(`MATCH (ac:AuthConfig { domainId: $domainId }) RETURN ac`, { domainId }) as QueryResult;
        if (response.records.length == 0) {
            message = createMessage('AuthConfigNotFound', { authConfig: { domainId } });
        }
        else {
            const authConfig = response.records[0].get('ac').properties as AuthConfig;
            message = createMessage('AuthConfigRetrieved', { authConfig });
        }
    }
    catch (e) {
        console.log('AuthConfigManager:retrieveAuthConfig', e);
        message = createMessage('Exception', { authConfig: { domainId }, errors: 'AuthConfigManager:retrieveAuthConfig' });
    }
    return message;
}

export async function updateAuthConfig (ctx:APIContext, tx:ITransaction, txDateTime:string, authConfig:AuthConfig) : Promise<Message> {
    let message:Message;
    try {
        authConfig.tenantId = ctx.tenant.tenantId;
        const response = await tx.run(`MATCH (ac:AuthConfig { domainId: $domainId}) RETURN ac`, { domainId: authConfig.domainId }) as QueryResult;
        if (response.records.length == 0) {
            message = createMessage('AuthConfigNotFound', { authConfig });
        }
        else {
            const authConfigToUpdate = response.records[0].get('ac').properties as AuthConfig;
            if (authConfigToUpdate.dateTimeModified! == authConfig.dateTimeModified!) {
                delete authConfig.tenantId;
                delete authConfig.dateTimeCreated;
                delete authConfig.createdBy;
                authConfig.dateTimeModified = txDateTime;
                authConfig.modifiedBy = ctx.user.userId as string || '00000000-0000-0000-0000-000000000000';
                Object.assign(authConfigToUpdate, authConfig);
                const errors = validateObject(AuthConfigSchema, authConfigToUpdate as Record<string, unknown>, []);
                if (errors === null) {
                    await tx.run(`MATCH (ac:AuthConfig { domainId: $ac.domainId }) SET ac = $ac RETURN ac`, { ac: authConfigToUpdate });
                    message = createMessage('AuthConfigUpdated', { authConfig: authConfigToUpdate });
                }
                else message = createMessage('AuthConfigNotValid', { authConfig, errors });
            }
            else message = createMessage('AuthConfigModified', { authConfig, dataTimeModified: authConfigToUpdate.dateTimeModified });
        }
    }
    catch (e) {
        console.log('AuthConfigManager:updateAuthConfig', e);
        message = createMessage('Exception', { authConfig, errors: 'AuthConfigManager:updateAuthConfig' });
    }
    return message;
}

export async function deleteAuthConfig (tx:ITransaction, domainId:string) : Promise<Message> {
    const authConfig = { domainId };
    let message:Message;
    try {
        await tx.run(`MATCH (ac:AuthConfig { domainId: $domainId }) DETACH DELETE ac`, { id: authConfig.domainId });
        message = createMessage('AuthConfigDeleted', { authConfig });
    }
    catch (e) {
        console.log('AuthConfigManager:deleteAuthConfig', e);
        message = createMessage('Exception', { authConfig, errors: 'AuthConfigManager:deleteAuthConfig' });
    }
    return message;
}

