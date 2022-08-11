<template>
<ion-page>
    <ion-content>
        <div class="section">
            <h3>Available Diagnostic Tasks</h3>
            <img src="../../img/car.png">
        </div>
        <ion-card v-for="t in availableTasks" :key="t.id">
            <ion-card-header>
                <ion-card-title>
                    <img src="../../img/maintenancecheck.png">
                    <h3>{{t.user_name}}</h3>
                </ion-card-title>
            </ion-card-header>
            <ion-card-content>
                <div class="col2">
                    <p>Location</p>
                    <p>{{t.location_details}}</p>
                    <em>Created at {{date(t.created_at)}}</em>
                </div>
                <ion-button @click="viewDetails(t.id);$router.push('/technician/tasks/taskdetails');" class="viewbutton" expand="block">Findings</ion-button>
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
import{local,dateFormat} from '@/functions';
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
        
        const que = query(pull('/pending_tasks'),orderByChild('status'), equalTo(1));
        onValue(que,()=>{
            get(que).then(snapshot=>{
                this.availableTasks=[];
                if(snapshot.exists()) for(let t in snapshot.val()) if(snapshot.val()[t].service_type == 'Technician') this.availableTasks.push(snapshot.val()[t]);
                this.availableTasks.sort(function(a,b){
                    return  parseInt(b.id) - parseInt(a.id);
                });
            })
        })
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

</style>
