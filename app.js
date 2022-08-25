const express = require('express');
const app = express(); // Create an app from the express function
const path = require('path');
const exphbs = require('express-handlebars');

app.use(express.static(path.join(__dirname, 'public'))); // allows using static files in the piblic directory

app.engine('handlebars', exphbs({defaultLayout: 'home'}));
app.set('view engine', 'handlebars');

app.get('/', (req, res)=> {
    res.render('home/index');
});

app.get('/about', (req, res)=> {
    res.render('home/about');
});

app.get('/login', (req, res)=> {
    res.render('home/login');
});

app.get('/register', (req, res)=> {
    res.render('home/register');
});


app.listen(4500, ()=> {
    console.log(`Listening on port 4500`);
});