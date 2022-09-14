<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="$router.push('/customer/location')">
                        <ion-icon style="font-size:24px;" :icon="arrowBackOutline"></ion-icon>
                    </ion-button>
                </ion-buttons>                
            </ion-toolbar>
        </ion-header>
        <ion-content>
                <div>
                <h2>Notes for the Rider</h2>
                <p>Please describe the item to be delivered
                so that your rider can assess how to deliver
                your item</p>
                <img src="@/img/notes.svg">

                <div class="col2">
                    <p>Fragile?</p>
                    <ion-toggle @ionChange="isFragile = !isFragile"></ion-toggle>
                </div>
                <ion-textarea v-model="notes" placeholder="Notes here..." autoGrow="true">
                </ion-textarea>
                <ion-button expand="block" @click="submit">Submit Request</ion-button>

            </div>
        </ion-content>
        
    </ion-page>
</template>

<script>
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonContent,
    IonToggle,
    IonTextarea,
    IonButton
 } from '@ionic/vue';
 import {arrowBackOutline} from 'ionicons/icons';
import {local,openToast,axiosReq,removeFix} from '@/functions';
import {sendNotification} from '@/functions-custom';
import {ciapi} from '@/js/globals';
import {push} from '@/firebase';


export default {
    components:{
        IonPage,
        IonContent,
        IonToggle,
        IonTextarea,
        IonButton,
        IonHeader,
        IonToolbar,
        IonButtons
    },
    data(){
        return{
            arrowBackOutline,

            isFragile:false,
            notes:''
        }
    },

    methods:{
        submit(){
            local.setInObject('customer_task','description', this.notes);
            if(this.isFragile) local.setInObject('customer_task','problems', 'Fragile');
            local.setInObject('customer_task','user_name', `${local.getObject('user_info').firstname} ${local.getObject('user_info').lastname}`);

            console.log(local.getObject('customer_task'))

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
                this.formLoading = false; 
            }).then(res=>{
                console.log(res.data);
                if(!res.data.success) return;
                let task = removeFix(res.data.task_info,'task_');                           
                
                push(`pending_tasks/${task.id}`,task);
                openToast('Request sent!', 'success');
                local.setInObject('customer_task','task_id',task.id);
                this.formLoading = false;
                sendNotification(
                'Your request was successfully sent!',
                `RentARepair is currently looking for delivery riders that can cater your request.`,
                '/notification').catch(()=>{
                    openToast('Something went wrong...', 'danger');
                    this.formLoading = false; 
                }).then(()=>{
                    this.$router.push('/customer/waiting');
                });
            
            });
        }
    }
}
</script>

<style scoped>
ion-header::after{display: none;}
ion-content{display: flex;}
ion-content > div{max-width: 600px;margin: 0 auto;padding: 60px 20px;}
h2{color:#b7160b;text-align: center}
h2 + p{text-align:center}
img{max-width: 200px;display: block;margin:30px auto;}
.col2{display: flex;justify-content: space-between;border-bottom: 1px solid #ccc}
ion-toggle{--background: #aaa;--background-checked: #b7170b;--handle-background: #222;--handle-background-checked: #b7170b;}
ion-textarea{--padding-start:0;--padding-end:0;border-bottom: 1px solid #ccc;margin-bottom: 20px;min-height: 200px;}
ion-content ion-button{--color:#fff;--background:#b7170b;--border-radius:20px}


</style>