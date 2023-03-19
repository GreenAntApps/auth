import type { APIContext, ITransaction, User, UserSession, UserCredentials, AuthConfig, Message, SAML } from "../../shared/server/types.ts";

import { createMessage } from "../../shared/server/utils.ts";
import * as AuthConfigService from './authconfig.service.ts';
import * as UserSessionManager from './usersession.manager.ts';

import * as zlibDeflate from "https://deno.land/x/compress@v0.4.5/zlib/deflate.ts";
import * as zlibInflate from "https://deno.land/x/compress@v0.4.5/zlib/inflate.ts";
import { encode, decode } from "https://deno.land/std@0.175.0/encoding/base64.ts"
import * as querystring from "https://deno.land/std@0.175.0/node/querystring.ts";
import { xml2js } from "https://deno.land/x/xml2js@1.0.0/mod.ts";

export async function createUserSession (ctx:APIContext, user:UserCredentials, sessionId:string) : Promise<Message> {
    return await ctx.db.writeTransaction(async (tx: ITransaction) : Promise<Message> => {
        const txDateTime = (new Date()).toISOString();
        const message = await createUserSessionTx(ctx, tx, txDateTime, user, sessionId);
        if (message.subject != 'UserSessionCreated') tx.rollback();        
        return message;        
    }) as Message;
}

export async function createUserSessionTx (ctx:APIContext, tx:ITransaction, txDateTime:string, user:UserCredentials, sessionId:string) : Promise<Message> {
    let message:Message;
    try {
        if (sessionId) {
            message = await UserSessionManager.retrieveSsoUser(tx, user);
        }
        else {
            if (user.password) user.password = await ctx.utils.createHash(user.password);
            message = await UserSessionManager.retrieveUser(tx, user);
        }
        if (message.subject == 'UserRetrieved') {
            const user:User = message.data.user as User;
            message = await UserSessionManager.createUserSession(ctx, tx, txDateTime, user, sessionId);
        }    
    }
    catch (e) {
        console.log('UserSessionService:createUserSession', e);
        message =  createMessage('Exception', { errors: 'UserSessionService:createUserSession' });
    }
    return message;
}

export async function retrieveUserSession (ctx:APIContext) : Promise<Message> {
    let message:Message;
    try {
        const sessionId = ctx.request.cookies.sessionId || '00000000-0000-0000-0000-000000000000';

        if (ctx.cache.get(sessionId)) {
            const userSession = ctx.cache.get(sessionId) as UserSession;
            ctx.cache.setExpires(userSession.id as string, 120);
            message = createMessage('UserSessionRetrieved', { userSession});
        }
        else {
            const userSession = { id: sessionId };
            message = await UserSessionManager.retrieveUserSession(ctx, userSession.id);
            if (message.subject == 'UserSessionRetrieved') {
                ctx.cache.set(userSession.id, message.data.userSession as UserSession, 120);
            }
        }

        if (message.subject == 'UserSessionNotFound') {
            const authConfigMessage = await AuthConfigService.retrieveAuthConfig(ctx);
            if (authConfigMessage.subject == 'AuthConfigRetrieved') {
                const authConfig = authConfigMessage.data.authConfig as AuthConfig;
                if (authConfig.ssoEnabled) {
                    message = createMessage('SSOAuthenticationRequired', {});
                }
            }
        }
    }
    catch (e) {
        console.log('UserSessionService:retrieveUserSession', e);
        message =  createMessage('Exception', { errors: 'UserSessionService:retrieveUserSession' });
    }
    return message;
}

export async function deleteUserSession (ctx:APIContext) : Promise<Message> {
    return await ctx.db.writeTransaction(async (tx:ITransaction) : Promise<Message> => {
        let message:Message;
        const sessionId = ctx.request.cookies.sessionId;
        if (!sessionId) {
            message = createMessage('UserSessionDeleted', {});
        }
        else {
            message = await deleteUserSessionTx(tx, sessionId);
            if (message.subject != 'UserSessionDeleted') tx.rollback();        
            ctx.cache.remove(sessionId);
        }
        return message;        
    }) as Message;
}

