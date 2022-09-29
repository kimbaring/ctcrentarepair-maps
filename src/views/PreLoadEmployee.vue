<template>
  <ion-page>
    <ion-content>
      <div class="content">
        <ion-card>
          <img src="../img/logo.png">
          <p>{{(loadLabel == '') ? 'Fetching data...' : 'Loaded:'}} {{loadLabel}}</p>
          <div class="loader"><div class="loader-inner"></div></div>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import { IonContent, IonPage} from '@ionic/vue';
import {preloadEmployee} from '@/preload';
import {local} from '@/functions';

export default ({
  name: 'PreLoadEmployee',
  components: {
    IonContent,
    IonPage
  },
  data(){
    return {
      loadLabel: '',
      loadPercent:0
    }
  },
  created(){
    preloadEmployee(res=>{
      switch(res){
        case 'config': this.loadLabel = 'App Configurations';break; 
        case 'user': this.loadLabel = 'User Data';break;
      }
      this.loadPercent+=50;
      document.querySelector('.loader-inner').style.width = this.loadPercent+'%';

      if(this.loadPercent == 100) {
        switch(local.getObject('user_info').role){
          case 'Technician': this.$router.replace('/technician/dashboard'); break;
          case 'Tow Truck Operator': this.$router.replace('/towing/dashboard'); break;
          case 'Ride Sharer': this.$router.replace('/ridesharer/dashboard'); break;
          case 'Delivery': this.$router.replace('/delivery/dashboard'); break;
        }
      }
    });
  }
});
</script>

<style scoped>
*{margin: 0;padding: 0;}

.content{
  height: 100%;
  min-height: 550px;
  position: relative;
  background: url('@/img/backgroundrentarepair.jpg');
}

img{
  display: block;
  margin: 0 auto 20px;
}

p{text-align: center;}

.loader{
  height: 10px;
  width: 80%;
  background: #eee;
  margin: 20px auto;
  border-radius: 20px;
  overflow: hidden;
}

.loader-inner{
  height: 100%;
  width: 0%;
  background: #b7170b;
}


ion-card{
  position: absolute;
  width: 90%;
  max-width: 600px;
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);
  padding: 20px;
  border-radius: 20px;
  display: block;
  margin: 0 auto 20px;

}


</style>
