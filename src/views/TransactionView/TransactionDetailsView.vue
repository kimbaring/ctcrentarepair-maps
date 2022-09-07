<template>
<ion-page>
    <ion-content>
        <div class="section">
            <a @click="$router.push('/customer/transactionhistory')"><ion-icon :icon="arrowBack"></ion-icon></a>
            <h3>Transaction Details</h3>
        </div>
        <ion-card>
            <ion-card-header>
                <ion-card-title :class="(loading) ? 'loading': null">
                    {{(task.problems != null && task.problems != '' ) ? objectify(task.problems)[0] : 'Ride Sharer: '+task.drop_location }}
                </ion-card-title>
                <ion-card-subtitle >
                    <span :class="(loading) ? 'loading': null">{{task.service_type}} {{(!loading) ? 'Services': null}}</span>
                </ion-card-subtitle>
            </ion-card-header>
            <ion-card-content>
                <div class="cardsection">
                    <div><p>Location</p><p :class="(loading) ? 'loading': null">{{task.customer_location}}</p></div>
                    <div><p>Time Requested</p><p :class="(loading) ? 'loading': null">{{parseDate(task.created_at)}}</p></div>
                    <div v-if="task.problems != null && task.problems != ''"><p>Problems</p><p :class="(loading) ? 'loading': null">{{problems()}}</p></div>
                    <div v-for="(t,i) in task.details" :key="i">
                        <p>{{formatKey(i)}}</p>
                        <p :class="(loading) ? 'loading': null">{{t}}</p>
                    </div>
                    <div><p>Status</p><p :class="(loading) ? 'loading': null">{{(task.service_type == "Ride Sharer") ? status(task.status,true) : status(task.status,false)}}</p></div>
                    
                    <div class="info" v-if="task.description != ''">{{task.description}}</div>
                </div>
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
    IonCardSubtitle,
    IonCardTitle,
} from '@ionic/vue';
import { 
    bookOutline,
    timeOutline,
    personCircleOutline,
    logOutOutline,
    arrowBack
} from 'ionicons/icons';
import {axiosReq,local, openToast,dateFormat,removeFix, lStore} from '@/functions';



export default({
    name: "TransactionDetails",
    components:{
        IonPage,
        IonContent,
        IonCard,
        IonCardHeader,
        IonCardContent,
        IonCardSubtitle,
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
    
            loading: true,
            task:{created_at:'01-01-2001 00:00:00',problems:'[""]'}
        }
    },
    mounted(){
        this.load(this.$route);
    },
    methods:{
        objectify(param){
            return local.objectify(param);
        },
        problems(){
            let probs = '';
            local.objectify(this.task.problems).forEach((el,i)=>{
                if(i == local.objectify(this.task.problems).length - 1) probs = probs + el; 
                else probs = probs + el + ', ';
            })
            return probs;
        },
        parseDate(date){
            console.log(date);    
            return dateFormat('%lm %d, %y (%h:%i%a)',date);
        },
        formatKey(key){
            let stringArr = key.toLowerCase().split('_');
            for (var i = 0; i < stringArr.length; i++) {
                stringArr[i] = stringArr[i].charAt(0).toUpperCase() + stringArr[i].substring(1);     
            }
            return stringArr.join(' '); 
        },
        status(value,isRideSharer = false){
            switch (value) {
                case '0': return 'Cancelled';
                case '1': return 'Waiting';
                case '2': return 'Accepted';
                case '3': 
                    if(isRideSharer) return 'Trip Started';
                    else return 'Arrived';
                case '4':
                    return 'Completed'
            }
        },
        load(to){
            if(to.path != '/customer/transactionhistory/transactiondetails') return;
            this.loading = true;

            let preloaded = null;
            let preloadedTasks = lStore.get('tasks');
            
            
            for(let p in preloadedTasks){
                let el = removeFix(preloadedTasks[p],'task_')
                if(el.id == local.get('view_details')){
                    preloaded = el;
                    this.loading = false;
                    break;
                }
            }
            

            if(preloaded != null) {
                this.task = preloaded;
                return;
            }

            
            axiosReq({
                method:"post",
                url: "https://www.medicalcouriertransportation.com/rentarepair/api/task?task_id="+local.get('view_details'),
                headers:{
                    PWAuth: local.get('user_token'),
                    PWAuthUser: local.get('user_id')
                }
            }).catch(()=>{
                openToast('Something went wrong!', 'danger');
            }).then(res=>{
                console.log(res.data);
                if(res.data.msg == 'invalid token') openToast('Invalid token!', 'danger');
                else if(res.data.success){
                    this.loading = false;
                    this.task = removeFix(res.data.result,"task_");
                }
                
            });
        }
    },
    watch:{
        $route (to){
            this.load(to);
        }
    }
});
</script>

<style scoped>
ion-header{
    text-align: center;
}
p.loading,ion-card-title.loading,ion-card-subtitle.loading{
    font-size: 0;
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


</style>
