<template>
    <ion-page class="locationPage" >
        <ion-header v-if="$route.path == '/customer/dashboard/location'">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button defaultHref="/customer/dashboard/location"></ion-back-button>
                </ion-buttons>                
            </ion-toolbar>
            <ion-title>Pin your location</ion-title>
        </ion-header>

        <ion-content v-if="$route.path == '/customer/dashboard/location'">
            <MapComp
                @pickup-coors="(n)=>pickupCoors = n"
                @dropoff-coors="(n)=>dropoffCoors = n"
                @current-coors="setCurrentCoors"
                
                hideDestination="true"
                :pinPickupCoorsLong="setCoors[0]"
                :pinPickupCoorsLat="setCoors[1]"
            ></MapComp>
            <ion-button expand="block" @click="submit">
                Confirm Location
            </ion-button>
        </ion-content>
    </ion-page>
</template>

<script>
import { IonButton } from '@ionic/vue';
import { locate, compass, navigateCircle, warning, close, mapOutline, timerOutline } from 'ionicons/icons';
import MapComp from '@/views/MapComp';
import {local} from '@/functions';
import {mapsData} from '@/functions-custom'
// import { toFormData, send } from '../functions.js';

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
        MapComp
    },
    data() {
        return {
            setCoors:[],
            pickupCoors: [],
            dropoffCoors: []
        }
    },
    mounted(){
        console.log(this.setCoors);
    },
    setup() {
        return { locate, compass, navigateCircle, warning, close, mapOutline, timerOutline };
    },
    methods:{
        setCurrentCoors(n){
            this.setCoors = [n.long,n.lat]
        },
        submit(){
            console.log(this.pickupCoors);
            mapsData(this.pickupCoors[0],this.pickupCoors[1],res=>{
                local.setInObject('customer_task','customer_location',res.features[0].place_name);
                local.setInObject('customer_task','customer_location_coors_lat',this.pickupCoors[1]);
                local.setInObject('customer_task','customer_location_coors_long',this.pickupCoors[0]);

                this.$router.push('/customer/dashboard/location/cardetails');
            })
            
        }
    }
    
};
</script>


<style scoped>
.ion-page{min-height: 600px;}
ion-content{border-radius:20px 20px 0 0;overflow:hidden;--color:#fff}#map {
    border: none;
    width: 100%;
    height: calc(100% - 156px);
    border-radius: 20px 20px 0 0;
    overflow: hidden;
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
ion-button{--background: #b7170b;color:#fff;--padding-top:20px;--padding-bottom:20px; margin: 0 20px}

</style>