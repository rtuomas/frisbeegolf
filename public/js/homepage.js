
// Get the modal
const modal = document.getElementById("myModal");
const resultModal = document.getElementById("resultModal");

// Get the button that opens the modal
const btn = document.getElementById("myBtn");
const resultButton = document.getElementById("resultButton");

// Get the <span> element that closes the modal
const span = document.getElementsByClassName("close")[0];
const resultSpan = document.getElementsByClassName("closeResult")[0];

// When the user clicks the button, open the modal 
btn.onclick = function() {
  modal.style.display = "block";
}
resultButton.onclick = function() {
  resultModal.style.display = "block";

  populateTable();

}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}
resultSpan.onclick = function() {
  resultModal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target === resultModal) {
      resultModal.style.display = "none";
  } else  if (event.target === modal) {
      modal.style.display = "none";
  }
}


/*
function logout() {
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "http://localhost:80/logout", true);
    xmlhttp.send();
}
*/


//const table = document.getElementById("table");
//onst results = document.getElementById("results");

function populateTable() {

    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            json = JSON.parse(xmlhttp.responseText);

            document.getElementById("table").innerHTML = 
            `<tr>
              <th>Päivämäärä</th>
              <th>Rata</th>
              <th>Rata Par</th>
              <th>Oma tulos</th>
            </tr>`;

            /*
            //var table = document.getElementById('gable');
            */
            json.forEach(obj => {

              const ownResult = obj.c1+obj.c2+obj.c3+obj.c4+obj.c5+obj.c6+obj.c7+obj.c8+obj.c9+
              obj.c10+obj.c11+obj.c12+obj.c13+obj.c14+obj.c15+obj.c16+obj.c17+obj.c18;
              const trackPar = obj.par1+obj.par2+obj.par3+obj.par4+obj.par5+obj.par6+obj.par7+obj.par8+obj.par9+
              obj.par10+obj.par11+obj.par12+obj.par13+obj.par14+obj.par15+obj.par16+obj.par17+obj.par18;
              



              let tr = document.createElement('tr');
              tr.innerHTML = 
              '<td>' + obj.play_date + '</td>' +
              '<td>' + obj.location_id + '</td>' +
              '<td>' + trackPar + '</td>' +
              '<td>' + ownResult + '</td>';
              table.appendChild(tr);


            });
        }
    };

    xmlhttp.open("GET", "http://127.0.0.1:80/results", true);
    xmlhttp.send();

};

//populateTable();