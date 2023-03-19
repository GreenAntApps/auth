import { postMessage } from '../../shared/client/lib/jsphere.js';
import { validateRequiredFields } from '../../shared/client/lib/utils.js';

import './sso.service.js';

const RequiredFields = ['ssoEnabled'];

// ------------------------ VIEW INITILIZATION ------------------------

export async function init (component, appState) {
    const view = await component.useViewTemplate('/auth/client/sso.edit.html');
    
    view.state.authConfig = {};

    // Register message event listeners
    view.registerMessageListener('AuthConfigRetrieved', (data) => { onAuthConfigRetrieved(view, data) });
    view.registerMessageListener('AuthConfigUpdated', (data) => { onAuthConfigUpdated(view, data) });
    view.registerMessageListener('AuthConfigModified', (data) => { onAuthConfigModified(view, data) });
    view.registerMessageListener('AuthConfigNotValid', (data) => { onAuthConfigNotValid(view, data) });

    view.header.value = 'Single Sign-On';
    view.usersBreadcrumbs.value = [{ id: 'sso', caption:'SSO' }];

    // Configure context menu links
    view.refresh.value = 'Refresh';
    view.refresh.onclick = () => { onRefreshAuthConfig(view, appState) };

    view.saveChanges.value = 'Save Changes';
    view.saveChanges.onclick = () => { onSaveChanges(view) };

    // Configure form fields
    view.ssoEnabled.label = 'Enable Single Sign-On';
    view.ssoEnabled.options = [
        { text: 'Yes', value: true },
        { text: 'No', value: false }
    ]

    view.ssoIdentityProvider.label = 'Identify Provider';
    
    view.ssoRequestUrl.label = 'Request URL';
}

export function refresh () {
    onRefreshAuthConfig();
}

// ------------------------ VIEW EVENT HANDLERS -----------------------

function onRefreshAuthConfig () {
    postMessage('RetrieveAuthConfig', {});
}

function onSaveChanges (view) {
    if (validateRequiredFields(view, RequiredFields)) {
        for (const field in view.state.authConfig) {
            if (view[field]) view.state.authConfig[field] = view[field].value;
        }
        postMessage('UpdateAuthConfig', { authConfig: view.state.authConfig });
    }
}

// ---------------------- MESSAGE EVENT HANDLERS ----------------------

function onAuthConfigRetrieved (view, data) {
    view.state.authConfig = data.authConfig;
    for (const field in view.state.authConfig) if (view[field]) view[field].value = view.state.authConfig[field];
    validateRequiredFields(view, RequiredFields);
}

function onAuthConfigUpdated (view, data) {
    onAuthConfigRetrieved(view, data);
    view.notification.show({
        message: 'Changes saved.',
        timeout: 4000
    })
}

function onAuthConfigModified (view) {
    view.notification.show({
        message: 'This configuration has been updated by another user.',
        timeout: 4000,
        actionHandler: () => { onRefreshAuthConfig(view) },
        actionText: 'Refresh'        
    })
}

function onAuthConfigNotValid (view, data) {
    for (const field in data.errors) view[field].message = data.errors[field];
    view.notification.show({
        message: 'Please correct the specified information.',
        timeout: 4000
    })
}
