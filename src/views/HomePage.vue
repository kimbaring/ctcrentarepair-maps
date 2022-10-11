<template>
  <ion-page>
    <ion-content>
      <div class="whitebg">
      </div>
      <div class="content">
        <ion-card>
          <ion-card-header>
            <img src="../img/logo.png" alt="">
          </ion-card-header>
          <ion-card-content>
            <section>
              <ion-button class="loginbutton" @click="$router.push('/login')" expand="block">Sign In</ion-button>
            </section>
            <!-- <section>
              <ion-button class="signupappple" expand="block"><ion-icon :icon="logoApple"></ion-icon>Sign in with Apple</ion-button>
            </section> -->
            <section>
              <ion-button class="signupbutton" @click="$router.push('/register')" expand="block">Sign Up</ion-button>
            </section>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import { IonContent, IonPage, IonCard,IonCardHeader,IonCardContent,IonButton} from '@ionic/vue';
import { logoApple } from 'ionicons/icons';
import{ auth } from'@/firebase';
import {GoogleAuthProvider, signInWithPopup} from 'firebase/auth';
import {axiosReq, local, openToast } from '@/functions';
import { ciapi, needEmailVerif } from '@/js/globals';
import router from '@/router';

export default ({
  name: 'HomePage',
  components: {
    IonContent,
    IonPage,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonButton
  },
  setup(){
    return{
      logoApple,
    }
  },
  methods:{
    SignGoogle(){
      const provider = new GoogleAuthProvider();


  
      
      signInWithPopup(auth, provider)
      .then((result) => {


        //result.additionalUserInfo.isNewUser
          axiosReq({
            method: 'post',
            url: ciapi +'users/login' ,
            data: {email: result.user.email}
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
              switch(res.data.info.role){
                case 'Customer': router.replace('/customer/dashboard'); break;
                case 'Technician': router.replace('/technician/dashboard'); break;
                case 'Tow Truck Operator': router.replace('/comingsoon'); break;
                case 'Ride Sharer': router.replace('/comingsoon'); break;
              }
            }
        });
      }).catch((error) => {
        const errorMessage = error.message;
        console.log(errorMessage);
        // ...
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
  min-height: 570px;
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
/**END OF CARD LAYOUT */
.loginbutton{
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
.signupbutton{
  height: 50px;
  --border-radius: 10px;
  margin-bottom: 10px;
  --background: #fff;
  color: #000;
  border: 1px solid rgba(0,0,0,0.1);
  --background-activated: var(--ion-color-light-danger);
  border-radius: 10px;
  font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 16px;
}
.signupappple{
  height: 50px;
  --border-radius: 10px;
  margin-bottom: 10px;
  --background: #000;
  color: #fff;
  border: 1px solid rgba(0,0,0,0.1);
  --background-activated: var(--ion-color-dark-tint);
  border-radius: 10px;
  font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 16px;
}
.signupbutton img{
  margin-right: 5px;
}
ion-icon{
  margin-right: 5px;
  font-size: 30px;
}
</style>
