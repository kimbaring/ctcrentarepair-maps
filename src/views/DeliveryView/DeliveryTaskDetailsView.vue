<template>
    <ion-page>
        <ion-content>
            <div class="section">
                <a @click="$router.push('/delivery/tasks')"><ion-icon :icon="arrowBack"></ion-icon></a>
                <h3>Task Information</h3>
            </div>
            <div class="ioncardimg">
                <img src="../../img/carvertical.png" />
            <ion-card>
                <ion-card-content>
                    <h2>Customer:</h2>
                    <h2 :class="(loading) ? 'loading': null">{{task_info.user_name}}</h2>
                    <br />
                    <h2>Created:</h2>
                    <h2 :class="(loading) ? 'loading': null">{{task_info.created_at}}</h2>
                    <br />
                    <h2>Fragile?</h2>
                    <h2 :class="(loading) ? 'loading': null">{{(task_info.problems == 'Fragile') ? 'Yes' : 'No'}}</h2>
                    <br />
                    <h2>Details:</h2>
                    <h2 :class="(loading) ? 'loading': null">{{task_info.description}}</h2>
                    <br />
                    <h2>From:</h2>
                    <h2 :class="(loading) ? 'loading': null">{{task_info.customer_location}}</h2>
                    <br/>
                    <h2>To:</h2>
                    <h2 :class="(loading) ? 'loading': null">{{task_info.drop_location}}</h2>
                    <!-- <ion-button class="viewbutton" @click="$router.push('/delivery/tasks/taskdetails/location')" expand="block">View in Map</ion-button> -->
                    <div class="buttonflex" v-if="allowAccept">
                        <section>
                        <ion-button expand="block" @click="accept" :disabled="formLoading">
                            <span v-if="!formLoading">Accept</span>
                            <span v-if="formLoading">
                                <ion-spinner name="dots"></ion-spinner>
                            </span>
                        </ion-button>
                        </section>
                        <section>
                        <ion-button expand="block" @click="$router.push('/delivery/tasks')" color="dark">Decline</ion-button>
                        </section>
                    </div>
                    <div class="buttonflex" v-if="!allowAccept && acceptedTask()">
                        <ion-button expand="block" @click="$router.push('/delivery/tasks/taskdetails/location')">Return to this task</ion-button>
                    </div>
                </ion-card-content>
            </ion-card>
            </div>
        </ion-content>
    </ion-page>
</template>


<script>
import { 
    IonPage,
    IonContent,
    IonCard,
    IonCardContent,
    IonButton,
    IonSpinner
} from '@ionic/vue';
import { 
    bookOutline,
    timeOutline,
    personCircleOutline,
    logOutOutline,
    arrowBack
} from 'ionicons/icons';
import{local,dateFormat} from '@/functions';
import{db} from '@/firebase';
import{get,onValue,query,ref,set} from 'firebase/database';

