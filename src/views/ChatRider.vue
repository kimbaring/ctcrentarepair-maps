<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button defaultHref="/customer/dashboard/location/cardetails/waiting/booked"></ion-back-button>
                </ion-buttons>                
            </ion-toolbar>
        </ion-header>

        <ion-content color="customred">
            <h2 class="ion-text-center title">Chat</h2>

            <div class="box_wrap">
                <div class="box_inner" :class="{ overflowHide : overflowHide }">
                    <ion-list :class="{ appHeightFix: fixHeight }">
                        <div class="" id="content">
                            <div class="" id="autoLink" :class="{zoomImg: (zoomKey == message.ID),box_user1: (!isSender(message.Sender)), box_user2: (isSender(message.Sender))}"  v-for="message in messageList" :key="message.key" slot="end" lines="none">
                                <ion-thumbnail v-if="message.Image">
                                    <ion-img @click="showSingle(message.ID);" :src="message.Image" :data-key="message.ID"></ion-img>
                                    <a v-if="(isSender(message.Sender))" @click="removeTextOption(); showButton2 = false;showButtonId2 = message.ID"><ion-icon :icon="ellipsisVertical"></ion-icon></a>
                                </ion-thumbnail>
                                <ion-item class="ion-text-end" lines="none">
                                    <ion-label slot="end" class="ion-text-wrap">
                                        <p id="autoLink" v-if="message.Message != ''" v-html="message.Message"></p>
                                        <a v-if="message.Message != ''" @click="removeImageOption(); showButton = false;showButtonId = message.ID">
                                            <ion-icon v-if="(isSender(message.Sender))" :icon="ellipsisVertical"></ion-icon>
                                        </a>
                                        <small>{{ dateString(message.Send_Date) }}</small></ion-label>
                                </ion-item>
                            </div>
                        </div>
                        <vue-easy-lightbox escDisabled moveDisabled :visible="visible" :index="index" :imgs="imgs" @hide="handleHide"
                                ></vue-easy-lightbox>
                        <p class="scrollBottom"></p>
                    </ion-list>
                </div>
                <div class="box_submit">
                    <ion-grid class="action_wrap" :class="(showButton) ? 'showActionButton': ''">
                        <ion-row class="ion-text-center">
                            <ion-col size="4">
                                    <a @click="setUpdateMessage" href="javascript:;"><ion-icon :icon="create" color="customred"></ion-icon>Update</a>
                            </ion-col>
                            <ion-col size="4">
                                    <a @click="deleteText(showButtonId)" href="javascript:;"><ion-icon :icon="trash" color="customred"></ion-icon>Remove</a>
                            </ion-col>
                            <ion-col size="4">
                                    <a @click="showButton = true" href="javascript:;"><ion-icon :icon="backspace" color="customred"></ion-icon>Cancel</a>
                            </ion-col>
                        </ion-row>
                    </ion-grid>
                    <ion-grid class="action_wrap" :class="(showButton2) ? 'showActionButton2': ''">
                        <ion-row class="ion-text-center">
                            <ion-col size="6">
                                    <a @click="deleteImg(showButtonId2)" href="javascript:;"><ion-icon :icon="trash" color="customred"></ion-icon>Remove</a>
                            </ion-col>
                            <ion-col size="6">
                                    <a @click="showButton2 = true" href="javascript:;"><ion-icon :icon="backspace" color="customred"></ion-icon>Cancel</a>
                            </ion-col>
                        </ion-row>
                    </ion-grid>
                    <ion-grid v-if="imageFile != null || currentImg != ''" :class="{ close : closePendingImg }">
                        <ion-row>
                            <ion-col size="3">
                                <ion-thumbnail>
                                    <span class="closeAttach" @click="closeAttachFile">&times;</span>
                                    <img :src="currentImg" alt="attach file">
                                    <p class="uploadProgress">{{ uploadProgress }}</p>
                                </ion-thumbnail>
                            </ion-col>
                        </ion-row>
                    </ion-grid>
                    <div class="typeWrap" v-if="isTyping" :class="{ addClass : addWrapClass }">
                        <p>{{role}} is typing</p>
                        <ion-spinner duration="1300" class="showTyping" name="dots"></ion-spinner>
                    </div>
                    <ion-item>
                        <div class="file_wrap">
                            <ion-icon :icon="camera"></ion-icon>
                            <input type="button" @click="takePicture" accept="image/*">
                        </div>
                        <div class="file_wrap2">
                            <ion-icon :icon="image"></ion-icon>
                            <input type="file" @change="showImage" accept="image/*">
                        </div>
                        <ion-input id="inputValue" class="ion-padding" v-model="showMessage" @keyup.enter="sendMessage" type="text" placeholder="Type something"></ion-input>
                        <ion-button slot="end" @click="sendMessage" color="customred">
                            <ion-icon :icon="send"></ion-icon>
                        </ion-button>
                    </ion-item>
                </div>
            </div>
        </ion-content>


    </ion-page>
