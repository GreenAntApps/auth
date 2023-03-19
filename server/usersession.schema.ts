import type { UserCredentials } from "../../shared/server/types.ts";

import { Schema, ConstraintParams, isRequired } from "../../shared/server/schema-validator.ts";

export const UserCredentialsSchema:Schema = {
    username: { type: 'string', constraints: username },
    password: { type: 'string', constraints: password }
}

function username (params:ConstraintParams) {
    const { obj } = params;
    const userCredentials = obj as UserCredentials;
    isRequired(userCredentials.username);
}

function password (params:ConstraintParams) {
    const { obj, tags } = params;
    const userCredentials = obj as UserCredentials;
    if (!tags.includes('ssoUser')) isRequired(userCredentials.password);
}
