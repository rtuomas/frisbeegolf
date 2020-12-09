let table = document.getElementById('table');
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

  table.innerHTML='';

  populateTable();

}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    table.innerHTML='';
  modal.style.display = "none";
}
resultSpan.onclick = function() {
    table.innerHTML='';
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
let resultsAllCourses = [];
let count = 0;

function populateTable() {
    table.innerHTML='';
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            json = JSON.parse(xmlhttp.responseText);
            table.innerHTML =
            `<tr>
              <th>Päivämäärä</th>
              <th>Rata</th>
              <th>Rata Par</th>
              <th>Oma tulos</th>
            </tr>`;

            /*
            //var table = document.getElementById('gable');
            */

            //console.log(json);


            json.forEach(obj => {

                resultsAllCourses [count]= {
                    trackID: obj.location_id,
                    trackName: obj.location_name,
                    [1]: {course: obj.c1, par: obj.par1},
                    [2]: {course: obj.c2, par: obj.par2},
                    [3]: {course: obj.c3, par: obj.par3},
                    [4]: {course: obj.c4, par: obj.par4},
                    [5]: {course: obj.c5, par: obj.par5},
                    [6]: {course: obj.c6, par: obj.par6},
                    [7]: {course: obj.c7, par: obj.par7},
                    [8]: {course: obj.c8, par: obj.par8},
                    [9]: {course: obj.c9, par: obj.par9},
                    [10]: {course: obj.c10, par: obj.par10},
                    [11]: {course: obj.c11, par: obj.par11},
                    [12]: {course: obj.c12, par: obj.par12},
                    [13]: {course: obj.c13, par: obj.par13},
                    [14]: {course: obj.c14, par: obj.par14},
                    [15]: {course: obj.c15, par: obj.par15},
                    [16]: {course: obj.c16, par: obj.par16},
                    [17]: {course: obj.c17, par: obj.par17},
                    [18]: {course: obj.c18, par: obj.par18},
                };
                count++;
              const ownResult = obj.c1+obj.c2+obj.c3+obj.c4+obj.c5+obj.c6+obj.c7+obj.c8+obj.c9+
              obj.c10+obj.c11+obj.c12+obj.c13+obj.c14+obj.c15+obj.c16+obj.c17+obj.c18;
              const trackPar = obj.par1+obj.par2+obj.par3+obj.par4+obj.par5+obj.par6+obj.par7+obj.par8+obj.par9+
              obj.par10+obj.par11+obj.par12+obj.par13+obj.par14+obj.par15+obj.par16+obj.par17+obj.par18;
              if (ownResult!==0){
                  const javaDate = new Date(obj.play_date);
                  const day = javaDate.getDate();
                  const month = javaDate.getMonth()+1;
                  const year = javaDate.getFullYear();

                  const playDate = day+'.'+month+'.'+year;
                  const trackName=obj.location_name;
                  let trackID = obj.location_id;
                  let tr = document.createElement('tr');
                  tr.innerHTML =
                      '<td>' + playDate + '</td>' +
                      '<td><input onclick="showMore('+trackID+')" type="button" value="' + trackName + '" id="Väylä"></td>' +
                      '<td>' + trackPar + '</td>' +
                      '<td>' + ownResult + '</td>';
                  table.appendChild(tr);
              }

            });

        }
    };

    xmlhttp.open("GET", "http://127.0.0.1:80/results", true);
    xmlhttp.send();

}

//populateTable();

function showMore(name){

table.innerHTML='';
    const tr = document.createElement('tr');
    tr.innerHTML='<td><input onclick="populateTable()" type="button" value="Takaisin" id="Takaisin"></td>';
    table.appendChild(tr);
for (let i=0;i<resultsAllCourses.length;i++){
        //console.log(resultsAllCourses[i].trackID);
        //console.log(resultsAllCourses[i].trackName);
        if (resultsAllCourses[i].trackID===name){
            const tr = document.createElement('tr');
            tr.innerHTML='<td>'+resultsAllCourses[i].trackName+'</td>'+
                '<td>PAR</td>'+
                '<td>Heitot</td>'+
                '<td>Tulos</td>';
            table.appendChild(tr);
            for(let j=1;j<19;j++){
                if(resultsAllCourses[i][j].course!==0){
                    const tr = document.createElement('tr');
                    //console.log("Väylä "+j+" heitot: "+resultsAllCourses[i][j].course+" PAR: "+resultsAllCourses[i][j].par);
                    const throws = resultsAllCourses[i][j].course;
                    const par = resultsAllCourses[i][j].par;
                    const equals = par-throws;
                    tr.innerHTML= '<td>Väylä: '+j+'</td>'+
                        '<td>'+resultsAllCourses[i][j].par+'</td>'+
                    '<td>'+resultsAllCourses[i][j].course+'</td>'+
                        '<td>'+equals+'</td>';
                    table.appendChild(tr);
                    //console.log("Väylä "+j+" PAR: "+resultsAllCourses[i][j].par);

               }
            }
            break;
        }
    }

}