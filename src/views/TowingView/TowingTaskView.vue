<template>
<ion-page>
    <ion-content>
        <div class="section">
            <h3>Available Towing Tasks</h3>
            <img src="../../img/car.png">
        </div>
        <ion-card v-for="t in availableTasks" :key="t.id" :class="{priorityTask:(t.isPriority === true)}">
            <ion-card-header>
                <ion-card-title>
                    <img src="../../img/maintenancecheck.png">
                    <h3>{{t.user_name}}</h3>
                    <span v-if="t.isPriority === true" class="priorityMark">+${{t.priority_fee}}</span>
                </ion-card-title>
            </ion-card-header>
            <ion-card-content>
                <div class="col2">
                    <p>Location</p>
                    <p>{{t.customer_location}}</p>
                    <em>Created at {{date(t.created_at)}}</em>
                </div>
                <ion-button @click="viewDetails(t.id);$router.push('/towing/tasks/taskdetails');" class="viewbutton" expand="block">See Details</ion-button>
            </ion-card-content>
        </ion-card>
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
    IonCardTitle,
    IonButton,
} from '@ionic/vue';
import { 
    bookOutline,
    timeOutline,
    personCircleOutline,
    logOutOutline,
} from 'ionicons/icons';
import{local,dateFormat,calcFlyDist} from '@/functions';
import{priorityScore} from '@/functions-custom';
import{pull} from '@/firebase';
import{onValue,query,orderByChild,equalTo,get} from 'firebase/database';

export default({
    name: "CustomerDashboard",
    components:{
        IonPage,
        IonContent,
        IonCard,
        IonCardHeader,
        IonCardContent,
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
            //end of ionicons

            availableTasks:[]
        }
    },
    mounted(){
        const getLocation = () => new Promise(
            (resolve, reject) => {
                window.navigator.geolocation.getCurrentPosition(
                    position => {
                        const location = {
                            lat:position.coords.latitude,
                            long:position.coords.longitude
                        };
                        resolve(location); // Resolve with location. location can now be accessed in the .then method.
                    },
                    err => {
                        this.formResponse = `${err.message}`;
                        this.openToast();
                        reject(err) // Reject with err. err can now be accessed in the .catch method.
                    }
                );
            }
        );

        getLocation().then(location => {
        
            const que = query(pull('/pending_tasks'),orderByChild('status'), equalTo(1));
            onValue(que,()=>{
                get(que).then(snapshot=>{
                    this.availableTasks=[];
                    if(snapshot.exists()){
                        for(let t in snapshot.val()){
                            if(snapshot.val()[t].service_type == 'Towing') {
                                let tasker = snapshot.val()[t];
                                let x = [snapshot.val()[t].customer_location_coors_long,snapshot.val()[t].customer_location_coors_lat];
                                let l = [location.long,location.lat];
                                if(snapshot.val()[t].priority != null && calcFlyDist(x,l) <= snapshot.val()[t].priority){
                                    tasker.isPriority = true;
                                }
                                this.availableTasks.push(tasker);
                            }
                        }
                        
                        this.availableTasks.sort(function(a,b){
                            let x = [a.customer_location_coors_long,a.customer_location_coors_lat];
                            let y = [b.customer_location_coors_long,b.customer_location_coors_lat];
                            let l = [location.long,location.lat];
                            let ac = a.created_at;
                            let bc = b.created_at;
                            let bps = priorityScore(y,l,bc);
                            let aps = priorityScore(x,l,ac);
                            if(a.isPriority === true) aps+50;
                            if(b.isPriority === true) bps+50;

                            return bps - aps;
                        });
                    } 
                })
            })
        });
    },
    methods:{
        date(dateString){
            return dateFormat('%lm %d, %h:%i:%s %a',dateString);
        },
        viewDetails(id){
            local.set('view_details',id);
        }
    }
});
</script>

<style scoped>
ion-header{
    text-align: center;
}
.section{
    background: var(--ion-color-secondary-contrast);
    height: 179px;
    position: relative;
}
.section h3{
    position: absolute;
    top: 61px;
    right: 0;
    left: 0;
    color: #000;
    font-size: 25px;
}
.section::before {
  content: "";
  position: absolute;
  top: 179px;
  background-color: #b7170b;
  height: 50px;
  width: 25px;
  border-top-left-radius: 25px;
  box-shadow: 0 -25px 0 0 #fff; /* This is where the magic happens! */
}
.section::after{
    content: "";
    position: absolute;
    top: 179px;
    background-color: #b7170b;
    height: 50px;
    width: 25px;
    border-top-right-radius: 25px;
    box-shadow: 0 -25px 0 0 #fff;
    right: 0;
}
.section img{
    display: block;
    margin: 0 auto;
    padding-top: 93px;
}
ion-content{
    --ion-background-color: var(--ion-color-dark-red);
    border-radius: 30px !important;
}

ion-card{overflow: visible !important;} 

h3{
    color: #000;
    margin: 0px 20px 70px 20px;
    text-align: center;
}
h2{
    font-style: normal;
    margin: 0px 0px 0px;
    padding: 10px;
    font-weight: 400;
    font-size: 20px;
    line-height: 24px;
}
ion-card-title{
    color: #000;
    font-style: normal;
    font-weight: 400;
    font-size: 20px;
    line-height: 24px;
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    align-items: start;
    height: 57px;
}
ion-card-title h3{
    padding-top: 10px;
    font-size: 20px;
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
ion-card:first-of-type{
    margin-top: 100px;
}

ion-card .col2{display: flex;flex-wrap: wrap;}
ion-card .col2 p:first-child{width: 20%;overflow: hidden;white-space: pre;text-overflow: ellipsis;}
ion-card .col2 p{width:80%;overflow: hidden;white-space: pre;text-overflow: ellipsis}
.priorityMark{
    position: absolute;
    right: 0;
    top: -40px;
    background: #B7160B;
    padding: 5px;
    color: #fff;
    width: 70px;
    height: 46px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid #fff;
}

.priorityTask{
    animation-name: prioShake;
    animation-duration: 2s;
    animation-iteration-count: infinite;
}

ion-card:not(:first-of-type).priorityTask{margin-top: 30px;}


@keyframes prioShake{
    0%{transform:rotate(0deg);filter:brightness(100%)}
    20%{transform:rotate(0deg)}
    25%{transform:rotate(-2deg)}
    30%{transform:rotate(0deg)}
    50%{filter:brightness(110%)}
    70%{transform:rotate(0deg)}
    75%{transform:rotate(2deg)}
    80%{transform:rotate(0deg)}
    100%{transform:rotate(0deg);filter:brightness(100%)}
}



.priorityTask ion-card-header{
    background:#ffe1a8;
}

.priorityTask ion-card-content{
    background:#ffebc4;
}


</style>
