import { postMessage, registerMessageListener, request } from '../../shared/client/lib/jsphere.js';

registerMessageListener('RetrieveAuthConfig', onRetrieveAuthConfig);
registerMessageListener('UpdateAuthConfig', onUpdateAuthConfig);

async function onRetrieveAuthConfig() {
    try {
        const response = await request({ method:'GET', url:'/api/authconfig' });
        const message = await response.json();
        postMessage(message.subject, message.data);
    }
    catch (e) {
        console.log(e);
    }    
}

async function onUpdateAuthConfig(data) {
    try {
        const response = await request({ method:'PUT', url:'/api/authconfig', data: data.authConfig });
        const message = await response.json();
        postMessage(message.subject, message.data);
    }
    catch (e) {
        console.log(e);
    }    
}
