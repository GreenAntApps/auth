import { adminUser } from "../../../shared/tests/testdata/users.js";
import { testData } from "../testdata/role.data.js";
import {
    createAdminUser,
    createUserSession,
    deleteUserSession,
    createEntity,
    retrieveEntity,
    updateEntity,
    deleteEntity
} from "../../../shared/tests/testlib/shared.api.js";

export default (ctx) => {
    const delay = 0;
    let role;

    ctx.run.testCase('Delete Existing Session', '', [], 0, async () => {
        const message = await deleteUserSession(ctx);
        ctx.test.expect(message.subject).to.equal('UserSessionDeleted');
    })
    
    ctx.run.testCase('Create Admin User', '', [], 0, async () => {
        const message = await createAdminUser(ctx, adminUser);
        ctx.test.expect(['UserCreated', 'DuplicateUser'].includes(message.subject)).to.equal(true);
    })
    
    ctx.run.testCase('Create Admin User Session', '', [], 0, async () => {
        const { username, password} = adminUser;
        const message = await createUserSession(ctx, { username, password });
        ctx.test.expect(message.subject).to.equal('UserSessionCreated');
    })
    
    ctx.run.testCase('Create Role', '', [], delay, async () => {
        const message = await createEntity(ctx, 'role', testData.validRole);
        role = message.data.role;
        ctx.test.expect(message.subject).to.equal('RoleCreated');
        ctx.test.expect(role).to.have.all.keys('id', 'tenantId', 'domainId', 'dateTimeCreated', 'createdBy', 'dateTimeModified', 'modifiedBy', 'name', 'description', 'permissions');
    })
    
    ctx.run.testCase('Retrieve Role', '', [], delay, async () => {
        const message = await retrieveEntity(ctx, 'role', role.id);
        role = message.data.role;
        ctx.test.expect(message.subject).to.equal('RoleRetrieved');
        ctx.test.expect(role).to.have.all.keys('id', 'tenantId', 'domainId', 'dateTimeCreated', 'createdBy', 'dateTimeModified', 'modifiedBy', 'name', 'description', 'permissions');
    })

    ctx.run.testCase('Update Role', '', [], delay, async () => {
        role.tenantId = 'tenantId';
        role.dateTimeCreated = (new Date()).toISOString();
        role.createdBy = '99999999-9999-9999-9999-999999999999';
        role.name = 'Updated role name';
        const message = await updateEntity(ctx, 'role', role);
        const updatedRole = message.data.role;

        ctx.test.expect(message.subject).to.equal('RoleUpdated');
        ctx.test.expect(role).to.have.all.keys('id', 'tenantId', 'domainId', 'dateTimeCreated', 'createdBy', 'dateTimeModified', 'modifiedBy', 'name', 'description', 'permissions');
        ctx.test.expect(updatedRole.tenantId).not.to.equal(role.tenantId);
        ctx.test.expect(updatedRole.dateTimeCreated).not.to.equal(role.dateTimeCreated);
        ctx.test.expect(updatedRole.name).to.equal(role.name);
    })
    
    ctx.run.testCase('Delete Role', '', [], delay, async () => {
        const message = await deleteEntity(ctx, 'role', role.id);
        role = message.data.role;
        ctx.test.expect(message.subject).to.equal('RoleDeleted');
        ctx.test.expect(role).to.have.property('id');
    })

    ctx.run.testCase('Delete Admin User Session', '', [], 0, async () => {
        const message = await deleteUserSession(ctx);
        ctx.test.expect(message.subject).to.equal('UserSessionDeleted');
    })
}
