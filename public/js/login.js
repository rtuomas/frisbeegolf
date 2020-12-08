'use strict';

const table = document.getElementById("table");

function populateTable() {

    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            json = JSON.parse(xmlhttp.responseText);

            console.log(json);

            //var table = document.getElementById('gable');
            json.forEach(obj => {
                let tr = document.createElement('tr');
                tr.innerHTML = 
                '<td>' + obj.location_id + '</td>' +
                '<td>' + obj.user_id + '</td>' +
                '<td>' + obj.track_result + '</td>';
                table.appendChild(tr);
            });
    
        }
    };

    xmlhttp.open("GET", "http://127.0.0.1:80/results", true);
    xmlhttp.send();

};

populateTable();

