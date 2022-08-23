<template>
    <ion-page>
        <ion-content>
            
            <div class="sections">
                <h3>We Found You A {{role()}}!</h3>
                <p>Please wait for few minutes for the {{role().toLowerCase()}} to arrive...</p>
                <img src="@/img/waiting.svg" />
            </div>
            <div class="form">
                <div class="worker">
                    <img :src="emp_info.profile_img">
                    <div class="workdet">
                        <h3>{{emp_info.firstname}} {{emp_info.lastname}}</h3>
                        <h3>{{emp_info.role}}</h3>
                        <h3>ID#{{emp_info.id}}</h3>
                    </div>
                </div>
                
                <div class="services" :class="{open: viewBreakdown}">
                    <h3>Distance Fee</h3>
                    <h3>${{feeComputation()[1]}}</h3>
                    <h3>Booking Fee</h3>
                    <h3>${{feeComputation()[2]}}</h3>
                    <h3>VAT</h3>
                    <h3>${{feeComputation()[3]}}</h3>
                </div>
                <div class="services">
                    <h3>Initial Fee</h3>
                    <h3>${{feeComputation()[0]}}</h3>
                    <h3>Estimated Time</h3>
                    <h3>{{mins}} min/s</h3>
                    <h3>Distance</h3>
                    <h3>{{km}} km</h3>                    
                </div>
                <ion-button @click="viewBreakdown = !viewBreakdown">{{(viewBreakdown) ? 'Hide' : 'View'}} Breakdown</ion-button>
                
            </div>
            <div class="submit_btn">
                <ion-button @click="$router.push('/customer/dashboard/location/cardetails/booked/chat')" expand="block" size="large">Chat</ion-button>
            </div>
            
        </ion-content>
    </ion-page>
</template>


<script>
import { IonButton} from '@ionic/vue';
import { locate, compass, navigateCircle, warning, close, mapOutline, timerOutline } from 'ionicons/icons';
// import { toFormData, send } from '../functions.js';
import {local,axiosReq,removeFix} from '@/functions';
import {ciapi} from '@/js/globals';

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
       
        IonButton
    },
    data() {
        return {
            formResponse: null,
            address: '',
            focused: false,
            awesome: false,
            bookRequest: false,
            bookResponse: null,

            km: 0,
            mins: 0,
            emp_info:{
                firstname:''
            },
            viewBreakdown: false
        }
    },
    setup() {
        return { locate, compass, navigateCircle, warning, close, mapOutline, timerOutline };
    },
    methods: {
        role(){
            const service = local.getObject('customer_task').service_type;
            switch(service.toLowerCase()){
                case 'towing': return 'Tow Truck Operator';
                default: return service;
            }
        },
        feeComputation(){
            const baseFee = 75;
            const appChargeRate = 0.3;
            const vat = 0.12;
            let totalFee = (this.km < 6) ? baseFee: baseFee + ((this.km-5) * 5);
            const distanceFee = totalFee;
            const bookFee = (totalFee * appChargeRate);
            const vatFee = (totalFee * vat);
            totalFee = totalFee + bookFee + vatFee;
            return [totalFee,distanceFee,bookFee,vatFee];
        },
        async getRoute(pickup,dropoff){
            console.log(pickup);
            console.log(dropoff);
            const pickupCoords = pickup;
            const dropoffCoords = dropoff;
            const token = 'pk.eyJ1Ijoic3BlZWR5cmVwYWlyIiwiYSI6ImNsNWg4cGlzaDA3NTYzZHFxdm1iMTJ2cWQifQ.j_XBhRHLg-CcGzah7uepMA';
            axiosReq({   
                method:'get',
                url:`https://api.mapbox.com/directions/v5/mapbox/driving/${pickupCoords[0]},${pickupCoords[1]};${dropoffCoords[0]},${dropoffCoords[1]}?steps=true&geometries=geojson&access_token=${token}`,
            }).then(res=>{
                this.km = (res.data.routes[0].distance / 1000).toFixed(1); // convert meters to kilometers
                this.mins = Math.floor(res.data.routes[0].duration / 60);
            });
            

        }
    },
    mounted() {
        axiosReq({
            method:'post',
            url: ciapi+'users?user_id='+local.getObject('customer_task').accepted_by_id,
            headers:{
                PWAuth: local.get('user_token'),
                PWAuthUser: local.get('user_id')
            }
        }).then(res=>{
            
            if(res.data.success){
                this.emp_info = removeFix(res.data.result,'user_');
                console.log(local.getObject('customer_task').accepted_by_id);
            }
        });
        this.getRoute(
            [local.getObject('customer_task').customer_location_coors_long,local.getObject('customer_task').customer_location_coors_lat],
            [local.getObject('customer_task').emp_location_coors_long,local.getObject('customer_task').emp_location_coors_lat]
        );
    }

};
</script>

