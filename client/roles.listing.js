import { navigateTo, postMessage } from '../../shared/client/lib/jsphere.js';

import './roles.service.js';

// ------------------------ VIEW INITILIZATION ------------------------

export async function init (component) {
    const view = await component.useViewTemplate('/auth/client/roles.listing.html');

    // Register message event listeners
    view.registerMessageListener('RoleDeleted', (data) => { onRoleDeleted(view, data) });
    view.registerMessageListener('DeleteRoleConfirmed', (data) => { onDeleteRoleConfirmed(view, data) });

    // Configure context menu links
    view.addRole.value = 'Add New Role';
    view.addRole.onclick = () => { navigateTo(`/app/roles/role`); }

    view.viewRole.value = 'View Role Details';
    view.viewRole.visible = false;
    view.viewRole.onclick = () => { navigateTo(`/app/roles/role/${view.state.role.id}`); }
    
    view.deleteRole.value = 'Delete Role';
    view.deleteRole.visible = false;
    view.deleteRole.onclick = () => { onDeleteRole(view) };

    // Configure data table
    view.roles.init({
        columns: {
            name: {
                column: 0,
                caption: 'Role',
                type: 'text'
            },
            description: {
                column: 1,
                caption: 'Description',
                type: 'text'
            }    
        },
        query: { conditions: [], orderBy: 'dateTimeModified', order: 'DESC', limit: 25 },
        requestEvent: 'RetrieveRoles',
        responseEvent: 'RolesRetrieved',
        onRefresh: () => { onDataTableRefresh(view) },
        onRowSelected: (row) => { onRowSelected(view, row) }
    });
}

export function refresh () {
    postMessage('SetRolesHeader', { header: 'Roles' });
    postMessage('AddBreadcrumb', { breadcrumbs: [
        { id: 'roles', caption:'Roles', navigateTo: '/app/roles' }
    ]})
}

// ------------------------ VIEW EVENT HANDLERS -----------------------

function onDataTableRefresh (view) {
    view.divider.visible = false;
    view.viewRole.visible = false;
    view.deleteRole.visible = false;
}

function onRowSelected (view, row) {
    view.state.role = row;
    view.divider.visible = true;
    view.viewRole.visible = true;
    view.deleteRole.visible = (view.state.role.id != '00000000-0000-0000-0000-000000000000');
}

function onDeleteRole (view) {
    view.confirm.open({
        title: 'Confirm Delete',
        message: `Are you sure that you would like to delete the role ${view.state.role.name}?`,
        onYes: { subject: 'DeleteRoleConfirmed', data: {} }
    })
}

// ---------------------- MESSAGE EVENT HANDLERS ----------------------

function onDeleteRoleConfirmed(view) {
    postMessage('DeleteRole', { id: view.state.role.id });
}

function onRoleDeleted(view) {
    view.roles.refresh.click();
}