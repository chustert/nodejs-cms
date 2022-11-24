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
const {select, generateDate} = require('./helpers/handlebars-helpers');
app.engine('handlebars', exphbs({handlebars: allowInsecurePrototypeAccess(Handlebars), defaultLayout: 'home', helpers: {select: select, generateDate: generateDate}}));
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
const admin = require('./routes/admin/index');
const posts = require('./routes/admin/posts');
const categories = require('./routes/admin/categories');
const comments = require('./routes/admin/comments');
const { read } = require('fs');

// Use Routes
app.use('/', home);
app.use('/admin', admin);
app.use('/admin/posts', posts);
app.use('/admin/categories', categories);
app.use('/admin/comments', comments);


app.listen(4500, ()=> {
    console.log(`Listening on port 4500`);
});