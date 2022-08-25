<template>
    <ion-page class="locationPage" >
        <ion-header v-if="$route.path == '/technician/tasks/taskdetails/location'">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button defaultHref="/customer/dashboard/location"></ion-back-button>
                </ion-buttons>                
            </ion-toolbar>
            <ion-title>Customer Location</ion-title>
        </ion-header>

        <ion-content v-if="$route.path == '/technician/tasks/taskdetails/location'">
            <p><strong>Address: </strong><br />{{task_info.customer_location}}</p>
            <div id="map"></div>
            <div class="task_info">
                <div class="col2">
                    <span>Customer Name</span>
                    <span>{{task_info.user_name}}</span>
                    <span>Customer ID</span>
                    <span>{{task_info.user_id}}</span>
                    <ion-button router-link="/technician/tasks/taskdetail">Task Details</ion-button>
                    <ion-button router-link="/technician/tasks/taskdetails/location/chat">Chat</ion-button>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script>
import {IonButton, toastController, loadingController } from '@ionic/vue';
import { locate, compass, navigateCircle, warning, close, mapOutline, timerOutline } from 'ionicons/icons';
// import { toFormData, send } from '../functions.js';
import{local} from '@/functions.js';
import mapboxgl from 'mapbox-gl';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
// Website address
// https://account.mapbox.com
// username: speedyrepair
// password: TGP9!J9n^MYm#Tx

// username: dev
// password: F77GBCmu2cvL8RF

// username: design
// password: 3PhmQScz3JFbAFH

// username: tester
// password: yyi4HgHLeTYi7mD

