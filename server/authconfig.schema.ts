import type { AuthConfig } from "../../shared/server/types.ts";

import { Schema, ConstraintParams, isRequired } from "../../shared/server/schema-validator.ts";

export const AuthConfigSchema:Schema = {
    tenantId: { type: 'string', constraints: tenantId },
    domainId: { type: 'string', constraints: domainId },
    dateTimeCreated: { type: 'dateTime', constraints: dateTimeCreated },
    createdBy: { type: 'uuid', constraints: createdBy },
    dateTimeModified: { type: 'dateTime', constraints: dateTimeModified },
    modifiedBy: { type: 'uuid', constraints: modifiedBy },
    ssoEnabled: { type: 'boolean', constraints: ssoEnabled },
    ssoRequestUrl: { type: 'string', constraints: ssoRequestUrl },
    ssoIdentityProvider: { type: 'string', constraints: ssoIdentityProvider },
}

function tenantId (params:ConstraintParams) {
    const { obj } = params;
    const authConfig = obj as AuthConfig;
    isRequired(authConfig.tenantId);
}

function domainId (params:ConstraintParams) {
    const { obj } = params;
    const authConfig = obj as AuthConfig;
    isRequired(authConfig.domainId);
}

function dateTimeCreated (params:ConstraintParams) {
    const { obj } = params;
    const authConfig = obj as AuthConfig;
    isRequired(authConfig.dateTimeCreated);
}

function createdBy (params:ConstraintParams) {
    const { obj } = params;
    const authConfig = obj as AuthConfig;
    isRequired(authConfig.createdBy);
}

function dateTimeModified (params:ConstraintParams) {
    const { obj } = params;
    const authConfig = obj as AuthConfig;
    isRequired(authConfig.dateTimeModified);
}

function modifiedBy (params:ConstraintParams) {
    const { obj } = params;
    const authConfig = obj as AuthConfig;
    isRequired(authConfig.modifiedBy);
}

function ssoEnabled (params:ConstraintParams) {
    const { obj } = params;
    const authConfig = obj as AuthConfig;
    isRequired(authConfig.ssoEnabled);
}

function ssoRequestUrl (_params:ConstraintParams) {
    // const { obj } = params;
    // const authConfig = obj as AuthConfig;
}

function ssoIdentityProvider (_params:ConstraintParams) {
    // const { obj } = params;
    // const authConfig = obj as AuthConfig;
}
