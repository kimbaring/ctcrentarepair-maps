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
            <div class="password">
              <ion-input v-model="password" type="password" placeholder="Password" id="password"></ion-input>
              <a v-if="password != ''" href="javascript:;" @click="showPass('#password')"><ion-icon :class="{ showIcon : !showIcon }" :icon="eye"></ion-icon><ion-icon :class="{ showIcon2 : !showIcon2 }" :icon="eyeOff"></ion-icon></a>
            </div>
            <div class="buttonflex">
                <section>
                  <ion-button :disabled="formLoading" v-on:click="login" class="loginbutton" expand="block">
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
import { IonContent, IonPage, IonCard,IonCardHeader, IonCardContent, IonButton, IonInput, IonSpinner, IonIcon } from '@ionic/vue';
import { axiosReq, validateForm,openToast, local } from '@/functions';
import {eye, eyeOff} from 'ionicons/icons';
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
    IonSpinner,
    IonIcon
  },
  data(){
    return{
      loginInput: "",
      password: "",
      formLoading: false,
      showIcon: true,
      showIcon2: false,
      eye,
      eyeOff
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

      console.log(this.loginInput);
      
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
            if(res.data.msg === 'user not found') openToast('User not registered!', 'danger');
            if(needEmailVerif && res.data.msg === 'user not verified'){
              openToast('User not verified!', 'danger');
              local.set('user_email',this.loginInput);
              this.$router.push('/verify-email');
            }
            if(res.data.msg === 'user deactivated') openToast('User deactivated!', 'danger');
            if(res.data.msg === 'wrong password') openToast('Wrong password!', 'danger');
            this.formLoading = false;
            console.log(res.data);
            if(res.data.success){
              local.set('user_id',res.data.user_id);
              local.set('user_token',res.data.token);
              local.setObject('user_info', res.data.info);
              if(res.data.info.role == 'Customer') window.location.replace('/preload');
              else window.location.replace('/preloademployee');
            }
        });
        
        
      }).catch(err=>{
        this.formLoading = false;
        console.log(err.code);
        if(err.code == 'auth/wrong-password') openToast('Wrong password!', 'danger');
        else if(err.code == 'auth/user-not-found') openToast('User not registered!', 'danger');

      });
    },
    showPass(e) {
      let inType = document.querySelector(e);

      if (inType.type === "password") {
        inType.type = "text";
        this.showIcon2 = true;
        this.showIcon = false;
      }else {
        inType.type = "password";
        this.showIcon = true;
        this.showIcon2 = false;
      }
    },
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

.password{
  position: relative;
}

.password a{
  position: absolute;
  top: 57%;
  z-index: 2;
  right: 20px;
  font-size: 20px;
  color: #777;
  transform: translateY(-50%);
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

.showIcon, .showIcon2{display: none;}

</style>