<style scoped>
.mapboxgl-map .mapboxgl-control-container{display: none !important;}
.map iframe{width:100%;box-sizing:border-box;height:35vh;border:none; border-radius: 10px;}
.worker img{
    width:70px;height: 70px;border-radius: 50%;object-fit: cover;
}
.worker{
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    padding-bottom: 20px;
    border-bottom: 1px solid #ececec;
    justify-content: center;
}
.services {
    padding: 0 ;
    overflow: hidden;
    display: flex;
    flex-direction: center;
    
    justify-content: center;
    flex-wrap: wrap;
    border-bottom: 1px solid #ccc;
    height:0;
    transition: 0.4s;
}

.services.open{
    height:125px;padding:20px 0
}
.services h3{
    float: left;
    color: #9b9b9b;
    width: 43%;
    margin: 5px 10px;
}
.services h3:nth-of-type(even){
    float: right;
    color: #ef867f;
}
.services h3{
    font-size: 15px;
}
.services:last-of-type{border-bottom: none;height:auto;padding:20px 0}
.form ion-button{
    font-size: 14px;
    height: 26px;
    margin: 10px 10px 30px;
    display: block;
    --background: transparent;
    --color: #555;
    --box-shadow: none;
    width: max-content;
}

.workdet{
    padding-left: 30px;
}
.workdet h3{
    font-size: 15px;
    line-height: 10px;
    color: #9b9b9b;
}
.workdet h3:first-child{
    font-size: 23px;
    color: #000;
}
.header-ios ion-toolbar:last-of-type{
    --border-width: 0px;
}
.section{
    height: 433px;
    position: relative;
    background: url('../../img/clientbackground.jpg');
    background-size: cover;
}
.section ion-title{
    padding-top: 50px;
    font-size: 19px;
    color: #fff;
    text-align: center;
}
.submit_btn{
    position: relative;
}
.submit_btn::before{
  content: "";
  position: absolute;
  top: 0;
  background-color: transparent;
  height: 50px;
  width: 25px;
  border-top-left-radius: 25px;
  box-shadow: 0 0 0 0 #fff; /* This is where the magic happens! */
  left: 0;
}


.submit_btn::after{
    content: "";
    position: absolute;
    top: 0;
    background-color: transparent;
    height: 50px;
    width: 25px;
    border-top-right-radius: 25px;
    box-shadow: 0 0 0 0 #fff;
    right: 0;
}
ion-back-button{color: #fff}
ion-header{color:#fff;}
ion-header small{text-align: center;display: block;}
ion-header::after {background-image: none;}
ion-toolbar{--background:#b7160b; color: #fff}
.form{min-height:250px; background-color: #fff; padding-top: 20px; border-radius: 20px;
margin-top: -20px;
position: relative;}
.form ion-input{border:1px solid #aaa;border-radius:10px;margin:10px 0 0;--padding-top:15px;--padding-bottom:15px;--padding-start:15px;--padding-end:15px}
.form ion-textarea{border:1px solid #aaa;border-radius:10px;margin:10px 0 0;--padding-top:15px;--padding-bottom:15px;--padding-start:15px;--padding-end:15px;height:15vh}
.submit_btn{ width:100%;padding:20px;z-index:10}
.submit_btn ion-button{--background:#b7160b;--color:#fff;font-size:14px;--padding-top:15px;--padding-bottom:15px;--border-radius:30px}
ion-button{--background: #b7160b;--border-radius:30px;}
ion-content{
    --ion-background-color: #fff
}

#map{pointer-events: none;height:50vh}

.sections{height: 50vh;display: flex;align-items: center;justify-content: center;background: #fff;flex-direction: column;padding: 20px;text-align: center;animation-name:waitAnim;animation-duration: 2s;animation-iteration-count: infinite;}
.sections img{max-width: 300px;width: 60vw;display: block;max-height: 60%;}

@keyframes waitAnim {
    0%,100%{opacity: 1;}
    50%{opacity: 0.5;}
}


/* ion-content{--background:#fff;border-radius: 20px 20px 0 0;overflow:hidden}
.form{min-height:500px}
.form > div{margin:15px;}
.form ion-input{border:1px solid #aaa;border-radius:10px;margin:10px 0 0;--padding-top:15px;--padding-bottom:15px;--padding-start:15px;--padding-end:15px}
.form ion-textarea{border:1px solid #aaa;border-radius:10px;margin:10px 0 0;--padding-top:15px;--padding-bottom:15px;--padding-start:15px;--padding-end:15px;height:15vh}
.submit_btn{position:fixed;bottom:0;left:0;background:#b7160b;width:100%;height:130px;padding:20px;z-index:10}
.submit_btn ion-button{--background:#fff;--color:#222;font-size:14px;--padding-top:15px;--padding-bottom:15px;--border-radius:10px}
.ion-page{background-color: #b7160b;}
ion-button{--background: #b7160b;}
ion-back-button{
    color: #fff
}
ion-title{text-align: center;}
ion-header{color:#fff;padding-bottom: 20px;}
ion-header small{text-align: center;display: block;}
ion-header::after {background-image: none;}
ion-toolbar{--background:#b7160b; color: #fff}
ion-input{--background: #fff;--color: #333;}
.col2{display: flex;justify-content: space-between;}
.col2 > *{width: 48%;} */


</style>
