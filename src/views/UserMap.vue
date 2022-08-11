<template>
    <ion-text>
        <h2>RideShare</h2>
    </ion-text>
    <ion-card>
        <div id="map"></div>
        <ion-card class="map-form">
            <div class="travel-info" v-show="awesome">
                <h2><ion-icon :icon="mapOutline" ></ion-icon> <span id="info1"></span></h2>
                <h2><ion-icon :icon="timerOutline"></ion-icon> <span id="info2"></span></h2>
            </div>
            <ion-card-header class="close">
                <span><ion-icon :icon="close"></ion-icon></span>
            </ion-card-header>
            <div id="geocoder" class="input-con">
                <div id="geocoder1">
                    <ion-icon id="currentlocation" :icon="compass"></ion-icon>
                </div>
                <div id="geocoder2">
                    <ion-icon :icon="navigateCircle"></ion-icon>
                </div>
            </div>
            <ion-button id="ion-book" expand="block" @click="bookNow">Book Now</ion-button>
        </ion-card>
    </ion-card>
</template>

<script>
import axios from 'axios';
// import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { IonCard, IonCardHeader, IonButton, toastController, loadingController } from '@ionic/vue';
import { locate, compass, navigateCircle, warning, close, mapOutline, timerOutline } from 'ionicons/icons';
import { toFormData, send } from '../functions.js';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { Capacitor } from "@capacitor/core";
import { NativeSettings, AndroidSettings, IOSSettings } from 'capacitor-native-settings';

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
        IonCard,
        IonCardHeader,
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
            location: {},
            latitude: "",
            longitude: "",            
            errorMessage: "",
            androidPermissions: "",
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
        async bookNow() {
            this.bookRequest = true;
            this.bookResponse = '';

            let currentDate = new Date().toLocaleString().replace(',','');

            const currentUserId     = JSON.parse(localStorage.getItem('currentUser'));
            const currentUserName   = JSON.parse(localStorage.getItem('currentUserName'));
            const pickupCoords      = JSON.parse(localStorage.getItem('getPickupCoords'));
            const pickupLocation    = JSON.parse(localStorage.getItem('getPickupLocation'));
            const dropoffCoords     = JSON.parse(localStorage.getItem('getDropoffCoords'));
            const dropoffLocation   = JSON.parse(localStorage.getItem('getDropoffLocation'));
            const totalDistance     = JSON.parse(localStorage.getItem('getKm'));

            console.log(currentUserId, currentUserName, pickupCoords, dropoffCoords);

            let formdata = toFormData({
                form: 'request_ride',
                action: 'create',
                customer_id: currentUserId,
                customer_name: currentUserName,
                location_origin: pickupCoords,
                location_origin_name: pickupLocation,
                location_destination: dropoffCoords,
                location_destination_name: dropoffLocation,
                location_distance: totalDistance,
                customer_notes: '',
                created: currentDate,
                booking_status: '0',
                rider_id: 'null'
            });

            if (currentUserId !== null && pickupCoords !== null && dropoffCoords !== null) {
                send('post','https://www.medicalcouriertransportation.com/rentarepair/archive/api.php',formdata)
                    .then(response=>{
                    if (response.data == "success") {
                        console.log(response);
                        this.openLoader();
                    } else {
                        console.log(response);
                    }
                });
                document.querySelector(".map-form").classList.remove('active');
            } else {
                console.log('Error!')
            }            
        },
        async checkUserPermissions() {
            const checkuserPerm = await Geolocation.checkPermissions();
            console.log('Response:', checkuserPerm);
            if (checkuserPerm.location == "granted") {
                this.formResponse = 'Location services granted';
            } else {
                NativeSettings.open({
                    optionAndroid: AndroidSettings.Location, 
                    optionIOS: IOSSettings.App
                });
            }
        },
        async requestUserPermissions() {
            const requestuserPerm = await Geolocation.requestPermissions();
            console.log('Response:', requestuserPerm);
        },
    },
    mounted() {
        this.checkUserPermissions();

        if (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') {
            Geolocation.requestPermissions();
        }

        mapboxgl.accessToken = 'pk.eyJ1Ijoic3BlZWR5cmVwYWlyIiwiYSI6ImNsNWg4cGlzaDA3NTYzZHFxdm1iMTJ2cWQifQ.j_XBhRHLg-CcGzah7uepMA';

        const getLocation = () => new Promise(
            (resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
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

        getLocation().then(location => { // Initiate getLocation function
            const map = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/speedyrepair/cl5h8u6it000116omwkioew0k',
                center: [location.long, location.lat],
                // center: [-122.662323, 45.523751],
                zoom: 12
            });

            // Initialize the geolocate control.
            const locate = new mapboxgl.GeolocateControl({
                geolocation: navigator.geolocation,
                positionOptions: {
                    enableHighAccuracy: true
                },
                showUserHeading: true,
                showUserLocation: true,
                trackUserLocation: true
            });

            // Add the geolocate control to the map.
            map.addControl(locate);

            axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${location.long},${location.lat}.json?access_token=${mapboxgl.accessToken}`)
                .then(({data}) => {
                    console.log(data);
                    var userCountry = data.features[5].properties.short_code;
                    var userOutbound = data.features[5].bbox;
                    console.log(userCountry);
                    console.log(userOutbound);

                    // Initialize the geocoder controls.
                    const geocoder1 = new MapboxGeocoder({
                        accessToken: mapboxgl.accessToken,
                        placeholder: 'Pick Up Address',
                        countries: userCountry,
                        bbox: userOutbound,
                        limit: 10,
                        mapboxgl: mapboxgl
                    });

                    const geocoder2 = new MapboxGeocoder({
                        accessToken: mapboxgl.accessToken,
                        placeholder: 'Drop Off Address',
                        countries: userCountry,
                        bbox: userOutbound,
                        limit: 10,
                        mapboxgl: mapboxgl
                    });

                    // Add the geocoder controls to the map.
                    geocoder1.addTo('#geocoder1');
                    geocoder2.addTo('#geocoder2');

                    let input1 = document.querySelectorAll('#geocoder input');

                    input1.forEach(i => {
                        i.addEventListener('click', function() {
                            document.querySelector(".map-form").classList.add('active');
                        });
                    });

                    let input2 = document.querySelectorAll('.close');

                    input2.forEach(i => {
                        i.addEventListener('click', function() {
                            document.querySelector(".map-form").classList.remove('active');
                        });
                    });

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

                    geocoder1.on('result', e => {
                        if (map.hasImage('pulsing-dot-a')) map.removeImage('pulsing-dot-a');
                        map.addImage('pulsing-dot-a', pulsingDot, { pixelRatio: 2 });

                        console.log(e);
                        let getPickupCoords = e.result.center;
                        let getPickupLocation = e.result.place_name;
                        localStorage.setItem('getPickupCoords', JSON.stringify(getPickupCoords));
                        localStorage.setItem('getPickupLocation', JSON.stringify(getPickupLocation));

                        const newpickupPoint = {
                            type: 'FeatureCollection',
                            features: [
                                {
                                    type: 'Feature',
                                    properties: {},
                                    geometry: {
                                        type: 'Point',
                                        coordinates: e.result.center
                                    }
                                }
                            ]
                        }

                        if (map.getLayer('pickupPoint')) {
                            map.getSource('pickupPoint').setData(newpickupPoint);
                            map.flyTo({
                                center: e.result.center,
                                zoom: 15
                            });
                        } else {
                            map.flyTo({
                                center: e.result.center,
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
                                                'coordinates': e.result.center
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
                        
                        const pickupCoords = JSON.parse(localStorage.getItem('getPickupCoords'));
                        const dropoffCoords = JSON.parse(localStorage.getItem('getDropoffCoords'));

                        if (pickupCoords !== null && dropoffCoords !== null) {
                            try {
                                map.fitBounds([
                                    pickupCoords,
                                    dropoffCoords
                                ], { 
                                    padding: 80
                                });
                                document.querySelector(".map-form").classList.remove('active');
                                getRoute(pickupCoords);
                                this.awesome = true;
                            } catch(err) {
                                console.log(err);
                            }
                        }

                    });

                    geocoder2.on('result', e => {
                        if (map.hasImage('pulsing-dot-b')) map.removeImage('pulsing-dot-b');
                        map.addImage('pulsing-dot-b', pulsingDot, { pixelRatio: 2 });

                        console.log(e);
                        let getDropoffCoords = e.result.center;
                        let getDropoffLocation = e.result.place_name;
                        localStorage.setItem('getDropoffCoords', JSON.stringify(getDropoffCoords));
                        localStorage.setItem('getDropoffLocation', JSON.stringify(getDropoffLocation));

                        const newdropoffPoint = {
                            type: 'FeatureCollection',
                            features: [
                                {
                                    type: 'Feature',
                                    properties: {},
                                    geometry: {
                                        type: 'Point',
                                        coordinates: e.result.center
                                    }
                                }
                            ]
                        }

                        if (map.getLayer('dropoffPoint')) {
                            map.getSource('dropoffPoint').setData(newdropoffPoint);
                            map.flyTo({
                                center: e.result.center,
                                zoom: 15
                            });
                        } else {
                            map.flyTo({
                                center: e.result.center,
                                zoom: 15
                            });
                            map.addSource('dropoffPoint', {
                                'type': 'geojson',
                                'data': {
                                    'type': 'FeatureCollection',
                                    'features': [
                                        {
                                            'type': 'Feature',
                                            'properties': {},
                                            'geometry': {
                                                'type': 'Point',
                                                'coordinates': e.result.center
                                            }
                                        }
                                    ]
                                }
                            });
                            map.addLayer({
                                'id': 'dropoffPoint',
                                'type': 'symbol',
                                'source': 'dropoffPoint',
                                'layout': {
                                    'icon-image': 'pulsing-dot-b'
                                }
                            });
                        }

                        const pickupCoords   = JSON.parse(localStorage.getItem('getPickupCoords'));
                        const dropoffCoords   = JSON.parse(localStorage.getItem('getDropoffCoords'));

                        if (pickupCoords !== null && dropoffCoords !== null) {
                            try {
                                map.fitBounds([
                                    pickupCoords,
                                    dropoffCoords
                                ], { 
                                    padding: 80
                                });
                                document.querySelector(".map-form").classList.remove('active');
                                getRoute(dropoffCoords);
                                this.awesome = true;
                            } catch(err) {
                                console.log(err);
                            }
                        }
                        
                    });
                    
                    // let coordinates;

                    // if (navigator.geolocation) {
                    //     navigator.geolocation.getCurrentPosition(function(position) {
                    //         coordinates = [position.coords.latitude, position.coords.longitude];
                    //         console.log(coordinates);

                    //         map.flyTo({
                    //             center: [
                    //                 position.coords.longitude,
                    //                 position.coords.latitude
                    //         ],
                    //             essential: true // this animation is considered essential with respect to prefers-reduced-motion
                    //         });

                    //     });
                    // } else {
                    //     map.flyTo({
                    //         center: [
                    //             -122.662323,
                    //             45.523751
                    //     ],
                    //         essential: true // this animation is considered essential with respect to prefers-reduced-motion
                    //     });
                    // }

                    document.getElementById('currentlocation').onclick = function(){
                        // locate.trigger();
                        if (map.hasImage('pulsing-dot-a')) map.removeImage('pulsing-dot-a');
                        map.addImage('pulsing-dot-a', pulsingDot, { pixelRatio: 2 });

                        var userAddress = data.features[0].place_name;
                        let getPickupCoords = [location.long, location.lat];
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
                                        coordinates: [location.long, location.lat]
                                    }
                                }
                            ]
                        }

                        if (map.getLayer('pickupPoint')) {
                            map.getSource('pickupPoint').setData(newpickupPoint);
                            map.flyTo({
                                center: [location.long, location.lat],
                                zoom: 15
                            });
                        } else {
                            map.flyTo({
                                center: [location.long, location.lat],
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
                                                'coordinates': [location.long, location.lat]
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

                        document.querySelector("#geocoder1 .mapboxgl-ctrl-geocoder--input").value = userAddress;

                        const a = document.querySelector("#geocoder1 .mapboxgl-ctrl-geocoder--input").value;
                        const b = document.querySelector("#geocoder2 .mapboxgl-ctrl-geocoder--input").value;

                        const pickupCoords = [location.long, location.lat];
                        const dropoffCoords = JSON.parse(localStorage.getItem('getDropoffCoords'));

                        if (a !== null && b !== null) {
                            try {
                                map.fitBounds([
                                    pickupCoords,
                                    dropoffCoords
                                ], { 
                                    padding: 60 
                                });
                                document.querySelector(".map-form").classList.remove('active');
                                getRoute(pickupCoords);
                                this.awesome = true;
                            } catch(err) {
                                console.log(err);
                            }
                        }

                    }

                    // create a function to make a directions request
                    async function getRoute() {
                        // make a directions request using driving profile
                        const pickupCoords = JSON.parse(localStorage.getItem('getPickupCoords'));
                        const dropoffCoords = JSON.parse(localStorage.getItem('getDropoffCoords'));
                        const query = await fetch(
                            `https://api.mapbox.com/directions/v5/mapbox/driving/${pickupCoords[0]},${pickupCoords[1]};${dropoffCoords[0]},${dropoffCoords[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
                            { method: 'GET' }
                        );
                        const json = await query.json();
                        const data = json.routes[0];
                        const route = data.geometry.coordinates;
                        const geojson = {
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'LineString',
                                coordinates: route
                            }
                        };
                        console.log(data);
                        
                        if (map.getSource('route')) { // if the route already exists on the map, we'll reset it using setData
                            map.getSource('route').setData(geojson);
                        }
                        else { // otherwise, we'll make a new request
                            map.addLayer({
                            id: 'route',
                            type: 'line',
                            source: {
                                type: 'geojson',
                                data: geojson
                            },
                            layout: {
                                'line-join': 'round',
                                'line-cap': 'round'
                            },
                            paint: {
                                'line-color': '#b7160b',
                                'line-width': 4,
                                'line-opacity': 1
                            }
                            });
                        }

                        let getKm = data.distance / 1000; // convert meters to kilometers

                        const info1 = document.getElementById('info1');
                        const info2 = document.getElementById('info2');
                        info1.innerHTML = `${Math.floor(data.duration / 60)} min ride`;
                        info2.innerHTML = `${getKm.toFixed(1) + " km"}`;

                        localStorage.setItem('getKm', JSON.stringify(getKm));

                    }

                    map.on('style.load', () => {
                        map.resize();
                        localStorage.removeItem('getPickupCoords');
                        localStorage.removeItem('getDropoffCoords');
                        // getRoute(start);
                        // locate.trigger();
                        // const suggestWrapper = document.getElementsByClassName('suggestions-wrapper');
                        // const div1 = suggestWrapper[0];
                        // const div2 = suggestWrapper[1];
                        // document.getElementById('geocoder').appendChild(div1, div2);
                    });

            });

        });

    }
};
</script>

<style scoped>
#map {
    border: none;
    width: 100%;
    height: calc(100% - 156px);
    border-radius: 20px 20px 0 0;
    overflow: hidden;
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
    border-radius: 20px 20px 0 0;
}

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
</style>