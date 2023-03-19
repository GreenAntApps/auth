import { navigateTo, postMessage } from '../../shared/client/lib/jsphere.js';
import { validateRequiredFields } from '../../shared/client/lib/utils.js';

import './users.service.js';
import './roles.service.js';

const RequiredFields = ['firstName', 'lastName', 'email', 'roleId'];

// ------------------------ VIEW INITILIZATION ------------------------

export async function init (component) {
    const view = await component.useViewTemplate('/auth/client/users.create.html');

    view.state.user = { firstName: '', lastName: '', email: '', username: '', password: '', roleId: '', isActive: false, isLogin: false };

    // Register message event listeners
    view.registerMessageListener('UserCreated', (data) => { onUserCreated(view, data) });
    view.registerMessageListener('UserNotValid', (data) => { onUserNotValid(view, data) });
    view.registerMessageListener('RolesRetrieved', (data) => { onRolesRetrieved(view, data) });

    // Configure context menu links
    view.backToUsers.value = 'Back To Users';
    view.backToUsers.onclick = () => { onNavigateBack() };

    view.saveChanges.value = 'Save Changes';
    view.saveChanges.onclick = () => { onSaveChanges(view) };
    
    // Configure form fields
    view.firstName.label = 'First Name';
    
    view.lastName.label = 'Last Name';
    
    view.email.label = 'Email';

    view.username.label = 'Username';

    view.password.label = 'Password';
    view.password.type = 'password';
    view.password.value = '';
    
    view.confirmPassword.label = 'Confirm Password';
    view.confirmPassword.type = 'password'
    
    view.roleId.label = 'Role';
    view.roleId.map = { text: 'name', value: 'id' };

    view.isActive.label = 'Is Active';
    
    view.isLogin.label = 'Can Log In';
}

export function refresh () {
    postMessage('SetUsersHeader', { header: 'New User' });
    postMessage('AddBreadcrumb', { breadcrumbs: [
        { id: 'users', caption:'Users', navigateTo: '/app/users' },
        { id: 'user', caption:'User', navigateTo: '/app/users/user' }
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
}

// ------------------------ VIEW EVENT HANDLERS -----------------------

function onNavigateBack () {
    navigateTo('/app/users');
}

function onSaveChanges (view) {
    if (validateRequiredFields(view, RequiredFields)) {
        for (const field in view.state.user) if (view[field]) view.state.user[field] = view[field].value;
        postMessage('CreateUser', { user: view.state.user });
    }
}

// ---------------------- MESSAGE EVENT HANDLERS ----------------------

function onUserCreated (view, data) {
    navigateTo(`/app/users/user/${data.user.id}`);
}

function onUserNotValid (view, data) {
    for (const field in data.errors) view[field].message = data.errors[field];
    view.notification.show({
        message: 'Please correct the specified information.',
        timeout: 4000
    })
}

function onRolesRetrieved (view, data) {
    view.roleId.options = data.query.records;
}
