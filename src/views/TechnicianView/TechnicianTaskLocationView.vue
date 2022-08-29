<template>
    <ion-page class="locationPage" >
        <ion-header v-if="$route.path == '/technician/tasks/taskdetails/location'">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button defaultHref="/customer/dashboard/location"></ion-back-button>
                </ion-buttons>                
            </ion-toolbar>
            <ion-title>Customer Location</ion-title>
        </ion-header>

        <ion-content v-if="$route.path == '/technician/tasks/taskdetails/location'">
            <MapComp
                hideForm="true"
                rerender="true"
                v-if="$route.path == '/technician/tasks/taskdetails/location'"

                :pinPickupCoorsLong="task_info.customer_location_coors_long"
                :pinPickupCoorsLat="task_info.customer_location_coors_lat"
            ></MapComp>
            <div class="task_info">
                <div class="col2">
                    <span>Customer Name</span>
                    <span>{{task_info.user_name}}</span>
                    <span>Customer ID</span>
                    <span>{{task_info.user_id}}</span>
                    <ion-button router-link="/technician/tasks/taskdetail">Task Details</ion-button>
                    <ion-button router-link="/technician/tasks/taskdetails/location/chat">Chat</ion-button>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script>
import {IonButton, IonPage, IonContent } from '@ionic/vue';
// import { toFormData, send } from '../functions.js';
import{local} from '@/functions.js';
import MapComp from '@/views/MapComp.vue'
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
        MapComp
    },
    data() {
        return {
            task_info: local.getObject('accepted_task')
        }
    },
    methods: {

    },
    mounted(){
        this.task_info = local.getObject('accepted_task');
        local.set('chat_id',this.task_info.id);
    }, 

    
};
</script>


<style scoped>
ion-content{--ion-background-color:#222;border-radius:0;overflow:scroll;--color:#fff;height: calc(100vh - 170px);}

#map {
    border: none;
    width: 100%;
    height: 50vh;
    border-radius: 20px 20px 0 0;
    overflow: hidden;
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

.task_info{padding: 20px 20px 40px}
.col2{display: flex;flex-wrap: wrap;gap:10px}
.col2 >*:nth-of-type(odd){font-weight: 700}
.col2 > *{width:45%}

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