<template>
  <ion-page>
        <ion-toolbar>
            <ion-buttons slot="start">
                <ion-back-button defaultHref="/register"></ion-back-button>
            </ion-buttons>
        </ion-toolbar>
        <ion-content>
            <div class="titlereg">
                <h3>Create new account as Customer</h3>
                <p>Please fill up the form</p>
            </div>
            <div class="regforms">
                <ion-input v-model="user.firstname" placeholder="First Name"></ion-input>
                <ion-input v-model="user.lastname" placeholder="Last Name"></ion-input>
                <ion-input v-model="user.username" placeholder="Username"></ion-input>
                <ion-input v-model="user.email" placeholder="Email"></ion-input>
                <ion-input v-model="user.password" type="password" placeholder="Password"></ion-input>
                <ion-input v-model="user.cnfpassword" type="password" placeholder="Confirm Password"></ion-input>
                <ion-button class="loginbutton" @click="register" expand="block">Register</ion-button>
                <p>Already have an account? <a @click="$router.push('/login')">Sign In</a></p>
            </div>
        </ion-content>
  </ion-page>
</template>

<script>
import { IonContent, IonPage,IonBackButton,IonToolbar,IonButtons,IonInput} from '@ionic/vue';
import {logoApple} from 'ionicons/icons';
import {axiosReq, validateForm, openToast, local} from '@/functions';
import router from '@/router';
import { ciapi, needEmailVerif } from '@/js/globals';
import { createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { auth } from '@/firebase';

export default ({
  name: 'RegisterCustomer',
  components: {
    IonContent,
    IonPage,
    IonBackButton,
    IonButtons,
    IonInput,
    IonToolbar
  },
  setup(){
    return{
      logoApple,
    }
  },data(){
    return{
        user:{role:"Customer"}
    };
  },
  methods:{
    register(){
        const valid = validateForm(this.user,{
            firstname: "required",
            lastname: "required",
            username: "required",
            email: {
                isEmail: true,
                isRequired: true,
                callback: ()=>{
                    openToast('Email must be in valid format!', 'danger');
                }  
            },
            password: {
                isRequired: true,
                minChars: 8,
                callback: ()=>{
                    openToast('Password must be more than 8 characters!', 'danger');
                }   
            },
            cnfpassword: {
                equalTo: this.user.password,
                isRequired: true,
                callback: ()=>{
                    openToast('Password and Confirm Password must match!', 'danger');
                }   
            },
            callback: ()=>{
                openToast('All fields are required!', 'danger');
            }
        });

        if(!valid.allValid) return false;
        openToast('Registration is inprogress...', 'warning');



        createUserWithEmailAndPassword(auth,this.user.email,this.user.password)
        .catch(err=>{
            console.log(err);   
            openToast(err, 'warning');
        })
        .then(userCred=>{
            console.log(userCred);   
            axiosReq({
                method: 'post',
                url: ciapi +'users/register',
                data: this.user
            }).catch(()=>{
                openToast('Something went wrong...', 'danger');
                deleteUser(userCred);
            }).then(res=>{ 
                if(res.data.msg === 'duplicate user'){ openToast('Account already exists!', 'danger');deleteUser(userCred);}
                else{
                    console.log(res.data);   
                    openToast('Registration Successful!', 'success');


                    if(needEmailVerif){
                        localStorage.setItem('user_email',this.user.email);
                        router.replace('/verify-email');
                        return;
                    }
                    axiosReq({
                        method: 'post',
                        url: ciapi +'users/login' ,
                        data: {email: this.user.email}
                    }).catch(err=>{
                        console.log(err.response);
                        openToast('Something went wrong...', 'danger');
                    }).then(result=>{
                        openToast('Login Successful', 'success');
                        local.set('user_id',result.data.user_id);
                        local.set('user_token',result.data.token);
                        local.setObject('user_info', result.data.info);
                        local.set('user_new',true);
                        if(result.data.msg === 'user not found') openToast('User not registered!', 'danger');
                        if(needEmailVerif && result.data.msg === 'user not verified') openToast('User not verified!', 'danger');
                        if(result.data.msg === 'user deactivated') openToast('User deactivated!', 'danger');
                        if(result.data.msg === 'wrong password') openToast('Wrong password!', 'danger');
                        if(result.data.success){   
                            router.replace('/addcarnewuser');
                        }
                    });
                }
                this.user = {role:"Customer"};
            });
        });
    }
  }
});
</script>

<style scoped>
*{margin: 0;padding: 0;}
.whitebg{
background-color: white;
height: 25vh;
position: absolute;
top: 0;
left: 0;
right: 0;
}
.content{
  height: 100%;
  min-height: 550px;
  position: relative;
}
ion-toolbar{
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    --ion-background-color: #fff;
}
ion-buttons{
    --ion-background-color: #fff;
}
ion-button{
    height: 50px;
  --border-radius: 10px;
  margin-bottom: 10px;
  --background: #b7170b;
  --background-activated: var(--ion-color-hover-red);
  font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 16px;
}
.titlereg{
    text-align: center;
    position: absolute;
    top: 37px;
    left: 5%;
    right: 5%;
    width: 90%;
}
ion-input{
    width: 277px;
    height: 51px;
    border: 1px solid #e2e2e2;
    background-color: #fff;
    border-radius: 11px;
    width: 100%;
    margin: 0 0 10px 0;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 16px;
    --padding-start:15px
}
.regforms{
    position: absolute;
    top: 118px;
    left: 20px;
    right: 20px;
}
section p{
    text-align: center;
}
section{
    position: absolute;
    top: 558px;
    left: 30px;
    right: 30px;
    margin-bottom: 20px;
}
ion-content{
    --ion-background-color:none;
    background-image: url('@/img/backgroundrentarepair.jpg');
    background-size: cover;
    background-position: bottom;
    height: 100%;
    width: 100%;
}
.regforms p{
    text-align: center;
}
/**END OF CARD LAYOUT */
</style>
