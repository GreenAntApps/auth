import type { Role, Query } from "../../shared/server/types.ts";

import { Schema, ConstraintParams, isRequired, isValidType, isWithinRange, isInList } from "../../shared/server/schema-validator.ts";
import { PERMISSIONS } from '../client/permissions.js';

export const QueryFieldMappings:Record<string, string> = {
    dateTimeCreated: 'role.dateTimeCreated',
    dateTimeModified: 'role.dateTimeModified',
    name: 'role.name',
    description: 'role.description',
}

export const QuerySchema = {
    fields: { type: 'array:string', default: ['name', 'description'], constraints: fields },
    conditions: { type: 'array:object', default: [], constraints: conditions },
    orderBy: { type: 'string', default: 'dateTimeModified', constraints: orderBy },
    order: { type: 'string', default: 'DESC', constraints: orderBy },
    limit: { type: 'number', default: 10, constraints: limit }
}

function fields (params:ConstraintParams) {
    const { obj } = params;
    const query = obj as Query;
    isInList(query.fields, ['name', 'description']);
}

function conditions (params:ConstraintParams) {
    const { obj } = params;
    const query = obj as Query;
    const fields = Object.keys(RoleSchema);
    for (const condition of query.conditions) {
        isInList(condition.field, fields);
        isInList(condition.operator, ['=', '!=', '>', '>=', '<', '<=', 'CONTAINS', 'STARTS WITH', 'ENDS WITH']);
        isValidType(RoleSchema[condition.field].type, condition.value);
    }
}

function orderBy (params:ConstraintParams) {
    const { obj } = params;
    const query = obj as Query;
    const fields = Object.keys(RoleSchema);
    isInList(query.orderBy.split(' ')[0], fields)
}

function limit (_params:ConstraintParams) {
    // const { obj } = params;
    // const query = obj as Query;
}


export const RoleSchema:Schema = {
    id: { type: 'uuid', constraints: id },
    tenantId: { type: 'string', constraints: tenantId },
    domainId: { type: 'string', constraints: domainId },
    dateTimeCreated: { type: 'dateTime', constraints: dateTimeCreated },
    createdBy: { type: 'uuid', constraints: createdBy },
    dateTimeModified: { type: 'dateTime', constraints: dateTimeModified },
    modifiedBy: { type: 'uuid', constraints: modifiedBy },
    name: { type: 'string', constraints: name },
    description: { type: 'string', constraints: description },
    permissions: { type: 'array:string', constraints: permissions },
}

function id (params:ConstraintParams) {
    const { obj } = params;
    const role = obj as Role;
    isRequired(role.id);
}

function tenantId (params:ConstraintParams) {
    const { obj } = params;
    const role = obj as Role;
    isRequired(role.tenantId);
}

function domainId (params:ConstraintParams) {
    const { obj } = params;
    const role = obj as Role;
    isRequired(role.domainId);
}

function dateTimeCreated (params:ConstraintParams) {
    const { obj } = params;
    const role = obj as Role;
    isRequired(role.dateTimeCreated);
}

function createdBy (params:ConstraintParams) {
    const { obj } = params;
    const role = obj as Role;
    isRequired(role.createdBy);
}

function dateTimeModified (params:ConstraintParams) {
    const { obj } = params;
    const role = obj as Role;
    isRequired(role.dateTimeModified);
}

function modifiedBy (params:ConstraintParams) {
    const { obj } = params;
    const role = obj as Role;
    isRequired(role.modifiedBy);
}

function name (params:ConstraintParams) {
    const { obj } = params;
    const role = obj as Role;
    isRequired(role.name);
    isWithinRange(role.name as string, { min: 3, max: 25 })
}

function description (params:ConstraintParams) {
    const { obj } = params;
    const role = obj as Role;
    isWithinRange(role.description as string, { max: 100});
}

function permissions (params:ConstraintParams) {
    const { obj } = params;
    const role = obj as Role;
    isInList(role.permissions as Array<string>, PERMISSIONS);
}
