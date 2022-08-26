const express = require('express');
const app = express(); // Create an app from the express function
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const Handlebars = require('handlebars');
const methodOverride = require('method-override');

mongoose.connect('mongodb://localhost:27017/cms').then(db=> {
    console.log('MONGO connected');
}).catch(error=>{
    console.log(error);
});

// Using Static
app.use(express.static(path.join(__dirname, 'public'))); // allows using static files in the piblic directory

// set view engine
const {select} = require('./helpers/handlebars-helpers');

app.engine('handlebars', exphbs({handlebars: allowInsecurePrototypeAccess(Handlebars), defaultLayout: 'home', helpers: {select: select}}));
app.set('view engine', 'handlebars');

// Body-Parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Method Override
app.use(methodOverride('_method'));

// load routes
const home = require('./routes/home/index');
const admin = require('./routes/admin/index');
const posts = require('./routes/admin/posts');

// use routes
app.use('/', home);
app.use('/admin', admin);
app.use('/admin/posts', posts);


app.listen(4500, ()=> {
    console.log(`Listening on port 4500`);
});