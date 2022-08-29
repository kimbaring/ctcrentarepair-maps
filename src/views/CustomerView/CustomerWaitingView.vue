<template>
    <ion-page class="locationPage" >
        <ion-header>
            <ion-title>Waiting for someone to accept your request</ion-title>
        </ion-header>

        <ion-content>
            <MapComp
            hideForm="true"
            rerender="true"
            v-if="$route.path == '/customer/waiting'"
            
            :pinPickupCoorsLong="pickupCoors[0]"
            :pinPickupCoorsLat="pickupCoors[1]"
            ></MapComp>
        </ion-content>
    </ion-page>
</template>

<script>
// import { IonCard, IonCardHeader, IonButton } from '@ionic/vue';
// import { toFormData, send } from '../functions.js';
import{local} from '@/functions.js';
import {db} from '@/firebase'
import {ref, onValue } from 'firebase/database';
import {sendNotification} from '@/functions-custom';
import MapComp from '@/views/MapComp';
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
        MapComp
    },
    data() {
        return {
            pickupCoors: [],
        }
    },
    mounted(){
        local.set('task_linear_path', '/customer/waiting');
        local.set('pageLoading', 0);    
        this.pickupCoors = [local.getObject('customer_task').customer_location_coors_long,local.getObject('customer_task').customer_location_coors_lat];
        console.log(this.pickupCoors);
        onValue(ref(db,`/pending_tasks/${local.getObject('customer_task').task_id}`),snapshot=>{
            if(snapshot.exists()){
                let snap = snapshot.val();
                

                if(snap.status > 1 && snap.emp_location_coors_long != null && local.getObject('customer_task').emp_location_coors_long == null){    
                    sendNotification(
                        'Your request has been accepted!',
                        `Please wait patiently for your ${local.getObject('customer_task').service_type} to arrive...`,
                        '/notifications');
                }

                local.setInObject('customer_task','accepted_by_id', snap.accepted_by_id);
                local.setInObject('customer_task','emp_location_coors_lat', snap.emp_location_coors_lat);
                local.setInObject('customer_task','emp_location_coors_long', snap.emp_location_coors_long);

                if(local.getObject('customer_task').emp_location_coors_long != null) this.$router.replace('/customer/booked');

                
                
                
            }
        })

        
        // mock-up accept

        // openToast('Simulating accept function in 5s with 20 W 34th St., New York, NY 10001, USA as mock up location','success');
        // setTimeout(() => {
        //     set(ref(db,'/pending_tasks/'+local.getObject('customer_task').task_id+'/status'),2);
        //     set(ref(db,'/pending_tasks/'+local.getObject('customer_task').task_id+'/emp_location_coors_long'),73.9857);
        //     set(ref(db,'/pending_tasks/'+local.getObject('customer_task').task_id+'/emp_location_coors_lat'),40.7484);
        //     set(ref(db,'/pending_tasks/'+local.getObject('customer_task').task_id+'/accepted_by_id'),local.get('user_id'));
        // }, 5000);

        // // openToast('Simulating accept function in 5s with Lapu-Lapu Airport Rd, Lapu-Lapu City, 6016 Cebu, Philippines as mock up location','success');
        // // setTimeout(() => {
        // //     set(ref(db,'/pending_tasks/'+local.getObject('customer_task').task_id+'/status'),2);
        // //     set(ref(db,'/pending_tasks/'+local.getObject('customer_task').task_id+'/emp_location_coors_long'),123.9802);
        // //     set(ref(db,'/pending_tasks/'+local.getObject('customer_task').task_id+'/emp_location_coors_lat'),10.3107);
        // //     set(ref(db,'/pending_tasks/'+local.getObject('customer_task').task_id+'/accepted_by_id'),local.get('user_id'));
        // // }, 5000);

        
    }

    
};
</script>


<style scoped>
.ion-page{min-height: 600px;}
ion-content{--ion-background-color:#222;border-radius:20px 20px 0 0;overflow:hidden;--color:#fff}

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