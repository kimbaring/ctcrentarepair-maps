<template>
<ion-page>
    <ion-content :fullscreen="true">
        <div class="mainlogo">
            <img src="../../img/headerlogo.png"/>
        </div>
        <p>Welcome, John Doe!</p>
        <h3>How Can We Help You Today?</h3>
        <div class="serv">
            <ion-card>
                    <ion-card-content>
                        <div class="services">
                        <ion-card @click="startService('Technician')">
                            <ion-card-content>
                                <ion-icon :icon="constructOutline"></ion-icon>
                                Technician
                            </ion-card-content>
                        </ion-card>
                        <ion-card @click="startService('Towing')">
                            <ion-card-content>
                                <img src="../../img/towwhite.png">
                                Towing
                            </ion-card-content>
                        </ion-card>
                        <ion-card @click="startService('Ride Sharer')">
                            <ion-card-content>
                                <ion-icon :icon="carSportOutline"></ion-icon>
                                Ride Sharer
                            </ion-card-content>
                        </ion-card>
                        <ion-card @click="startService('Delivery')">
                            <ion-card-content>
                                <ion-icon :icon="cubeOutline"></ion-icon>
                                Delivery
                            </ion-card-content>
                        </ion-card>
                        </div>
                    </ion-card-content>
            </ion-card>
        </div>
        <div class="announcements">
            <announcements-comp></announcements-comp>
        </div>
        <div class="ongoingtask" v-if="task != null" >
            <div class="head">
                <h3 @click="gotoTask"><span>Ongoing Task</span>{{ task.service_type }} Services<small>Tap here to continue. <q v-if="preUploadTask.includes(taskPath())">Tap the (X) icon to cancel.</q></small></h3>
                <ion-button @click="clearTask" v-if="preUploadTask.includes(taskPath())"><ion-icon :icon="closeOutline"></ion-icon></ion-button>
            </div>
            <ion-progress-bar style="position: relative; top: 10px;" type="indeterminate"></ion-progress-bar>
        </div>
        
    </ion-content>
</ion-page>
</template>


<script>
import { 
    IonPage,
    IonContent,
    IonCard,
    IonCardContent,
    IonProgressBar,
    IonIcon
} from '@ionic/vue';
import { 
    bookOutline,
    timeOutline,
    personCircleOutline,
    logOutOutline,
    carSportOutline,
    constructOutline,
    closeOutline,
    cubeOutline
} from 'ionicons/icons';
import { local, openToast, axiosReq } from '@/functions';
import {ref,remove,onValue,query,orderByChild,equalTo, limitToLast} from 'firebase/database';
import AnnouncementsComp from '@/views/AnnouncementsComp.vue';
import  router  from '@/router';
import {db} from '@/firebase';
import {ciapi} from '@/js/globals';

export default({
    name: "CustomerDashboard",
    components:{
        IonPage,
        IonContent,
        IonCard,
        IonProgressBar,
        IonCardContent,
        IonIcon,
        AnnouncementsComp
    },

    data(){
        return{
            //ionicons
            bookOutline,
            timeOutline,
            personCircleOutline,
            logOutOutline,
            carSportOutline,
            constructOutline,
            closeOutline,
            cubeOutline,
            //end of ionicons

            task: null,
            preUploadTask:[
                '/customer/location',
                '/customer/requestdetails',
                '/customer/waiting',
            ]
            
        }
    },
    mounted(){
        local.set('pageLoading',local.get('pageLoading') + 1); 
        if(local.get('pageLoading') == 1) {window.location.reload(); return;}
        else local.set('pageLoading', 0);

        const que = query(ref(db,'/pending_tasks'),
        orderByChild('user_id'),
        equalTo(local.get('user_id')),
        limitToLast(1));
        
        onValue(que,snapshot=>{
            if(snapshot.exists()){
                this.task = snapshot.val()[Object.keys(snapshot.val())[0]];
                local.setObject('customer_task',this.task);
                switch (this.task.status){
                    case 1: local.set('task_linear_path','/customer/waiting');break;
                    case 2: local.set('task_linear_path','/customer/booked');break;
                }
            }
        });

        if(this.task == null) this.task = local.getObject('customer_task');

    },
    methods:{
        clearTask(){
            
            if(local.get('task_linear_path') == '/customer/waiting'){
                remove(ref(db,`/pending_tasks/${local.getObject('customer_task').id}`));
                axiosReq({
                    method: 'post',
                    url: ciapi + `task/delete?task_id=${local.getObject('customer_task').id}`,
                    headers:{
                        PWAuth: local.get('user_token'),
                        PWAuthUser: local.get('user_id'),
                    }
                }).catch(()=>{
                    openToast('Something went wrong...', 'danger');
                });
            }
            remove(ref(db,`/pending_tasks/${local.getObject('customer_task').id}`));
            local.remove('customer_task');
            local.remove('task_linear_path');
            

            this.task = null;
        },
        taskPath(){
            return local.get('task_linear_path');
        },
        parseJsonString(param){
            return local.objectify(param);
        },
        gotoTask(){
            this.$router.push(local.get('task_linear_path'));
        },
        startService(service){
            if (local.getObject('customer_task') != null){

                openToast('Please wait for your current request to finish before you make another request!','danger');
                return;
            }
            local.remove('customer_task');
            local.setObject('customer_task',{service_type: service});
            router.push('/customer/location');
        }
    }
});
</script>

