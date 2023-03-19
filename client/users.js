import { navigateTo } from '../../shared/client/lib/jsphere.js';

export async function init (component, appState) {
    const view = await component.useViewTemplate('/auth/client/users.html');
    view.registerMessageListener('AddBreadcrumb', (data) => { onAddBreadcrumb(view, appState, data) });
    view.registerMessageListener('SetUsersHeader', (data) => { onSetUsersHeader(view, appState, data) });
}

export function refresh (view, appState) {
    if (appState.currentPath.startsWith('/app/users/user/')) {
        view.contentPanel.use('/auth/client/users.edit.js', appState);
    }
    else if (appState.currentPath == '/app/users/user') {
        view.contentPanel.use('/auth/client/users.create.js', appState);
    }
    else if (appState.currentPath == '/app/users') {
        view.contentPanel.use('/auth/client/users.listing.js', appState);
    }
    else {
        navigateTo('/');
    }
}

function onSetUsersHeader (view, appState, data) {
    view.header.value = data.header;
}

function onAddBreadcrumb (view, appState, data) {
    view.usersBreadcrumbs.value = data.breadcrumbs;
}

// function onAddBreadcrumb (view, appState, data) {
//     view.breadcrumbs.removeAll();
//     const breadcrumbs = data.breadcrumbs;
//     for (let i = 0; i < breadcrumbs.length; i++) {
//         const breadcrumb = view.breadcrumbs.add(breadcrumbs[i].id);
//         if (i > 0) {
//             breadcrumb.separator.value = '&#183;';
//             breadcrumb.separator.visible = true;
//         }
//         breadcrumb.link.value = breadcrumbs[i].caption;
//         breadcrumb.link.onclick = () => { navigateTo(breadcrumbs[i].navigateTo) };
//         if (i < breadcrumbs.length - 1) breadcrumb.link.addClass('module-breadcrumb-link');
//     }
// }
    
