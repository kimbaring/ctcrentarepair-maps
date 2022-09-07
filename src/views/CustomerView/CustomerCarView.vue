<template>
<ion-page>
    <ion-content>
        <div class="section">
            <h3>My Car</h3>
            <ion-button class="viewbutton" expand="block" @click="$router.push('/customer/mycar/addcar')">Add Car</ion-button>
        </div>
        <div>
            <ion-card v-for="(c,i) in cars" :key="i">
                <ion-card-content>
                    <img :src="c.img">
                    <ion-card-title>
                        {{c.brand}} {{c.model}} 
                    </ion-card-title>
                    <div class="cardsection">
                        <p>Plate Number</p>
                        <p>{{c.plate_number}}</p>
                    </div>
                    {{c.more_info}}
                    <div class="col2">
                        <ion-button class="viewbutton" expand="block" :data-item="c.id" @click="viewDetails($event)">View</ion-button>
                        <ion-button class="viewbutton" expand="block" :data-item="c.id" @click="editDetails($event)">Edit</ion-button>
                    </div>
                    <!-- <ion-button class="viewbutton" expand="block">View History</ion-button> For tracing purpose sa technician -->
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
    IonCardTitle,
    IonButton
} from '@ionic/vue';
import { 
    bookOutline,
    timeOutline,
    personCircleOutline,
    logOutOutline,
} from 'ionicons/icons';
import {local,lStore} from '@/functions';

export default({
    name: "CustomerDashboard",
    components:{
        IonPage,
        IonContent,
        IonCard,
        IonCardContent,
        IonCardTitle,
        IonButton
    },

    data(){
        return{
            //ionicons
            bookOutline,
            timeOutline,
            personCircleOutline,
            logOutOutline,
            //end of ionicons

            cars:[]
            
        }
    },
    created(){
        this.loadVehicles();
        this.isNewUser = local.get('user_new');
    },
    watch:{
        $route (to){
            if(to != '/customer/mycar') return;
            this.loadVehicles();
        }
    },
    methods:{
        viewDetails(event){
            local.set('car_reference',event.target.dataset.item);
            this.$router.push('/customer/cardetails');
        },
        editDetails(event){
            local.set('car_reference',event.target.dataset.item);
            this.$router.push('/customer/mycar/editcar');
        },
        open(taskid){
            local.set('view_details',taskid);
            this.$router.push('/customer/transactionhistory/transactiondetails')
        },
        loadVehicles(){
            this.cars = lStore.get('cars');
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
    top: 50px;
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
.section ion-button{
    position: absolute;
    color: #000;
    --background: #fff;
    bottom: 15px;
    left: 25%;
    right: 25%;
}

.col2 {display: flex;gap:5px;justify-content: space-around;}
.col2 > *{width: 48%;}

ion-card img{margin: -17px -17px 20px;width: 100vw;height: 200px;object-fit: cover;max-width: unset;}
</style>


