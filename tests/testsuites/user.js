import { adminUser } from "../../../shared/tests/testdata/users.js";
import { testData } from "../testdata/user.data.js";
import {
    createUserSession,
    deleteUserSession,
    createEntity,
    retrieveEntity,
    updateEntity,
    deleteEntity
} from "../../../shared/tests/testlib/shared.api.js";

export default (ctx) => {
    const delay = 0;
    let adminRoleId;
    let user;

    ctx.run.testCase('Delete Existing Session', '', [], 0, async () => {
        const message = await deleteUserSession(ctx);
        ctx.test.expect(message.subject).to.equal('UserSessionDeleted');
    })
    
    ctx.run.testCase('Create Admin User', '', [], 0, async () => {
        const message = await createAdminUser(ctx, adminUser);
        ctx.test.expect(['UserCreated'].includes(message.subject)).to.equal(true);
        adminRoleId = message.data.user.roleId;
    })
    
    ctx.run.testCase('Create Admin User Session', '', [], 0, async () => {
        const { username, password} = adminUser;
        const message = await createUserSession(ctx, { username, password });
        ctx.test.expect(message.subject).to.equal('UserSessionCreated');
    })
    
    ctx.run.testCase('Create User', '', [], delay, async () => {
        testData.validUser.roleId = adminRoleId;
        const message = await createEntity(ctx, 'user', testData.validUser);
        user = message.data.user;
        ctx.test.expect(message.subject).to.equal('UserCreated');
        ctx.test.expect(user).to.have.all.keys('id', 'tenantId', 'domainId', 'dateTimeCreated', 'createdBy', 'dateTimeModified', 'modifiedBy', 'firstName', 'lastName', 'username', 'email', 'isActive', 'isLogin', 'roleId');
    })
    
    ctx.run.testCase('Retrieve User', '', [], delay, async () => {
        const message = await retrieveEntity(ctx, 'user', user.id);
        user = message.data.user;
        ctx.test.expect(message.subject).to.equal('UserRetrieved');
        ctx.test.expect(user).to.have.all.keys('id', 'tenantId', 'domainId', 'dateTimeCreated', 'createdBy', 'dateTimeModified', 'modifiedBy', 'firstName', 'lastName', 'username', 'email', 'isActive', 'isLogin', 'roleId');
        ctx.test.expect(user).not.to.have.keys('password');
    })

    ctx.run.testCase('Update User', '', [], delay, async () => {
        user.tenantId = 'tenantId';
        user.username = 'username';
        user.dateTimeCreated = (new Date()).toISOString();
        user.createdBy = '99999999-9999-9999-9999-999999999999';
        const message = await updateEntity(ctx, 'user', user);
        const updatedUser = message.data.user;

        ctx.test.expect(message.subject).to.equal('UserUpdated');
        ctx.test.expect(updatedUser).to.have.all.keys('id', 'tenantId', 'domainId', 'dateTimeCreated', 'createdBy', 'dateTimeModified', 'modifiedBy', 'firstName', 'lastName', 'username', 'email', 'isActive', 'isLogin', 'roleId');
        ctx.test.expect(updatedUser.tenantId).not.to.equal(user.tenantId);
        ctx.test.expect(updatedUser.username).not.to.equal(user.username);
        ctx.test.expect(updatedUser.dateTimeCreated).not.to.equal(user.dateTimeCreated);
    })
    
    ctx.run.testCase('Delete User', '', [], delay, async () => {
        const message = await deleteEntity(ctx, 'user', user.id);
        user = message.data.user;
        ctx.test.expect(message.subject).to.equal('UserDeleted');
        ctx.test.expect(user).to.have.property('id');
    })

    ctx.run.testCase('Delete Admin User Session', '', [], 0, async () => {
        const message = await deleteUserSession(ctx);
        ctx.test.expect(message.subject).to.equal('UserSessionDeleted');
    })
}
