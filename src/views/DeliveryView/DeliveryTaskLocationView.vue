<template>
    <ion-page>
        <ion-header v-if="$route.path == '/delivery/tasks/taskdetails/location'">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button defaultHref="/customer/dashboard/location"></ion-back-button>
                </ion-buttons>                
            </ion-toolbar>
            <ion-title>Customer Location</ion-title>
        </ion-header>

        <ion-content v-if="$route.path == '/delivery/tasks/taskdetails/location'">
            <MapComp
                hideForm="true"
                rerender="true"
                @currentCoors="e=>{currentCoors = e;fetchDistance();}"
                v-if="$route.path == '/delivery/tasks/taskdetails/location'"

                :pinPickupCoorsLong="task_info.customer_location_coors_long"
                :pinPickupCoorsLat="task_info.customer_location_coors_lat"
            ></MapComp>

            <div class="modalCont" v-if="task_finish">
                <div class="modalBox">
                    <span>We have sent a verification code to your current customer. Please kindly ask for the code and enter the code below</span>
                    <ion-input v-model="vercode" placeholder="6-digit code"></ion-input>
                    <ion-button expand="block" @click="submitCode">Start Trip</ion-button>
                </div>
            </div>

            <div class="task_info">
                <div class="col2">
                    <span>Customer Name</span>
                    <span>{{task_info.user_name}}</span>
                    <span>Customer ID</span>
                    <span>{{task_info.user_id}}</span>
                    <span>Request ID</span>
                    <span>{{task_info.id}}</span>
                </div>
                <div class="col2 breakdown">
                    <span>Distance Fee</span>
                    <span>${{feeComputation[1]}}</span>
                    <span>Booking Fee</span>
                    <span>${{feeComputation[2]}}</span>
                    <span>VAT</span>
                    <span>${{feeComputation[3]}}</span>
                    <span>Total</span>
                    <span>${{feeComputation[0]}}</span>
                </div>
                <div class="col2">
                    <ion-button router-link="/delivery/tasks/taskdetails">Task Details</ion-button>
                    <ion-button router-link="/delivery/tasks/taskdetails/location/chat">Chat</ion-button>
                </div>
                <ion-button @click="arrived" expand="block" class="finishBook">Start Trip</ion-button>
            </div>
        </ion-content>
    </ion-page>
</template>

<script>
import {IonButton, IonPage, IonContent,IonInput } from '@ionic/vue';
import{local,openToast,axiosReq,lStore} from '@/functions.js';
import MapComp from '@/views/MapComp.vue';
import {db} from '@/firebase';
import {set,ref,get} from 'firebase/database';


// Website address
// https://account.mapbox.com
// username: speedyrepair
// password: TGP9!J9n^MYm#Tx

// username: dev
// password: F77GBCmu2cvL8RF

// username: design
// password: 3PhmQScz3JFbAFH

// username: tester
// password: yyi4HgHLeTYi7mD

export default {
    name: "MapBox",
    components: {
        IonButton,
        IonPage,
        IonContent,
        IonInput,
        MapComp
    },
    data() {
        return {
            task_info: local.getObject('accepted_task'),
            task_finish: false,
            vercode: '',
            feeComputation:[0,0,0,0],
            km:0,
            location:{},
            currentCoors:[]
        }
    },
    methods: {
        arrived(){
            this.task_finish = true;
            let verif = Math.floor(Math.random() * 899999) + 100000;
            set(ref(db,'/finish-notifs/'+local.getObject('accepted_task').id),verif);
        },
        submitCode(){
            get(ref(db,'/finish-notifs/'+local.getObject('accepted_task').id)).then(snapshot=>{
                if(!snapshot.exists()) return;
                console.log(snapshot.val() + ', ' + this.vercode);
                if(this.vercode != snapshot.val()) openToast('Verification code is incorrect!','danger');
                else{
                    set(ref(db,'/finish-notifs/'+local.getObject('accepted_task').id),'finished');
                    this.$router.replace('/delivery/trip');
                }
            });
        },
        fetchDistance(){
            const token = 'pk.eyJ1Ijoic3BlZWR5cmVwYWlyIiwiYSI6ImNsNWg4cGlzaDA3NTYzZHFxdm1iMTJ2cWQifQ.j_XBhRHLg-CcGzah7uepMA';
            this.location.start_long = local.getObject('accepted_task').customer_location_coors_long;
            this.location.start_lat = local.getObject('accepted_task').customer_location_coors_lat;

            if(this.task_info.service_type == 'Ride Sharer' || this.task_info.service_type == 'Delivery'){
                this.location.end_long = this.task_info.drop_location_coors_long;
                this.location.end_lat = this.task_info.drop_location_coors_lat;
            }else{
                this.location.end_long = this.currentCoors.long;
                this.location.end_lat = this.currentCoors.lat;
            }
            
            axiosReq({   
                method:'get',
                url:`https://api.mapbox.com/directions/v5/mapbox/driving/${this.location.start_long},${this.location.start_lat};${this.location.end_long},${this.location.end_lat}?steps=true&geometries=geojson&access_token=${token}`,
            }).then(res=>{
                this.km = (res.data.routes[0].distance / 1000).toFixed(1); // convert meters to kilometers
                this.mins = Math.floor(res.data.routes[0].duration / 60);
                
                let configs = {};
                lStore.get('config').forEach(el=> {
                    configs[el.config_field] = el.config_value;
                });
                
                const baseFee = parseFloat(configs.fee_delivery_base_charge);
                const appChargeRate = parseFloat(configs.fee_delivery_app_charge);
                const vat = parseFloat(configs.fee_vat_charge);
                const d = parseFloat(configs.fee_delivery_distance_charge)
                let totalFee = (this.km < 6) ? baseFee: baseFee + ((this.km-5) * d);
                const distanceFee = totalFee;
                const bookFee = (totalFee * appChargeRate);
                const vatFee = ((totalFee + bookFee) * vat);
                totalFee = totalFee + bookFee + vatFee;
                this.feeComputation = [
                    totalFee.toFixed(2),
                    distanceFee.toFixed(2),
                    bookFee.toFixed(2),
                    vatFee.toFixed(2)
                ];
            });
        }
    },
    mounted(){
        this.task_info = local.getObject('accepted_task');
        local.set('chat_id',this.task_info.id);
    }, 

    
};
</script>


