<template>
    <ion-page>
         <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button defaultHref="/technician"></ion-back-button>
                </ion-buttons>                
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <div class="section">
                <ion-title>Add Wallet</ion-title>
            </div>
            <h2></h2>
            <div class="form">
                <div class="col2">
                    <div>
                        Amount
                        <ion-input v-model="amount" placeholder="Enter Amount"></ion-input>
                    </div>
                </div>
            </div>
            <div class="submit_btn">
                <div ref="paypal"></div>
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
} from '@ionic/vue';
import{ local } from '@/functions.js';
import {push, db} from '@/firebase.js';
import {get, child, ref} from 'firebase/database';



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
    },
    data(){
        return{
            amount: 0,
            userid: local.get('user_id'),
            wallets: 0,
            userwallets: [],
        }
    },
    mounted: function() {
    const script = document.createElement("script");
    script.src =
      "https://www.paypal.com/sdk/js?client-id=AUEkhwjZikNAwxm23SBgQfIjqcxwjPm6ZDtHq9JJwt1z-4GwwrEUl7wtc6Cr_8CY6F9F5DWECzHyh3GL";
    script.addEventListener("load", this.setLoaded);
    document.body.appendChild(script);
    console.log(this.setLoaded);
    },
    methods: {
    setLoaded: function() {
        this.loaded = true;
        window.paypal
            .Buttons({
                    createOrder: (data, actions) => {
                    if(this.amount != 0)
                    {
                        return actions.order.create({
                        purchase_units: [
                            {
                                description: "Adding Wallet to Rent a Repair",
                                amount: {
                                    currency_code: "USD",
                                    value: this.amount
                                }
                            }
                        ]
                        });
                    }
                    else{
                        console.log("Please Enter Amount");
                    }
            },
            onApprove: async () => {
                // const order = await actions.order.capture();
                get(child(ref(db), `userwallet/${this.userid}`)).then((snapshot) => {
                if (snapshot.exists()) {
                    this.userwallets.wallet = parseInt(snapshot.val().wallet) + parseInt(this.amount);
                    this.userwallets.user_id = this.userid;
                    push(`userwallet/${this.userid}`, this.userwallets);
                    this.$router.push('/technician');
                } else {
                    this.userwallets.wallet = this.amount;
                    this.userwallets.user_id = this.userid;
                    push(`userwallet/${this.userid}`, this.userwallets);
                    this.$router.push('/technician');
                }
                }).catch((error) => {
                console.error(error);
                });
            },
            onError: err => {
                console.log(err);
            }
            })
            .render(this.$refs.paypal);
        }
    }
});
</script>

<style scoped>
h2{
    font-size: 20px;
color: #b7170b;
text-align: center;
border-bottom: 1px solid #ccc;
padding-bottom: 13px;
width: 90%;
margin: 20px auto 0;

}
.viewbutton{
    --background: #b7170b;
    --background-activated: var(--ion-color-hover-red);
}
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
ion-back-button{color: #fff}
ion-header{color:#fff;}
ion-header small{text-align: center;display: block;}
ion-header::after {background-image: none;}
ion-toolbar{--background:#b7160b; color: #fff}
.form{background-color: #fff; padding-top: 20px;}
.form > div{margin:15px;}
.form ion-input{border:1px solid #aaa;border-radius:10px;margin:10px 0 0;--padding-top:15px;--padding-bottom:15px;--padding-start:15px;--padding-end:15px}
.form ion-textarea{border:1px solid #aaa;border-radius:10px;margin:10px 0 0;--padding-top:15px;--padding-bottom:15px;--padding-start:15px;--padding-end:15px;height:15vh}
.submit_btn{
    width: 90%;
    margin: 0 auto;
}
</style>
