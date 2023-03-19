import { navigateTo, postMessage, request } from '../../shared/client/lib/jsphere.js';

import './login.service.js';
import './sso.service.js';

// ------------------------ VIEW INITILIZATION ------------------------

export async function init (component, appState) {
    const view = await component.useViewTemplate('/auth/client/login.html');

    // Register message event listeners
    view.registerMessageListener('UserSessionCreated', () => { onUserSessionCreated(appState) })
    view.registerMessageListener('UserNotFound', () => { onUserNotFound(view) })
    
    // Configure form fields
    view.username.label = "Username";
    view.password.label = "Password";
    view.password.type = 'password';
    view.login.text = 'Log In';
    view.login.style = 'button.primary';
    view.login.onclick = () => {
        postMessage('CreateUserSession', { username: view.username.value, password: view.password.value })
    }
    view.ssoLogin.text = 'Single Sign-On';
    view.ssoLogin.style = 'button.secondary';
    view.ssoLogin.onclick = () => {
        navigateTo('/');
    }
    view.ssoLogin.visible = false;
}

export async function refresh (view) {
    const response = await request({ method:'GET', url:'/api/usersession' });
    if (response.status == 200) {
        const message = await response.json();
        if (message.subject == 'SSOAuthenticationRequired') view.ssoLogin.visible = true;
    }
}
    
// ---------------------- MESSAGE EVENT HANDLERS ----------------------

function onUserSessionCreated (appState) {
    if (appState.currentPath == '/login')
        navigateTo('/');
    else
        navigateTo();
}

function onUserNotFound (view) {
    view.message.value = 'An incorrect username/password was provided.';
}
