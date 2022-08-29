<template>
    <ion-card class="parent">
        <div id="map"></div>
        <ion-card class="map-form" :class="{hide: hideForm}">
            <div class="travel-info" v-show="awesome">
                <h2><ion-icon :icon="mapOutline" ></ion-icon> <span id="info1"></span></h2>
                <h2><ion-icon :icon="timerOutline"></ion-icon> <span id="info2"></span></h2>
            </div>
            <ion-card-header class="close">
                <span><ion-icon :icon="close"></ion-icon></span>
            </ion-card-header>
            <div id="geocoder" class="input-con">
                <div id="geocoder1" >
                    <ion-icon id="currentlocation" :icon="compass"></ion-icon>
                </div>
                <div id="geocoder2" :class="{hide: hideDestination}">
                    <ion-icon :icon="navigateCircle"></ion-icon>
                </div>
            </div>
        </ion-card>
    </ion-card>
</template>

<script defer>
import {IonCard,IonCardHeader,IonIcon} from '@ionic/vue';
import {compass,navigateCircle,close} from 'ionicons/icons';
import axios from 'axios';  
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import {mapsData} from '@/functions-custom';

export default({
    props: ['hideForm',"hideDestination","pinPickupCoorsLong","pinPickupCoorsLat","pinDropOffCoorsLong","pinDropOffCoorsLat"],
    components: {
        IonCard,
        IonCardHeader,
        IonIcon
    },
    setup() {
        return { compass,navigateCircle,close };
    },
    data(){
        return{
            awesome: null,
            map: null,

            pickupCoors: [],
            dropoffCoors: []

        }
    },
    mounted(){
        this.defMap();
    },
    watch:{
        map(){
            if(this.pinPickupCoorsLong != null && this.pinPickupCoorsLat != null) {
                this.pin(this.pinPickupCoorsLong,this.pinPickupCoorsLat,'a');
                this.pickupCoors = [this.pinPickupCoorsLong,this.pinPickupCoorsLat];
            }
            if(this.pinDropoffCoorsLong != null && this.pinDropoffCoorsLat != null) {
                this.pin(this.pinDropoffCoorsLong,this.pinDropoffCoorsLat,'b')
                this.dropoffCoors = [this.pinDropoffCoorsLong,this.pinDropoffCoorsLat];
            }   
        },
        $route(){
            this.$forceUpdate();
            this.map.remove();
            if(this.pinPickupCoorsLong != null && this.pinPickupCoorsLat != null) {
                this.pin(this.pinPickupCoorsLong,this.pinPickupCoorsLat,'a');   
                this.pickupCoors = [this.pinPickupCoorsLong,this.pinPickupCoorsLat];
            }
            if(this.pinDropoffCoorsLong != null && this.pinDropoffCoorsLat != null) {
                this.pin(this.pinDropoffCoorsLong,this.pinDropoffCoorsLat,'b')
                this.dropoffCoors = [this.pinDropoffCoorsLong,this.pinDropoffCoorsLat];
            }
        }
    },
    methods:{
        getLocation(){
            return new Promise(
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
        },

        
        
        defMap(){
            mapboxgl.accessToken = 'pk.eyJ1Ijoic3BlZWR5cmVwYWlyIiwiYSI6ImNsNWg4cGlzaDA3NTYzZHFxdm1iMTJ2cWQifQ.j_XBhRHLg-CcGzah7uepMA';

            this.getLocation().then(location => { // Initiate getLocation functioN               
                this.$emit('currentCoors',location);
                const map = new mapboxgl.Map({
                    container: 'map',
                    style: 'mapbox://styles/speedyrepair/cl5h8u6it000116omwkioew0k?optimize=true',
                    center: [location.long, location.lat],
                    // center: [-122.662323, 45.523751],
                    zoom: 12
                });

                map.on('load',()=>{
                    this.initMap(map,location);
                    this.map = map;
                });
            });
            
        },

        pin(long,lat,pinFix){
            this.$emit('coors',[long,lat]);
            if(pinFix == 'a') {
                this.$emit('pickupCoors',[long,lat]);
                mapsData(long,lat,res=>{
                    if(document.querySelector("#geocoder1 .mapboxgl-ctrl-geocoder--input")) 
                        document.querySelector("#geocoder1 .mapboxgl-ctrl-geocoder--input").value = res.features[0].place_name;
                })
            }
            else if(pinFix == 'b'){
                this.$emit('dropoffCoors',[long,lat]);
                this.getRoute(this.pickupCoors,[long,lat])
                mapsData(long,lat,res=>{
                    if(document.querySelector("#geocoder2 .mapboxgl-ctrl-geocoder--input")) 
                    document.querySelector("#geocoder2 .mapboxgl-ctrl-geocoder--input").value = res.features[0].place_name;
                })
            }   


            const map = this.map;
            const size = 130;
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


            if (map.hasImage('pulsing-dot-'+pinFix)) map.removeImage('pulsing-dot-'+pinFix);
            map.addImage('pulsing-dot-'+pinFix, pulsingDot, { pixelRatio: 2 });
            const newPoint = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'Point',
                            coordinates: [long,lat]
                        }
                    }
                ]
            };

            if (map.getLayer('point'+pinFix)) {
                map.getSource('point'+pinFix).setData(newPoint);
                map.flyTo({
                    center: [long,lat],
                    zoom: 15
                });
            } else {
                map.flyTo({
                    center: [long,lat],
                    zoom: 15
                });
                map.addSource('point'+pinFix, {
                    'type': 'geojson',
                    'data': {
                        'type': 'FeatureCollection',
                        'features': [
                            {
                                'type': 'Feature',
                                'properties': {},
                                'geometry': {
                                    'type': 'Point',
                                    'coordinates': [long,lat]
                                }
                            }
                        ]
                    }
                });
                map.addLayer({
                    'id': 'point'+pinFix,
                    'type': 'symbol',
                    'source': 'point'+pinFix,
                    'layout': {
                        'icon-image': 'pulsing-dot-'+pinFix 
                    }
                });
            }

            document.querySelector(".map-form").classList.remove('active');
        },

        initMap(map,location){
            // Initialize the geolocate control.
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

                axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${location.long},${location.lat}.json?access_token=${mapboxgl.accessToken}`)
                .then(({data}) => {
                    var userCountry = data.features[5].properties.short_code;
                    var userOutbound = data.features[5].bbox;

                    // Initialize the geocoder controls.
                    const geocoder1 = new MapboxGeocoder({
                        accessToken: mapboxgl.accessToken,
                        placeholder: 'Pick Up Address',
                        countries: userCountry,
                        bbox: userOutbound,
                        limit: 5,
                        mapboxgl: mapboxgl
                    });

                    const geocoder2 = new MapboxGeocoder({
                        accessToken: mapboxgl.accessToken,
                        placeholder: 'Drop Off Address',
                        countries: userCountry,
                        bbox: userOutbound,
                        limit: 5,
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


                    // This implements `StyleImageInterface`
                    // to draw a pulsing dot icon on the map.
                    

                    geocoder1.on('result', e => {
                        this.pin(e.result.center[0],e.result.center[1],'a');
                        document.querySelector("#geocoder1 .mapboxgl-ctrl-geocoder--input").value = e.result.place_name;

                    });

                    geocoder2.on('result', e => {
                        this.pin(e.result.center[0],e.result.center[1],'b');
                        document.querySelector("#geocoder2 .mapboxgl-ctrl-geocoder--input").value = e.result.place_name;
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

                    document.getElementById('currentlocation').onclick = ()=> {
                        this.pin(location.long,location.lat,'a');
                        document.querySelector("#geocoder1 .mapboxgl-ctrl-geocoder--input").value = data.features[0].place_name;
                    }
                        
                        
                    // create a function to make a directions request
                
            });


            


            map.on('style.load', () => {
                map.resize();
                document.getElementById('currentlocation').click();
                
                
                
                // getRoute(start);
                // locate.trigger();
                // const suggestWrapper = document.getElementsByClassName('suggestions-wrapper');
                // const div1 = suggestWrapper[0];
                // const div2 = suggestWrapper[1];
                // document.getElementById('geocoder').appendChild(div1, div2);
            });

       
                
        },
        async getRoute(pickupCoords,dropoffCoords) {
            // make a directions request using driving profile
            const map = this.map
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
    }



    
})

</script>

<style scoped>
ion-card{box-shadow: unset;}
ion-card.parent{min-height: 600px;}
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
    padding: 0 15px 30vh !important;
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
    /* border-radius: 20px 20px 0 0; */
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

#map {
    border: none;
    width: 100%;
    min-height: 600px;
    height: calc(100vh - 200px);
    border-radius: 20px 20px 0 0;
    overflow: hidden;
}

.mapboxgl-ctrl-geocoder--input {
    font: 1rem sans-serif;
    padding: 5px 45px 5px 15px;
	height: 50px !important;
}

.mapboxgl-ctrl-geocoder {
    box-shadow: none;
}

.mapboxgl-ctrl-geocoder svg {
	display: none !important;
}

.mapboxgl-ctrl-geocoder--input:focus {
    outline: none;
}

#geocoder1 .suggestions-wrapper {
	position: absolute;
	top: 100%;
	width: 100vw;
	height: auto;
	z-index: 123;
	left: 50%;
	right: 50%;
	transform: translateX(-50%);
}

#geocoder2 .suggestions-wrapper {
	position: absolute;
	top: 100%;
	width: 100vw;
	height: auto;
	z-index: 123;
	left: 50%;
	right: 50%;
	transform: translateX(-50%);
}

.hide{
    display: none;
}

</style>
