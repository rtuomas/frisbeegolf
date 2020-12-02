/**
 * @author Joonas Soininen
 * @version 1.6
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
//... adding data in searchLayer ...
map.addControl( new L.Control.Search({
    position:'topright',
    layer: searchLayer,
    initial: false,
    zoom: 15,
    marker: false
}) );
//searchLayer is a L.LayerGroup contains searched markers

L.control.scale().addTo(map);

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
    const div = L.DomUtil.create('div', 'info legend');
    div.innerHTML = '<select name="valinta" id="valinta">\n' +
        '    <option value="empty" id="empty">Valitse maakunta tästä:</option>\n' +
        '    <option value="ahvenanmaa" id="ahvenanmaa">Ahvenanmaa</option>\n' +
        '    <option value="etela-karjala" id="etela-karjala">Etelä-Karjala</option>\n' +
        '    <option value="etela-pohjanmaa" id="etela-pohjanmaa">Etelä-Pohjanmaa</option>\n' +
        '    <option value="etela-savo" id="etela-savo">Etelä-Savo</option>\n' +
        '    <option value="kainuu" id="kainuu">Kainuu</option>\n' +
        '    <option value="kanta-hame" id="kanta-hame">Kanta-Häme</option>\n' +
        '    <option value="keski-pohjanmaa" id="keski-pohjanmaa">Keski-Pohjanmaa</option>\n' +
        '    <option value="keski-suomi" id="keski-suomi">Keski-Suomi</option>\n' +
        '    <option value="kymenlaakso" id="kymenlaakso">Kymenlaakso</option>\n' +
        '    <option value="lappi" id="lappi">Lappi</option>\n' +
        '    <option value="pirkanmaa" id="pirkanmaa">Pirkanmaa</option>\n' +
        '    <option value="pohjois-karjala" id="pohjois-karjala">Pohjois-Karjala</option>\n' +
        '    <option value="pohjois-pohjanmaa" id="pohjois-pohjanmaa">Pohjois-Pohjanmaa</option>\n' +
        '    <option value="pohjois-savo" id="pohjois-savo">Pohjois-Savo</option>\n' +
        '    <option value="paijat-hame" id="paijat-hame">Päijät-Häme</option>\n' +
        '    <option value="satakunta" id="satakunta">Satakunta</option>\n' +
        '    <option value="uusimaa" id="uusimaa">Uusimaa</option>\n' +
        '    <option value="varsinais-suomi" id="varsinais-suomi">Varsinais-Suomi</option>\n' +
        '    <option value="kokosuomi" id="kokosuomi">Kaikki radat</option>\n' +
        '</select>' +
        '<br><input onclick="trackSearch()" type="button" value="Näytä radat" id="submit">';
    div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
    return div;
};
legend.addTo(map);

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

const dropdownAreas = document.getElementById('valinta');
/**
 *
 */
function trackSearch() { //Funktiolla määritellään mitä tapahtuu hakunappia painettaessa
let area;
    switch (dropdownAreas.selectedIndex) { //Switch-case määrittää mikä pudostusvalikon atribuutti on käytössä ja default päivittä kartan
        case 1:
            area = 'Ahvenanmaa';
            break;
        case 2:
            area = 'Etelä-Karjala';
            break;
        case 3:
            area = 'Etelä-Pohjanmaa';
            break;
        case 4:
            area = 'Etelä-Savo';
            break;
        case 5:
            area = 'Kainuu';
            break;
        case 6:
            area = 'Kanta-Häme';
            break;
        case 7:
            area = 'Keski-Pohjanmaa';
            break;
        case 8:
            area = 'Keski-Suomi';
            break;
        case 9:
            area = 'Kymenlaakso';
            break;
        case 10:
            area = 'Lappi';
            break;
        case 11:
            area = 'Pirkanmaa';
            break;
        case 12:
            area = 'Pohjois-Karjala';
            break;
        case 13:
            area = 'Pohjois-Pohjanmaa';
            break;
        case 14:
            area = 'Pohjois-Savo';
            break;
        case 15:
            area = 'Päijät-Häme';
            break;
        case 16:
            area = 'Satakunta';
            break;
        case 17:
            area = 'Uusimaa';
            break;
        case 18:
            area = 'Varsinais-Suomi';
            break;
        case 19:
            area = 'kaikki';
            break;
        default:
            alert('Valitse jokin näytettävä arvo.')
            break;
    }
    makeQuery(area)
}

/**
 * makeQuery-function is called when there is a need to go into the servers database. The function accesses the server
 * trough an xmlhttp-request and passes data to the server, in this case the chosen are where the frisbeegolf courses
 * are searched for.
 * @param area
 */
function makeQuery(area) {
    searchLayer.clearLayers();
    let crd, teksti;
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            json = JSON.parse(xmlhttp.responseText);
            //console.log(json);
            for (let i=0; i<json.rows.length; i++){
                //console.log(json.rows[i].latitude+' '+json.rows[i].longitude);

                if (json.rows[i].latitude!==0&&json.rows[i].longitude!==0){
                    crd = {latitude: json.rows[i].latitude, longitude: json.rows[i].longitude};
                    teksti = json.rows[i].location_name;
                    const trackMarker = L.marker([crd.latitude, crd.longitude], {title: teksti, icon: basketIcon}).bindPopup(teksti+'<br>'+crd.latitude+' '+crd.longitude).openPopup().on('click', function () {
                    });
                    searchLayer.addLayer(trackMarker);
                }
            }
            map.setView([crd.latitude, crd.longitude], 10);
        }
    };
    xmlhttp.open("GET", "http://127.0.0.1:80/nouda?area="+area, true);
    xmlhttp.send();
}


