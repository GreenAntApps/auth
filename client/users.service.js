import { postMessage, registerMessageListener, request } from '../../shared/client/lib/jsphere.js';

registerMessageListener('CreateUser', onCreateUser);
registerMessageListener('RetrieveUser', onRetrieveUser);
registerMessageListener('RetrieveUsers', onRetrieveUsers);
registerMessageListener('UpdateUser', onUpdateUser);
registerMessageListener('DeleteUser', onDeleteUser);

async function onCreateUser(data) {
    try {
        const response = await request({ method:'POST', url:'/api/user', data: data.user });
        const message = await response.json();
        postMessage(message.subject, message.data);
    }
    catch (e) {
        console.log(e);
    }    
}

async function onRetrieveUser(data) {
    try {
        const response = await request({ method:'GET', url:`/api/user/${data.id}` });
        const message = await response.json();
        postMessage(message.subject, message.data);
    }
    catch (e) {
        console.log(e);
    }    
}

async function onRetrieveUsers(data) {
    try {
        const response = await request({ method:'POST', url:'/api/users', data: data.query });
        const message = await response.json();
        postMessage(message.subject, message.data);
    }
    catch (e) {
        console.log(e);
    }    
}

async function onUpdateUser(data) {
    try {
        const response = await request({ method:'PUT', url:'/api/user', data: data.user });
        const message = await response.json();
        postMessage(message.subject, message.data);
    }
    catch (e) {
        console.log(e);
    }    
}

async function onDeleteUser(data) {
    try {
        const response = await request({ method:'DELETE', url:`/api/user/${data.id}` });
        const message = await response.json();
        postMessage(message.subject, message.data);
    }
    catch (e) {
        console.log(e);
    }    
}
