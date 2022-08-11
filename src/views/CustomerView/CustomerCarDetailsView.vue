<template>
    <ion-page>
         <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button defaultHref="/customer/dashboard/location"></ion-back-button>
                </ion-buttons>                
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <div class="section">
                <ion-title>Car Details</ion-title>
                <small>Please choose the car that needs service<br /> and describe the problem.</small>
                
            </div>
            <div class="car_accordions"  @click="car_selection = !car_selection">
                <img :src="vehicle.img">
                <h3>{{vehicle.brand}} {{vehicle.model}}
                <small>{{vehicle.plate_number}} {{(vehicle.brand == null) ? 'Choose a vehicle...' : ''}}</small>
                <span v-if="vehicle.brand != null">Tap to change car...</span>
                </h3>
                
            </div>

            <div class="car_modal" :class="(car_selection) ? 'open':''">

            <div class="car_items">
                <h2>Pick the car that needs service</h2>
                <ion-input placeholder="Search" v-model="vehicle_search" @keyup="vehiclesearch"></ion-input>
                <div class="cars_holder">
                    <div v-for="(v,i) in vehicle_search_results" :key="i" @click="vehicle = v; car_selection = false;customer.car_id = v.id">
                        <img :src="v.img">
                        <h3>{{ v.brand }} {{ v.model }}</h3>
                        <p>Plate Number: {{ v.plate_number }}</p>
                    </div>
                </div>
                <ion-button expand="block" @click="car_selection = !car_selection">Cancel</ion-button>
            </div>
            </div>
            <!-- if wala kay mag add siya car details tas ma save sa car database para di na siya mag add balik -->
            <!-- pero mu gawas rani siya if walay stored car sa iyang car database -->
            <div class="form">
            <div class="tech_types">
                <ion-list>
                    <ion-item>
                        Service Type
                    </ion-item>
                    <ion-item v-for="(t,i) in tech_types" :key="i"><ion-checkbox @click="handleProblemChecklist(t)"></ion-checkbox>{{t}}</ion-item>
                </ion-list>
            </div>
            <div>
                <ion-textarea v-model="customer.more_information" placeholder="More information about the issue..."></ion-textarea>
            </div>
                <div class="submit_btn">
                    <ion-button expand="block" @click="submit">Submit</ion-button>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>


<script>
import {
    IonTitle,
    IonPage,
    IonBackButton,
    IonHeader,
    IonButtons,
    IonToolbar,
    IonContent,
    IonInput,
    IonTextarea,
    IonList,
    IonItem,
    IonCheckbox
} from '@ionic/vue';
import {local, openToast,validateForm, axiosReq, removeFix} from '@/functions';
import router from '@/router';
import { ciapi } from '@/js/globals';
import { push } from '@/firebase';



export default({
    components:{
        IonTitle,
        IonPage,
        IonHeader,
        IonBackButton,
        IonButtons,
        IonToolbar,
        IonContent,
        IonInput,
        IonTextarea,
        IonList,
        IonItem,
        IonCheckbox
    },
    data(){
        return{
            car_selection:false,
            customer:{problems:[]},
            vehicle:{},
            vehicles:[],
            vehicle_search: '',
            tech_types:[
                "Flat Tire",
                "Engine Problem",
                "Key Locked Inside Vehicle",
                "Dead Battery",
                "Others",
            ],
            vehicle_search_results:[]

        }
    },
    mounted(){
        this.loadVehicles(this.$route.path);
    },
    methods:{
        handleProblemChecklist(tech_types){
            if(this.customer.problems.includes(tech_types))
                this.customer.problems.splice(this.customer.problems.indexOf(tech_types),1);
            else
                this.customer.problems.push(tech_types);
        },
        loadVehicles(to){
            if(to != '/customer/dashboard/location/cardetails') return;
            this.vehicles = [];
            axiosReq({
                method:"post",
                url: ciapi+"cars?_batch=true&car_user_id="+local.get('user_id'),
                headers:{
                    PWAuth: local.get('user_token'),
                    PWAuthUser: local.get('user_id')
                }
            }).catch(()=>{
                openToast('Something went wrong!', 'danger');
            }).then(res=>{
                if(res.data.msg == 'invalid token') openToast('Invalid token!', 'danger');
                else if(res.data.success){
                    for(let i=0; i<res.data.result.length;i++) this.vehicles.push(removeFix(res.data.result[i],'car_'));
                    this.vehiclesearch();
                }
            });
        },
        submit(){
            const valid = validateForm(this.customer,{
                car_id: 'required',
                more_information: 'required',
                callback:()=>{openToast('Required fields are empty!', 'danger')}
            });
            if(!valid.allValid) return;

            local.setInObject('customer_task','description', this.customer.more_information);
            local.setInObject('customer_task','car_id', this.customer.car_id);
            local.setInObject('customer_task','problems', JSON.stringify(this.customer.problems));
            local.setInObject('customer_task','user_name', `${local.getObject('user_info').firstname} ${local.getObject('user_info').lastname}`);
            delete this.customer.more_information;

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
                if(!res.data.success) return;
                let task = removeFix(res.data.task_info,'task_'); 
                router.push('/customer/dashboard/location/cardetails/booked');
                push(`pending_tasks/${task.id}`,task);
                openToast('Request sent!', 'success');

                axiosReq({
                    method: 'post',
                    url: ciapi+'users/notifications/create',
                    headers:{
                        PWAuth: local.get('user_token'),
                        PWAuthUser: local.get('user_id')
                    },
                    data:{
                        title: 'Your request was successfully sent!',
                        description: `RentARepair is currently looking for ${task.service_type.toLowerCase()}s that can cater your request.`,
                        url: '/notification'
                    }
                }).catch(()=>{
                    openToast('Something went wrong...', 'danger');
                }).then(res=>{
                    let notif = removeFix(res.data.notif_info,'notif_');
                    push(`notifications/${notif.id}`,notif);
                })
            
            })
        },
        vehiclesearch(){
            if(this.vehicle_search == '') {this.vehicle_search_results = [...this.vehicles];return;}
            
            this.vehicle_search_results = [];
            
            for(let v = 0;v<this.vehicles.length;v++){
                if(
                    this.vehicles[v].brand.toLowerCase().includes(this.vehicle_search.toLowerCase()) ||
                    this.vehicles[v].model.toLowerCase().includes(this.vehicle_search.toLowerCase()) ||
                    this.vehicles[v].plate_number.toLowerCase().includes(this.vehicle_search.toLowerCase()) ||
                    (this.vehicles[v].brand + ' ' +this.vehicles[v].model).toLowerCase().includes(this.vehicle_search.toLowerCase())
                ) this.vehicle_search_results.push(this.vehicles[v]);
            }
            
        }
    },
    watch:{
        $route(to){
            this.loadVehicles(to);
        }
    }
});
</script>

