const express = require('express');
const app = express(); // Create an app from the express function
const path = require('path');
const exphbs = require('express-handlebars');

app.use(express.static(path.join(__dirname, 'public'))); // allows using static files in the piblic directory

app.engine('handlebars', exphbs({defaultLayout: 'home'}));
app.set('view engine', 'handlebars');

// load routes
const main = require('./routes/home/main');

app.use('/', main);


app.listen(4500, ()=> {
    console.log(`Listening on port 4500`);
});