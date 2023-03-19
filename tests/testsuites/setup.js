import { adminUser } from "../../../shared/tests/testdata/users.js";

export default async (ctx) => {
    await ctx.run.testCase('Initialize Database', '', [], 0, async () => {
        const message = await initializeDatabase(ctx, adminUser);
        ctx.test.expect(message.subject).to.equal('SetupCompleted');
    })
}

async function initializeDatabase (ctx, adminUser) {
    const response = await fetch(`${ctx.params.host}/api/setup`, {
        method: 'POST',
        headers: [['Content-Type', 'application/json']],
        body: JSON.stringify(adminUser)
    });
    const message = await response.json();
    return message;
}
