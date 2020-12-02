const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const cons = require('consolidate');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'rootPass',
    database: 'nodelogin'
});

con.connect( err => {
    err?console.log(err):console.log("Connected to database!");
})


const app = express();
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
    res.render('login_register');
 });

 app.get('/home', (req, res) => {
     //res.render('test2');
     
	if (req.session.loggedin) {
        res.render('test2', {
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


app.listen(80);