<style scoped>

.ongoingtask{position: fixed;bottom:0;width: 100%;padding: 20px 10px;background:#fff;box-shadow: 0 0 10px #aaa;border-radius: 20px 20px 0 0;}
.ongoingtask .head{display: flex;align-items: center;}
.ongoingtask .head h3{margin:0;text-align: left;width: 100%;color:#222;font-size: 20px;}
.ongoingtask .head h3 small{display:block;font-weight: 400;font-size: 14px;margin-top: 5px;}
.ongoingtask .head ion-button{--background:#fff;--color:#b7170b;--box-shadow: none;font-size: 20px;}



.ongoingtask span{display: block;font-size: 15px;font-weight: 400;font-style: italic;margin-bottom: 10px;}
.mainlogo{
    background: var(--ion-color-danger-contrast);
    height: 150px;
    position: relative;
    top: 0;
}
.mainlogo img{
    display: block;
    margin: 0 auto;
    padding-top: 60px;
}
.mainlogo::before {
  content: "";
  position: absolute;
  top: 150px;
  background-color: #b7170b;
  height: 50px;
  width: 25px;
  border-top-left-radius: 25px;
  box-shadow: 0 -25px 0 0 #fff; /* This is where the magic happens! */
  z-index: -1;
}
.mainlogo::after{
    content: "";
    position: absolute;
    top: 150px;
    background-color: #b7170b;
    height: 50px;
    width: 25px;
    border-top-right-radius: 25px;
    box-shadow: 0 -25px 0 0 #fff;
    right: 0;
}
ion-content{
    --ion-background-color: var(--ion-color-content);
}

ion-progress-bar{
    position: relative;
    top: 10px;
    --progress-background: #b7170b;
    --background: #fff;
    border-radius: 20px;
    margin: 10px 0 0;
}

ion-content h3{
    color: #fff;
    margin: 10px auto 30px;
    font-weight: 700;
    text-align: center;
    padding: 0 10px;
}
ion-content p{
    margin:30px 0 0;
    color:#fff;
    text-align: center;
}


.serv ion-card{
    box-shadow: none;
}
.serv ion-card-content{
    padding: 0;
}
.services{
    display: flex;
    text-align: center;
    color: #000;
    font-style: normal;
    font-weight: 400;
    font-size: 20px;
    line-height: 24px;
    flex-wrap: wrap;
    justify-content: center;
    gap:10px;
    margin: 0 0 20px;
}

.services ion-card{
    width:47%;
    padding:20px 5px;
    color:#fff;
    border:none;
    border-radius:20px;
    background: #6b0700;
    border:3px solid #6b0700;
    margin: 0;
    display: flex;
justify-content: center;
align-items: center;
}
.services ion-card-content{
    
    justify-content: center;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.services ion-card:hover{
    border:3px solid #fff;
}
.services ion-card::before{
    content:"";
    position:absolute;
    top:50%;
    left:50%;
    transform: translateX(-50%) translateY(-50%);
    width:0;
    height: 0;
    background: rgb(255,255,255,0.4);
    border-radius: 20px;
    transition: 0.4s;
}
.services ion-card:active::before{
    width: 300%;
    height: 300%;
}

.services ion-icon{
    display: block;
    text-align: center;
    font-size: 50px;
    color: #000;
    font-style: normal;
    font-weight: 400;
    line-height: 24px;
    color: #fff;
}
.services img{
    width: 69px;
    margin-bottom: 1px;
    display: block;
}

.announcements{
    background: #fff;
    min-height: calc(100vh - 411px);
    padding: 20px;
    border-radius: 30px 30px 0 0;
}
</style>
