import { navigateTo, postMessage } from '../../shared/client/lib/jsphere.js';
import { validateRequiredFields } from '../../shared/client/lib/utils.js';

import './users.service.js';
import './roles.service.js';

const RequiredFields = ['firstName', 'lastName', 'email', 'roleId'];

// ------------------------ VIEW INITILIZATION ------------------------

export async function init (component, appState) {
    const view = await component.useViewTemplate('/auth/client/users.edit.html');
    
    view.state.user = { id: appState.currentPath.split('/')[4] };

    // Register message event listeners
    view.registerMessageListener('UserRetrieved', (data) => { onUserRetrieved(view, data) });
    view.registerMessageListener('UserUpdated', (data) => { onUserUpdated(view, data) });
    view.registerMessageListener('UserModified', (data) => { onUserModified(view, data) });
    view.registerMessageListener('UserNotValid', (data) => { onUserNotValid(view, data) });
    view.registerMessageListener('UserDeleted', (data) => { onUserDeleted(view, data) });
    view.registerMessageListener('DeleteUserConfirmed', (data) => { onDeleteUserConfirmed(view, data) });
    view.registerMessageListener('RolesRetrieved', (data) => { onRolesRetrieved(view, data) });

    // Configure context menu links
    view.backToUsers.value = 'Back To Users';
    view.backToUsers.onclick = () => { onNavigateBack() };

    view.refresh.value = 'Refresh';
    view.refresh.onclick = () => { onRefreshUser(view, appState) };

    view.saveChanges.value = 'Save Changes';
    view.saveChanges.onclick = () => { onSaveChanges(view) };
    view.saveChanges.visible = (view.state.user.id != '00000000-0000-0000-0000-000000000000');
    
    view.deleteUser.value = 'Delete User';
    view.deleteUser.onclick = () => { onDeleteUser(view) };
    view.deleteUser.visible = (view.state.user.id != '00000000-0000-0000-0000-000000000000');

    // Configure form fields
    view.firstName.label = 'First Name';
    view.firstName.disabled = (view.state.user.id == '00000000-0000-0000-0000-000000000000');
    
    view.lastName.label = 'Last Name';
    view.lastName.disabled = (view.state.user.id == '00000000-0000-0000-0000-000000000000');
    
    view.email.label = 'Email';
    view.email.disabled = (view.state.user.id == '00000000-0000-0000-0000-000000000000');

    view.username.label = 'Username';
    view.username.disabled = (view.state.user.id == '00000000-0000-0000-0000-000000000000');

    view.password.label = 'Password';
    view.password.type = 'password';
    view.password.value = '';
    view.password.disabled = (view.state.user.id == '00000000-0000-0000-0000-000000000000');
    
    view.confirmPassword.label = 'Confirm Password';
    view.confirmPassword.type = 'password'
    view.confirmPassword.disabled = (view.state.user.id == '00000000-0000-0000-0000-000000000000');
    
    view.roleId.label = 'Role';
    view.roleId.map = { text: 'name', value: 'id' };
    view.roleId.disabled = (view.state.user.id == '00000000-0000-0000-0000-000000000000');

    view.isActive.label = 'Is Active';
    view.isActive.disabled = (view.state.user.id == '00000000-0000-0000-0000-000000000000');
    
    view.isLogin.label = 'Can Log In';
    view.isLogin.disabled = (view.state.user.id == '00000000-0000-0000-0000-000000000000');
}

export function refresh (view, appState) {
    postMessage('AddBreadcrumb', { breadcrumbs: [
        { id: 'users', caption:'Users', navigateTo: '/app/users' },
        { id: 'user', caption:'User' }
    ]})
    postMessage('RetrieveRoles', {
        query: { 
            fields: ['id', 'name'],
            conditions: [],
            orderBy: 'name',
            order: 'ASC',
            limit: 25
        }
    })
    onRefreshUser(view, appState);
}

// ------------------------ VIEW EVENT HANDLERS -----------------------

function onNavigateBack () {
    navigateTo('/app/users');
}

function onRefreshUser (view) {
    postMessage('RetrieveUser', { id: view.state.user.id });
}

function onSaveChanges (view) {
    if (validateRequiredFields(view, RequiredFields)) {
        for (const field in view.state.user) if (view[field]) view.state.user[field] = view[field].value;
        postMessage('UpdateUser', { user: view.state.user });
    }
}

function onDeleteUser (view) {
    view.confirm.open({
        title: 'Confirm Delete',
        message: `Are you sure that you would like to delete the user ${view.state.user.firstName} ${view.state.user.lastName}?`,
        onYes: { subject: 'DeleteUserConfirmed', data: {} }
    })
}

// ---------------------- MESSAGE EVENT HANDLERS ----------------------

function onUserRetrieved (view, data) {
    view.state.user = data.user;
    for (const field in view.state.user) if (view[field]) view[field].value = view.state.user[field];
    validateRequiredFields(view, RequiredFields);
    postMessage('SetUsersHeader', { header: `${view.state.user.firstName} ${view.state.user.lastName}` });
}

function onUserUpdated (view, data) {
    onUserRetrieved(view, data);
    view.notification.show({
        message: 'Changes saved.',
        timeout: 4000
    })
}

function onUserModified (view) {
    view.notification.show({
        message: 'This user has been updated by another user.',
        timeout: 4000,
        actionHandler: () => { onRefreshUser(view) },
        actionText: 'Refresh'        
    })
}

function onUserNotValid (view, data) {
    for (const field in data.errors) view[field].message = data.errors[field];
    view.notification.show({
        message: 'Please correct the specified information.',
        timeout: 4000
    })
}

function onDeleteUserConfirmed (view) {
    postMessage('DeleteUser', { id: view.state.user.id });
}

function onUserDeleted () {
    onNavigateBack();
}

function onRolesRetrieved (view, data) {
    view.roleId.options = data.query.records;
}
