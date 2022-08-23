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

function mapsData(long,lat,callback){
    const accessToken = 'pk.eyJ1Ijoic3BlZWR5cmVwYWlyIiwiYSI6ImNsNWg4cGlzaDA3NTYzZHFxdm1iMTJ2cWQifQ.j_XBhRHLg-CcGzah7uepMA';
    return axiosReq({
        method: 'GET',
        url: `https://api.mapbox.com/geocoding/v5/mapbox.places/${long},${lat}.json?access_token=${accessToken}`,
    }).then(res=>{
        callback(res.data);
    })
}


export {
    sendNotification,
    mapsData
};