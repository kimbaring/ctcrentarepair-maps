<template>
    <ion-page>
         <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button defaultHref="/customer/mycar" v-if="!isNewUser"></ion-back-button>
                </ion-buttons>                
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <div class="section">
                <ion-title>Add Car</ion-title>
            </div>
            <div class="form">
                <div>
                    Upload Image
                    <label for="imgpick">
                        {{(car_details.img == null ) ? 'Choose an Image' : ''}}
                        <img :src="car_details.img" v-if="car_details.img != null">
                    </label>
                    <input @change="chooseImg" id="imgpick" type="file" placeholder="e.g. Fortuner" hidden>
                </div>
                <div>
                    Model
                    <ion-input v-model="car_details.model" placeholder="e.g. Fortuner"></ion-input>
                </div>
                <div>
                    Brand
                    <ion-input v-model="car_details.brand" placeholder="e.g. Toyota"></ion-input>
                </div>
                <div>
                    Plate Number
                    <ion-input v-model="car_details.plate_number" placeholder="e.g. XYZ123"></ion-input>
                </div>
                <div>
                    More Information
                    <ion-textarea v-model="car_details.more_info" placeholder="e.g. Red, custom finish"></ion-textarea>
                </div>
            </div>
            <div class="submit_btn">
                <ion-button expand="block" size="large" @click="submits">Submit</ion-button>
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
    IonTextarea
} from '@ionic/vue';
import {local, openToast,validateForm, axiosReq, toDataURL, dateFormat} from '@/functions';
import router from '@/router';
import { ciapi } from '@/js/globals';
import { storage } from '@/firebase';
import { ref as sref, uploadString, getDownloadURL } from 'firebase/storage';



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
        IonTextarea
    },
    data(){
        return{
            car_details:{},

            isNewUser : false
        }
    },
    mounted(){
        this.isNewUser = local.get('user_new');
    },
  
    methods:{
        chooseImg(){
            toDataURL(document.getElementById("imgpick").files[0]).then(result=>{
                this.car_details.img = result;
            })
        },
        submits(){
            const valid = validateForm(this.car_details,{
                img: "required",
                model:"required",    
                brand:"required",
                plate_number:"required",
                callback:()=>{
                    openToast('Required fields are empty','success');        
                }   
            });

            if(!valid.allValid) return;

            const date = new Date();
            const dateString = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + " " + 
            date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
            const generateFileName = local.get('user_id')+dateFormat('%y%m%d%h%i%s',dateString);

            openToast('Adding car...','warning');

            uploadString(sref(storage,'car-images/'+generateFileName),this.car_details.img,'data_url').then(()=>{

            getDownloadURL(sref(storage,'car-images/'+generateFileName)).then(dlink=>{
                console.log(this.car_details);
                this.car_details.img = dlink;
                axiosReq({
                    method: 'post',
                    url: ciapi+'cars/create',
                    headers:{
                        PWAuth: local.get('user_token'),
                        PWAuthUser: local.get('user_id')
                    },
                    data: this.car_details  
                }).catch(()=>{
                    openToast('Something went wrong!', 'danger');
                }).then(res=>{
                    if(res.data.success){
                        openToast('Car added successfully!','success');
                        local.set('user_new',false)
                        setTimeout(()=>{router.replace('/customer/dashboard')},100);
                    }
                    else if(res.data.msg == 'invalid token') openToast('Token expired!', 'danger');
            
                });
                });
            });
        },
        submit(){
            
        }
    }
});
</script>

<style scoped>
.header-ios ion-toolbar:last-of-type{
    --border-width: 0px;
}
.section{
    background: var(--ion-color-dark-red);
    height: 97px;
    position: relative;
}
.section ion-title{
    padding-top: 50px;
    font-size: 19px;
    color: #fff;
    text-align: center;
}
.section::before {
  content: "";
  position: absolute;
  top: 97px;
  background-color: transparent;
  height: 50px;
  width: 25px;
  border-top-left-radius: 25px;
  box-shadow: 0 -25px 0 0 #b7170b; /* This is where the magic happens! */
}
.section::after{
    content: "";
    position: absolute;
    top: 97px;
    background-color: transparent;
    height: 50px;
    width: 25px;
    border-top-right-radius: 25px;
    box-shadow: 0 -25px 0 0 #b7170b;
    right: 0;
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
  box-shadow: 0 -25px 0 0 #fff; /* This is where the magic happens! */
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
    box-shadow: 1px -25px 0 0 #fff;
    right: 0;
}
ion-back-button{color: #fff}
ion-header{color:#fff;}
ion-header small{text-align: center;display: block;}
ion-header::after {background-image: none;}
ion-toolbar{--background:#b7160b; color: #fff}
.form{min-height:596px; background-color: #fff; padding-top: 20px;}
.form > div{margin:15px;}
.form ion-input{border:1px solid #aaa;border-radius:10px;margin:10px 0 0;--padding-top:15px;--padding-bottom:15px;--padding-start:15px;--padding-end:15px}
.form ion-textarea{border:1px solid #aaa;border-radius:10px;margin:10px 0 0;--padding-top:15px;--padding-bottom:15px;--padding-start:15px;--padding-end:15px;height:15vh}
.form img{display: block;margin: 0 auto;}
.submit_btn{ width:100%;padding:20px;z-index:10}
.submit_btn ion-button{--background:#fff;--color:#222;font-size:14px;--padding-top:15px;--padding-bottom:15px;--border-radius:10px}

label[for="imgpick"]{display: block;padding: 10px;margin: 10px 0;border: 1px dashed #aaa;border-radius: 10px;}

</style>
