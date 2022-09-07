<template>
    <ion-page>
         <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button defaultHref="/customer/mycar"></ion-back-button>
                </ion-buttons>                
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <div class="section">
                <ion-title>Edit Car</ion-title>
            </div>
            <div class="form">
                <div>
                    <ion-button @click="chooseImg">{{(car_details.img == null) ? 'Upload' : 'Change'}} image</ion-button>
                    <figure><img :src="car_details.img" v-if="car_details.img != null"></figure>
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
                    <ion-textarea v-model="car_details.more_info" placeholder="e.g. XYZ123"></ion-textarea>
                </div>
            </div>
            <div class="submit_btn">
                <ion-button expand="block" @click="submit">Save</ion-button>
                <ion-button expand="block" @click="deleteCar">Delete Car</ion-button>
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
import {local, openToast, axiosReq, dateFormat,optimizeImage, lStore} from '@/functions';
import router from '@/router';
import { ciapi } from '@/js/globals';
import { storage } from '@/firebase';
import { ref as sref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { Camera, CameraResultType } from '@capacitor/camera';

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
            prev_img_link:'',
            car_delete:false
        }
    },
    created(){
        this.load(this.$route.path);
    },
    methods:{
        chooseImg(){
            Camera.getPhoto({
                quality: 100,
                allowEditing: true,
                resultType: CameraResultType.DataUrl
            }).then(img=>{
                optimizeImage(img.dataUrl).then(src=>{
                    this.car_details.img = src;
                });
            });
        },
        load(to){
            if(to != '/customer/mycar/editcar') return;
            lStore.get('cars').forEach(el=>{
                if(el.id == local.get('car_reference')) this.car_details = el
            });
        },
        deleteCar(){
            
            

            if(this.car_details.img != ''){
                let reference = this.car_details.img.match(/%2F([0-9]+)\?/g)[0];
                reference = reference.replaceAll('%2F','').replaceAll('?','');
                deleteObject(sref(storage,'car-images/'+reference)).then(()=>{
                    axiosReq({
                        method: 'post',
                        url: ciapi+'cars/delete?car_id='+local.get('car_reference'),
                        headers:{
                            PWAuth: local.get('user_token'),
                            PWAuthUser: local.get('user_id')
                        },
                        data: this.car_details  
                    }).catch(()=>{
                        openToast('Something went wrong!', 'danger');
                    }).then(res=>{
                        if(res.data.success){
                            openToast('Car deleted successfully!','success');
                            router.go(-1);
                        }
                        else if(res.data.msg == 'invalid token') openToast('Token expired!', 'danger');
                    });
                });
            }else{
                console.log('test');
                axiosReq({
                    method: 'post',
                    url: ciapi+'cars/delete?car_id='+local.get('car_reference'),
                    headers:{
                        PWAuth: local.get('user_token'),
                        PWAuthUser: local.get('user_id')
                    },
                    data: this.car_details  
                }).catch(()=>{
                    openToast('Something went wrong!', 'danger');
                }).then(res=>{
                    console.log(res.data);
                    if(res.data.success){
                        openToast('Car deleted successfully!','success');
                        router.go(-1);
                    }
                    else if(res.data.msg == 'invalid token') openToast('Token expired!', 'danger');
                });
            }
        },
        submit(){           
            
            if(this.prev_img_link != '' && this.car_details.img != ''){
                console.log(this.prev_img_link);
                let reference = this.prev_img_link.match(/%2F([0-9]+)\?/g)[0];
                reference = reference.replaceAll('%2F','').replaceAll('?','');

                const date = new Date();
                const dateString = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + " " + 
                date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                const generateFileName = local.get('user_id')+dateFormat('%y%m%d%h%i%s',dateString);

                deleteObject(sref(storage,'car-images/'+reference)).then(()=>{
                    uploadString(sref(storage,'car-images/'+generateFileName),this.car_details.img,'data_url').then(()=>{

                    getDownloadURL(sref(storage,'car-images/'+generateFileName)).then(dlink=>{
                        console.log(this.car_details);
                        this.car_details.img = dlink;
                        axiosReq({
                            method: 'post',
                            url: ciapi+'cars/update?car_id='+local.get('car_reference'),
                            headers:{
                                PWAuth: local.get('user_token'),
                                PWAuthUser: local.get('user_id')
                            },
                            data: this.car_details  
                        }).catch(()=>{
                            openToast('Something went wrong!', 'danger');
                        }).then(res=>{
                            if(res.data.success){
                                openToast('Car updated successfully!','success');
                                router.go(-1);
                            }
                            else if(res.data.msg == 'invalid token') openToast('Token expired!', 'danger');
                        });
                        });
                    });
                });
            }else if(this.car_details.img == ''){
                const date = new Date();
                const dateString = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + " " + 
                date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                const generateFileName = local.get('user_id')+dateFormat('%y%m%d%h%i%s',dateString);

                uploadString(sref(storage,'car-images/'+generateFileName),this.car_details.img,'data_url').then(()=>{

                getDownloadURL(sref(storage,'car-images/'+generateFileName)).then(dlink=>{
                    console.log(this.car_details);
                    this.car_details.img = dlink;
                    axiosReq({
                        method: 'post',
                        url: ciapi+'cars/update?car_id='+local.get('car_reference'),
                        headers:{
                            PWAuth: local.get('user_token'),
                            PWAuthUser: local.get('user_id')
                        },
                        data: this.car_details  
                    }).catch(()=>{
                        openToast('Something went wrong!', 'danger');
                    }).then(res=>{
                        if(res.data.success){
                            openToast('Car updated successfully!','success');
                            router.go(-1);
                        }
                        else if(res.data.msg == 'invalid token') openToast('Token expired!', 'danger');
                    });
                    });
                });
            }else{
                axiosReq({
                    method: 'post',
                    url: ciapi+'cars/update?car_id='+local.get('car_reference'),
                    headers:{
                        PWAuth: local.get('user_token'),
                        PWAuthUser: local.get('user_id')
                    },
                    data: this.car_details  
                }).catch(()=>{
                    openToast('Something went wrong!', 'danger');
                }).then(res=>{
                    if(res.data.success){
                        openToast('Car updated successfully!','success');
                        router.go(-1);
                    }
                    else if(res.data.msg == 'invalid token') openToast('Token expired!', 'danger');
                });
            }
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
    display: flex;
    gap:10px;
}
.submit_btn ion-button{
    width: 48%;
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


label[for="imgpick"]{display: block;padding: 10px;margin: 10px 0;border: 1px dashed #aaa;border-radius: 10px;}
figure{margin: 0;background: #eee;margin: 10px 0 20px}
figure img{object-fit: cover;height: 300px;width: 100%;}

ion-button{--background:#b7160b;--color:#fff;margin:0 auto}

</style>
