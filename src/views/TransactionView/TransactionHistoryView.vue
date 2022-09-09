<template>
<ion-page>
    <ion-content>
        <div class="section">
            <h3>Transaction History</h3>
        </div>
        <div>
            <div class="viewMode" :class="viewMode">
                <div @click="viewMode = 'all';">All</div>
                <div @click="viewMode = 'technician';">Technician</div>
                <div @click="viewMode = 'towing';">Towing</div>
                <div @click="viewMode = 'ridesharer';">Ride Sharer</div>
            </div>
            <ion-card class="task_item" v-for="(t,i) in transactions" :key="i" v-show="t.service_type.replaceAll(' ','').toLowerCase() == viewMode || viewMode == 'all'">
                <ion-card-header>
                    <ion-card-title>
                        {{ (t.problems != null && t.problems != '' ) ? parseJsonString(t.problems)[0] : 'Ride Sharer: '+t.drop_location }}
                    </ion-card-title>
                    <ion-card-subtitle>
                        {{ t.service_type }} Service
                    </ion-card-subtitle>
                    <div class="date">{{ t.create_at }}</div>
                </ion-card-header>
                <ion-card-content>
                    <div class="cardsection">
                        <p>Address</p>
                        <p>{{ t.customer_location }}</p>
                        <p>Created</p>
                        <p>{{date(t.created_at)}}</p>
                    </div>
                    <ion-button @click="open(t.id)" class="viewbutton" expand="block">Details</ion-button>                    
                </ion-card-content>
            </ion-card>
            <div class="loadMore">
                <p>Load More</p> <ion-icon :icon="refreshCircleOutline"></ion-icon>
            </div>
            
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
    IonCardSubtitle,
    IonCardTitle,
    IonButton,
    IonIcon
} from '@ionic/vue';
import { 
    bookOutline,
    timeOutline,
    personCircleOutline,
    logOutOutline,
    refreshCircleOutline
} from 'ionicons/icons';

import { getDatabase,ref, query, orderByChild, equalTo, onValue  } from 'firebase/database';
import {local,dateFormat,axiosReq,openToast,removeFix, lStore,elementLoad, bubbleSort} from '@/functions';