export default({
    name: "CustomerDashboard",
    components:{
        IonPage,
        IonContent,
        IonCard,
        IonCardContent,
        IonButton,
        IonSpinner
    },

    data(){
        return{
            //ionicons
            bookOutline,
            timeOutline,
            personCircleOutline,
            logOutOutline,
            arrowBack,
            //end of ionicons

            task_info:{},
            loading:true,
            formLoading: false,
            allowAccept: true
        }
    },
    created(){
        this.loadInfo();
    },
    watch:{
        $route(to){
            if(to.path != '/delivery/tasks/taskdetails') return;
            this.loadInfo();
        }
    },
    methods:{
        acceptedTask(){
            if(!local.isset('accepted_task')) return false;
            console.log(local.getObject('accepted_task').id == this.task_info.id);
            if(local.getObject('accepted_task').id == this.task_info.id) return true; 
            return false;
        },
        loadInfo(){
            this.loading = true;
            const que = query(ref(db,'/pending_tasks/'+local.get('view_details')));
            const que2 = query(ref(db,`/available/${local.getObject('user_info').role.replaceAll(' ','_')}/${local.get('user_id')}`));
            onValue(que2,snapshot=>{           
                console.log(snapshot.exists())
                if(snapshot.exists()) this.allowAccept = true;
                else this.allowAccept = false;
            })
            onValue(que,()=>{
                get(que).then(snapshot=>{
                    if(snapshot.exists()){
                        this.task_info = snapshot.val();
                        this.task_info.created_at = dateFormat('%lm %d,%y (%h:%i%a)',this.task_info.created_at);
                        this.loading = false;
                    }
                })
            });
        },

        accept(){

            this.formLoading = true;
            
            const getLocation = () => new Promise(
                (resolve, reject) => {
                    window.navigator.geolocation.getCurrentPosition(
                        position => {
                            const location = {
                                lat:position.coords.latitude,
                                long:position.coords.longitude
                            };
                            resolve(location); // Resolve with location. location can now be accessed in the .then method.
                        },
                        err => {
                            this.formResponse = `${err.message}`;
                            this.openToast();
                            reject(err) // Reject with err. err can now be accessed in the .catch method.
                        }
                    );
                }
            );

            getLocation().then(location => {
                set(ref(db,`/available/${local.getObject('user_info').role.replaceAll(' ','_')}/${local.get('user_id')}`),'active');
                set(ref(db,'/pending_tasks/'+this.task_info.id+'/status'),2);
                set(ref(db,'/pending_tasks/'+this.task_info.id+'/emp_location_coors_long'),location.long);
                set(ref(db,'/pending_tasks/'+this.task_info.id+'/emp_location_coors_lat'),location.lat);
                set(ref(db,'/pending_tasks/'+this.task_info.id+'/accepted_by_id'),local.get('user_id'));
                local.setObject('accepted_task',this.task_info);
                this.$router.push('/delivery/tasks/taskdetails/location');
                this.formLoading = false;
            });

        }
    }
});
</script>

<style scoped>


ion-button{--border-radius: 10px;}
ion-card-content h2:last-of-type{margin-bottom: 20px;}

.buttonflex{
    display: flex;
    gap:5px
}
.buttonflex section{
    width: 50%;
}
.buttonflex ion-button{
    --background: #b7170b;
    --background-activated: var(--ion-color-hover-red);
}
.space{
    padding-bottom: 30px;
}
ion-header{
    text-align: center;
}
ion-content{
    --ion-background-color: var(--ion-color-dark-red);
    border-radius: 30px !important;
}
.section{
    background: var(--ion-color-dark-red);
    height: 150px;
    position: relative;
}
.section h3{
    position: absolute;
    top: 70px;
    right: 0;
    left: 0;
    color: #fff;
}
.section ion-icon{
    color: #fff;
    font-style: normal;
    font-weight: 400;
    font-size: 30px;
    line-height: 24px;
    position: absolute;
    top: 30px;
    left: 25px;
}
h3{
    color: #000;
    margin: 0px 20px 70px 20px;
    padding-left: 20px;
    text-align: left;
    font-size: 30px;
    width: 53%;
}
h2{
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 19px;
}
ion-card-content{
    min-height: 272px;
    position: relative;
}
ion-card-title{
    color: #000;
    font-style: normal;
    font-weight: 400;
    font-size: 20px;
    line-height: 24px;
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    align-items: start;
    height: 57px;
}
ion-card-title h3{
    padding-top: 10px;
    font-size: 20px;
}
ion-card-subtitle{
    color: #000;
}
ion-card-content{
    background-color: #f4f4f4;
}
.cardsection{
    display:flex;
    flex-wrap: wrap;
}
.cardsection p{
    width: 50%;
    margin: 5px auto;
    display:flex;
    white-space: pre;
    text-overflow: ellipsis;
    overflow: hidden;
    
}
ion-card-header{
    background-color:#ededed;
    position:relative;
}
.date{
    position: absolute;
    right: 23px;
    top: 29px;
    color: #B7160B;
}
.viewbutton{
    --background: #b7170b;
    --background-activated: var(--ion-color-hover-red);

}
.ioncardimg{
    position: relative;
}
.ioncardimg img{
    position: absolute;
    right: -1px;
    z-index: 1;
    top: -31px;
    width: 124px;
}

.loading{
    animation-name: load;
    position: relative;
    padding-left: 10px;
    overflow: hidden;
    background: #aaa;
    min-height:20px
}
.loading::before{
    content:"";
    position: absolute;
    height: 200%;
    width:50%;
    background: #ccc;
    top:0;
    left:0;
    box-shadow: 0 0 30px #ccc;
    opacity: 0.7;
    animation-name: load;
    animation-duration: 0.4s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
}


@keyframes load{
    0%{left:0}
    100%{left:100%}
}
</style>