</template>

<script>
import { IonPage, IonBackButton, IonHeader, IonButtons, IonContent, IonItem, IonLabel, IonList, IonIcon, IonInput, IonButton, IonThumbnail, IonImg, IonGrid, IonRow, IonCol, IonSpinner } from '@ionic/vue';
import { personCircle, chatboxEllipses, send, image, trash, create, ellipsisVertical, backspace, camera } from 'ionicons/icons';
import Autolinker from 'autolinker';
import VueEasyLightbox from 'vue-easy-lightbox';
import { Camera, CameraResultType } from '@capacitor/camera';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import '@/firebase';
import {dateFormat, local} from '@/functions';
import { getDatabase, ref, remove, onValue, set, onChildAdded } from "firebase/database";
import { getStorage, ref as sRef, uploadBytesResumable, getDownloadURL, deleteObject, uploadString } from "firebase/storage";

export default ({
    components: { IonPage, IonBackButton, IonHeader, IonButtons,IonContent, IonItem, IonLabel, IonList, IonIcon, IonInput, IonButton, IonThumbnail, IonImg, IonGrid, IonRow, IonCol, VueEasyLightbox, IonSpinner },
    setup() {
        return {
            personCircle, chatboxEllipses, send, image, trash, create, ellipsisVertical, backspace, camera
        }
    },
    data() {
        return {
            sendFile: '',
            showMessage: '',
            messageList: [],
            imageFile: null,
            currentImg: '',
            zoomKey: 0,
            closePendingImg: false,
            uploadProgress: '',
            overflowHide: false,
            showButton: true,
            showButton2: true,
            showButtonId:'',
            updateMode: false,
            queImage: '',
            visible: false,
            index: 0,
            imgs: [],
            fixHeight: false,
            myFunction: false,
            addWrapClass: false,
            isTyping: false,
            role: local.getObject('user_info').role
        }
    },
    watch:{
        showMessage(){
            const db = getDatabase();
            if(this.showMessage.length > 0) set(ref(db, 'Messages/'+local.get('chat_id')+'/info/'+local.get('user_id')),"typing");
            else set(ref(db, 'Messages/'+local.get('chat_id')+'/info/'+local.get('user_id')),"idle");
        }
    },
    methods: {
        dateString(date){
            return dateFormat('%lm %d, %y at %h:%i%a',date);
        },
        isSender(id){
            console.log(id)
            if(id==local.get('user_id')) return true;
            return false;
        },
        async takePicture() {
            Camera.getPhoto({
                quality: 90,
                allowEditing: true,
                resultType: CameraResultType.DataUrl
            }).then((img) => {

                let storage = getStorage();

                const date = new Date();
                const dateString = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + " " + 
                date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                const generateFileName = dateFormat('%y%m%d%h%i%s',dateString);

           

                // const uploadTask = uploadBytesResumable(sRef(storage, 'images/'+generateFileName), metadata);

                uploadString(sRef(storage, 'images/' + generateFileName), img.dataUrl, 'data_url').then(() => {
                    
                    getDownloadURL(sRef(storage, 'images/' + generateFileName)).then((downloadURL) => {
                        this.currentImg = downloadURL;
                    })

                });
            });

        },
        showSingle(ID) {
            for(let img3 in this.messageList){
                if(this.messageList[img3].ID == ID){
                    this.imgs = this.messageList[img3].Image;
                }
            }
            this.index = 1;
            this.show()
            this.fixHeight = true
        },
        show() {
            this.visible = true
        },
        handleHide() {
            this.visible = false
            this.fixHeight = false
        },
        setUpdateMessage(){
            this.updateMode = true;
            
            for(let msg in this.messageList){
                if(this.messageList[msg].ID == this.showButtonId){
                    this.showMessage = this.messageList[msg].Message;
                    break;
                }
            }
            this.showButton = true;
        },
        sendMessage() {
            if(this.showMessage == '' && this.currentImg == '') {
                return;
            }

            if(this.updateMode){

                const db = getDatabase();
                for(let msg in this.messageList){
                    if(this.messageList[msg].ID == this.showButtonId){

                        if(this.showMessage == '') return;

                        set(ref(db, `/Messages/${local.get('chat_id')}/msgs/${msg}`),this.showMessage);
                        break;
                    }
                }

                this.showButton = true;
                this.showMessage = '';

                setTimeout(()=> {
                    document.querySelector('.box_inner').scrollTo({
                        top: this.showMessage,
                        left: 0,
                        behavior: 'auto'
                    });
                }, 100)

                return;
            }

            // this.showMessage = this.showMessage.replaceAll(/(http||https):\/\/[^\s]+/gi,'<a target="_blank" href="$&" v-html>$&</a>');

            this.showMessage = Autolinker.link(this.showMessage, { className: 'btnLink', sanitizeHtml: true });

            const db = getDatabase();
            const userID = Math.floor(Math.random(1) * 999);
            // const getSendDate = date.format(now, date.compile('ddd, MMM DD h:mm A'));

            const date2 = new Date();
            const dateString = date2.getFullYear() + "-" + date2.getMonth() + "-" + date2.getDate() + " " + 
            date2.getHours() + ":" + date2.getMinutes() + ":" + date2.getSeconds();
            const generateFileName = local.get('user_id')+dateFormat('%y%m%d%h%i%s',dateString);
            set(ref(db, 'Messages/'+local.get('chat_id')+'/msgs/'+generateFileName), {
                ID: userID,
                Message: this.showMessage,
                Send_Date: dateString,
                Image: this.currentImg,
                Sender: local.get('user_id')
            });

            console.log("image: "+this.currentImg);

            this.showMessage = "";
            this.currentImg = "";
            this.closePendingImg = true;
        },
        showImage(event) {
            this.imageFile = event.target.files[0];
            this.currentImg = null;
            this.uploadFile();
        },
        uploadFile() {
            const storage = getStorage();
            const sendFile = this.imageFile;

            const metadata = {
                contentType: 'image/jpg'
            };

            const storageRef = sRef(storage, 'images/' + sendFile.name);
            const uploadTask = uploadBytesResumable(storageRef, sendFile, metadata);

            uploadTask.on('state_changed', (snapshot) => {
                this.closePendingImg = false;
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                this.uploadProgress = progress.toFixed() + '%';
            }, (error) => {
                    console.log(error);
                }, () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        this.uploadProgress = '';
                        this.currentImg = downloadURL;
                    });
                }
            );
        },
        deleteText(ID) {
            

            if(!confirm('Are you sure you want to delete?')) {
                this.showButton = true;
                return;
            }

            const db = getDatabase();
            for(let msg in this.messageList){
                if(this.messageList[msg].ID == ID){
                    remove(ref(db, `/Messages/${local.get('chat_id')}/msgs/${msg}`));
                    break;
                }
            }

            this.showButton = true;

        },
        deleteImg(ID) {

            if(!confirm('Are you sure you want to delete?')) {
                this.showButton2 = true;
                return;
            }

            const db = getDatabase();
            for(let msg2 = 0; msg2 < this.messageList.length; msg2++){
                if(this.messageList[msg2].ID == ID){
                    remove(ref(db, `/Messages/${local.get('chat_id')}/msgs/${msg2}`));
                    break;
                }
            }

            this.showButton2 = true;
        },
        closeAttachFile() {
            this.closePendingImg = true;
            this.currentImg = '';
            const storage = getStorage();
            deleteObject(sRef(storage,'images/' + this.queImage));
        },
        removeTextOption() {
            this.showButton = true;
        },
        removeImageOption() {
            this.showButton2 = true;
        }
    },
    mounted() {
        const db = getDatabase();
        const getMessage = ref(db, 'Messages/'+local.get('chat_id')+'/msgs');
        const getTypingStatus = ref(db, 'Messages/'+local.get('chat_id')+'/info/');



        set(ref(db, 'Messages/'+local.get('chat_id')+'/info/'+local.get('user_id')),"idle");

        onValue(getTypingStatus,(snapshot)=>{
            if(snapshot.exists()){
                for(let s in snapshot.val()){
                    if(s != local.get('user_id')){
                        if(snapshot.val()[s] == "typing")
                            this.isTyping = true;
                        else 
                            this.isTyping = false;
                    }
                }
            }
        })

        if(local.getObject('user_info').role == 'Customer'){
            switch(local.getObject('customer_task').service_type.toLowerCase()){
                case 'technician': this.role= 'Technician'; break;
                case 'towing': this.role= 'Tow Truck Operator'; break;
                case 'ride sharer': this.role= 'Ride Sharer'; break;
            }
        }else{
            this.role = 'Customer';
        }

        

        onValue(getMessage, (snapshot) => {
            const data = snapshot.val();
            this.myFunction = true;
            this.messageList = data;
            let messageArray = [];
            for(let m in this.messageList) this.messageList.ID = m;
            for(let m in this.messageList) messageArray.push(this.messageList[m]);
            messageArray.sort((a,b)=>{
                var d1 = new Date(a.Send_Date);
                var d2 = new Date(b.Send_Date);
                
                return d1 - d2;
            })
            console.log(this.messageList);


            for(let m in this.messageList) messageArray.push(this.messageList[m]);

            this.messageList = messageArray;
        });
        
        onChildAdded(getMessage, () =>{
            setTimeout(()=> {
                document.querySelector('.box_inner').scrollTo({
                    top: document.querySelector('.box_inner').scrollHeight,
                    left: 0,
                    behavior: 'smooth'
                });
            }, 100);
        })

        defineCustomElements(window);
    }
})

