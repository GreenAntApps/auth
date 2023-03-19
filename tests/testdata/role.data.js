export const testData = {
    validRole: {
        name: "Guest",
        description: "Guest user",
        permissions: ["user:canViewUsers"]
    },
    invalidRole1: { // add a comment describing this role
        name: "Guest",
        description: "Guest user",
        permissions: ["user:canViewUsers"]
    },
    invalidRole2: { // add a comment describing this role
        name: "Guest",
        description: "Guest user",
        permissions: ["user:canViewUsers"]
    },
    roles: [
        {
            name: "Guest1",
            description: "Guest1 user",
            permissions: ["user:canViewUsers"]
        },
        {
            name: "Guest2",
            description: "Guest2 user",
            permissions: ["user:canViewUsers"]
        },
        {
            name: "Guest3",
            description: "Guest3 user",
            permissions: ["user:canViewUsers"]
        }
    ]
}
