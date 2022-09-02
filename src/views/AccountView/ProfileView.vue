<template>
<ion-page>
    <ion-content>
        <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
            <ion-refresher-content></ion-refresher-content>
        </ion-refresher>


        <div class="changeProfileModal" :class="{open:changeProfileMode}">
            Confirm profile image?
            <div class="col2">
                <ion-button expand="block" @click="uploadProfile">
                    <span v-if="!formLoading2">Confirm</span>
                    <span v-if="formLoading2">
                        <ion-spinner name="dots"></ion-spinner>
                    </span>
                </ion-button>
                <ion-button expand="block" @click="changeProfileMode = false;">Cancel</ion-button>
            </div>
        </div>

        <div class="section">
            <div class="profile_img" @click="openChangeTooltip" @dblclick="openCamera">
                <img id="profile_img_elem"/>
            </div>
        </div>
        <div class="profile_view">
            <h2>{{ user.firstname }} {{ user.middlename }} {{ user.lastname }}</h2>
            <small>{{ user.role }}</small>
            <div class="profile_grid" >
                <span class="field">Username</span>
                <span class="value">{{ user.username }}</span>
            </div>
            <div class="profile_grid">
                <span class="field">Email</span>
                <span class="value">{{ user.email }}</span>
            </div>
            <div class="profile_grid">
                <span class="field">Joined On</span>
                <span class="value">{{ user.created }}</span>
            </div>
            <div class="profile_grid" v-if="user.role != 'Customer'">
                <span class="field">Availability Status</span>
                <div class="value"><ion-toggle id="availableToggle" @ionChange="changeAvailabilityStatus"></ion-toggle></div>
            </div>
            <ion-button expand="block" @click="$router.push('/customer/profile/update')">Update Profile</ion-button>
            <ion-button expand="block" @click="logout" color="dark">
                <span v-if="!formLoading1">Log Out</span>
                <span v-if="formLoading1">
                    <ion-spinner name="dots"></ion-spinner>
                </span>
            </ion-button>
        </div>
    </ion-content>
</ion-page>
</template>


<script>
import { 
    IonPage,
    IonContent,
    IonToggle,
    IonSpinner
} from '@ionic/vue';
import { 
    bookOutline,
    timeOutline,
    personCircleOutline,
    logOutOutline
} from 'ionicons/icons';
import router from '@/router';
import { axiosReq, local, openToast, optimizeImage, dateFormat } from '@/functions';
import { ciapi } from '@/js/globals';
import { auth, storage, push,db } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Camera, CameraResultType } from '@capacitor/camera';
import{ref,remove,get} from 'firebase/database'
import { ref as sref, uploadString, getDownloadURL } from 'firebase/storage';

export default({
    name: "CustomerDashboard",
    components:{
        IonPage,
        IonContent,
        IonToggle,
        IonSpinner
    },

    data(){
        return{
            //ionicons
            bookOutline,
            timeOutline,
            personCircleOutline,
            logOutOutline,
            //end of ionicons

            user: {},
            changeProfileMode: false,
            availabilityStatus: false,
            formLoading1: false,
            formLoading2: false,

        }
    },
    mounted(){
        this.user = JSON.parse(local.get('user_info'));
        this.user.created = new Date(Date.parse(this.user.created_at.match('[0-9]+-[0-9]+-[0-9]+')[0])); // our Date object
        this.user.created = this.user.created.toLocaleDateString("en-US", {month:'long',day:'numeric',year:'numeric'});
        document.querySelector('#profile_img_elem').src = local.getObject('user_info').profile_img;

        let role = this.user.role.replaceAll(' ','_').toLowerCase();


        if(role == 'customer') return;
        get(ref(db,`/available/${role}/${local.get('user_id')}`)).then(snapshot=>{
            if(snapshot.exists()){
                document.getElementById('availableToggle').setAttribute('checked',true);
            }else{
                document.getElementById('availableToggle').removeAttribute('checked');
            }
        })
    },
    methods:{
        changeAvailabilityStatus(){
            this.availabilityStatus = !this.availabilityStatus;
            let role = this.user.role.replaceAll(' ','_').toLowerCase();
            if(this.availabilityStatus){
                push(`/available/${role}/${local.get('user_id')}`,'active');
            }else{
                remove(ref(db,`/available/${role}/${local.get('user_id')}`));
            }
        },
        openChangeTooltip(){
            openToast('Double tap to change profile image','dark');
        },
        uploadProfile(){
            this.formLoading2 = true;
            const date = new Date();
            const dateString = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + " " + 
            date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
            const generateFileName = local.get('user_id')+dateFormat('%y%m%d%h%i%s',dateString);

            openToast('Uploading image...','success');
        
            uploadString(sref(storage,'profile-images/'+generateFileName),document.querySelector('#profile_img_elem').src,'data_url').then(()=>{

                getDownloadURL(sref(storage,'profile-images/'+generateFileName)).then(dlink=>{
                    console.log(dlink);
                    document.querySelector('#profile_img_elem').src = dlink;
                    axiosReq({
                        method: 'post',
                        url: ciapi+'users/update?user_id='+local.get('user_id'),
                        headers:{
                            PWAuth: local.get('user_token'),
                            PWAuthUser: local.get('user_id')
                        },
                        data: { profile_img:dlink}
                    }).catch(()=>{
                        openToast('Something went wrong!', 'danger');
                    }).then(res=>{
                        if(res.data.success){
                            this.formLoading2 = false;
                            openToast('Profile uploaded successfully!','success');  
                            local.setInObject('user_info','profile_img',dlink);
                            this.changeProfileMode = false;
                        }
                        else if(res.data.msg == 'invalid token') openToast('Token expired!', 'danger');
                    });
                });
            });
        },
        async openCamera(){
            Camera.getPhoto({
                quality: 100,
                allowEditing: true,
                resultType: CameraResultType.DataUrl
            }).then(img=>{
                optimizeImage(img.dataUrl).then(src=>{
                    document.querySelector('#profile_img_elem').src = src;
                    this.changeProfileMode = true;
                });
            });
        },

        // async
       
        logout(){
            this.formLoading1 = true;

            axiosReq({
                method:'post',
                url: ciapi+'users/logout'.toLowerCase(),
                headers:{
                    PWAuth: local.get('user_token'),
                    PWAuthUser: local.get('user_id')
                }
            }).catch(()=>{
                openToast('Something went wrong...', 'danger');
            }).
            then(()=>{
                signOut(auth).then(() => {
                    openToast('Logout Successful', 'success');
                    local.remove('user_id');
                    local.remove('user_token');
                    local.remove('user_info');
                    router.replace('/login');
                    this.formLoading1 = false;
                }).catch(()=> {
                    openToast('Something went wrong...', 'danger');
                });
            });

            
        }
    }
});
</script>

