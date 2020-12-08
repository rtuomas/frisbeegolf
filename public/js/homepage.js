
// Get the modal
const modal = document.getElementById("myModal");
const reultModal = document.getElementById("resultModal");

// Get the button that opens the modal
const btn = document.getElementById("myBtn");
const resultButton = document.getElementById("resultButton");

// Get the <span> element that closes the modal
const span = document.getElementsByClassName("close")[0];
const span2 = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function() {
  modal.style.display = "block";
}
resultButton.onclick = function() {
  console.log("TEST");
  resultModal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}
span.onclick = function() {
  resultModal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target === modal) {
    modal.style.display = "none";
  }
}
window.onclick = function(event) {
  if (event.target === resultModal) {
    resultModal.style.display = "none";
  }
}


/*
function logout() {
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "http://localhost:80/logout", true);
    xmlhttp.send();
}
*/


const table = document.getElementById("table");

function populateTable() {

    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            json = JSON.parse(xmlhttp.responseText);


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