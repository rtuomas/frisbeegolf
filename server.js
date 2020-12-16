const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const cons = require('consolidate');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');
const util = require('util');
const cors = require('cors');
const urlencodedParser = bodyParser.urlencoded({extended:false});
const { check, validationResult } = require('express-validator');


const url = require('url');

/*
//Tuomaksen yhteys
const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'rootPass',
    database: 'frisbee'
});

 */



 


//Joonaksen yhteys:
const con = mysql.createConnection({
    host: "localhost",
    user: "olso",
    password: "olso",
    database: "frisbee"
});


const query = util.promisify(con.query).bind(con);

con.connect( err => {
    err?console.log(err):console.log("Connected to database!");
})


const app = express();
app.use(cors());

/*
app.set('view engine', 'pug');
app.set('views','./views');
*/

app.engine('html', cons.swig)
app.set('views','./views');
app.set('view engine', 'html');

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.use(session({
    //path: '/',
	secret: 'secretcode',
	resave: true,
	saveUninitialized: true
}));

app.use(express.static(__dirname + '/public'));
app.use('/public', express.static(path.join(__dirname, "public")));

app.get('/', (req, res) => {
    if (req.session.loggedin) {
        res.redirect('/home');
	} else {
        //res.sendFile(path.join(__dirname + '/views/login_register.html'));
        const ip = req.connection.remoteAddress
        const port = req.connection.remotePort
        console.log(ip, port);
        res.render('login_register', {
            ip: "My ip: " + ip + " port: " + port
        });

    }
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if(username&&password) {
        const sql = 'SELECT * FROM accounts WHERE username = ?';
        con.query(sql, [username], async (error, results, fields) => {
            if(results.length>0 && await bcrypt.compare(password, results[0].password)){
                req.session.loggedin = true;
                req.session.username = username;
                res.redirect('/home');
            } else {
                res.render('login_register', {
                    warning: "Wrong password or/and username"
                });
            }
		});
    } else {
        res.render('login_register', {
            warning: "Pls fill username and password"
        });
    }
});

app.post('/register', urlencodedParser, 
    [check('username').isLength({ min: 2 }).withMessage("At least 2 characters in username"),
    check('password').isLength({ min: 2 }).withMessage("At least 2 characters in password")],
    (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('login_register', {
                usernameError: errors.array()[0].msg,
                passwordError: errors.array()[1].msg
            });
        } else {
            const username = req.body.username;
            const password = req.body.password;
            if(username&&password){
                const sql = 'SELECT * FROM accounts WHERE username = ?';
                con.query(sql, [username], async (error, results1, fields) => {
                    if(results1.length>0){
                        res.render('login_register', {
                            warning: "Username already in use"
                        });
                    } else {
                        let hashedPass = await bcrypt.hash(password, 8);
                        const sql = 'INSERT INTO accounts VALUES (?,?,?)';
                        con.query(sql, [null,username,hashedPass], (error, results2, fields) => {
                            const sql = 'SELECT id FROM accounts WHERE username = ?';
                            con.query(sql, [username], (error, results3, fields) => {
                                user = username;
                                userID = results3[0].id;
                                req.session.loggedin = true;
                                req.session.username = username;
                                res.redirect('/home');
                            });
                        });
                    }
                })
            } else {
                res.render('login_register', {
                    warning: "Pls fill username AND password fields"
                });
            }
        } 
    }
);
 

app.post('/logout', (req, res) => {
    req.session.loggedin = false;
    req.session.username = null;
    res.redirect('/');
});


app.post('/changePassword', (req, res) => {

    if(req.session.loggedin){
        const username = req.session.username;

        const sql = 'SELECT * FROM accounts WHERE username = ?';
        con.query(sql, [username], async (error, results, fields) => {
            if(results.length>0 && await bcrypt.compare(req.body.passwordCurrent, results[0].password)){
                if(req.body.password1 === req.body.password2) {
                    let hashedPass = await bcrypt.hash(req.body.password1, 8);

                    const sql = "UPDATE accounts SET password = ? WHERE username = ?";
                    con.query(sql, [hashedPass, username], async (error, results, fields) => {
                        console.log("Password changed!");
                        res.redirect('home');
                        /*
                        res.render('homepage', {
                            warning: "Password is changed",
                            username: req.session.username
                        });
                        */
                        
                    });
                } else {
                    res.render('homepage', {
                        warning: "Passwords don't match.",
                        username: req.session.username
                    });
                }
                

            } else {
                res.render('homepage', {
                    warning: "Password is not correct",
                    username: req.session.username
                });
            }
        });
    } else {
        res.render('login_register', {
            warning: "You have to login first!"
        });
    }
     
});

