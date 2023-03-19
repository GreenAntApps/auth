import { adminUser } from "../../../shared/tests/testdata/users.js";
import { testData } from "../testdata/role.data.js";
import {
    createAdminUser,
    createUserSession,
    deleteUserSession,
    createEntity,
    retrieveEntities,
} from "../../../shared/tests/testlib/shared.api.js";

export default (ctx) => {
    const delay = 0;

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
    
    ctx.run.testCase('Create Multiple Roles', '', [], delay, async () => {
        for (const role of testData.roles) {
            const message = await createEntity(ctx, 'role', role);
            ctx.test.expect(message.subject).to.equal('RoleCreated');
        }
    })
    
    ctx.run.testCase('Retrieve Roles', '', [], delay, async () => {
        const query = { fields: ['id', 'name', 'description', 'permissions'] };
        const message = await retrieveEntities(ctx, 'roles', query);
        const roles = message.data.query.records;
        ctx.test.expect(message.subject).to.equal('RolesRetrieved');
        ctx.test.expect(roles[0]).to.have.all.keys('id', 'name', 'description', 'permissions');
    })

    ctx.run.testCase('Delete Admin User Session', '', [], 0, async () => {
        const message = await deleteUserSession(ctx);
        ctx.test.expect(message.subject).to.equal('UserSessionDeleted');
    })
}
