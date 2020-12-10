/**
 * @author Joonas Soininen
 * @version 2.5
 *
 */
'use strict';

let json;
let position = null;

let darkMap = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', { //Määritettään eri karttakerroksille muuttujat ja karttojen lähteet
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

const map = L.map('map', { //Määritetään kartalle muttuja ja annetaan sille eri käytetttävät layerit
    layers: [darkMap, osm, realMap, hsl]
});

let baseMaps = { //Tässä luodaan muttuja karttavalikolle
    "Dark": darkMap,
    "HSL": hsl,
    "Air": realMap,
    "OSM": osm
};

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

const searchLayer = L.layerGroup().addTo(map);

L.control.scale().addTo(map);

map.zoomControl.setPosition('topright');

navigator.geolocation.getCurrentPosition(success, error, options);

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

const legend = L.control({position: 'topleft'});
legend.onAdd = function (map) {
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
        '<br><input onclick="makeQuery()" type="button" value="Näytä radat" id="submit">';
    div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
    return div;
};
legend.addTo(map);

map.addControl( new L.Control.Search({
    position:'topleft',
    layer: searchLayer,
    initial: false,
    zoom: 15,
    marker: false
}) );

const myLocation = L.control({position: 'bottomright'});
myLocation.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'oma_sijainti');
    div.innerHTML = '<input onclick="map.setView([position.latitude, position.longitude], 13);" type="image" id="my_location" src="https://static.thenounproject.com/png/92016-200.png" width="30px">';
    div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
    return div;
};
myLocation.addTo(map);

/**
 * makeQuery-function is called when there is a need to go into the servers database. The function accesses the server
 * trough an xmlhttp-request and passes data to the server, in this case the chosen are where the frisbeegolf courses
 * are searched for.
 */
function makeQuery() {
    const area = document.getElementById('valinta').value;
    searchLayer.clearLayers();
    let crd, trackName, trackID;
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            json = JSON.parse(xmlhttp.responseText);
            //console.log(json);
            for (let i=0; i<json.rows.length; i++){
                //console.log(json.rows[i].latitude+' '+json.rows[i].longitude);

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
    xmlhttp.open("GET", "http://127.0.0.1:80/nouda?area="+area, true);
    xmlhttp.send();
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
            //console.log(user);

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

//Tulostaulukon muuttujia
const modalResults = document.getElementById("onCourse");
const spanResults = document.getElementsByClassName("closeAddedResults")[0];
let results = [];
let courseID=1;
let trackIdentification, userIdentification;

/**
 * Function is a waypoint in between and it connect to the server and fetches username and ID for the results to be matched to the right player.
 * It also adds the data to the modal that popsup when the playTrack function activating button is pressed.
 * tracID and trackName are passed to this function to be added to the results database later.
 * @param trackID
 * @param trackName
 */
function playTrack(trackID, trackName){
results.length=0;
courseID=1;
document.getElementById('list').innerHTML='';

    modalResults.style.display = "block";

    //console.log("NAPPI Väylä ID: "+trackID);
    //console.log("NAPPI Väylä NIMI: "+trackName);
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            json = JSON.parse(xmlhttp.responseText);
            //console.log("map User ID: "+json.id);
            //console.log("map User: "+json.user);
            document.getElementById('Rata').innerHTML=trackName;
            document.getElementById('User').innerHTML='Pelaaja: '+json.user;
            trackIdentification=trackID;
            userIdentification=json.id;
            results[0]={trackID: trackIdentification, userID: userIdentification};
            window.onclick = function(event) {
                if (event.target === modalResults) {
                    modalResults.style.display = "none";
                }
                spanResults.onclick = function() {
                    modalResults.style.display = "none";
                }

            }
       }
    };
    xmlhttp.open("GET", "http://127.0.0.1:80/user/username", true);
    xmlhttp.send();

}

/**
 *
 */
function addResults(){
    //console.log('add note');
    const throws = document.getElementById('Heitot').value;
    const PAR = document.getElementById('PAR').value;
    //console.log(courseID);
    //const updated = {CourseID: courseID, Throws: throws, PAR: PAR};
    //console.log(updated);
    if (courseID===19){
        alert("Ei voi syöttää enempää väyliä");
    } else if(throws===''||throws===0||PAR===''||PAR===0){
        alert("Ei voi olla tyhjä eikä 0, ole ystävällinen ja syötä sopiva arvo :)");
    }  else {
        results[courseID] = {CourseID: courseID, Throws: throws, PAR: PAR};
        courseID++
        document.getElementById('Heitot').value = '';
        document.getElementById('PAR').value = '';
        document.getElementById('saveResultButton').innerHTML='<input onclick="saveResults()" type="button" value="Tallenna tulokset tietokantaan" id="saveResults"/>';
        loadList();
    }
    //console.log(results);
}