export default({
    name: "CustomerDashboard",
    components:{
        IonPage,
        IonContent,
        IonCard,
        IonCardHeader,
        IonCardContent,
        IonCardSubtitle,
        IonCardTitle,
        IonButton,
        IonIcon
    },

    data(){
        return{
            //ionicons
            bookOutline,
            timeOutline,
            personCircleOutline,
            logOutOutline,
            refreshCircleOutline,   
            //end of ionicons

            transactions:[],
            viewMode:'all',
            isRequesting: false,
            prevLength:0,
            requestOffset: 0
        }
    },
    created(){
        const db = getDatabase();
        const que = query(ref(db,'/pending_tasks'),orderByChild('user_id'), equalTo(local.get('user_id')));

        let tasksLoaded = [];
        for(let i in lStore.get('tasks')){
            tasksLoaded.push(removeFix(lStore.get('tasks')[i],"task_"));
        }



        this.transactions = tasksLoaded;

        onValue(que, ()=>{
            axiosReq({
                method:"post",
                url: "https://www.medicalcouriertransportation.com/rentarepair/api/task?_orderby=task__id_DESC&_limit=10&_batch=true&task_user_id="+local.get('user_id'),
                headers:{
                    PWAuth: local.get('user_token'),
                    PWAuthUser: local.get('user_id')
                }
            }).catch(()=>{
                openToast('Something went wrong!', 'danger');
            }).then(res=>{
                if(res.data.msg == 'invalid token') openToast('Invalid token!', 'danger');
                else if(res.data.success){
                    let tasks = res.data.result;
                    this.isRequesting = false;
                    for(let i = 0; i < tasks.length; i++){
                        this.transactions[i] = removeFix(tasks[i],"task_");
                    }
                    this.transactions = bubbleSort(this.transactions,true);
                    }    
            });
        });

        elementLoad('.loadMore').then(()=>{
            const scrollCallback = ()=>{
                let a = document.querySelector('.loadMore').getBoundingClientRect().y;
                let b = document.querySelector('.childRouter').offsetHeight;

                // console.log(`${a} ${b}`);
                
                if(a < b) this.loadMore();

            }

            document.querySelector('ion-router-outlet').addEventListener("wheel",scrollCallback);
            document.querySelector('ion-router-outlet').addEventListener("touchmove ",scrollCallback);
        })
    },
    watch:{
        $route (to){
            if(!to.path == '/customer/transactionhistory') return;
        }
    },
    methods:{
        date(dateString){
            return dateFormat('%lm %d, %y',dateString);
        },
        parseJsonString(param){
            return local.objectify(param);
        },
        
        open(taskid){
            local.set('view_details',taskid);
            this.$router.push('/customer/transactionhistory/transactiondetails')
        },

        loadMore(){
            console.log(this.isRequesting);
            if(this.isRequesting) return;
            this.isRequesting = true;

            if(this.transactions.length < 10) return;
            if(this.prevLength >= this.transactions.length) return;
            this.prevLength = this.transactions.length;
            this.requestOffset += 10;
            
            axiosReq({
                method:"post",
                url: "https://www.medicalcouriertransportation.com/rentarepair/api/task?_orderby=task__id_DESC&_limit=10&_offset="+this.requestOffset+"&_batch=true&task_user_id="+local.get('user_id'),
                headers:{
                    PWAuth: local.get('user_token'),
                    PWAuthUser: local.get('user_id')
                }
            }).catch(()=>{
                openToast('Something went wrong!', 'danger');
            }).then(res=>{
                this.isRequesting = false;
                if(res.data.msg == 'invalid token') openToast('Invalid token!', 'danger');
                else if(res.data.successs){
                    let tasks = res.data.result;
                    for(let i = 0; i < tasks.length; i++){
                        this.transactions.push(removeFix(tasks[i],"task_"));
                    }
                    this.transactions = bubbleSort(this.transactions,true);
                }

                console.log(this.transactions.length);
            });

            
        }

        

    }
});
</script>

<style scoped>
.loadMore{
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    color: #555;
}


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
ion-card-title{
    color: #000;
    font-style: normal;
    font-weight: 400;
    font-size: 20px;
    line-height: 24px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
ion-card-subtitle{
    color: #000;
}
ion-card-content{
    background-color: #f4f4f4;
}
.cardsection{
    display:flex;
    flex-wrap: wrap;
}
.cardsection p{
    width: 50%;
    margin: 5px auto;
    display:flex;
    white-space: pre;
    text-overflow: ellipsis;
    overflow: hidden;
    
}
ion-card-header{
    background-color:#ededed;
    position:relative;
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

ion-button{
    --background: #b7170b;
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

.viewMode{display: flex;width:85%;margin:30px auto;font-size: 14px;flex-wrap: wrap;border: 1px solid #b7170b;border-radius: 20px;overflow: hidden;position: relative;}
.viewMode div{width: 30%;color:#b7170b;text-align: center;padding:10px 0;z-index: 2;transition: 0.4s;}
.viewMode div:first-of-type{width:10%}
.viewMode.all div:first-of-type{color:#fff;border-left: none;}
.viewMode.technician div:nth-of-type(2){color:#fff;border-left: none;}
.viewMode.towing div:nth-of-type(3){color:#fff;border-left: none;}

.viewMode.ridesharer div:nth-of-type(4){color:#fff;border-left: none;}


.loadMore ion-icon{font-size: 25px;animation-name: loaderSpin; animation-duration:  0.4s; animation-timing-function:  linear;animation-iteration-count: infinite ;}
@keyframes loaderSpin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}


.viewMode::before{position:absolute;content:"";width:10%;height: 100%;background:#b7170b;top:0;left:0;z-index: 1;transition: 0.4s;border-radius: 20px;}
.viewMode.technician::before{left:10%;z-index: 1;width:30%;}
.viewMode.towing::before{left:40%;z-index: 1;width:30%;}
.viewMode.ridesharer::before{left:70%;z-index: 1;width:30%;}
</style>
