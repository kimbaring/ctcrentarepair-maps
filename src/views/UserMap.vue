<template>
    <map-comp 
        :pinPickupCoorsLong="setPickupCoors.long" 
        :pinPickupCoorsLat="setPickupCoors.lat" 
        @coors="receiveCoors" 
        hideForm="true">
    </map-comp>
</template>

<script>
import MapComp from '@/views/MapComp.vue';

export default({
    components:{
        MapComp
    },
    data(){
        return{
            coors:[],
            setPickupCoors:{
                long: 0.0098,
                lat: 51.4934
            }
        }
    },
    mounted(){
       
    },
    methods:{
        receiveCoors(n){
            this.coors.push(n);
            console.log(n);
        }
    }
})

</script>


