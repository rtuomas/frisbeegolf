'use strict';
/**
 * @author Joonas Soininen
 * @version 2.8
 *
 */

let json;
let position = null;

/**
 * Variables for all different map-layers and the path to the right layer.
 */
let darkMap = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    }),
    osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }),
    realMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }),
    hsl = L.tileLayer('https://cdn.digitransit.fi/map/v1/{id}/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
        maxZoom: 19,
        tileSize: 512,
        zoomOffset: -1,
        id: 'hsl-map'});

/**
 * Variable for the map itself and declarations for the different layers that it can use
 */
const map = L.map('map', {
    layers: [darkMap, osm, realMap, hsl]
});

/**
 * Variable for the different layers and their types put into a list.
 * @type {{HSL: *, Dark: *, OSM: *, Air: *}}
 */
let baseMaps = {
    "Dark": darkMap,
    "HSL": hsl,
    "Air": realMap,
    "OSM": osm
};

/**
 * Previously created list of layers is added on top of the map layer.
 */
L.control.layers(baseMaps).addTo(map); //Tällä lisätään luotu karttamuuttuja itse kartalle

/**
 * options for the map
 * @type {{enableHighAccuracy: boolean, maximumAge: number, timeout: number}}
 */
const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};

/**
 * success-function is called when leaflets navigator has made a search for users location and it gives the coordinates
 * when calling.
 * @param pos
 */
function success(pos) {
    position = pos.coords;

    map.setView([position.latitude, position.longitude], 13);
    //console.log(`Latitude: ${position.latitude}`);
    //console.log(`Longitude: ${position.longitude}`);
    addMarker(position, 'Minä olen tässä');
}

/**
 * error-function is used when there appears an error on any usage of the map. It gets its parameter when there is an
 * issue
 * @param err
 */
function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
}

/**
 * Adding the search function to the map layer and a distance scale.
 * Aligning the zoom-controls position from default to the top right corner.
 */
const searchLayer = L.layerGroup().addTo(map);
L.control.scale().addTo(map);
map.zoomControl.setPosition('topright');

/**
 * User location control
 */
navigator.geolocation.getCurrentPosition(success, error, options);

/**
 * Variables for custom icons and their settings
 */
const meIcon = L.icon({
    iconUrl: 'public/images/me.png',
    iconSize: [50,50],
    iconAnchor: [15,40],
    popupAnchor: [10,-30]
}), basketIcon = L.icon({
    iconUrl: 'public/images/301023-200.png',
    iconSize: [40,40],
    iconAnchor: [10,30],
    popupAnchor: [10,-30]
});

/**
 * addMarker-function is called when a marker is needed to be put on the map, it always needs coordinates as a parameter
 * and optionally a text input to show in the popup.
 * @param crd
 * @param teksti
 */
function addMarker(crd, teksti) {
    //crd={latitude:'60.171040', longitude:'24.941957'}; //Helsingin päärautatieasema
    L.marker([crd.latitude, crd.longitude], {icon: meIcon}).addTo(map).bindPopup('<p class="iconText">'+teksti+'</p>').openPopup().on('click', function () {
    });
}

/**
 * Creating a variable for the distance input, adding it on the map-layer and making it a function that can be used to
 * get user input.
 */
const distanceLegend = L.control({position: 'topleft'});
distanceLegend.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'distance legend');
    div.innerHTML = '<input type="number" id="distanceValue" placeholder="Etäisyys kilometreinä">' +
        '<input onclick="makeDistanceQuery()" type="button" value="Etsi radat" id="submit">';
    div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
    return div;
};
distanceLegend.addTo(map);

/**
 * Creating a variable for the county search function, adding all the options to it and adding it to the map-layer.
 */
const areaLegend = L.control({position: 'topleft'});
areaLegend.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'area legend');
    div.innerHTML = '<select name="valinta" id="valinta">\n' +
        '    <option value="kaikki" id="empty">Kaikki radat</option>\n' +
        '    <option value="Ahvenanmaa" id="ahvenanmaa">Ahvenanmaa</option>\n' +
        '    <option value="Etelä-Karjala" id="etela-karjala">Etelä-Karjala</option>\n' +
        '    <option value="Etelä-Pohjanmaa" id="etela-pohjanmaa">Etelä-Pohjanmaa</option>\n' +
        '    <option value="Etelä-Savo" id="etela-savo">Etelä-Savo</option>\n' +
        '    <option value="Kainuu" id="kainuu">Kainuu</option>\n' +
        '    <option value="Kanta-Häme" id="kanta-hame">Kanta-Häme</option>\n' +
        '    <option value="Keski-Pohjanmaa" id="keski-pohjanmaa">Keski-Pohjanmaa</option>\n' +
        '    <option value="Keski-Suomi" id="keski-suomi">Keski-Suomi</option>\n' +
        '    <option value="Kymenlaakso" id="kymenlaakso">Kymenlaakso</option>\n' +
        '    <option value="Lappi" id="lappi">Lappi</option>\n' +
        '    <option value="Pirkanmaa" id="pirkanmaa">Pirkanmaa</option>\n' +
        '    <option value="Pohjois-Karjala" id="pohjois-karjala">Pohjois-Karjala</option>\n' +
        '    <option value="Pohjois-Pohjanmaa" id="pohjois-pohjanmaa">Pohjois-Pohjanmaa</option>\n' +
        '    <option value="Pohjois-Savo" id="pohjois-savo">Pohjois-Savo</option>\n' +
        '    <option value="Päijät-Häme" id="paijat-hame">Päijät-Häme</option>\n' +
        '    <option value="Satakunta" id="satakunta">Satakunta</option>\n' +
        '    <option value="Uusimaa" id="uusimaa">Uusimaa</option>\n' +
        '    <option value="Varsinais-Suomi" id="varsinais-suomi">Varsinais-Suomi</option>\n' +
        '</select>' +
        '<input onclick="makeCountyQuery()" type="button" value="Näytä radat" id="submit">';
    div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
    return div;
};
areaLegend.addTo(map);