/**
 *
 */
function loadList() {
    const table = document.getElementById('list');
    const rowHead = document.createElement('tr');

    table.innerHTML = '';
    rowHead.innerHTML='<tr><th>Pelatut</th><th>Heitot</th><th>PAR</th><th>Tulos</th></tr>';
    table.appendChild(rowHead);
    for (let i=1; i<results.length; i++) {
        let heitot = results[i].Throws;
        let PAR = results[i].PAR;
        let tulos = heitot-PAR;
        const row = document.createElement('tr');
        row.id = i;
        row.innerHTML = '<td><a onclick="updateResult(this)">Väylä '+results[i].CourseID+'</a></td>' +
            '<td><a>'+results[i].Throws+'</a></td>' +
            '<td><a>'+results[i].PAR+'</a></td>' +
            '<td><a>'+tulos+'</a></td>' +
            '<td><input onclick="updateResult(this)" type="button" value="Muokkaa" id="Muokkaa"></td>';
        table.appendChild(row);
    }
}

/**
 * Function is used to update already set result to the local storage list and is handled the right id when called.
 * @param element
 */
function updateResult(element) {
    const id = element.parentNode.parentNode.id;
    const tr = document.getElementById(id);
    //console.log(id);
    const throwsOneRow = results[id].Throws;
    const parOneRow = results[id].PAR;
    const resultOneRow = throwsOneRow-parOneRow;
    for (let i=1;i<results.length;i++){
        const throwsAllRows = results[i].Throws;
        const parAllRows = results[i].PAR;
        const resultAllRows = throwsAllRows-parAllRows;
        const trList = document.getElementById(i);
        trList.innerHTML='';
        trList.innerHTML='<td><a>Väylä '+results[i].CourseID+'</a></td>' +
            '<td><a>'+results[i].Throws+'</a></td>' +
            '<td><a>'+results[i].PAR+'</a></td>'+
            '<td><a>'+resultAllRows+'</a></td>';
    }
    tr.innerHTML='';
    tr.innerHTML='<td><a>Väylä '+results[id].CourseID+'</a></td>' +
        '<td><input type="number" id="HeitotEDIT" placeholder="'+results[id].Throws+'" autofocus /></td>' +
        '<td><input type="number" id="PAREDIT" placeholder="'+results[id].PAR+'"/></td>' +
        '<td><a>'+resultOneRow+'</a></td>' +
        '<td><input onclick="saveEdit(this)" type="button" value="Tallenna" id="Tallenna"></td>';
}

/**
 * Function saves the edited list columns back to the list and is given the right id when called.
 * @param elementID
 */
function saveEdit(elementID){

    const id = elementID.parentNode.parentNode.id;
    const throws = document.querySelector('#HeitotEDIT').value;
    const PAR = document.querySelector('#PAREDIT').value;
    const tr = document.getElementById(id);
    //console.log(id);
    const throwsOneRow = results[id].Throws;
    const parOneRow = results[id].PAR;
    const resultOneRow = throwsOneRow-parOneRow;
    results[id] = {CourseID: id, Throws: throws, PAR: PAR};
    tr.innerHTML='';
    tr.innerHTML='<td><a>Väylä '+results[id].CourseID+'</a></td>' +
        '<td><a>'+results[id].Throws+'</a></td>' +
        '<td><a>'+results[id].PAR+'</a></td>' +
        '<td><a>'+resultOneRow+'</a></td>' +
        '<td><input onclick="updateResult(this)" type="button" value="Muokkaa" id="Muokkaa"></td>';

    for (let i=1;i<results.length;i++){
        const throwsAllRows = results[i].Throws;
        const parAllRows = results[i].PAR;
        const resultAllRows = throwsAllRows-parAllRows;
        const trList = document.getElementById(i);
        trList.innerHTML='';
        trList.innerHTML='<td><a onclick="updateResult(this)">Väylä '+results[i].CourseID+'</a></td>' +
        '<td><a>'+results[i].Throws+'</a></td>' +
        '<td><a>'+results[i].PAR+'</a></td>' +
            '<td><a>'+resultAllRows+'</a></td>' +
        '<td><input onclick="updateResult(this)" type="button" value="Muokkaa" id="Muokkaa"></td>';
    }
}

/**
 *
 */
function saveResults(){
    document.getElementById('list').innerHTML='';
    document.getElementById('saveResultButton').innerHTML='';
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            json = xmlhttp.responseText;
            alert(json);
            //console.log(json);
        }
    };
    xmlhttp.open("POST", "http://127.0.0.1:80/plays/trackresult", true);
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlhttp.send(JSON.stringify(results));
}