export async function deleteUserSessionTx (tx:ITransaction, sessionId:string) : Promise<Message> {
    let message:Message;
    try {
        message = await UserSessionManager.deleteUserSession(tx, sessionId);  
    }
    catch (e) {
        console.log('UserSessionService:deleteUserSession', e);
        message =  createMessage('Exception', { errors: 'UserSessionService:deleteUserSession' });
    }
    return message;
}

export async function retrieveSsoRequestUrl (ctx:APIContext) : Promise<Message> {
    let message:Message;
    try {
        message = await AuthConfigService.retrieveAuthConfig(ctx);
        if (message.subject == 'AuthConfigRetrieved') {
            const authConfig = message.data.authConfig as AuthConfig;
            const ssoResponseUrl = `${(ctx.tenant.hostname == 'localhost') ? 'http://' : 'https://'}${ctx.tenant.hostname}/sso/session`;
            const id = ctx.utils.createId();
            const date = new Date().toISOString();
            let samlRequest = `
                <samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="_${id}" Version="2.0" ProviderName="PHApplicationServices" IssueInstant="${date}" Destination="${authConfig.ssoRequestUrl}" ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" AssertionConsumerServiceURL="${ssoResponseUrl}">
                    <saml:Issuer>78d5ee00-599a-4a51-aefa-36d7e03478b2</saml:Issuer>
                    <samlp:NameIDPolicy Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress" AllowCreate="true"/>
                </samlp:AuthnRequest>`;
            let relayState = ctx.request.cookies.sessionId;
            samlRequest = querystring.escape(encode(zlibDeflate.deflateRaw((new TextEncoder()).encode(samlRequest))));
            relayState = querystring.escape(encode(zlibDeflate.deflateRaw((new TextEncoder()).encode(relayState))));
            console.log('REQUEST-relayState', ctx.request.cookies.sessionId)
            message = createMessage('SsoRequestUrl', { url: `${authConfig.ssoRequestUrl}?SAMLRequest=${samlRequest}&RelayState=${relayState}` })
        }
    }
    catch (e) {
        console.log('UserSessionService:retrieveSsoRequestUrl', e);
        message =  createMessage('Exception', { errors: 'UserSessionService:retrieveSsoRequestUrl' });
    }
    return message;
}

export async function createSsoUserSession (ctx:APIContext) : Promise<Message> {
    let message:Message;
    try {
        message = await AuthConfigService.retrieveAuthConfig(ctx);
        if (message.subject == 'AuthConfigRetrieved') {
            const authConfig = message.data.authConfig as AuthConfig;
            const samlResponse = ctx.request.data as Record<string, unknown>;
            const samlResponseXml = (new TextDecoder()).decode(decode(samlResponse.SAMLResponse as string));
            const samlRelayState = (new TextDecoder()).decode(zlibInflate.inflateRaw(decode(samlResponse.RelayState as string)));
            const saml:SAML = xml2js(samlResponseXml, { compact: true }) as SAML;
            const issuer = saml['samlp:Response']['Issuer']._text;
            const status = saml['samlp:Response']['samlp:Status']['samlp:StatusCode']._attributes.Value;
            const email = saml["samlp:Response"]['Assertion'].Subject.NameID._text;
            console.log('RESPONSE-relayState', samlRelayState)
            console.log('issuer=', issuer);
            console.log('status=', status);
            console.log('email=', email);
            if (authConfig.ssoIdentityProvider == issuer && status == 'urn:oasis:names:tc:SAML:2.0:status:Success') {
                const userCredentials:UserCredentials = { username: email }
                message = await createUserSession(ctx, userCredentials, samlRelayState);
            }
        }
    }
    catch (e) {
        console.log('UserSessionService:createSsoUserSession', e);
        message =  createMessage('Exception', { errors: 'UserSessionService:createSsoUserSession' });
    }
    return message;
}