<style scoped>
ion-content{--ion-background-color:#222;border-radius:0;overflow:scroll;--color:#fff;height: calc(100vh - 170px);}

ion-card.parent {
    min-height: auto;
    height: calc(100% - 176px);
}

ion-back-button{
    color:#fff
}


ion-header{
    background:#b7160b;
    color:#fff;
}
ion-toolbar{
    --background:#b7160b;
}

ion-title{
    text-align: center;
    padding: 20px;
}


ion-card {
    position: relative;
    width: 100%;
    height: 100%;
    margin: auto;
    background: none;
    border-radius: 0;
    overflow: visible;
}

ion-text {
    display: block;
    text-align: center;
}

ion-text h2 {
    margin: 0 auto 15px;
}

.map-form {
	position: relative;
    left: 0;
    right: 0;
    margin: auto;
    min-height: 170px;
}

.map-form {
	position: absolute;
    bottom: 0;
    width: 100%;
    height: auto;
    padding: 15px !important;
    color: #515151;
    margin: auto;
    z-index: 11;
    transition: all 500ms ease-in-out;
    background: #fff;
}

.map-form.active {
    padding: 0 15px 100% !important;
    background: #fff;
    overflow: hidden;
    transform: none;
}

.close {
    display: none;
	justify-content: center;
	align-items: center;
}

.map-form.active .close {
    display: flex;
    width: 100%;
    justify-content: flex-end;
    padding: 15px 10px;
}

.map-form.active .close span ion-icon {
    position: static;
    transform: none;
}

.modalCont{position: fixed;z-index: 2000;width: 100vw;height: 100vh;background: rgb(0,0,0,0.5);top:0;left:0;display: flex;justify-content: center;align-items: center;}
.modalBox{background:#fff;width: 90%;padding: 20px;max-width: 450px;border-radius: 20px;color:#222;}
.modalBox ion-input{background: #eee;text-align: center;border:1px solid #ccc;margin: 20px auto 0;border-radius: 20px;font-weight: 700;transition: 0.4s;}
.modalBox ion-input:focus-within{background: #fff;}
.breakdown{margin: 20px 0;padding: 20px 0;border-top: 1px solid #fff;border-bottom: 1px solid #fff;}
.map-form.active #geocoder {
    width: 100%;
    margin: 0 auto;
}

#geocoder1 {
    position: relative;
    background-color: #fff;
    border-bottom: 1px solid rgb(235, 235, 235);
    z-index: 123;
}

#geocoder2 {
    position: relative;
    background-color: #fff;
}

ion-content p{
    padding: 20px;
    margin: 15px 0 0;
}

.finishBook{
    margin:20px 0;
}

ion-icon {
    position: absolute;
    top: 50%;
    right: 10px;
    z-index: 12;
    width: 25px;
    height: 25px;
    margin: 0;
    transform: translateY(-50%);
}

ion-icon {
    --border-radius: 0;
    --background: none;
    /* --background: #b7160b; */
    --background-activated: none;
    --ripple-color: none;
    --box-shadow: none;
    color: #b7160b;
}

#geocoder2 ion-icon {
    color: #333;
}

#geocoder2 ion-icon:hover {
    cursor: unset;
}

ion-icon:hover {
    color: #791c18;
    cursor: pointer;
}

ion-icon:active {
    color: #333;
}

ion-input a {
	position: absolute;
	left: 15px;
	font-size: 20px;
	color: #b7160b;
}

ion-button {
	margin: 5px 2px 0;
	height: 2.5em;
}

.travel-info {
	display: flex;
	flex-flow: row wrap;
	justify-content: space-between;
    align-items: center;
	position: absolute;
	bottom: 100%;
	width: 100%;
	left: 0;
	right: 0;
	margin: 0;
	font-size: 1em;
	background: #b7160b;
	color: #fff;
	text-align: center;
	line-height: 100%;
    transition: all 500ms ease-in-out;
    /* border-radius: 20px 20px 0 0; */
}

.task_info{
    padding: 40px 20px;
    background: #222;
}

ion-button{
    --border-radius: 20px;
}

.col2{display: flex;flex-wrap: wrap;gap:10px;justify-content: space-between;}
.col2 >*:nth-of-type(odd){font-weight: 700}
.col2 > *{width:47%}

.travel-info h2 {
    font-size: 1em;
    line-height: 3;
    margin: 0;
    width: 50%;
    text-align: center;
    display: flex;
	flex-flow: row wrap;
	justify-content: center;
    align-items: center;
}

.travel-info h2 ion-icon {
    position: static;
    transform: none;
    color: #fff;
    width: 20px;
    height: 20px;
    margin-right: 10px;
}

ion-button{--background: #b7170b;color:#fff;--padding-top:20px;--padding-bottom:20px}

</style>