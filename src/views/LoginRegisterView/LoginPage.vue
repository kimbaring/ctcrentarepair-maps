<template>
  <ion-page>
    <ion-content>
      <div class="whitebg">
      </div>
      <div class="content">
        <ion-card>
          <ion-card-header>
            <img src="../../img/logo.png" alt="">
          </ion-card-header>
          <ion-card-content>
            <ion-input v-model="loginInput" placeholder="Email"></ion-input>
            <ion-input v-model="password" type="password" placeholder="Password"></ion-input>
            <div class="buttonflex">
                <section>
                  <ion-button v-bind:disabled="formLoading" v-on:click="login" class="loginbutton" expand="block">
                    <span v-if="!formLoading">Login</span>
                    <span v-if="formLoading">
                        <ion-spinner name="dots"></ion-spinner>
                    </span>
                  </ion-button>
                </section>
                <section>
                  <ion-button @click="$router.push('/register')" class="signupbutton" expand="block">Register</ion-button>
                </section>
            </div>
            <section>
                <a @click="$router.push('/forgotpassword')">Forgot Password</a>
            </section>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import { IonContent, IonPage, IonCard,IonCardHeader, IonCardContent, IonButton, IonInput, IonSpinner } from '@ionic/vue';
import { axiosReq, validateForm,openToast, local } from '@/functions';
import router from '@/router';
import { ciapi, needEmailVerif } from '@/js/globals';
import{ signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase';

export default ({
  name: 'LoginPage',
  components: {
    IonContent,
    IonPage,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonButton,
    IonInput,
    IonSpinner
  },
  data(){
    return{
      loginInput: "",
      password: "",
      formLoading: false,
    };
  },
  methods:{
    login(){
      let rules = {password:{isRequired:true,minChars:8,callback:()=>{openToast('Password must be more than 8 characters!', 'danger')}}};
      let input = {password:this.password};
      rules.email = {isRequired:true,isEmail:true,callback:()=>{openToast('Email must be in valid format!', 'danger')}};
      input.email = this.loginInput;
      rules.callback = ()=>{openToast('All fields are required!', 'danger')};
      
      const valid = validateForm(input,rules);
      if(!valid.allValid) return;
      
      this.formLoading = true;

      signInWithEmailAndPassword(auth, this.loginInput, this.password)
      .then(()=> {
        axiosReq({
          method: 'post',
          url: ciapi +'users/login' ,
          data: {email: this.loginInput,uid_hashed:auth.currentUser.uid}
        }).catch(err=>{
          console.log(err.response);
          openToast('Something went wrong...', 'danger');
        }).then(res=>{
            openToast('Login Successful', 'success');
            local.set('user_id',res.data.user_id);
            local.set('user_token',res.data.token);
            local.setObject('user_info', res.data.info);
            if(res.data.msg === 'user not found') openToast('User not registered!', 'danger');
            if(needEmailVerif && res.data.msg === 'user not verified') openToast('User not verified!', 'danger');
            if(res.data.msg === 'user deactivated') openToast('User deactivated!', 'danger');
            if(res.data.msg === 'wrong password') openToast('Wrong password!', 'danger');
            if(res.data.success){
              this.formLoading = false;
              switch(res.data.info.role){
                case 'Customer': router.replace('/customer/dashboard'); break;
                case 'Technician': router.replace('/technician/dashboard'); break;
                case 'Tow Truck Operator': router.replace('/comingsoon'); break;
                case 'Ride Sharer': router.replace('/comingsoon'); break;
              }
            }
        });
        
        
      }).catch(err=>{
        this.formLoading = false;
        console.log(err.code);
        if(err.code == 'auth/wrong-password') openToast('Wrong password!', 'danger');
        else if(err.code == 'auth/user-not-found') openToast('User not registered!', 'danger');

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
ion-content{
  --ion-background-color: black;
  position:relative;
}
ion-card{
  position: absolute;
  left: 0;
  right: 0;
  display:flex;
  flex-wrap: wrap;
  flex-direction: column;
  justify-content: center;
  margin: 25px 25px 25px 25px;
  border-radius: 29px;
  background-image: url('@/img/backgroundrentarepair.jpg');
  background-size: cover;
  background-position: bottom;
  min-height: 500px;
  height: 93%;
}
ion-card-header{
  text-align:center;
  position: absolute;
  top: 50px;
  left: 15%;
  right: 0;
  width: 70%;
}

ion-card-content{
  position: absolute;
  bottom: 50px;
  left: 20px;
  right: 20px;
}

/**End of Card */
.loginbutton{
    height: 50px;
    --border-radius: 10px;
    margin-bottom: 10px;
    --background: #b7170b;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 16px;
    --background-activated: var(--ion-color-hover-red);
}
.signupbutton{
    height: 50px;
    --border-radius: 10px;
    margin-bottom: 10px;
    border-radius: 10px;
    --background: #b7170b;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 16px;
    --background-activated: var(--ion-color-hover-red);
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
.buttonflex{
display: flex;
flex-wrap: wrap;
}
.buttonflex section{
    width: 48%;
    margin-left: 3px;
}
ion-card-content section{
    text-align: center;
    text-decoration: none;
}
</style>

