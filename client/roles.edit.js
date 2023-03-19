import { navigateTo, postMessage } from '../../shared/client/lib/jsphere.js';
import { validateRequiredFields } from '../../shared/client/lib/utils.js';
import { SECTIONS, SECTION_PERMISSIONS } from './permissions.js';

import './roles.service.js';

const RequiredFields = ['name', 'description' ];

// ------------------------ VIEW INITILIZATION ------------------------

export async function init (component, appState) {
    const view = await component.useViewTemplate('/auth/client/roles.edit.html');
    
    view.state.role = { id: appState.currentPath.split('/')[4] };
    view.state.selectedPermissions = {};

    // Register message event listeners
    view.registerMessageListener('RoleRetrieved', (data) => { onRoleRetrieved(view, data) });
    view.registerMessageListener('RoleUpdated', (data) => { onRoleUpdated(view, data) });
    view.registerMessageListener('RoleModified', (data) => { onRoleModified(view, data) });
    view.registerMessageListener('RoleNotValid', (data) => { onRoleNotValid(view, data) });
    view.registerMessageListener('RoleDeleted', (data) => { onRoleDeleted(view, data) });
    view.registerMessageListener('DeleteRoleConfirmed', (data) => { onDeleteRoleConfirmed(view, data) });

    // Configure context menu links
    view.backToRoles.value = 'Back To Roles';
    view.backToRoles.onclick = () => { onNavigateBack() };

    view.refresh.value = 'Refresh';
    view.refresh.onclick = () => { onRefreshRole(view, appState) };

    view.saveChanges.value = 'Save Changes';
    view.saveChanges.onclick = () => { onSaveChanges(view) };
    view.saveChanges.visible = (view.state.role.id != '00000000-0000-0000-0000-000000000000');
    
    view.deleteRole.value = 'Delete Role';
    view.deleteRole.onclick = () => { onDeleteRole(view) };
    view.deleteRole.visible = (view.state.role.id != '00000000-0000-0000-0000-000000000000');

    // Configure form fields
    view.name.label = 'Role Name';
    view.name.disabled = (view.state.role.id == '00000000-0000-0000-0000-000000000000');
    
    view.description.label = 'Description';
    view.description.disabled = (view.state.role.id == '00000000-0000-0000-0000-000000000000');
        
    view.section.label = 'Sections';
    view.section.value = 0;
    view.section.options = SECTIONS;
    view.section.onchange = () => { onSectionChanged(view) };
    view.section.visible = (view.state.role.id != '00000000-0000-0000-0000-000000000000');
}

export function refresh (view, appState) {
    postMessage('AddBreadcrumb', { breadcrumbs: [
        { id: 'roles', caption:'Roles', navigateTo: '/app/roles' },
        { id: 'role', caption:'Role' }
    ]})
    onRefreshRole(view, appState);
}

// ------------------------ VIEW EVENT HANDLERS -----------------------

function onNavigateBack () {
    navigateTo('/app/roles');
}

function onRefreshRole (view) {
    postMessage('RetrieveRole', { id: view.state.role.id });
}

function onSaveChanges (view) {
    view.state.role.permissions = [];
    if (validateRequiredFields(view, RequiredFields)) {
        for (const field in view.state.role) if (view[field]) view.state.role[field] = view[field].value;
        for (const permission in view.state.selectedPermissions) {
            view.state.role.permissions.push(permission);
        }
        postMessage('UpdateRole', { role: view.state.role });
    }
}

function onDeleteRole (view) {
    view.confirm.open({
        title: 'Confirm Delete',
        message: `Are you sure that you would like to delete the role ${view.state.role.name}?`,
        onYes: { subject: 'DeleteRoleConfirmed', data: {} }
    })
}

function onSectionChanged (view) {
    if (view.state.role.id == '00000000-0000-0000-0000-000000000000') return;
    view.sectionPermissions.removeAll();
    const permissions = SECTION_PERMISSIONS[SECTIONS[view.section.value]];
    for (let i = 0; i < permissions.length; i++) {
        const id = 'permission' + i;
        const row = view.sectionPermissions.add(id);
        row.permission.label = permissions[i].split(':')[1];
        row.permission.checked = view.state.selectedPermissions[permissions[i]] || false;
        row.permission.onchange = () => {
            if (row.permission.checked) view.state.selectedPermissions[permissions[i]] = true
            else delete view.state.selectedPermissions[permissions[i]];
        }
    }
}

// ---------------------- MESSAGE EVENT HANDLERS ----------------------

function onRoleRetrieved (view, data) {
    view.state.role = data.role;
    for (const field in view.state.role) if (view[field]) view[field].value = view.state.role[field];
    validateRequiredFields(view, RequiredFields);
    for (const permission of view.state.role.permissions) {
        view.state.selectedPermissions[permission] = true;
    }
    onSectionChanged(view);
    postMessage('SetRolesHeader', { header: view.state.role.name });
}

function onRoleUpdated (view, data) {
    onRoleRetrieved(view, data);
    view.notification.show({
        message: 'Changes saved.',
        timeout: 4000
    })
}

function onRoleModified (view) {
    view.notification.show({
        message: 'This role has been updated by another user.',
        timeout: 4000,
        actionHandler: () => { onRefreshRole(view) },
        actionText: 'Refresh'        
    })
}

function onRoleNotValid (view, data) {
    for (const field in data.errors) view[field].message = data.errors[field];
    view.notification.show({
        message: 'Please correct the specified information.',
        timeout: 4000
    })
}

function onDeleteRoleConfirmed (view) {
    postMessage('DeleteRole', { id: view.state.role.id });
}

function onRoleDeleted () {
    onNavigateBack();
}
