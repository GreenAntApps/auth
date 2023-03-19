export const SECTION_PERMISSIONS = {
    roles: [
        'roles:canCreateRoles',
        'roles:canDeleteRoles',
        'roles:canUpdateRoles',
        'roles:canViewRoles'
    ],
    users: [
        'users:canCreateAdminUsers',
        'users:canCreateUsers',
        'users:canDeleteUsers',
        'users:canUpdateUsers',
        'users:canViewUsers'
    ]
}

export const SECTIONS = getSections();
export const PERMISSIONS = getPermissions();

function getSections () {
    const sections = [];
    for (const prop in SECTION_PERMISSIONS) {
        sections.push(prop);
    }
    return sections;
}

function getPermissions () {
    const permissions = [];
    for (const prop in SECTION_PERMISSIONS) {
        permissions.concat(SECTION_PERMISSIONS[prop]);
    }
    return permissions;
}
