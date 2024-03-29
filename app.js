const https = require("https");
const fs = require("fs");
const express = require('express');
const app = express(); // Create an app from the express function
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const Handlebars = require('handlebars');
const methodOverride = require('method-override');
const upload = require('express-fileupload');
const session = require('express-session');
const flash = require('connect-flash');
const {mongoDbUrl} = require('./config/database');
const passport = require('passport');

mongoose.connect(mongoDbUrl).then(db=> {
    console.log('MONGO connected');
}).catch(error=>{
    console.log(error);
});

// Using Static
app.use(express.static(path.join(__dirname, 'public'))); // allows using static files in the piblic directory

// set view engine
const {select, generateDate, paginate, notEqual} = require('./helpers/handlebars-helpers');
const {userRoleAuthenticated} = require('./helpers/role-authentication');
app.engine('handlebars', exphbs({handlebars: allowInsecurePrototypeAccess(Handlebars), defaultLayout: 'home', helpers: {select: select, generateDate: generateDate, paginate: paginate, notEqual: notEqual, userRoleAuthenticated: userRoleAuthenticated}}));

app.set('view engine', 'handlebars');

// File Upload Middleware
app.use(upload());

// Body-Parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Method Override
app.use(methodOverride('_method'));

// Sessions
app.use(session({
    secret: 'chris123',
    resave: true,
    saveUninitialized: true
}));

app.use(flash());

// PASSPORT
app.use(passport.initialize());
app.use(passport.session());

// Local variables using Middleware
app.use((req, res, next)=> {
    res.locals.user = req.user || null;
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.error = req.flash('error');
    next();
});

// Load Routes
const home = require('./routes/home/index');
const myAccount = require('./routes/home/my-account');
const admin = require('./routes/admin/index');
const posts = require('./routes/admin/posts');
const categories = require('./routes/admin/categories');
const comments = require('./routes/admin/comments');
const users = require('./routes/admin/users');
const { read } = require('fs');

// Use Routes
app.use('/', home);
app.use('/my-account', myAccount);
app.use('/admin', admin);
app.use('/admin/posts', posts);
app.use('/admin/categories', categories);
app.use('/admin/comments', comments);
app.use('/admin/users', users);

// Creating object of key and certificate for SSL
const options = {
    key: fs.readFileSync("server.key"),
    cert: fs.readFileSync("server.cert"),
  };

// const port = process.env.PORT || 4500;
const port = process.env.PORT || 3000;

if(process.env.NODE_ENV === 'production') {
    app.listen(port, ()=> {
        console.log(`Listening on port ${port}`);
    });
} else {
    // Creating https server by passing options and app object
    https.createServer(options, app)
    .listen(port, () => {
    console.log(`Server started at port ${port}`);
    });
}