app.get('/home', (req, res) => {
    getResults(req)

	if (req.session.loggedin) {
        
        res.render('homepage', {
            username: req.session.username
        });
        //res.send('Welcome back, ' + request.session.username + '!');
	} else {
		res.render('login_register', {
            warning: "You have to login first!"
        });
    }
    
    //response.end();
    
});





app.get('/results', (req, res) => {
    //console.log(user+"  "+userID)
    if (req.session.loggedin) {
        const username = req.session.username;

        let sql = 'SELECT * FROM accounts WHERE username = ?';
        (async () => {
            try {
                const result2 = await query(sql, [username]);
                let userID = result2[0].id;
                sql = 'SELECT * FROM results LEFT JOIN locations ON results.location_id=locations.location_id WHERE account_id=('+userID+');'
                const tulos = await query(sql, [userID]);
                res.send(tulos);
                console.log("USERNAME:   ", req.session.username);
            } catch (err) {
                console.log("Getting results was not successfull! " + err);
                res.send("Getting results was not successfull! " + err);
            }
        })()
    }

});



//----------------------------------------------------------------

//Joonaksen tekemät lisäykset ja muutokset alkaa:
/**
 * Old path for the map from testing only its functionality, obsolete in finished app.
 */
/*
app.get("/kartta", function (req, res){
    res.sendFile(path.join(__dirname+'/views/kartta.html'));
})
 */

/**
 * Connection to collect location and all other data for the frisbeegolf courses to map.js
 */
app.get('/nouda', function (req, res) {
    let area = url.parse(req.url, true).query;
    //console.log("map.js ratojen haku: "+req.url);
    let sql;
    if (area.area!=='kaikki'){
        sql="SELECT * FROM Locations WHERE location_area = ?";
    } else {
        sql="SELECT * FROM Locations";
    }

    (async () => {
        try {
            const rows = await query(sql,[area.area]);
            const string = JSON.stringify(rows);
            //console.log("Tietokannasta raakadata:");
            //console.log(rows);
            const alteredResult = '{"numOfRows":'+rows.length+',"rows":'+string+'}';
            //console.log("Tietokannasta muunneltu data: "+alteredResult);
            res.set('Access-Control-Allow-Origin', '*'); //Ehkä tietoturvariski jos arvona *
            res.send(alteredResult);

        }
        catch (err) {
            console.log("Database error!"+ err);
        }
        finally {
            //conn.end();
        }
    })()
})

/**
 * Connection to pass the current username and id to the map.js
 */
app.get("/user/username", function (req, res){
    if (req.session.loggedin) {
        const username = req.session.username;
        const sql = 'SELECT * FROM accounts WHERE username = ?';
        con.query(sql, [username], async (error, results, fields) => {
            const string={id: results[0].id, user: results[0].username};
            //console.log(string);
            res.send(string);
        });
    } else {
        const string={id: null, user: null};
        res.send(string);
    }

})

/**
 * Post method to get all the player results to the database from the map.js
 */
app.post("/plays/trackresult", urlencodedParser, function (req,res){
    //console.log("body: %j", req.body);
    const jsonObj = req.body;
    //console.log(jsonObj[0].trackID+' '+jsonObj[0].userID+' '+jsonObj[1].Throws);
    let values=[];
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth()+1;
    const year = date.getFullYear();
    const today = year+'-'+month+'-'+day;

    const trackIDE = jsonObj[0].trackID.toString();
    const userIDE = jsonObj[0].userID.toString();

        values=[[null], [trackIDE], [userIDE], [today]];

    for(let i=1; i<jsonObj.length; i++){
        if (jsonObj[i].Throws===''&&jsonObj[i].PAR!==''){
            values.push([0],[jsonObj[i].PAR]);
        } else if (jsonObj[i].PAR===''&&jsonObj[i].Throws!==''){
            values.push([jsonObj[i].Throws],[0]);
        } else if (jsonObj[i].Throws===''&&jsonObj[i].PAR===''){
            values.push([0],[0]);
        } else {
            values.push([jsonObj[i].Throws], [jsonObj[i].PAR]);
        }
    }

    for(let i=jsonObj.length; i<38-jsonObj.length; i++){
        values.push([0]);
    }

    //console.log(values);

    const sqlquery = "INSERT INTO results VALUES (?)";
    (async () => {
        try {
            const result = await query(sqlquery, [values]);
            res.send("Tulosten tallennus onnistui!");
        } catch (err) {
            console.log("Insertion into some (2) table was unsuccessful! " + err);
            res.send("Tallentaminen epäonnistui! Ota yhteys sivuston ylläpitoon");
        }
    })()

})
//Joonaksen tekemät lisäykset päättyy.



function getResults(req){
    console.log("user: ", req.session.username);
}

app.listen(80);