/**
 * Adding setting for the search function.
 */
map.addControl( new L.Control.Search({
    position:'topleft',
    layer: searchLayer,
    initial: false,
    zoom: 15,
    marker: false
}) );

/**
 * Creating a variable for going back to my own location, adding a function to it and declaring what it does when clicked.
 */
const myLocation = L.control({position: 'bottomright'});
myLocation.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'oma_sijainti');
    div.innerHTML = '<input onclick="map.setView([position.latitude, position.longitude], 13);" type="image" id="my_location" src="https://static.thenounproject.com/png/92016-200.png" width="30px">';
    div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
    return div;
};
myLocation.addTo(map);

/**
 * makeCountyQuery-function is called when there is a need to go into the servers database. The function accesses the server
 * trough an xmlhttp-request and passes data to the server, in this case the chosen are where the frisbeegolf courses
 * are searched for.
 */
function makeCountyQuery() {
    const area = document.getElementById('valinta').value;
    searchLayer.clearLayers();
    let crd, trackName, trackID;
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            json = JSON.parse(xmlhttp.responseText);
            for (let i=0; i<json.rows.length; i++){
                if (json.rows[i].latitude!==0&&json.rows[i].longitude!==0){
                    crd = {latitude: json.rows[i].latitude, longitude: json.rows[i].longitude};
                    trackName = json.rows[i].location_name;
                    trackID = json.rows[i].location_id;
                    addTrack(crd, trackName, trackID);
                }
            }
            map.setView([crd.latitude, crd.longitude], 10);
        }
    };
    xmlhttp.open("GET", "http://127.0.0.1:80/nouda/maakunta?area="+area, true);
    xmlhttp.send();
}

/**
 * makeDistanceQuery-function is called when the user wants to search tracks in a radius froom the users location.
 * Function sends a request to the servers database and returns the tracks in the radius the user inputted.
 */
function makeDistanceQuery(){
    let distance = document.getElementById('distanceValue').value;
    if (distance <=0){
        alert("Syötä positiivinen luku!");
    } else {
    searchLayer.clearLayers();
    //JSON.stringify(string);
    let crd, trackName, trackID, km;
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            json = JSON.parse(xmlhttp.responseText);
            //console.log("Tietokannasta haettu ja map.js lähetetty data:");
            console.log(json);

            for (let i=0; i<json.rows.length; i++){
                //console.log(json.rows[i].location_name+' '+json.rows[i].distance);

                if (json.rows[i].latitude!==0&&json.rows[i].longitude!==0){
                    crd = {latitude: json.rows[i].latitude, longitude: json.rows[i].longitude};
                    trackName = json.rows[i].location_name;
                    trackID = json.rows[i].location_id;
                    km = json.rows[i].distance;
                    let fixedkm = km.toFixed(2);

                    addTrack(crd, trackName, trackID);

                }
            }
            map.setView([position.latitude, position.longitude], 10);
        }
    };
    xmlhttp.open("GET", "http://127.0.0.1:80/nouda/distance?dis="+distance+"&lat="+position.latitude+"&lon="+position.longitude, true);
    xmlhttp.send();
    }
}

/**
 * Functions adds frisbeegolf tracks to the map and uses crd for coordinates lat/long, trackName for the name of the track and trackID to identify the track and usage on other functions
 * @param crd
 * @param trackName
 * @param trackID
 */
function addTrack(crd, trackName, trackID) {
    let xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            json = JSON.parse(xmlhttp.responseText);
            //console.log("map User ID: "+json.id);
            //console.log("map User: "+json.user);
            const user = json;
            //console.log(json);

            let trackMarker;

            if (user.id==null||user.user==null){
                trackMarker = L.marker([crd.latitude, crd.longitude], {
                    title: trackName,
                    icon: basketIcon
                }).bindPopup('<p class="iconText">'+trackName+'</p>' + '<p style="color:red;">Kirjaudu sisälle pelataksesi</p>'
                ).openPopup().on('click', function () {
                    //console.log("RATAICON Väylä ID: " + trackID);
                });

            } else {

                trackMarker = L.marker([crd.latitude, crd.longitude], {
                    title: trackName,
                    icon: basketIcon
                }).bindPopup('<p class="iconText">'+trackName+'</p>'+ '<input type="button" onclick="playTrack(' + trackID + ',\'' + trackName + '\')" value="Pelaa tämä" id="playTrack"/>'
                ).openPopup().on('click', function () {
                    //console.log("RATAICON Väylä ID: " + trackID);
                });

            }
            searchLayer.addLayer(trackMarker);
        }
    };
    xmlhttp.open("GET", "http://127.0.0.1:80/user/username", true);
    xmlhttp.send();
}