<style scoped>
h2{
    font-size: 30px;
color: #b7170b;
text-align: center;
border-bottom: 1px solid #ccc;
padding-bottom: 13px;
width: 90%;
margin: 20px auto 0;

}
.viewbutton{
    --background: #b7170b;
    --background-activated: var(--ion-color-hover-red);
}
.header-ios ion-toolbar:last-of-type{
    --border-width: 0px;
}
ion-header::after{
    display: none;
}
.section ion-title{
    padding-top: 50px;
    font-size: 30px;
    color: #b7170b;
    text-align: center;
}

.section small{
    font-size: 16px;
    text-align: center;
    display: block;
    margin: 60px 20px;
    color: #777;
}
.car_accordions{
    display: flex;
    align-items: center;
    gap: 20px;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    border-radius: 20px;
    border: 1px solid #ddd;
    width: 95%;

}
.car_accordions img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  background: #b7170b;
}

.car_accordions small{font-weight: 400;margin: 10px 0 0;display: block;}
.car_accordions span{display: block;color:#777;font-size: 14px; margin: 20px 0 0}

.car_items h2{text-align: center;color:#b7170b;font-size: 20px;}
.car_items{margin: 0 20px;width: calc(100% - 20px);max-width:600px;background: #fff;margin:0 auto;left:50%;top:50%;position: absolute;transform: translateX(-50%) translateY(-50%);padding:20px;border-radius: 20px}
.car_items div{border-bottom:1px solid #ddd}
.car_items div:last-child{border-bottom:none}
.car_items img{width:70px;height:70px;float:left;margin-right: 20px;background:#aaa;border-radius: 50%}
.car_modal{position: fixed;z-index:9999;width:100vw;height:100vh;background:rgb(0,0,0,0.5);top:0;z-index:-1;opacity:0;transition: 0.4s;}

.car_modal.open{z-index:999;opacity: 1;}

.car_items ion-input{border:1px solid #ddd;color:#222;border-radius: 20px;--padding-start: 20px;margin-bottom:30px}

.form{max-width: 600px;margin: 0 auto;padding:20px}

.tech_types{max-width: 600px;max-width: 600px;margin: 0 auto 20px;padding: 0 10px;position: relative;}
/* .tech_types ion-list:nth-child(2){position: absolute;z-index: 100;width: 100%;top:100%;} */
.tech_types ion-item{--padding-start:0 !important}
.item-inner{}
ion-textarea{height:100px}
.tech_types ion-checkbox{margin: 0 20px;--background:#fff;--background-checked:#b7170b;--border-color-checked:#b7170b}
ion-button{--background: #b7170b;color:#fff;--border-radius: 20px;--padding-top:20px;--padding-bottom:20px}
.cars_holder{height: 195px;overflow-y: scroll;margin-bottom: 20px;}
</style>
