'use strict';

console.log("test");

function logout() {
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "http://localhost:80/logout", true);
    xmlhttp.send();
}