export default {
    name: "MapBox",
    components: {
        IonButton
    },
    data() {
        return {
            formResponse: null,
            address: '',
            focused: false,
            awesome: false,
            bookRequest: false,
            bookResponse: null,
            map:null,
            pulsingDot:null,
            task_info: local.getObject('accepted_task')
        }
    },
    setup() {
        return { locate, compass, navigateCircle, warning, close, mapOutline, timerOutline };
    },
    methods: {
        async openToast() {
            try {
                await toastController.dismiss();
            } catch(e) {
                console.log(e);
            }

            if (this.formResponse === "User denied geolocation prompt") {
                this.color = 'primary';
                this.icon = warning;
            }
            if (this.formResponse === "Origin does not have permission to use Geolocation service") {
                this.color = 'dark';
                this.icon = warning;
            }

            const toast = await toastController
                .create({
                    message: this.formResponse,
                    position: 'top',
                    color: this.color,
                    icon: this.icon,
                    cssClass: 'custom-toast',
                    duration: 10000
                })
            return toast.present();
        },
        async openLoader() {
            const loading = await loadingController
                .create({
                    message: 'Looking for drivers around your area',
                    duration: 500000
                });
            return loading.present();
        },
        locationPin(placeName,long,lat){

            const size = 130;
 
                    // This implements `StyleImageInterface`
            // to draw a pulsing dot icon on the map.
            const pulsingDot = {
                    width: size,
                    height: size,
                    data: new Uint8Array(size * size * 4),
                
                // When the layer is added to the map,
                // get the rendering context for the map canvas.
                onAdd: function () {
                    const canvas = document.createElement('canvas');
                    canvas.width = this.width;
                    canvas.height = this.height;
                    this.context = canvas.getContext('2d');
                },
                
                // Call once before every frame where the icon will be used.
                render: function () {
                    const duration = 1000;
                    const t = (performance.now() % duration) / duration;
                    
                    const radius = (size / 2) * 0.3;
                    const outerRadius = (size / 2) * 0.7 * t + radius;
                    const context = this.context;
                    
                    // Draw the outer circle.
                    context.clearRect(0, 0, this.width, this.height);
                    context.beginPath();
                    context.arc(
                    this.width / 2,
                    this.height / 2,
                    outerRadius,
                    0,
                    Math.PI * 2
                    );
                    context.fillStyle = `rgba(183, 22, 11, ${1 - t})`;
                    context.fill();
                    
                    // Draw the inner circle.
                    context.beginPath();
                    context.arc(
                    this.width / 2,
                    this.height / 2,
                    radius,
                    0,
                    Math.PI * 2
                    );
                    context.fillStyle = 'rgba(183, 22, 11, 1)';
                    context.strokeStyle = 'white';
                    context.lineWidth = 2 + 4 * (1 - t);
                    context.fill();
                    context.stroke();
                    
                    // Update this image's data with data from the canvas.
                    this.data = context.getImageData(
                    0,
                    0,
                    this.width,
                    this.height
                    ).data;
                    
                    // Continuously repaint the map, resulting
                    // in the smooth animation of the dot.
                    map.triggerRepaint();
                    
                    // Return `true` to let the map know that the image was updated.
                    return true;
                }
            };
            
            const map = this.map;
            if (map.hasImage('pulsing-dot-a')) map.removeImage('pulsing-dot-a');
                            map.addImage('pulsing-dot-a', pulsingDot, { pixelRatio: 2 });

                            var userAddress = placeName;
                            let getPickupCoords = [long, lat];
                            localStorage.setItem('getPickupCoords', JSON.stringify(getPickupCoords));
                            localStorage.setItem('getPickupLocation', JSON.stringify(userAddress));

                            const newpickupPoint = {
                                type: 'FeatureCollection',
                                features: [
                                    {
                                        type: 'Feature',
                                        properties: {},
                                        geometry: {
                                            type: 'Point',
                                            coordinates: [long, lat]
                                        }
                                    }
                                ]
                            }

                            if (map.getLayer('pickupPoint')) {
                                map.getSource('pickupPoint').setData(newpickupPoint);
                                map.flyTo({
                                    center: [long, lat],
                                    zoom: 15
                                });
                            } else {
                                map.flyTo({
                                    center: [long, lat],
                                    zoom: 15
                                });
                                map.addSource('pickupPoint', {
                                    'type': 'geojson',
                                    'data': {
                                        'type': 'FeatureCollection',
                                        'features': [
                                            {
                                                'type': 'Feature',
                                                'properties': {},
                                                'geometry': {
                                                    'type': 'Point',
                                                    'coordinates': [long, lat]
                                                }
                                            }
                                        ]
                                    }
                                });
                                map.addLayer({
                                    'id': 'pickupPoint',
                                    'type': 'symbol',
                                    'source': 'pickupPoint',
                                    'layout': {
                                        'icon-image': 'pulsing-dot-a'
                                    }
                                });
                            }
        },
    mapInit() {

        mapboxgl.accessToken = 'pk.eyJ1Ijoic3BlZWR5cmVwYWlyIiwiYSI6ImNsNWg4cGlzaDA3NTYzZHFxdm1iMTJ2cWQifQ.j_XBhRHLg-CcGzah7uepMA';

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

        getLocation().then((location) => { // Initiate getLocation function
            const map = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/speedyrepair/cl5h8u6it000116omwkioew0k',
                center: [location.long, location.lat],
                // center: [-122.662323, 45.523751],
                zoom: 12
            })

            this.map = map;
            
            map.on('load', ()=>{
                this.mapInit2();
            });
            // Initialize the geolocate control.
            
        });
        

    },
    mapInit2(){
        const map = this.map;
        const locate = new mapboxgl.GeolocateControl({
                geolocation: window.navigator.geolocation,
                positionOptions: {
                    enableHighAccuracy: true
                },
                showUserHeading: true,
                showUserLocation: true,
                trackUserLocation: true
            });

            
                
            // Add the geolocate control to the map.
            map.addControl(locate);
            
            const taskCoors = {
                loc: this.task_info.customer_location,
                long: this.task_info.customer_location_coors_long,
                lat: this.task_info.customer_location_coors_lat
            };
            this.locationPin(taskCoors.loc,taskCoors.long,taskCoors.lat);

            map.on('style.load', () => {
                map.resize();
                
                // getRoute(start);
                // locate.trigger();
                // const suggestWrapper = document.getElementsByClassName('suggestions-wrapper');
                // const div1 = suggestWrapper[0];
                // const div2 = suggestWrapper[1];
                // document.getElementById('geocode r').appendChild(div1, div2);
            });
        
    }
        
    },
    mounted(){
        this.mapInit();
        this.task_info = local.getObject('accepted_task');
        local.set('chat_id', this.task_info.id);
    },
    watch:{
        $route(to){
            if(to.path != '/technician/tasks/taskdetails/location') return;
            this.mapInit();
        }
        
    }

    
};
</script>


