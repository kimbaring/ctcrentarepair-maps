<template>
  <ion-page>
    <ion-tabs >
      <ion-router-outlet class="childRouter"></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="dashboard" href="/customer/dashboard">
          <ion-icon :icon="homeOutline" />
        </ion-tab-button>
        <ion-tab-button tab="transactionhistory" href="/customer/transactionhistory">
          
          <ion-icon :icon="timeOutline" />
        </ion-tab-button>
        <ion-tab-button tab="car" href="/customer/mycar">
          <ion-icon :icon="nuclearOutline"></ion-icon>
        </ion-tab-button>
        <ion-tab-button tab="notif" href="/notification">
          <span class="notif" v-if="counter > 0">{{counter}}</span>
          <ion-icon :icon="notificationsOutline"></ion-icon>
        </ion-tab-button>
        <ion-tab-button tab="profile" href="/customer/profile">
          <ion-icon :icon="personCircleOutline" />
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script>
import {
    IonTabBar,
    IonTabButton,
    IonTabs,
    IonIcon,
    IonPage,
    IonRouterOutlet,
  } from '@ionic/vue';
import { personCircleOutline, timeOutline, homeOutline,nuclearOutline,notificationsOutline } from 'ionicons/icons';
import { local } from '@/functions';
import { db } from '@/firebase';
import {ref,query, orderByChild, equalTo, get, onValue} from 'firebase/database';

export default({
  name: 'TabsPage',
  components: { IonTabBar,
    IonTabButton,
    IonTabs,
    IonIcon,
    IonPage,
    IonRouterOutlet
},
  data() {
    return {
      personCircleOutline,
      timeOutline,
      homeOutline,
      nuclearOutline,
      notificationsOutline,
      counter: null,
    }
  },
  mounted(){
    const que = query(ref(db,'/notifications'),orderByChild('user_id'), equalTo(local.get('user_id')));


    

    onValue(ref(db,'/notifications'), ()=>{
      this.counter = 0;
      let keys = [];
      get(que).then(snapshot=>{
          if(snapshot.exists()) for(let snap in snapshot.val()) if(snapshot.val()[snap].is_read != 1) keys.push(snap);
          this.counter = keys.length;
      });
    });

    this.isNewUser = local.get('user_new');
    console.log(local.get('user_new'));
  }
});
</script>
<style scoped>
ion-tab-bar{
    background: var(--ion-color-light-contrast);
}
ion-tab-button{
    --background-focused: var(--ion-color-secondary-contrast);
    background: var(--ion-color-light-contrast);
    --color-selected: var(--ion-color-secondary-contrast);
}

ion-router-outlet{overflow-y: scroll;}

.notif{
  position: absolute;
  right: 30px;
  top: 5px;
  background: #b7160b;
  border-radius: 50%;
  width: 16px;
  height: 16px;
}

</style>
