<template>
<ion-page>
    <ion-content>
        <div class="section">
            <h3>Notifications</h3>
        </div>
        <div v-if="isLoading">
            <ion-card>
                <ion-card-content>
                    <h3><ion-skeleton-text :animated="true"></ion-skeleton-text></h3>
                    <p><ion-skeleton-text :animated="true"></ion-skeleton-text></p>
                    <em><ion-skeleton-text :animated="true"></ion-skeleton-text></em>
                </ion-card-content>
            </ion-card>
            <ion-card>
                <ion-card-content>
                    <h3><ion-skeleton-text :animated="true"></ion-skeleton-text></h3>
                    <p><ion-skeleton-text :animated="true"></ion-skeleton-text></p>
                    <em><ion-skeleton-text :animated="true"></ion-skeleton-text></em>
                </ion-card-content>
            </ion-card>
            <ion-card>
                <ion-card-content>
                    <h3><ion-skeleton-text :animated="true"></ion-skeleton-text></h3>
                    <p><ion-skeleton-text :animated="true"></ion-skeleton-text></p>
                    <em><ion-skeleton-text :animated="true"></ion-skeleton-text></em>
                </ion-card-content>
            </ion-card>
            <ion-card>
                <ion-card-content>
                    <h3><ion-skeleton-text :animated="true"></ion-skeleton-text></h3>
                    <p><ion-skeleton-text :animated="true"></ion-skeleton-text></p>
                    <em><ion-skeleton-text :animated="true"></ion-skeleton-text></em>
                </ion-card-content>
            </ion-card>
            <ion-card>
                <ion-card-content>
                    <h3><ion-skeleton-text :animated="true"></ion-skeleton-text></h3>
                    <p><ion-skeleton-text :animated="true"></ion-skeleton-text></p>
                    <em><ion-skeleton-text :animated="true"></ion-skeleton-text></em>
                </ion-card-content>
            </ion-card>
            <ion-card>
                <ion-card-content>
                    <h3><ion-skeleton-text :animated="true"></ion-skeleton-text></h3>
                    <p><ion-skeleton-text :animated="true"></ion-skeleton-text></p>
                    <em><ion-skeleton-text :animated="true"></ion-skeleton-text></em>
                </ion-card-content>
            </ion-card>
        </div>
        <div v-if="!isLoading">
            <ion-card v-for="(n,i) in notifications" :key="i">
                <ion-card-content :class="(n.is_read == 1) ? 'notifRead': ''" :data-key="n.id" @click="readNotif(i)">
                    <h3>{{n.title}}</h3>
                    <p>{{n.description}}</p>
                    <em>{{n.dateString}}</em>
                </ion-card-content>
            </ion-card>
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
    IonSkeletonText
} from '@ionic/vue';
import { 
    bookOutline,
    timeOutline,
    personCircleOutline,
    logOutOutline,
} from 'ionicons/icons';

import { getDatabase,ref, query, orderByChild, equalTo, onValue, remove  } from 'firebase/database';
import {local,dateFormat, openToast,axiosReq,removeFix} from '@/functions';
import {db} from '@/firebase';
import {ciapi} from '@/js/globals';

