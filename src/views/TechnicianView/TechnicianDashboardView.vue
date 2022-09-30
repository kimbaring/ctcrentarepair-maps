<template>
<ion-page>
    <ion-content :fullscreen="true">
        <div class="mainlogo">
            <img src="../../img/headerlogo.png"/>
        </div>
        <div class="top">
            <div class="title">
                <h2>Welcome, <span>{{user.firstname}}!</span></h2>
                <ion-button @click="addwallet">Add Wallet</ion-button>
            </div>
            <ion-card>
                    <ion-card-content>
                        <h3 style="color:white;">Your Wallet</h3>
                        <h2><sup>$</sup>{{this.wallet}}</h2>
                    </ion-card-content>
            </ion-card>
        </div>
        <div class="announcements">
            <ion-card>
            <ion-card-header>
                <ion-card-title>Total Tasks</ion-card-title>
            </ion-card-header>
                <ion-card-content>
                    Keep close to Nature's heart... and break clear away, once in awhile, and climb a mountain or spend a week in the woods. Wash your spirit clean. 
                </ion-card-content>
            </ion-card>
            <ion-card>
                <ion-card-header>
                <ion-card-title>Task History</ion-card-title>
            </ion-card-header>
                <ion-card-content>
                    Keep close to Nature's heart... and break clear away, once in awhile, and climb a mountain or spend a week in the woods. Wash your spirit clean. 
                </ion-card-content>
            </ion-card>
        </div>

        <div class="ongoingtask" v-if="task != null" >
            <div class="head">
                <h3 @click="gotoTask"><span>Ongoing Task</span>{{ task.service_type }} Services<small>Tap here to return to tasking.</small></h3>
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
    IonCardHeader,
    IonCardContent,
    IonProgressBar,
    IonCardTitle,
    IonButton,
} from '@ionic/vue';
import { 
    bookOutline,
    timeOutline,
    personCircleOutline,
    logOutOutline,
    carSportOutline,
    constructOutline
} from 'ionicons/icons';
import { local,axiosReq } from '@/functions';
import  router  from '@/router';
import { db} from '@/firebase.js';
import {ciapi} from '@/js/globals';
import {get, child, ref,onValue,query,orderByChild,equalTo, limitToLast,remove} from 'firebase/database';

export default({
    name: "CustomerDashboard",
    components:{
        IonPage,
        IonContent,
        IonCard,
        IonCardHeader,
        IonCardContent,
        IonProgressBar,
        IonCardTitle,
        IonButton,
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
            //end of ionicons
            
            wallet: "",
            userid: local.get('user_id'),
            user: {name: ''},
            task: null
        }
    },
    created(){
        this.user = local.getObject('user_info');

        const que = query(ref(db,'/pending_tasks'),
        orderByChild('accepted_by_id'),
        equalTo(local.get('user_id')),
        limitToLast(1));
        
        onValue(que,snapshot=>{
            if(snapshot.exists()){
                this.task = snapshot.val()[Object.keys(snapshot.val())[0]];
                local.setObject('accepted_task',this.task);
                local.set('view_details',this.task.id);

                get(ref(db,'/finish-notifs/'+this.task.id)).then(snapshot=>{
                    if(!snapshot.exists()) return;
                    if(snapshot.val() == 'finished');
                    remove(ref(db,`/finish-notifs/${this.task.id}`));
                    remove(ref(db,`/pending_tasks/${this.task.id}`));
                    local.remove('accepted_task');
                    local.remove('task_linear_path');

                    axiosReq({
                        method:'post',
                        url: ciapi+'task/update?task_id='+this.task.id,
                        headers:{
                            PWAuth: local.get('user_token'),
                            PWAuthUser: local.get('user_id')
                        },
                        data:{status:3}
                    }).then(()=>this.task = null);
                });
            }
        });
    },
    updated(){
        get(child(ref(db), `userwallet/${this.userid}`)).then((snapshot) => {
                if (snapshot.exists()) {
                    this.wallet = snapshot.val().wallet;
                } else {
                    this.wallet = 0;
                }
            }).catch(()=> {
        });
    },
    methods:{
        addwallet(){
            router.push('/technician/wallet');
        },
        gotoTask(){
            this.$router.push('/technician/tasks/taskdetails/location');
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


.top > h2{
    color:#fff;
    font-size: 18px;
    font-weight: 700;
    height: 100px;
    max-width: 200px;

}
.title{
    color:#fff;
    font-size: 18px;
    font-weight: 700;
    height: 100px;
    max-width: 200px;

}

.top h2 span{
    font-size: 30px;
    display: block;
    margin-top: 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: pre;
}

.top{
    display: flex;
    padding: 40px 20px;
    justify-content: space-around;
}

.top ion-card{
    text-align: center;
    box-shadow: none;
    color:#fff;
    background:#6b0700;
    width:150px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.top ion-card-content h2{
    font-size: 30px;
    font-weight: 700;
}

.top ion-card-content h2 sup{
    font-size: 16px;
}



.announcements{
    background: #fff;
    min-height: calc(100vh - 411px);
    padding: 20px;
    border-radius: 30px 30px 0 0;
}

.announcements ion-card{
    background: #fff;
    color:#333;
    box-shadow: 0 2px 5px #aaa;
    padding:10px;
    border-radius:20px;
}
.announcements ion-title slot{
    --font-weight: 700 !important;
    color: #b7160b;
}

.title ion-button{
    --background: #fff;
    color: #000;
}


</style>
