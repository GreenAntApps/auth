import { postMessage, registerMessageListener, request } from '../../shared/client/lib/jsphere.js';

registerMessageListener('CreateUserSession', onCreateUserSession);
registerMessageListener('DeleteUserSession', onDeleteUserSession);

async function onCreateUserSession(data) {
    try {
        const response = await request({ method:'POST', url:'/auth/server/usersession', data });
        const message = await response.json();
        postMessage(message.subject, message.data);
    }
    catch (e) {
        console.log(e);
    }    
}

async function onDeleteUserSession() {
    try {
        const response = await request({ method:'DELETE', url:'/auth/server/usersession' });
        const message = await response.json();
        postMessage(message.subject, message.data);
    }
    catch (e) {
        console.log(e);
    }    
}
