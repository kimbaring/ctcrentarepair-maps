<template>
    <ion-page>
        <ion-content>
            <div class="content">
                <h3>Enjoy the Trip!</h3>
                <img src="@/img/traveling.svg">
                <p>You will automatically be redirected to your dashboard after the ride sharer confirms your arrival in your destination.</p>
                <div class="col2">
                    <span>Ride Sharer</span>
                    <span>{{emp.firstname}} {{emp.lastname}}</span>
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
            </div>
        </ion-content>
    </ion-page>
</template>

<script>
import {IonPage,IonContent} from '@ionic/vue';
import {axiosReq, local, removeFix,openToast, LNotifications} from '@/functions';
import {db} from '@/firebase';
import {ciapi} from '@/js/globals';
import {onValue,ref,remove} from 'firebase/database';

export default ({
    components:{
        IonPage,
        IonContent
    },
    data(){
        return {
            fee:{
                distcharge:0,
                appcharge:0,
                vat: 0,
                total:0
            },
            emp:{firstname:'',lastname:''},
            taskId:0
        }
    },
    mounted(){
        local.set('task_linear_path','/customer/trip');
        this.taskId = local.getObject('customer_task').task_id || local.getObject('customer_task').id;

        axiosReq({
            method:'post',
            url:ciapi+'users?user_id='+local.getObject('customer_task').accepted_by_id,
            headers:{
                PWAuth: local.get('user_token'),
                PWAuthUser:local.get('user_id')
            }
        }).then(res=>{
            this.emp = removeFix(res.data.result,'user_');
        });

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


        onValue(ref(db,'/finish-notifs/'+this.taskId),snapshot=>{
            if(!snapshot.exists()) return;
            if(snapshot.val() != 'arrived') return;
            axiosReq({
                method: 'post',
                url: ciapi + `task/update?task_id=${local.getObject('customer_task').task_id}`,
                headers:{
                    PWAuth: local.get('user_token'),
                    PWAuthUser: local.get('user_id'),
                },
                data:{status:4}
            }).catch(()=>openToast('Something went wrong!','danger'))
            .then(res=>{
                if(!res.data.success){
                    openToast('Something went wrong...', 'danger');
                    return;
                }

                LNotifications.requestPermission().then(()=>{
                    LNotifications.send('Task completed!',
                    `Thank you for choosing RentARepair for your transportation needs.!`);
                });


                remove(ref(db,'/finish-notifs/'+this.taskId));
                local.remove('customer_task');
                setTimeout(()=>window.location.assign('/customer/finished'),200);
            });
        });
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

