<template>
    <ion-page>
        <ion-content v-if="$route.path == '/customer/location'">
            <h3>Pin your location</h3>
            <MapComp
                rerender="true"
                v-if="$route.path == '/customer/location'"
                
                @pickup-coors="(n)=>pickupCoors = n"
                @dropoff-coors="(n)=>{dropoffCoors = n;}"
                @current-coors="setCurrentCoors"

                :displayRoute="displayRoute"
                :hideDestination="(serviceType != 'Ride Sharer')"
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
import {local,openToast,axiosReq,removeFix} from '@/functions';
import {sendNotification} from '@/functions-custom';
import {mapsData} from '@/functions-custom';
import {ciapi} from '@/js/globals';
import {push} from '@/firebase';
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
            dropoffCoors: [],
            serviceType: local.getObject('customer_task').service_type,
            displayRoute: false
        }
    },
    watch:{
        $dropoffCoors(){
            console.log('test');    
        },
        $route(to){
            if(to.path =='/customer/location'){
                local.set('pageLoading',local.get('pageLoading') + 1);  
                if(local.get('pageLoading') == 1) {window.location.reload(); return;}
                else local.set('pageLoading', 0);
            }
        }
    },
    mounted(){
        local.set('pageLoading',local.get('pageLoading') + 1);  
        if(local.get('pageLoading') == 1) {window.location.reload(); return;}
        else local.set('pageLoading', 0);
        
        local.set('task_linear_path', '/customer/location');
    },
    setup() {
        return { locate, compass, navigateCircle, warning, close, mapOutline, timerOutline };
    },
    methods:{
        setCurrentCoors(n){
            this.setCoors = [n.long,n.lat];
        },
        submit(){
            if(this.pickupCoors.length != 2){
                openToast('Please pin your location!','danger')
                return;
            }

            mapsData(this.pickupCoors[0],this.pickupCoors[1],res=>{
                local.setInObject('customer_task','customer_location',res.features[0].place_name);
                local.setInObject('customer_task','customer_location_coors_lat',this.pickupCoors[1]);
                local.setInObject('customer_task','customer_location_coors_long',this.pickupCoors[0]);
            })

            if(this.serviceType == 'Ride Sharer'){
                if(this.dropoffCoors.length != 2) {
                    openToast('Please pin your destination!','danger')
                    return;
                }
                
                mapsData(this.dropoffCoors[0],this.dropoffCoors[1],res=>{
                    local.setInObject('customer_task','drop_location',res.features[0].place_name);
                    local.setInObject('customer_task','drop_location_coors_lat',this.dropoffCoors[1]);
                    local.setInObject('customer_task','drop_location_coors_long',this.dropoffCoors[0]);
                    local.setInObject('customer_task','user_name', `${local.getObject('user_info').firstname} ${local.getObject('user_info').lastname}`);

                    axiosReq({
                        method: 'post',
                        url: ciapi+'task/create',
                        headers:{
                            PWAuth: local.get('user_token'),
                            PWAuthUser: local.get('user_id')
                        },
                        data: local.getObject('customer_task')
                    }).catch(()=>{
                        openToast('Something went wrong', 'danger');    
                    }).then(res=>{
                        console.log(res.data);
                        if(!res.data.success) return;
                        let task = removeFix(res.data.task_info,'task_');                           
                        
                        push(`pending_tasks/${task.id}`,task);
                        openToast('Request sent!', 'success');
                        local.setInObject('customer_task','task_id',task.id);

                        sendNotification(
                        'Your request was successfully sent!',
                        `RentARepair is currently looking for ride sharers that can cater your request.`,
                        '/notification').catch(()=>{
                            openToast('Something went wrong...', 'danger');
                        }).then(()=>{
                            this.$router.push('/customer/waiting');
                        });
                    
                    });
                })

                

                return;
            }
            
            this.$router.push('/customer/requestdetails');
        }
    }
    
};
</script>


<style scoped>
.ion-page{min-height: 600px;}

ion-content{
    border-radius: 0;
    overflow:hidden;
    --color:#fff
}

#map {
    border: none;
    width: 100%;
    height: calc(100% - 156px);
    border-radius: 0;
    overflow: hidden;
}

ion-content h3{
    margin: 0;
    text-align: center;
    position: absolute;
    z-index: 200;
    background: #b7160b;
    width: max-content;
    top: 40px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px;
    border-radius: 10px;
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