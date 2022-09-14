<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script>
import { IonApp, IonRouterOutlet, alertController } from '@ionic/vue';
// import { IonApp, IonRouterOutlet } from '@ionic/vue';
import {local,openToast} from '@/functions.js';
import router from '@/router';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Capacitor } from "@capacitor/core";
import { NativeSettings, AndroidSettings,IOSSettings } from 'capacitor-native-settings';  
import {Keyboard,KeyboardResize} from '@capacitor/keyboard';

export default ({
  name: 'App',
  components: {
    IonApp,
    IonRouterOutlet
  },
  data(){
    return{
      loginPaths: [
        "/home",
        "/register",
        "/registercustomer",
        "/registertechnician",
        "/registerridesharer",
        "/registertowCompany",
        "/login",
        "/verify-email",
        "/forgotpassword",
        "/register",
        "/location-settings",
        "/registerdelivery"
      ],
      interval: null,
    };
  },
  beforeUnmounted() {
    // prevent memory leak
    clearInterval(this.interval)
  },

  created(){
    this.routeChanged(this.$route.path);
    defineCustomElements(window);
    setInterval(() => {
      this.checkAllGPS();
    }, 5000);
  },

  methods:{
    checkAllGPS(){
        this.checkGPSPermission().then(()=>{
        this.requestGPSPermission().then(()=>{
          this.askToTurnOnGPS().then(()=>{
            
          });
        });
      });
    },
    async askToTurnOnGPS() {
        return await new Promise((resolve,reject) => {
          if (Capacitor.isNativePlatform()) {
            LocationAccuracy.canRequest().then((canRequest) => {
                if (canRequest) {
                    LocationAccuracy.request(LocationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
                        () => {
                            resolve(true);
                        },
                        () => {this.presentAlert();}
                    );
                }
                else { reject('Failed to open location!'); }
            });
          } else { this.error1 = Capacitor.isNativePlatform(); resolve(true); }
        })
    },
     async checkGPSPermission() {
          return await new Promise((resolve, reject) => {
              if (Capacitor.isNativePlatform()) {
                  AndroidPermissions.checkPermission(AndroidPermissions.PERMISSION.ACCESS_FINE_LOCATION).then(
                      result => {
                          if (result.hasPermission) {
                              // If having permission show 'Turn On GPS' dialogue
                              this.error1 = result.hasPermission
                              resolve(true);
                          } else {
                            this.error1 = result.hasPermission
                              // If not having permission ask for permission
                              resolve(false);
                          }
                      },
                      () => { reject('Failed to check GPS Permission!'); }
                  );
              } else { this.error1 = Capacitor.isNativePlatform(); resolve(true); }
          })
      },

      async requestGPSPermission(){
          return await new Promise((resolve, reject) => {
            if (Capacitor.isNativePlatform()) {
              LocationAccuracy.canRequest().then((canRequest) => {
                  if (canRequest) {
                      resolve('CAN_REQUEST');
                  } else {
                      // Show 'GPS Permission Request' dialogue
                      AndroidPermissions.requestPermission(AndroidPermissions.PERMISSION.ACCESS_FINE_LOCATION)
                          .then(
                              (result) => {
                                  if (result.hasPermission) {
                                    this.error2 = result.hasPermission;
                                      // call method to turn on GPS
                                      resolve('GOT_PERMISSION');
                                  } else {
                                    this.error2 = result.hasPermission;
                                      resolve('DENIED_PERMISSION');
                                  }
                              },
                              error => {
                                this.error2 = error;
                                reject('Denied GPS Permission!');
                                  // Show alert if user click on 'No Thanks'
                                  // alert('requestPermission Error requesting location permissions ' + error);
                              }
                          );
                  }
              });
            }
          })
      },
      async presentAlert() {
        const alert = await alertController.create({
          header: 'Please turn on your Location',
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              handler: () => {
                this.error3 = "User cancel to turn on location";
              },
            },
            {
              text: 'Turn on',
              role: 'confirm',
              handler: () => {
                NativeSettings.open({
                  optionAndroid: AndroidSettings.Location, 
                  optionIOS: IOSSettings.App
                });
              },
            },
          ],
        });

        await alert.present();

        const { role } = await alert.onDidDismiss();
        this.roleMessage = `Dismissed with role: ${role}`;
      },
    routeChanged(to){
      if(!local.isset('user_token')) {
        if(this.loginPaths.includes(to)) return;
        router.replace('/login');
        if(to == '/home') return;
        openToast("You must be signed in!", 'danger');
      } else if(to == '/customer/location') {
        if (Capacitor.isNativePlatform()) {
          Keyboard.addListener('keyboardWillShow', () => {
              Keyboard.setResizeMode({
                  mode: KeyboardResize.None
              });
          });
        }
      } else {
         if(this.loginPaths.includes(to)) {
          switch(local.getObject('user_info').role){
            case 'Customer': router.replace('/customer/dashboard'); break;
            case 'Technician': router.replace('/technician/dashboard'); break;
            case 'Tow Truck Operator': router.replace('/comingsoon'); break;
            case 'Ride Sharer': router.replace('/comingsoon'); break;
            case 'Delivery': router.replace('/comingsoon'); break;
          }
          openToast("Please log out properly!", 'danger');
        }
        if (Capacitor.isNativePlatform()) {
          Keyboard.addListener('keyboardWillShow', () => {
              Keyboard.setResizeMode({
                  mode: KeyboardResize.Native
              });
          });
        }
      }
    }
  },

  watch:{
    $route (to){
      this.routeChanged(to.path);
    }
  }
});
</script>