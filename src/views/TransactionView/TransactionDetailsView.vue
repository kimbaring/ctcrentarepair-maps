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
                    {{ (task.problems != null && task.problems != '' && task.service_type != 'Delivery' && task.service_type != 'Ride Sharer') ? title(): ''}}
                    {{ (task.service_type == 'Ride Sharer') ? 'Ride Sharer: '+task.drop_location : ''}}
                    {{ (task.service_type == 'Delivery') ? 'Delivery: '+task.drop_location : ''}}
                </ion-card-title>
                <ion-card-subtitle >
                    <span :class="(loading) ? 'loading': null">{{task.service_type}} {{(!loading) ? 'Services': null}}</span>
                </ion-card-subtitle>
            </ion-card-header>
            <ion-card-content>
                <div class="cardsection">
                    <div><p>Location</p><p :class="(loading) ? 'loading': null">{{task.customer_location}}</p></div>
                    <div><p>Time Requested</p><p :class="(loading) ? 'loading': null">{{parseDate(task.created_at)}}</p></div>
                    <div v-if="task.problems != null && task.problems != ''">
                        <p>{{(task.service_type =='Delivery') ? 'Fragile':'Problems'}}</p>
                        <p :class="(loading) ? 'loading': null">{{(task.service_type =='Delivery') ? ((task.problems == 'Fragile') ? 'Yes': ''):problems()}}</p></div>
                    <div v-for="(t,i) in task.details" :key="i">
                        <p>{{formatKey(i)}}</p>
                        <p :class="(loading) ? 'loading': null">{{t}}</p>
                    </div>
                    <div><p>Status</p><p :class="(loading) ? 'loading': null">{{status(task.status)}}</p></div>
                    
                    <div class="info" v-if="task.description != ''">{{task.description}}</div>
                    <ion-button v-if="task.service_type == 'Technician'&& false && allowPrint" @click="print">Dowload Receipt PDF</ion-button>
                </div>
            </ion-card-content>
        </ion-card>
        <div class="content technician" v-if="transaction.basefee != 0">
        <img src="@/img/logo.png" alt="" />
        <h1>Official Receipt</h1>
        <div class="col2">
            <span>Customer: <span class="red">{{task.user_name}}</span></span>
            <span>Date: <span class="red">{{parseDate(task.created_at)}}</span></span>
            <span>Service: <span class="red">{{task.service_type}}</span></span>
            <span>Transaction ID: <span class="red">{{task.id}}</span></span>
            
        </div>
        <div class="box">
            <div class="boxcell"><strong class="block">Problems: </strong>{{(task.service_type =='Delivery') ? ((task.problems == 'Fragile') ? 'Yes': ''):problems()}}</div>
            <div class="boxcell" v-if="task.description"><strong class="block">More Information:</strong>
                {{task.description}}
            </div>
            <div class="boxcell">
                <strong class="block">Payment Breakdown:</strong>
                <div class="col2price">
                    <span>Distance Fee</span>
                    <span>$75 + ($5 x {{decimal((transaction.distkm < 6) ? transaction.distkm : 0,2)}}km) = ${{decimal(transaction.distcharge)}}</span>
                    <span>Booking Fee</span>
                    <span>${{decimal(transaction.distcharge)}} + 30% = ${{decimal(transaction.distcharge * 0.3)}}</span>
                    <span>VAT Fee</span>
                    <span>${{decimal(transaction.distcharge)}} + 12% = ${{decimal(transaction.distcharge * 0.12)}}</span>
                    <span><strong>Total</strong></span>
                    <span><strong>${{decimal(transaction.total)}}</strong></span>
                </div>

            </div>
        </div>
    </div>
    </ion-content>
</ion-page>
</template>


