import{axiosReq,local,removeFix} from '@/functions';
import{push} from '@/firebase';
import{ciapi} from '@/js/globals';

function sendNotification(title,description,url){
    return new Promise((resolve,reject)=>{
        axiosReq({
            method: 'post',
            url: ciapi+'users/notifications/create',
            headers:{
                PWAuth: local.get('user_token'),
                PWAuthUser: local.get('user_id')
            },
            data:{
                title: title,
                description: description,
                url: url
            }
        }).catch(err=>{
            reject(err);
        }).then(res=>{
            resolve(res);
            let notif = removeFix(res.data.notif_info,'notif_');
            push(`notifications/${notif.id}`,notif);
        });
    });
        
}

export {
    sendNotification
};