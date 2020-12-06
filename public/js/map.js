/**
 * @author Joonas Soininen
 * @version 1.9
 *
 */

'use strict';

let json;
let position = null;

const map = L.map('map');

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);
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
    console.log(`Latitude: ${position.latitude}`);
    console.log(`Longitude: ${position.longitude}`);

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
 *
 */
const searchLayer = L.layerGroup().addTo(map);

L.control.scale().addTo(map);

map.zoomControl.setPosition('topright');
/**
 *
 */
navigator.geolocation.getCurrentPosition(success, error, options);

/**
 *
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
    L.marker([crd.latitude, crd.longitude], {icon: meIcon}).addTo(map).bindPopup(teksti).openPopup().on('click', function () {
    });
}

/**
 *
 */
const legend = L.control({position: 'topleft'});
legend.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'area legend');
    div.innerHTML = '<select name="valinta" id="valinta">\n' +
        '    <option value="empty" id="empty">Maakunnat:</option>\n' +
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
        '    <option value="kaikki" id="kokosuomi">Kaikki radat</option>\n' +
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

/**
 *
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
 * makeQuery-function is called when there is a need to go into the servers database. The function accesses the server
 * trough an xmlhttp-request and passes data to the server, in this case the chosen are where the frisbeegolf courses
 * are searched for.
 * @param area
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

    const markkeri = L.marker([crd.latitude, crd.longitude], {title: trackName, icon: basketIcon}).bindPopup(trackName+'<br>'+trackID+'<br><input type="button" onclick="playTrack('+trackID+',\''+trackName+'\')" value="Pelaa tämä" id="playTrack"/>').openPopup().on('click', function () {

        console.log("RATAICON Väylä ID: "+trackID);

    });
    searchLayer.addLayer(markkeri);

}

/**
 * Function is used to activate scoreboard for the user and use the already existing trackID to connect result to the right track.
 * @param trackID
 */
//TODO Scoreboard appearance not finished

    // Get the modal
const modalResults = document.getElementById("onCourse");

// Get the <span> element that closes the modal
const spanResults = document.getElementsByClassName("closeResults")[0];

// When the user clicks on <span> (x), close the modal
spanResults.onclick = function() {
    modalResults.style.display = "none";
}

let results = [];
let courseID=1;
let trackIdentification, userIdentification;

function playTrack(trackID, trackName){
results.length=0;
courseID=1;
const list = document.getElementById('list').innerHTML='';
    modalResults.style.display = "block";

    console.log("NAPPI Väylä ID: "+trackID);
    console.log("NAPPI Väylä NIMI: "+trackName);
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            json = JSON.parse(xmlhttp.responseText);
            console.log("map User ID: "+json.id);
            console.log("map User: "+json.user);
            const track = document.getElementById('Rata').innerHTML=trackName;
            const user = document.getElementById('User').innerHTML='Pelaaja: '+json.user;
            trackIdentification=trackID;
            userIdentification=json.id;
            results[0]={trackID: trackIdentification, userID: userIdentification};
       }
    };
    xmlhttp.open("GET", "http://127.0.0.1:80/user/username", true);
    xmlhttp.send();


}

//TODO Make this functioning! All below!!

function addResults(){
    console.log('add note');
    const throws = document.getElementById('Heitot').value;
    const PAR = document.getElementById('PAR').value;
    console.log(courseID);
    const updated = {CourseID: courseID, Throws: throws, PAR: PAR};
    console.log(updated);
    results[courseID] = {CourseID: courseID, Throws: throws, PAR: PAR};
    courseID++
    console.log(results);
    document.getElementById('Heitot').value = '';
    document.getElementById('PAR').value = '';
    document.getElementById('saveResultButton').innerHTML='<input onclick="saveResults()" type="button" value="Tallenna tulokset tietokantaan" id="saveResults"/>';
    loadList();
}

function loadList() {
    const table = document.getElementById('list');
    const rowHead = document.createElement('tr');

    table.innerHTML = '';
    rowHead.innerHTML='<tr><th>Pelatut</th><th>Heitot</th><th>PAR</th></tr>';
    table.appendChild(rowHead);
    for (let i=1; i<results.length; i++) {
        const row = document.createElement('tr');
        row.id = i;
        row.innerHTML = '<td><a onclick="updateResult(this)">Väylä '+results[i].CourseID+'</a></td>' +
            '<td><a>'+results[i].Throws+'</a></td>' +
            '<td><a>'+results[i].PAR+'</a></td>' +
            '<td><input onclick="updateResult(this)" type="button" value="Muokkaa" id="Muokkaa"></td>';
        table.appendChild(row);
    }
}

function updateResult(element) {

    console.log('update note');

    const id = element.parentNode.parentNode.id;
    const tr = document.getElementById(id);
    console.log(id);

    for (let i=1;i<results.length;i++){
        const trList = document.getElementById(i);
        trList.innerHTML='';
        trList.innerHTML='<td><a>Väylä '+results[i].CourseID+'</a></td>' +
            '<td><a>'+results[i].Throws+'</a></td>' +
            '<td><a>'+results[i].PAR+'</a></td>';
    }
    tr.innerHTML='';
    tr.innerHTML='<td><a>Väylä '+results[id].CourseID+'</a></td>' +
        '<td><a><input type="text" id="HeitotEDIT" placeholder="'+results[id].Throws+'" autofocus /></a></td>' +
        '<td><a><input type="text" id="PAREDIT" placeholder="'+results[id].PAR+'"/></a></td>' +
        '<td><input onclick="saveEdit(this)" type="button" value="Tallenna" id="Tallenna"></td>';
}

function saveEdit(elementID){

    const id = elementID.parentNode.parentNode.id;
    const throws = document.querySelector('#HeitotEDIT').value;
    const PAR = document.querySelector('#PAREDIT').value;
    const tr = document.getElementById(id);
    console.log(id);
    results[id] = {CourseID: id, Throws: throws, PAR: PAR};
    tr.innerHTML='';
    tr.innerHTML='<td><a>Väylä '+results[id].CourseID+'</a></td>' +
        '<td><a>'+results[id].Throws+'</a></td>' +
        '<td><a>'+results[id].PAR+'</a></td>' +
        '<td><input onclick="updateResult(this)" type="button" value="Muokkaa" id="Muokkaa"></td>';

    for (let i=1;i<results.length;i++){
        const trList = document.getElementById(i);
        trList.innerHTML='';
        trList.innerHTML='<td><a onclick="updateResult(this)">Väylä '+results[i].CourseID+'</a></td>' +
        '<td><a>'+results[i].Throws+'</a></td>' +
        '<td><a>'+results[i].PAR+'</a></td>' +
        '<td><input onclick="updateResult(this)" type="button" value="Muokkaa" id="Muokkaa"></td>';
    }
}

function saveResults(){

    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            json = xmlhttp.responseText;
            console.log(json);
        }
    };
    xmlhttp.open("POST", "http://127.0.0.1:80/plays/trackresult", true);
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlhttp.send(JSON.stringify(results));
}