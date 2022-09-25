const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fs = require('fs');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

require('dotenv').config();

let connStr = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
mongoose.connect(connStr, {user: process.env.DB_USER, pass: process.env.DB_PASS});

let sessionStore = MongoStore.create({
    mongoUrl: `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}`
});

var app = express();

app.use(session({
    secret: 'rsdosecret',
    resave: false,
    saveUninitialized: true,
    store: sessionStore
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(async (req, res, next) => {
    // if(true) {
    //  let user = (await User.find({ username: 'skrbnikrsdo' }))[0];
    //  if (user) user = user.toObject();
    //  req.session.user = user;
    // }

    try {
        if (req.path.includes('register') || req.path === "/User/createUser") {
            if (req.path === "/User/createUser") {
                if (req.query["adminCreate"] === "true" && (!req.session.user || !req.session.user.admin)) {
                    return res.redirect('/register?error="Ne uporabljat adminCreate zastavice kot ne admin ozirona ne pijavljen uporabnik."');
                }
                return require("./controllers/User.js")["createUser"](req, res, next);
            }
            return require('./controllers/Home').registerPage(req, res, next);
        }

        if (!req.session.user && !req.path.includes('login')) {
            return res.redirect('/login');
        }
        res.locals.user = req.session.user;

        next();
    } catch (err) {
        console.log("app use error");
        console.log(err);
        next(err);
    }

});


app.get('/', function (req, res, next) {
    if (req.session?.user?.admin) {
        require('./controllers/Home').manageUsers(req, res, next);
    } else {
        require('./controllers/Home').index(req, res, next);
    }
});

app.get('/register', function (req, res, next) {
    require('./controllers/Home').registerPage(req, res, next);
});

app.get('/login', function (req, res, next) {
    try {
        require('./controllers/Home').loginPage(req, res, next);
    } catch (err) {
        console.log("Login error");
        console.log(err);
        next(err);
    }
});

app.get('/logout', (req, res, next) => {
    try {
        //console.log("---LOGOUT GET");
        //console.log("---Checking REQ (session)", req.session);
        //console.log("---Checking RES (locals)", res.locals);

        //console.log("Redirecting to /login (now) (try location later)");
        res.redirect('/login');


        //console.log("L1 req.session", req.session)

        //console.log("Destroying session", req.session);
        req.session.destroy();

        //console.log("L2 res.session", res.session)

        //console.log("We are at login now (are we?)");
    } catch (err) {
        console.log("Logout error");
        console.log(err);
        next(err);
    }
})

app.get('/User/edituser', function (req, res, next) {
    try {
        require('./controllers/Home').editUser(req, res, next);
    } catch (err) {
        console.log("App get edit user error");
        console.log(err);
        next(err);
    }
});

app.get('/manageUsers', function (req, res, next) {
    try {
        //console.log("we at manage users get")

        if (req.session.user && req.session.user.admin) {
            require('./controllers/Home').manageUsers(req, res, next);
        } else {
            require('./controllers/Home').index(req, res, next);
        }
    } catch (err) {
        console.log("App manage users get error");
        console.log(err);
        next(err);
    }


});


app.all(`/:controller/:action`, async function (req, res, next) {
    let {controller, action} = req.params;

    if (controller === "Record" && action === "editFile") {
        if (req?.session?.user?.numRecordsAssigned) {
            try {
                req.session.user.numRecordsAssigned = (await User.findById(req.session.user._id)).numRecordsAssigned;
            } catch (e) {
                console.log(e, "err at updating num records assigned");
            }
        }
    }

    if (fs.existsSync(`./controllers/${controller}.js`)) {
        let controllerObj = require(`./controllers/${controller}.js`);
        if (!controllerObj[action]) {
            next(createError(404, `Action ${action} does not exist!`));
        } else {
            controllerObj[action](req, res, next);
        }
    }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    console.log("Creating error")
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    console.log("Error handler", err)
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page

    try {
        console.log("err status time ig", err.status)
        res.status(err.status || 500);
        // console.log("err render time ig")
        // res.render('error');
    } catch (err) {
        console.log("error handler error");
        console.log(err);
        next(err);
    }

});

app.listen(80); 