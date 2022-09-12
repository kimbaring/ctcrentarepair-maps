<template>
    <ion-page>
        <ion-content>
            <div>
                <h3>Task Completed! <ion-icon :icon="checkmarkCircleSharp"></ion-icon></h3>
                <p>Thank you for choosing RentARepair for your car service needs! You can review the details about this task in the Transactions History tab.</p>
                <p>Should you wish to create another request, press the button below!</p>
                <img src="@/img/task-finished.svg">
                <ion-button @click="$router.replace('/customer/dashboard')">Back to Home</ion-button>
                </div>
        </ion-content>
    </ion-page>
</template>

<script>
import {
    IonPage,
    IonContent,
    IonButton
} from '@ionic/vue'
import {
    checkmarkCircleSharp
} from 'ionicons/icons'

export default({
    components:{
        IonPage,
        IonContent,
        IonButton
    },
    data(){
        return{
            checkmarkCircleSharp
        }
    }
})
</script>

<style scoped>
ion-content div{padding: 20px;margin: 0 auto;max-width: 600px;width: 100%;text-align: center;position: absolute;top:50%;left:50%;transform: translateX(-50%) translateY(-50%)}
h3{}
img{width: 80%;max-width: 250px;display: block;margin: 40px auto;border:5px double #b7160b;aspect-ratio: 1/1;border-radius: 50%}
p{margin:10px 0}
ion-button{--background:#b7160b;--border-radius:20px}
ion-icon{font-size: inherit;color:#b7160b;vertical-align: top;}
ion-button{}


</style>