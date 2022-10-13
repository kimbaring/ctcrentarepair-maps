import{axiosReq,local,removeFix,calcFlyDist} from '@/functions';
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

function priorityScore(coors1,coors2,requestDateTime){
    let dist = calcFlyDist(coors1,coors2);
    let requestTime = new Date(requestDateTime).getTime();
    let waitTime = Math.floor((Date.now() - requestTime) / 120000);
    let prioScore = 10;
    let prioScoreDist = (dist <= 5) ? Math.floor(dist) * -0.5 : -2.5 + Math.floor(dist - 5) * -1;
    let prioScoreWait = (waitTime <= 5) ? waitTime  * 1 : waitTime * 2;
    prioScore = prioScore + (prioScoreDist + prioScoreWait);
    /* if(prioScore > 10) prioScore = 10;
    if(prioScore < 0) prioScore = 0; */
    return prioScore;
}


export {
    sendNotification,
    mapsData,
    priorityScore
};