'use strict'
/**
 * @author Joonas Soininen
 * @version 2.5.1
 *
 */
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
    document.getElementById('Tulosteet').innerHTML='';
    document.getElementById('resultsInput').className='visible';
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
 * Function is used to add player results from a course to the loccl results list.
 * Input can't be a zero or below zero and can only be a number.
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
    } else if(throws===''||throws<=0||PAR===''||PAR<=0){
        alert("Ei voi olla tyhjä eikä alle 1, ole ystävällinen ja syötä sopiva arvo :)");
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
 * Function updates the list as the player adds scores to it. It rewrites the page when called.
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
 * Function is used to update already set result to the local storage list and is handled with the right id when called.
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
        '<td><input type="number" id="HeitotEDIT" value="'+results[id].Throws+'" autofocus /></td>' +
        '<td><input type="number" id="PAREDIT" value="'+results[id].PAR+'"/></td>' +
        '<td><a>'+resultOneRow+'</a></td>' +
        '<td><input onclick="saveEdit(this)" type="button" value="Tallenna" id="Tallenna"></td>';
}

/**
 * Function saves the edited list columns back to the list with the right row id that is passed to it when called.
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
    if(throws===''||throws<=0||PAR===''||PAR<=0){
        alert("Ei voi olla tyhjä eikä alle 1, ole ystävällinen ja syötä sopiva arvo :)");
    } else {
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
}

/**
 * Function saves the results to the database when called and alerts the user if the function was successful or not.
 */
function saveResults(){
    document.getElementById('saveResultButton').innerHTML='';

    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            json = xmlhttp.responseText;
            //console.log(json);
            document.getElementById('User').innerHTML='';
            document.getElementById('resultsInput').className='hidden';
            document.getElementById('Tulosteet').innerHTML=json;
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
                    '<td><a>'+tulos+'</a></td>';
                table.appendChild(row);
            }
        }
    };
    xmlhttp.open("POST", "http://127.0.0.1:80/plays/trackresult", true);
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlhttp.send(JSON.stringify(results));
}