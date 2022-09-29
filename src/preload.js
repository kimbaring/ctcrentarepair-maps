import {lStore,axiosReq,removeFix, local} from '@/functions';
import {ciapi} from '@/js/globals';

function getAPI(endpoint,data=null,headers=null){
    return axiosReq({
        method:'get',
        url: ciapi+endpoint,
        headers: headers,
        data:data
    });
}


export function preloadEmployee(callback){

    getAPI('admin/config?_batch=true',null,{
        PWAuthUser:localStorage.getItem('user_id'),
        PWAuth:localStorage.getItem('user_token'),
    }).then(res=>{
        lStore.set('config',res.data.result);
        callback('config');
    });


    getAPI('users?user_id='+localStorage.getItem('user_id'),null,{
        PWAuthUser:localStorage.getItem('user_id'),
        PWAuth:localStorage.getItem('user_token'),
    }).then(res=>{
        lStore.set('user',removeFix(res.data.result,'user_'));
        callback('user');
    });
}



export default function preload(callback){

    getAPI('admin/config?_batch=true',null,{
        PWAuthUser:localStorage.getItem('user_id'),
        PWAuth:localStorage.getItem('user_token'),
    }).then(res=>{
        lStore.set('config',res.data.result);
        callback('config');
    });


    getAPI('users?user_id='+localStorage.getItem('user_id'),null,{
        PWAuthUser:localStorage.getItem('user_id'),
        PWAuth:localStorage.getItem('user_token'),
    }).then(res=>{
        lStore.set('user',removeFix(res.data.result,'user_'));
        callback('user');
    });

    getAPI('cars?_batch=true&car_user_id='+localStorage.getItem('user_id'),null,{
        PWAuthUser:localStorage.getItem('user_id'),
        PWAuth:localStorage.getItem('user_token'),
    }).then(res=>{
        let removedFixes = [];
        res.data.result.forEach(el=>{
            removedFixes.push(removeFix(el,'car_'))
        }) 
        lStore.set('cars',removedFixes)
        callback('cars');
    });

    getAPI('users/notifications?_batch=true&_orderby=notif__id_DESC&_limit=20&notif_user_id='
        +localStorage.getItem('user_id'),null,{
        PWAuthUser:localStorage.getItem('user_id'),
        PWAuth:localStorage.getItem('user_token'),
    }).then(res=>{
        lStore.set('notifications',removeFix(res.data.result,'user_'));
        callback('notifications');
    });

    getAPI('task?_batch=true&_orderby=task__id_DESC&_limit=10&task_user_id='
        +localStorage.getItem('user_id'),null,{
        PWAuthUser:localStorage.getItem('user_id'),
        PWAuth:localStorage.getItem('user_token'),
    }).then(res=>{
        lStore.set('tasks',removeFix(res.data.result,'user_'));
        callback('task');
    });
    
    axiosReq({
        method:'post',
        url: ciapi+'admin/announcements?_batch=true',
        headers:{
            PWAuth: local.get('user_token'),
            PWAuthUser: local.get('user_id')
        }
    }).then(res=>{
        let removedFixes = [];
        res.data.result.forEach(el=>{
            removedFixes.push(removeFix(el,'ann_'));
        });

        lStore.set('announcements',removedFixes);
        callback('ann');
    })
}

