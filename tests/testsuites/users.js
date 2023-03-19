import { adminUser } from "../../../shared/tests/testdata/users.js";
import { testData } from "../testdata/user.data.js";
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
    
    ctx.run.testCase('Create Multiple Users', '', [], delay, async () => {
        for (const user of testData.users) {
            const message = await createEntity(ctx, 'user', user);
            ctx.test.expect(message.subject).to.equal('UserCreated');
        }
    })
    
    ctx.run.testCase('Retrieve Users', '', [], delay, async () => {
        const query = { fields: ['id', 'username', 'email', 'isAdmin', 'isActive'], filter: [
            { field: 'isAdmin', operator: '=', value: true }
        ]};
        const message = await retrieveEntities(ctx, 'users', query);
        const users = message.data.query.records;
        ctx.test.expect(message.subject).to.equal('UsersRetrieved');
        ctx.test.expect(users[0]).to.have.all.keys('id', 'username', 'email', 'isActive', 'isAdmin');
    })

    ctx.run.testCase('Delete Admin User Session', '', [], 0, async () => {
        const message = await deleteUserSession(ctx);
        ctx.test.expect(message.subject).to.equal('UserSessionDeleted');
    })
}
