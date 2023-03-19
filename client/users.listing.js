import { navigateTo, postMessage } from '../../shared/client/lib/jsphere.js';

import './users.service.js';
import './roles.service.js';

// ------------------------ VIEW INITILIZATION ------------------------

export async function init (component) {
    const view = await component.useViewTemplate('/auth/client/users.listing.html');

    // Register message event listeners
    view.registerMessageListener('RolesListRetrieved', (data) => { onRolesListRetrieved(view, data) });
    view.registerMessageListener('UserDeleted', (data) => { onUserDeleted(view, data) });
    view.registerMessageListener('DeleteUserConfirmed', (data) => { onDeleteUserConfirmed(view, data) });

    // Configure context menu links
    view.addUser.value = 'Add New User';
    view.addUser.onclick = () => { navigateTo(`/app/users/user`); }

    view.viewUser.value = 'View User Details';
    view.viewUser.visible = false;
    view.viewUser.onclick = () => { navigateTo(`/app/users/user/${view.state.user.id}`); }
    
    view.deleteUser.value = 'Delete User';
    view.deleteUser.visible = false;
    view.deleteUser.onclick = () => { onDeleteUser(view) };

    // Configure data table
    view.users.init({
        columns: {
            'firstName': {
                column: 0,
                caption: 'First Name',
                type: 'text'
            },
            'lastName': {
                column: 1,
                caption: 'Last Name',
                type: 'text'
            },
            'username': {
                column: 2,
                caption: 'Username',
                type: 'text'
            },
            'email': {
                column: 3,
                caption: 'Email',
                type: 'text'
            },
            'roleId': {
                column: 4,
                caption: 'Role',
                alias: 'role',
                type: 'option',
                optionsMap: { text: 'name', value: 'id' },
                options: [],
            },
            'isActive': {
                caption: 'Active',
                type: 'option',
                options: [
                    { text: 'Yes', value: true },
                    { text: 'No', value: false }
                ]
            }
        },
        query: { conditions:[], orderBy:'dateTimeModified', order:'DESC', limit:10 },
        requestEvent: 'RetrieveUsers',
        responseEvent: 'UsersRetrieved',
        onRefresh: () => { onDataTableRefresh(view) },
        onRowSelected: (row) => { onRowSelected(view, row) }
    });
}

export function refresh () {
    postMessage('SetUsersHeader', { header: 'Users' });
    postMessage('AddBreadcrumb', { breadcrumbs: [
        { id: 'users', caption:'Users', navigateTo: '/app/users' }
    ]})
    postMessage('RetrieveRolesList');
}

// ------------------------ VIEW EVENT HANDLERS -----------------------

function onDataTableRefresh (view) {
    view.divider.visible = false;
    view.viewUser.visible = false;
    view.deleteUser.visible = false;
}

function onRowSelected (view, row) {
    view.state.user = row;
    view.divider.visible = true;
    view.viewUser.visible = true;
    view.deleteUser.visible = (view.state.user.id != '00000000-0000-0000-0000-000000000000');
}

function onDeleteUser (view) {
    view.confirm.open({
        title: 'Confirm Delete',
        message: `Are you sure that you would like to delete the user ${view.state.user.firstName} ${view.state.user.lastName}?`,
        onYes: { subject: 'DeleteUserConfirmed', data: {} }
    })
}

// ---------------------- MESSAGE EVENT HANDLERS ----------------------

function onRolesListRetrieved(view, data) {
    view.users.updateColumn('roleId', { options: data.query.records })
}

function onDeleteUserConfirmed(view) {
    postMessage('DeleteUser', { id: view.state.user.id });
}

function onUserDeleted(view) {
    view.users.refresh.click();
}