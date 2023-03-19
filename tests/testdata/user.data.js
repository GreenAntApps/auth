export const testData = {
    validUser: { // add a comment describing this user
        firstName: 'Magic',
        lastName: 'Johnson',
        email: "magic@lakers.com",
        username: "user1",
        password: "password1",
        isLogin: true,
        isAdmin: true,
        isActive: true,
        roleId: ''
    },
    invalidUser1: { // add a comment describing this user
        firstName: 'Larry',
        lastName: 'Bird',
        email: "bird@boston.com",
        username: "user2",
        password: "password2",
        isLogin: true,
        isAdmin: true,
        isActive: true,
        roles: []
    },
    invalidUser2: { // add a comment describing this user
        firstName: 'John',
        lastName: 'Stockton',
        email: "stockton@utah.com",
        username: "user3",
        password: "password3",
        isLogin: true,
        isAdmin: true,
        isActive: true,
        roles: []
    },
    users: [
        {
            firstName: 'Magic',
            lastName: 'Johnson',
            email: "magic@lakers.com",
            username: "user1",
            password: "password1",
            isLogin: true,
            isAdmin: true,
            isActive: true,
            roles: []
        },
        {
            firstName: 'Larry',
            lastName: 'Bird',
            email: "bird@boston.com",
            username: "user2",
            password: "password2",
            isLogin: true,
            isAdmin: true,
            isActive: true,
            roles: []
        },
        {
            firstName: 'John',
            lastName: 'Stockton',
            email: "stockton@utah.com",
            username: "user3",
            password: "password3",
            isLogin: true,
            isAdmin: true,
            isActive: true,
            roles: []
        }
    ]
}