<script>
import { 
    IonPage,
    IonContent,
    IonCard,
    IonButton,
    IonCardHeader,
    IonCardContent,
    IonCardSubtitle,
    IonCardTitle,
    IonIcon
} from '@ionic/vue';
import { 
    bookOutline,
    timeOutline,
    personCircleOutline,
    logOutOutline,
    arrowBack
} from 'ionicons/icons';
import {axiosReq,local, openToast,dateFormat,removeFix, lStore} from '@/functions';
import * as html2pdf from 'html2pdf.js';



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
        IonButton,
        IonIcon
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
            task:{created_at:'01-01-2001 00:00:00',problems:'[""]'},
            transaction: {basefee:0,appcharge:0,distcharge:0,distkm:0,vat:0,total:0},
            allowPrint:false
        }
    },
    mounted(){
        this.load(this.$route);


        
    },
    methods:{
        objectify(param){
            return local.objectify(param);
        },
        title(){
            return local.objectify(this.task.problems)[0];
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
            return dateFormat('%lm %d, %y (%h:%i%a)',date);
        },
        formatKey(key){
            let stringArr = key.toLowerCase().split('_');
            for (var i = 0; i < stringArr.length; i++) {
                stringArr[i] = stringArr[i].charAt(0).toUpperCase() + stringArr[i].substring(1);     
            }
            return stringArr.join(' '); 
        },
        status(value){
            switch (value) {
                case '0': return 'Cancelled';
                case '1': return 'Waiting';
                case '2': return 'Accepted';
                case '3': 
                    if(this.task.service_type == 'Ride Sharer') return 'Trip Started';
                    if(this.task.service_type == 'Delivery') return 'Picked up';
                    else return 'Completed';
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
                this.fetchTransaction();
            }else{
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
                    if(res.data.msg == 'invalid token') openToast('Invalid token!', 'danger');
                    else if(res.data.success){
                        this.loading = false;
                        this.task = removeFix(res.data.result,"task_");
                        if(this.task.status == 3 && 
                        this.task.service_type != 'Ride Sharer' && this.task.service_type != 'Delivery'){
                            this.fetchTransaction();
                        }else if(this.task.status == 4){
                            this.fetchTransaction();
                        }
                    }
                    
                });
            }
        },
        fetchTransaction(){

            axiosReq({
                method:"post",
                url: "https://www.medicalcouriertransportation.com/rentarepair/api/transactions?trans_id="+local.get('view_details'),
                headers:{
                    PWAuth: local.get('user_token'),
                    PWAuthUser: local.get('user_id')
                }
            }).catch(()=>{
                openToast('Something went wrong!', 'danger');
            }).then(res=>{
                if(res.data.msg == 'invalid token') openToast('Invalid token!', 'danger');
                this.transaction = removeFix(res.data.result,'trans_');
                this.allowPrint = true;
            });
        },
        decimal(val){
            return parseFloat(val).toFixed(2);
        },
        print(){
            let opt = {
                margin: [10,10,10,10],
                filename: `RentARepair-${this.task.id}.pdf`,
                image: { type: 'jpeg', quality: 2 },
                html2canvas: {
                    dpi: 300,
                    scale:2,
                    letterRendering: true,
                    useCORS: true
                },
                jsPDF: { unit: 'mm', orientation: 'portrait',format:'letter'},
                pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
            };
            document.querySelector('.content').style.display = 'block';
            html2pdf(document.querySelector('.content'),opt).save();
            setTimeout(()=>document.querySelector('.content').style.display = 'none',50);
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

.content{font-family: sans-serif;padding: 20px;max-width: 700px;margin: 0 auto;z-index: -1;background: #fff;color:#222;display: none;}
.content h1{font-size: 20px;text-align: center;color:#b7170b;margin:0 0 20px;padding: 10px;}
.content .col2{display: grid;grid-template-columns: 1fr 1fr;}
.content .col2 span {font-weight: 700;margin: 10px 0;}
.content .col2price{display: grid;grid-template-columns: 1fr 2fr;row-gap: 5px;}
.content .col2price span:nth-of-type(even){quotes: none;color:#b7170b;text-align: right;}
.content .col2price span{padding: 5px 0 0;}
.content .col2price span:last-of-type{border-top: 2px solid #000;padding: 5px 0 0;}
.content .red{color:#b7170b;}
.content img{width: 200px;display: block;margin: 0 auto;}
.content .box{border:3px solid #aaa;margin: 20px 0;}
.content .boxcell{padding: 15px;}
.content .boxcell:not(:last-child){border-bottom:3px solid #aaa}
.content .block{display: block;margin:0 0 5px}
.content .block:not(:first-child){margin:10px 0 5px}
ion-button{--background: #b7160b;--border-radius:30px;}

</style>
