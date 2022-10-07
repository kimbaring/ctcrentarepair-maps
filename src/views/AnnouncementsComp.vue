<template>
        <div class="tooltip" v-if="announcements[0].id == 0">
            Fetching announcements<ion-spinner duration="1300" name="dots"></ion-spinner>
        </div>
        <div v-else>
            <div class="announcements_box " v-for="a in announcements" :key="a.id">
                <img :src="(a.imgsrc != null && a.imgsrc != '') ? a.imgsrc : defaultImg" />
                <div class="content">
                    <h2>{{a.title}}</h2>
                    <p>{{a.description}}</p>
                </div>  
            </div>
        </div>
</template>

<script>
import {IonSpinner} from '@ionic/vue';
import{axiosReq,local,removeFix,lStore} from '@/functions';
import{ciapi} from '@/js/globals';

export default({
    components:{
        IonSpinner
    },
    data(){
        return {
            announcements:[{
                id:0,
                title:'',
                description:'',
                imgsrc:''
            }],
            defaultImg: ''
        };
    },
    mounted(){
        this.loadAnnouncements();
        this.announcements = lStore.get('announcements');
        this.defaultImg = lStore.get('config').ann_defimg;
    },
    methods:{
        loadAnnouncements(){
            axiosReq({
                method:'post',
                url: ciapi+'admin/announcements?_batch=true',
                headers:{
                    PWAuth: local.get('user_token'),
                    PWAuthUser: local.get('user_id')
                }
            }).then(res=>{
                this.announcements = [];
                res.data.result.forEach(el=>{
                    this.announcements.push(removeFix(el,'ann_'));
                });
            });
        }
    }
})
</script>


<style scoped>
.announcements_box img{
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.tooltip{text-align: center;color:#777}
.tooltip ion-spinner{vertical-align: text-bottom;vertical-align: baseline;
height: 10px;}

.announcements_box{
    background: #fff;
    box-shadow: none;
    position: relative;
    overflow: hidden;
    border-radius:10px;
    margin:5px 0;
    height:200px;
    transition: 0.4s;
}

.content{
    --font-weight: 700 !important;
    background: rgba(0, 0, 0, 0.7);
    padding: 5px;
    margin: 0 auto;
    width: max-content;
    position: absolute;
    top: 0px;
    width: 100%;
    height: calc(100% + 20px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    color:#fff;
    transition: 0.2s;
}

.announcements_box:active .content{
    transform: translateY(-20px);
}


h2{
    --font-weight: 700 !important;
    color: #b7160b;
    background: #fff;
    padding: 5px;
    margin: 0 auto;
    width: max-content;
}

</style>