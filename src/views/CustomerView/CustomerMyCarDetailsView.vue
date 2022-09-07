<template>
<ion-page>
    <ion-content>
        <div class="section">
            <a @click="$router.push('/customer/mycar')"><ion-icon :icon="arrowBack"></ion-icon></a>
            <h3>Car Details</h3>
        </div>
        <ion-card>
            <ion-card-header>
                <img :src="car.img">
                <ion-card-title>
                    {{car.brand}} {{car.model}}
                </ion-card-title>
            </ion-card-header>
            <ion-card-content>
                <div class="cardsection">
                    <div><p>Plate Number</p><p>{{car.plate_number}}</p></div>
                    <div class="info" v-if="car.more_info != ''">{{car.more_info}}</div>
                </div>
                <ion-button class="viewbutton" expand="block" @click="$route.push('customer/mycar/editcar')">Edit Details</ion-button>

            </ion-card-content>
        </ion-card>
    </ion-content>
</ion-page>
</template>


<script>
import { 
    IonPage,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonCardTitle,
} from '@ionic/vue';
import { 
    bookOutline,
    timeOutline,
    personCircleOutline,
    logOutOutline,
    arrowBack
} from 'ionicons/icons';
import {lStore,local} from '@/functions';


export default({
    name: "TransactionDetails",
    components:{
        IonPage,
        IonContent,
        IonCard,
        IonCardHeader,
        IonCardContent,
        IonCardTitle,
    },

    data(){
        return{
            //ionicons
            bookOutline,
            timeOutline,
            personCircleOutline,
            logOutOutline,
            arrowBack,
            //end of ionicons
            car:{}
        }
    },
    mounted(){
        this.load(this.$route.path);
    },
    methods:{
        load(to){
            if(to != '/customer/cardetails') return;
            lStore.get('cars').forEach(el=>{
                if(el.id == local.get('car_reference')) this.car = el
            });
        }
    },
    watch:{
        $route (to){
            this.load(to.path);
        }
    }
});
</script>

<style scoped>
ion-header{
    text-align: center;
}
.section{
    background: var(--ion-color-dark-red);
    height: 150px;
    position: relative;
}
.section h3{
    position: absolute;
    top: 70px;
    right: 0;
    left: 0;
}
ion-content{
    --ion-background-color: var(--ion-color-dark-red);
    border-radius: 30px !important;
}
h3{
    color: #fff;
    margin: 0px 20px 70px 20px;
    text-align: center;
}
ion-card-title{
    color: #000;
    font-style: normal;
    font-weight: 400;
    font-size: 20px;
    line-height: 24px;
    height: 24px;
}
ion-card-subtitle{
    color: #000;
}
ion-card-subtitle span{
    display: block;
}

ion-card-content{
    background-color: #f4f4f4;
}
.cardsection > div{
    display:flex;
    flex-wrap: wrap;
}
.cardsection p{
    width: 50%;
    margin: 8px auto;
    display:flex;
    align-items: center
}

.cardsection .info{
    margin: 10px 0;
    border-radius: 10px;
    display: block;
    padding: 10px;
    background: #fff;
    border: 1px solid #ccc;
}

ion-card-header{
    background-color:#ededed;
    position:relative;
}
.date{
    position: absolute;
    right: 23px;
    top: 29px;
    color: #B7160B;
}
.viewbutton{
    --background: #b7170b;
    --background-activated: var(--ion-color-hover-red);
}
.section ion-icon{
    color: #fff;
    font-style: normal;
    font-weight: 400;
    font-size: 30px;
    line-height: 24px;
    position: absolute;
    top: 30px;
    left: 25px;
}

.loading{
    animation-name: load;
    position: relative;
    padding-left: 10px;
    overflow: hidden;
    background: #aaa;
}
.loading::before{
    content:"";
    position: absolute;
    height: 200%;
    width:50%;
    background: #ccc;
    top:0;
    left:0;
    box-shadow: 0 0 30px #ccc;
    opacity: 0.7;
    animation-name: load;
    animation-duration: 0.4s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
}


@keyframes load{
    0%{left:0}
    100%{left:100%}
}

ion-card-header img{width: 100vw;max-height: 200px;object-fit: cover;margin: -17px -17px 5px;max-width: unset;}


</style>
