import { postMessage, registerMessageListener, request } from '../../shared/client/lib/jsphere.js';

registerMessageListener('CreateRole', onCreateRole);
registerMessageListener('RetrieveRole', onRetrieveRole);
registerMessageListener('RetrieveRoles', onRetrieveRoles);
registerMessageListener('RetrieveRolesList', onRetrieveRolesList);
registerMessageListener('UpdateRole', onUpdateRole);
registerMessageListener('DeleteRole', onDeleteRole);

async function onCreateRole(data) {
    try {
        const response = await request({ method:'POST', url:'/api/role', data: data.role });
        const message = await response.json();
        postMessage(message.subject, message.data);
    }
    catch (e) {
        console.log(e);
    }    
}

async function onRetrieveRole(data) {
    try {
        const response = await request({ method:'GET', url:`/api/role/${data.id}` });
        const message = await response.json();
        postMessage(message.subject, message.data);
    }
    catch (e) {
        console.log(e);
    }    
}

async function onRetrieveRoles(data) {
    try {
        const response = await request({ method:'POST', url:'/api/roles', data: data.query });
        const message = await response.json();
        postMessage(message.subject, message.data);
    }
    catch (e) {
        console.log(e);
    }    
}

async function onRetrieveRolesList() {
    try {
        const data = { query: { conditions:[], orderBy:'name', order:'ASC' } };
        const response = await request({ method:'POST', url:'/api/roles', data: data.query });
        const message = await response.json();
        const subject = (message.subject == 'RolesRetrieved') ? 'RolesListRetrieved' : message.subject;
        postMessage(subject, message.data);
    }
    catch (e) {
        console.log(e);
    }    
}

async function onUpdateRole(data) {
    try {
        const response = await request({ method:'PUT', url:'/api/role', data: data.role });
        const message = await response.json();
        postMessage(message.subject, message.data);
    }
    catch (e) {
        console.log(e);
    }    
}

async function onDeleteRole(data) {
    try {
        const response = await request({ method:'DELETE', url:`/api/role/${data.id}` });
        const message = await response.json();
        postMessage(message.subject, message.data);
    }
    catch (e) {
        console.log(e);
    }    
}
