<template>
  <ion-page>
    <ion-content>
      <div class="content">
        <ion-card>
          <img src="../img/logo.png">
          <p>Loaded: {{loadLabel}}...</p>
          <div class="loader"><div class="loader-inner"></div></div>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import { IonContent, IonPage} from '@ionic/vue';
import preload from '@/preload';

export default ({
  name: 'PreLoad',
  components: {
    IonContent,
    IonPage
  },
  data(){
    return {
      loadLabel: 'User Data',
      loadPercent:0
    }
  },
  created(){
    preload(res=>{
      switch(res){
        case 'user': this.loadLabel = 'User Data';break;
        case 'cars': this.loadLabel = 'Car Data';break;
        case 'task': this.loadLabel = 'Tasks';break;
        case 'notifications': this.loadLabel = 'Notifications';break;
      }

      
      this.loadPercent+=25;
      document.querySelector('.loader-inner').style.width = this.loadPercent+'%';

      if(this.loadPercent == 100) setTimeout(()=>this.$router.replace('/customer/dashboard'), 300);
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