<style scoped>
ion-content{--ion-background-color:#222;border-radius:0;overflow:scroll;--color:#fff;height: calc(100vh - 170px);}

#map {
    border: none;
    width: 100%;
    height: 50vh;
    border-radius: 20px 20px 0 0;
    overflow: hidden;
}

ion-back-button{
    color:#fff
}


ion-header{
    background:#b7160b;
    color:#fff;
}
ion-toolbar{
    --background:#b7160b;
}

ion-title{
    text-align: center;
    padding: 20px;
}


ion-card {
    position: relative;
    width: 100%;
    height: 100%;
    margin: auto;
    background: none;
    border-radius: 0;
    overflow: visible;
}

ion-text {
    display: block;
    text-align: center;
}

ion-text h2 {
    margin: 0 auto 15px;
}

.map-form {
	position: relative;
    left: 0;
    right: 0;
    margin: auto;
    min-height: 170px;
}

.map-form {
	position: absolute;
    bottom: 0;
    width: 100%;
    height: auto;
    padding: 15px !important;
    color: #515151;
    margin: auto;
    z-index: 11;
    transition: all 500ms ease-in-out;
    background: #fff;
}

.map-form.active {
    padding: 0 15px 100% !important;
    background: #fff;
    overflow: hidden;
    transform: none;
}

.close {
    display: none;
	justify-content: center;
	align-items: center;
}

.map-form.active .close {
    display: flex;
    width: 100%;
    justify-content: flex-end;
    padding: 15px 10px;
}

.map-form.active .close span ion-icon {
    position: static;
    transform: none;
}

.map-form.active #geocoder {
    width: 100%;
    margin: 0 auto;
}

#geocoder1 {
    position: relative;
    background-color: #fff;
    border-bottom: 1px solid rgb(235, 235, 235);
    z-index: 123;
}

#geocoder2 {
    position: relative;
    background-color: #fff;
}

ion-content p{
    padding: 20px;
    margin: 15px 0 0;
}

ion-icon {
    position: absolute;
    top: 50%;
    right: 10px;
    z-index: 12;
    width: 25px;
    height: 25px;
    margin: 0;
    transform: translateY(-50%);
}

ion-icon {
    --border-radius: 0;
    --background: none;
    /* --background: #b7160b; */
    --background-activated: none;
    --ripple-color: none;
    --box-shadow: none;
    color: #b7160b;
}

#geocoder2 ion-icon {
    color: #333;
}

#geocoder2 ion-icon:hover {
    cursor: unset;
}

ion-icon:hover {
    color: #791c18;
    cursor: pointer;
}

ion-icon:active {
    color: #333;
}

ion-input a {
	position: absolute;
	left: 15px;
	font-size: 20px;
	color: #b7160b;
}

ion-button {
	margin: 5px 2px 0;
	height: 2.5em;
}

.travel-info {
	display: flex;
	flex-flow: row wrap;
	justify-content: space-between;
    align-items: center;
	position: absolute;
	bottom: 100%;
	width: 100%;
	left: 0;
	right: 0;
	margin: 0;
	font-size: 1em;
	background: #b7160b;
	color: #fff;
	text-align: center;
	line-height: 100%;
    transition: all 500ms ease-in-out;
    /* border-radius: 20px 20px 0 0; */
}

.task_info{padding: 20px 20px 40px}
.col2{display: flex;flex-wrap: wrap;gap:10px}
.col2 >*:nth-of-type(odd){font-weight: 700}
.col2 > *{width:45%}

.travel-info h2 {
    font-size: 1em;
    line-height: 3;
    margin: 0;
    width: 50%;
    text-align: center;
    display: flex;
	flex-flow: row wrap;
	justify-content: center;
    align-items: center;
}

.travel-info h2 ion-icon {
    position: static;
    transform: none;
    color: #fff;
    width: 20px;
    height: 20px;
    margin-right: 10px;
}

ion-button{--background: #b7170b;color:#fff;--padding-top:20px;--padding-bottom:20px}

</style>