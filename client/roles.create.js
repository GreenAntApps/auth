import { navigateTo, postMessage } from '../../shared/client/lib/jsphere.js';
import { validateRequiredFields } from '../../shared/client/lib/utils.js';
import { SECTIONS, SECTION_PERMISSIONS } from './permissions.js';

import './roles.service.js';

const RequiredFields = ['name'];

// ------------------------ VIEW INITILIZATION ------------------------

export async function init (component) {
    const view = await component.useViewTemplate('/auth/client/roles.create.html');

    view.state.role = { name: '', description: '' };
    view.state.selectedPermissions = {};

    // Register message event listeners
    view.registerMessageListener('RoleCreated', (data) => { onRoleCreated(view, data) });
    view.registerMessageListener('RoleNotValid', (data) => { onRoleNotValid(view, data) });
    view.registerMessageListener('DuplicateRole', (data) => { onDuplicateRole(view, data) });

    // Configure context menu links
    view.backToRoles.value = 'Back To Roles';
    view.backToRoles.onclick = () => { onNavigateBack() };

    view.saveChanges.value = 'Save Changes';
    view.saveChanges.onclick = () => { onSaveChanges(view) };
    
    // Configure form fields
    view.name.label = 'Role Name';
    
    view.description.label = 'Description';
        
    view.section.label = 'Sections';
    view.section.value = '';
    view.section.options = SECTIONS;
    view.section.onchange = () => { onSectionChanged(view) };
}

export function refresh (view, appState) {
    postMessage('SetRolesHeader', { header: 'New Role' });
    postMessage('AddBreadcrumb', { breadcrumbs: [
        { id: 'roles', caption:'Roles', navigateTo: '/app/roles' },
        { id: 'role', caption:'Role', navigateTo: '/app/roles/role' }
    ]})
}

// ------------------------ VIEW EVENT HANDLERS -----------------------

function onNavigateBack () {
    navigateTo('/app/roles');
}

function onSaveChanges (view) {
    view.state.role.permissions = [];
    if (validateRequiredFields(view, RequiredFields));
    for (const field in view.state.role) if (view[field]) view.state.role[field] = view[field].value;
    for (const permission in view.state.selectedPermissions) {
        view.state.role.permissions.push(permission);
    }
    postMessage('CreateRole', { role: view.state.role });
}

function onSectionChanged (view) {
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

function onRoleCreated (view, data) {
    navigateTo(`/app/roles/role/${data.role.id}`);
}

function onRoleNotValid (view, data) {
    for (const field in data.errors) view[field].message = data.errors[field];
    view.notification.show({
        message: 'Please correct the specified information.',
        timeout: 4000
    })
}

function onDuplicateRole (view) {
    view.name.message = 'This role already exists.';
    view.notification.show({
        message: 'Please correct the specified information.',
        timeout: 4000
    })
}