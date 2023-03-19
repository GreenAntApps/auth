import type { User, Query } from "../../shared/server/types.ts";

import { Schema, ConstraintParams, isRequired, isValidType, isWithinRange, isInList } from "../../shared/server/schema-validator.ts";

export const QueryFieldMappings:Record<string, string> = {
    dateTimeCreated: 'user.dateTimeCreated',
    dateTimeModified: 'user.dateTimeModified',
    firstName: 'user.firstName',
    lastName: 'user.lastName',
    username: 'user.username',
    email: 'user.email',
    isActive: 'user.isActive',
    roleId: 'user.roleId'
}

export const QuerySchema = {
    fields: { type: 'array:string', default: ['firstName', 'lastName', 'username', 'email', 'isActive', 'roleId', 'role'], constraints: fields },
    conditions: { type: 'array:object', default: [], constraints: conditions },
    orderBy: { type: 'string', default: 'dateTimeModified', constraints: orderBy },
    order: { type: 'string', default: 'DESC', constraints: orderBy },
    limit: { type: 'number', default: 10, constraints: limit }
}

function fields (params:ConstraintParams) {
    const { obj } = params;
    const query = obj as Query;
    isInList(query.fields, ['firstName', 'lastName', 'username', 'email', 'isActive', 'roleId', 'role']);
}

function conditions (params:ConstraintParams) {
    const { obj } = params;
    const query = obj as Query;
    const fields = Object.keys(UserSchema);
    for (const condition of query.conditions) {
        isInList(condition.field, fields);
        isInList(condition.operator, ['=', '!=', '>', '>=', '<', '<=', 'CONTAINS', 'STARTS WITH', 'ENDS WITH']);
        isValidType(UserSchema[condition.field].type, condition.value);
    }
}

function orderBy (params:ConstraintParams) {
    const { obj } = params;
    const query = obj as Query;
    const fields = Object.keys(UserSchema);
    isInList(query.orderBy.split(' ')[0], fields)
}

function limit (_params:ConstraintParams) {
    // const { obj } = params;
    // const query = obj as Query;
}

export const UserSchema:Schema = {
    id: { type: 'uuid', constraints: id },
    tenantId: { type: 'string', constraints: tenantId },
    domainId: { type: 'string', constraints: domainId },
    dateTimeCreated: { type: 'dateTime', constraints: dateTimeCreated },
    createdBy: { type: 'uuid', constraints: createdBy },
    dateTimeModified: { type: 'dateTime', constraints: dateTimeModified },
    modifiedBy: { type: 'uuid', constraints: modifiedBy },
    firstName: { type: 'string', constraints: firstName },
    lastName: { type: 'string', constraints: lastName },
    username: { type: 'string', constraints: username },
    password: { type: 'string', constraints: password },
    email: { type: 'string', constraints: email },
    isActive: { type: 'boolean', default: false, constraints: isActive },
    isLogin: { type: 'boolean', default: false, constraints: isLogin },
    roleId: { type: 'uuid', constraints: roleId },
}

function id (params:ConstraintParams) {
    const { obj } = params;
    const user = obj as User;
    isRequired(user.id);
}

function tenantId (params:ConstraintParams) {
    const { obj } = params;
    const user = obj as User;
    isRequired(user.tenantId);
}

function domainId (params:ConstraintParams) {
    const { obj } = params;
    const user = obj as User;
    isRequired(user.domainId);
}

function dateTimeCreated (params:ConstraintParams) {
    const { obj } = params;
    const user = obj as User;
    isRequired(user.dateTimeCreated);
}

function createdBy (params:ConstraintParams) {
    const { obj } = params;
    const user = obj as User;
    isRequired(user.createdBy);
}

function dateTimeModified (params:ConstraintParams) {
    const { obj } = params;
    const user = obj as User;
    isRequired(user.dateTimeModified);
}

function modifiedBy (params:ConstraintParams) {
    const { obj } = params;
    const user = obj as User;
    isRequired(user.modifiedBy);
}

function firstName (params:ConstraintParams) {
    const { obj } = params;
    const user = obj as User;
    isRequired(user.firstName);
    isWithinRange(user.firstName as string, { min: 1, max: 25 })
}

function lastName (params:ConstraintParams) {
    const { obj } = params;
    const user = obj as User;
    isRequired(user.lastName);
    isWithinRange(user.lastName as string, { min: 2, max: 25 })
}

function username (params:ConstraintParams) {
    const { obj } = params;
    const user = obj as User;
    isRequired(user.username);
    isWithinRange(user.username as string, { min: 5, max: 25 })
}

function password (_params:ConstraintParams) {
    // const { obj } = params;
    // const user = obj as User;
    // isRequired(user.password);
}

function email (params:ConstraintParams) {
    const { obj } = params;
    const user = obj as User;
    isRequired(user.email);
}

function isActive (_params:ConstraintParams) {
    // const { obj } = params;
    // const user = obj as User;
    // isRequired(user.isActive);
}

function isLogin (_params:ConstraintParams) {
    // const { obj } = params;
    // const user = obj as User;
    // isRequired(user.isLogin);
}

function roleId (_params:ConstraintParams) {
    // const { obj } = params;
    // const user = obj as User;
    // isRequired(user.role);
}

