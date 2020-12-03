const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const cons = require('consolidate');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');
const util = require('util');
const cors = require('cors');


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

 app.post('/register', (req, res) => {

    
    const sql = 'SELECT * FROM accounts WHERE ip = ?';
    con.query(sql, [req.connection.remoteAddress], (error, results, fields) => {
        if(!results.length>0){


            //------------------------------------------------------------------------------------
            //------------------------------------------------------------------------------------
            //------------------------------------------------------------------------------------
            const username = req.body.username;
            const password = req.body.password;


            if(username&&password) {
            const sql = 'SELECT * FROM accounts WHERE username = ?';
            con.query(sql, [username], async (error, results, fields) => {
                if(results.length>0) {
                    res.render('login_register', {
                        warning: "Username already in use"
                    });
                } else {
                    let hashedPass = await bcrypt.hash(password, 8);
                    const sql = 'INSERT INTO accounts VALUES (?,?,?,?)';
                    con.query(sql, [null,req.connection.remoteAddress,username,hashedPass], (error, results, fields) => {
                        req.session.loggedin = true;
                        req.session.username = username;
                        res.redirect('/home');
                    });
                }
            });
            //------------------------------------------------------------------------------------
            //------------------------------------------------------------------------------------
            //------------------------------------------------------------------------------------


        }
        } else {
            res.render('login_register', {
                warning: "You have already registered from that ip!"
            });
        }

    });
    

 });

 

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
                        res.render('homepage', {
                            warning: "Password is changed",
                            username: req.session.username
                        });
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

app.get('/results', function (req, res) {

    const sql = 'SELECT * FROM results';
    con.query(sql, async (error, results, fields) => {
        res.send(results);
    });

});

//----------------------------------------------------------------

//Joonaksen tekemät lisäykset ja muutokset alkaa:
//Kartta-sivun polku ja linkkaus sivustoon
app.get("/kartta", function (req, res){
    res.sendFile(path.join(__dirname+'/views/kartta.html'));
})

//Tietokannasta frisbeegolfratojen kysely
app.get('/nouda', function (req, res) {
    let area = url.parse(req.url, true).query;
    let alteredResult;
    let string;
    let sql;
    if (area.area!=='kaikki'){
        sql="SELECT * FROM Locations WHERE location_area = ?";
    } else {
        sql="SELECT * FROM Locations";
    }

    (async () => {
        try {
            const rows = await query(sql,[area.area]);
            string = JSON.stringify(rows);
            alteredResult = '{"numOfRows":'+rows.length+',"rows":'+string+'}';
            //console.log(rows);
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
//Joonaksen tekemät lisäykset päättyy.

app.listen(80);