export default({
    name: "CustomerDashboard",
    components:{
        IonPage,
        IonContent,
        IonCard,
        IonCardContent,
        IonSkeletonText
    },

    data(){
        return{
            //ionicons
            bookOutline,
            timeOutline,
            personCircleOutline,
            logOutOutline,
            //end of ionicons

            notifications:[],
            originLoad: false,
            isLoading: true
        }
    },
    created(){
        const db = getDatabase();
        const que = query(ref(db,'/notifications'),orderByChild('user_id'), equalTo(local.get('user_id')));

        onValue(que, ()=>{
            if(this.originLoad){
                this.originLoad = false;
                return;
            }

            axiosReq({
                method: 'post',
                url: ciapi + `users/notifications?notif_user_id=${local.get('user_id')}&_batch=true`,
                headers:{
                    PWAuth: local.get('user_token'),
                    PWAuthUser: local.get('user_id'),
                }
            }).catch(()=>{
                openToast('Something went wrong...', 'danger');
            }).then(res=>{
                let result = [];
                this.notifications = [];
                for(let r in res.data.result){
                    result.push(removeFix(res.data.result[r],'notif_'));
                    result[result.length - 1].dateString = dateFormat('%lm %d, %y at %h:%i:%s %a',result[result.length - 1].created_at);
                }
                result.sort(function(a,b){
                    return  parseInt(b.id) - parseInt(a.id);
                });
                this.notifications = [...result];
                this.isLoading = false;
            });
            
        });


    },
    watch:{
        $route (to){
            if(!to == '/customer/transactionhistory') return;

        }
    },
    methods:{
        date(dateString){
            return dateFormat('%lm %d, %y',dateString);
        },
        
        open(taskid){
            local.set('view_details',taskid);
            this.$router.push('/customer/transactionhistory/transactiondetails')
        },
        readNotif(i){
            this.notifications[i].is_read = 1;
            this.readFromDB(this.notifications[i].id);
        },
        readFromDB(id){

            axiosReq({
                method: 'post',
                url: ciapi + `users/notifications/update?notif_id=${id}`,
                headers:{
                    PWAuth: local.get('user_token'),
                    PWAuthUser: local.get('user_id'),
                },
                data:{is_read:1}
            }).catch(()=>{
                openToast('Something went wrong...', 'danger');
            }).then(()=>{
                this.originLoad = true;
                remove(ref(db,`/notifications/${id}`));
            });
        }

    }
});
</script>

<style scoped>
ion-header{
    text-align: center;
}
.section{
    background: var(--ion-color-dark-red);
    height: 150px;
    position: relative;
}
.section h3{
    position: absolute;
    top: 70px;
    right: 0;
    left: 0;
}
.section::before {
  content: "";
  position: absolute;
  top: 150px;
  background-color: #fff;
  height: 50px;
  width: 25px;
  border-top-left-radius: 25px;
  box-shadow: 0 -25px 0 0 #b7170b; /* This is where the magic happens! */
}
.section::after{
    content: "";
    position: absolute;
    top: 150px;
    background-color: #fff;
    height: 50px;
    width: 25px;
    border-top-right-radius: 25px;
    box-shadow: 0 -25px 0 0 #b7170b;
    right: 0;
}
ion-content{
    --ion-background-color: var(--ion-color-dark-contrast);
    border-radius: 30px !important;
}
h3{
    color: #fff;
    margin: 0px 20px 70px 20px;
    text-align: center;
}
ion-card-content{
    background-color: #fff;
}
ion-card-content h3{
    margin: 0 0 10px;
    color: #222;
    font-size: 18px;
    text-align: left;
    padding-bottom: 10px;
    border-bottom: 1px solid #ccc;
    font-weight: 700;
    white-space: pre;
    overflow: hidden;
    text-overflow: ellipsis;
    position: relative;
}



ion-card-content::before{
    content: "";
    background: #555;
    position: absolute;
    width: 0;
    height: 0;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    border-radius: 50%;
    transition: 0.2s;
    opacity: 0.2;
}

ion-card-content:active::before{
   width: 200%;
   height: 200%;
}




ion-card-content p{
    white-space: pre;
    overflow: hidden;
    text-overflow: ellipsis;
}



.date{
    position: absolute;
    right: 23px;
    top: 29px;
    color: #B7160B;
}
.viewbutton{
    --background: #b7170b;
    --background-activated: var(--ion-color-hover-red);
}

h2{
    font-size: 20px;
color: #b7170b;
text-align: center;
border-bottom: 1px solid #ccc;
padding-bottom: 13px;
width: 90%;
margin: 20px auto 0;
}

.notifRead{
    background: #ddd;
}

</style>