<style scoped>
ion-content{
    --ion-background-color: var(--ion-color-dark-contrast);
}

.profile_img{position: absolute;
top: 30px;
left: 50px;
right: 50px;width: 200px;height: 200px;margin: 0 auto;border-radius: 50%;overflow: hidden;border:10px solid #fff;box-shadow: 0 0 5px #000;background: #b7170b;}
.profile_img img{width:inherit;height: inherit;border-radius: 50%;position: absolute;top: 50%;left: 50%;transform: translateX(-50%) translateY(-50%);object-fit: cover;}
.section{
    background: var(--ion-color-dark-red);
    height: 200px;
    position: relative;
    top: 0;
}
.section::before {
  content: "";
  position: absolute;
  top: 200px;
  background-color: #fff;
  height: 50px;
  width: 25px;
  border-top-left-radius: 25px;
  box-shadow: 0 -25px 0 0 #b7170b; /* This is where the magic happens! */
}
.section::after{
    content: "";
    position: absolute;
    top: 200px;
    background-color: #fff;
    height: 50px;
    width: 25px;
    border-top-right-radius: 25px;
    box-shadow: 0 -25px 0 0 #b7170b;
    right: 0;
}
.profile_view{background:#fff;padding: 70px 20px 20px;border-radius: 20px 20px 0 0;margin-top: -50px;text-align: center;min-height:calc(100vh - 277px);height: auto;}
.profile_view h2{white-space: nowrap;text-overflow: ellipsis;text-transform: capitalize;overflow: hidden;font-size: 5.7vw;}
.profile_view small{margin: 0 0 40px;font-size: 18px;display: block;}
.profile_grid{display: flex;justify-content: space-between;padding: 10px 0;border-bottom: 1px solid #aaa;align-items: center;}
.profile_grid .field{font-weight: bold;}
.profile_grid .value{color:#b7170b;max-width: 60vw;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;}
ion-button{--background: #b7170b;
    --background-activated: var(--ion-color-hover-red);margin: 20px 0;--padding-top: 20px;--padding-bottom: 20px;}

ion-toggle{

}

.link{
  color:#b7170b;
}

.col2{
display: flex;
gap:10px;
}

.changeProfileModal{
    padding: 20px 10px;
    position: fixed;
    bottom:-100%;
    z-index: 100;
    width: 100%;
    box-shadow: 0 0 10px #ccc;
    transition:0.4s;
    background: #fff;
}


.changeProfileModal.open{
    bottom:0
}


.col2 > *{
    width:48%;
}

ion-toggle {
  --background: #aaa;
  --background-checked: #b7170b;

  --handle-background: #222;
  --handle-background-checked: #b7170b;
}



@media only screen and (min-width:500px){
.profile_view h2{font-size: 30px;}
}
</style>