</script>

<style scoped>

ion-back-button{color: #fff}
ion-header{color:#fff;}
ion-header small{text-align: center;display: block;}
ion-header::after {background-image: none;}
ion-toolbar{--background:#b7160b; color: #fff}

ion-buttons{background: #b7160b; padding: 12px 0 0 12px;}
.title{font-size: 26px; margin: 35px 0 68px;}
.title span{display: block;}
.box_inner{height: 50vh; overflow-y: scroll; position: relative;}
.box_inner ion-list{ padding: 12px 8px !important;background: none;}
.box_submit{position: absolute; bottom: -49px; left: 0; right: 0;}
.box_submit ion-item{--background: #e3e3e3 !important;border-radius: 0 0 20px 20px;}

.box_user1 ion-item small{display: block; font-size: 9px; color: #9f9f9f; font-style: italic; margin: 8px 0 0 0;}
[class^="box_user"] ion-item a{position: absolute; left: revert; text-decoration: none; color: #555; top: 23px;cursor: pointer;}
[class^="box_user"] ion-item a:hover{opacity: 0.6;}
[class^="box_user"] ion-thumbnail a{position: absolute; right: -17px; text-decoration: none; color: #555; top: 23px;cursor: pointer;}
[class^="box_user"] ion-thumbnail a:hover{opacity: 0.6;}
[class^="box_user"] ion-item small{display: block; font-size: 9px; color: #9f9f9f; font-style: italic; margin: 8px 0 0 0;}
[class^="box_user"] ion-label{margin-bottom: 0;}
[class^="box_user"] ion-label p{background: linear-gradient(to bottom, #ff3b3b, #fb7474); width: 100%; max-width: 200px; min-height: 45px; padding: 10px; border-radius: 10px 10px 0 10px;color: #fff;}
.box_wrap{position: relative;background: #fff;margin: 12px 12px 0; border-radius: 20px 20px 0 0; padding: 30px 12px 0;}
.box_wrap ion-grid{background: #fff; box-shadow: 0px 0px 12px #4d4d4d;left: 0; right: 0; bottom: 50px; z-index: 1;position: absolute;}
.box_wrap .btn_submit{background: #1e1e1e; color: #fff; text-align: center; border-radius: 30px;margin: 0 12px 0 12px;}
.box_wrap .btn_submit ion-input:hover{opacity: 0.6;}
.box_wrap .input_field{color: #000;}
.remove{display: none;}
.file_wrap{position: relative;}
.file_wrap:hover{opacity: 0.8;}
.file_wrap > input{font-size: 0; position: absolute; top: px; left: 10px; width: 30px; height: 25px; --color: none !important; --border: none !important; cursor: pointer;opacity: 0;}
.file_wrap ion-icon{color: #979797;font-size: 22px;}
.file_wrap2{position: relative;}
.file_wrap2:hover{opacity: 0.8;}
.file_wrap2 > input{font-size: 0; position: absolute; top: 4px; left: 4px; width: 30px; height: 25px; --color: none !important; --border: none !important; cursor: pointer;opacity: 0;}
.file_wrap2 ion-icon{color: #979797;font-size: 22px;}
.zoomImg{position: fixed !important; top: 20px; left: 0; right: 0; text-align: center; margin: 0 auto !important; width: 100% !important; z-index: 9999; background: #e3e3e3; min-height: 500px !important; height: auto;}
.zoomImg ion-img{object-fit: contain !important;}
[class^="box_user"] ion-thumbnail{cursor: pointer; position: relative; box-shadow: 0px 0px 6px #8e8e8e; --border-radius: 10px !important; width: 200px; margin: 25px 18px 0 auto; max-width: 100%; min-height: 180px;}
.zoomImg span{position: absolute; right: 6px; top: 5px; font-size: 22px; cursor: pointer; display: block;}
.zoomImg span:hover{opacity: 0.6;}
.addStyle{position: relative;z-index: 3;}
.show{display: block;}
.close{display: none;}
.closeAttach{position: absolute; right: 1px; top: -2px; color: #fff;cursor: pointer;}
.uploadProgress{color: #000; position: absolute; top: 5px; left: 0; right: 0; text-align: center; font-size: 13px; font-weight: bold;}
ion-input{color: #555; font-size: 14px; padding-left: 8px !important;}
.overflowHide{overflow: hidden !important;}
.box_submit ion-thumbnail{position: relative;}
.action_wrap ion-icon{display: block; margin: 0 auto; font-size: 20px;}
.box_wrap ion-grid a{text-decoration: none; color: #555; font-size: 13px; display: block;}
.showActionButton{display: none;}
.showActionButton2{display: none;}
.vel-modal{height: 50vh; overflow: hidden;}
.appHeightFix{overflow: hidden; height: 50vh;}
.typeWrap{min-height: 20px; background: linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9));position: relative;width: max-content;}
.typeWrap p{color: #6f6f6f;font-size: 11px;width: max-content;margin-left: 20px;}
.showTyping{color: #6f6f6f;position: absolute;bottom: 0;left: calc(100% + 10px);}
.addClass{background: #fff; min-height: 25px;}

.box_user1{  width: max-content;}   
.box_user1 ion-item{margin: 8px 0;}
.box_user1 ion-label{margin: 0 !important;width: 100%;text-align: left;}
.box_user1 ion-label p{background: linear-gradient(to bottom, #cacaca, #eee); max-width: 200px; width: 100%; padding: 10px; border-radius: 10px 10px 10px 0; min-height: 45px;color:#222}

</style>

<style>
.user ion-icon{color: #555 !important;}
.car ion-icon{color: #fff !important;}
</style>