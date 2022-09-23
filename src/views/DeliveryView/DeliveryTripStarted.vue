<template>
    <ion-page>
        <ion-content>
            <div class="content">
                <h3>You have picked up the package!</h3>
                <img src="@/img/deliver.svg">
                <p>Please press 'Finish Delivery' and ask for the code after handing the package so you can finish this task.</p>
                <div class="col2">
                    <span>Customer</span>
                    <span>{{customer}}</span>
                    <span>Request ID</span>
                    <span>{{taskId}}</span>
                </div>
                <div class="col2">
                    <span>Distance Fee</span>
                    <span>${{fee.distcharge}}</span>
                    <span>Booking Fee</span>
                    <span>${{fee.apprate}}</span>
                    <span>VAT</span>
                    <span>${{fee.vatcharge}}</span>
                    <span>Total</span>
                    <span>${{fee.total}}</span>
                </div>
                <ion-button expand="block" @click="finishTrip">Finish Delivery</ion-button>
            </div>
        </ion-content>
    </ion-page>
</template>

<script>
import {IonPage,IonContent,IonButton} from '@ionic/vue';
import {axiosReq, local, removeFix} from '@/functions';
import {db} from '@/firebase';
import {ciapi} from '@/js/globals';
import {set,ref,remove} from 'firebase/database';

export default ({
    components:{
        IonPage,
        IonContent,
        IonButton
    },
    data(){
        return {
            customer:'',
            fee:{
                distcharge:0,
                appcharge:0,
                vat: 0,
                vatcharge:0,
                total:0
            },
        }
    },
    mounted(){
        local.set('task_linear_path','/delivery/trip');
        this.taskId = local.getObject('accepted_task').task_id || local.getObject('accepted_task').id;

        this.customer = local.getObject('accepted_task').user_name;

        axiosReq({
            method:'post',
            url:ciapi+'transactions?trans_id='+this.taskId, 
            headers:{
                PWAuth: local.get('user_token'),
                PWAuthUser:local.get('user_id')
            }
        }).then(res=>{
            this.fee = removeFix(res.data.result,'trans_');
            this.fee.distcharge = parseFloat(this.fee.distcharge).toFixed(2);
            this.fee.apprate = (this.fee.distcharge * this.fee.appcharge);
            this.fee.apprate = parseFloat(this.fee.apprate).toFixed(2);
            this.fee.total = parseFloat(this.fee.total).toFixed(2);
            this.fee.vatcharge = this.fee.distcharge * this.fee.vat;
            this.fee.vatcharge = parseFloat(this.fee.vatcharge).toFixed(2);
        });
    },
    methods:{
        finishTrip(){
            set(ref(db,'/finish-notifs/'+local.getObject('accepted_task').id),'arrived'); 
            set(ref(db,'/available/'+local.getObject('user_info').role.replaceAll(' ','_')+'/'+local.get('user_id')),'active');
            
            remove(ref(db,'/pending_tasks/'+local.getObject('accepted_task').id));
            local.remove('accepted_task');
            setTimeout(()=>this.$router.replace('/delivery/finished'),200);
        }
    }
})
</script>   

<style scoped>
.content{text-align:center;max-width:600px;margin:0 auto;position:relative;top:50%;transform: translateY(-50%);padding: 20px}
h3{color:#b7160b}
img{margin:20px auto;max-width: 250px}
p{color:#777;margin:20px 0 40px}
.col2{display: grid;grid-template-columns: 1fr 1fr;text-align:left;margin: 0 0 20px;}
.col2:first-of-type{padding:0 0 20px;border-bottom:1px solid #ccc}
.col2 span{margin:5px 0}
.col2 span:nth-of-type(even){color:#b7160b;text-align: right}
ion-button{--background:#b7160b;--border-radius:20px}
</style>

