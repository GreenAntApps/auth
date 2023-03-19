import { navigateTo } from '../../shared/client/lib/jsphere.js';

export async function init (component, appState) {
    const view = await component.useViewTemplate('/auth/client/roles.html');
    view.registerMessageListener('AddBreadcrumb', (data) => { onAddBreadcrumb(view, appState, data) });
    view.registerMessageListener('SetRolesHeader', (data) => { onSetRolesHeader(view, appState, data) });
}

export function refresh (view, appState) {
    if (appState.currentPath.startsWith('/app/roles/role/')) {
        view.contentPanel.use('/auth/client/roles.edit.js', appState);
    }
    else if (appState.currentPath == '/app/roles/role') {
        view.contentPanel.use('/auth/client/roles.create.js', appState);
    }
    else if (appState.currentPath == '/app/roles') {
        view.contentPanel.use('/auth/client/roles.listing.js', appState);
    }
    else {
        navigateTo('/');
    }
}

function onSetRolesHeader (view, appState, data) {
    view.header.value = data.header;
}

function onAddBreadcrumb (view, appState, data) {
    view.rolesBreadcrumbs.value = data.breadcrumbs;
}
