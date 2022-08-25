const express = require('express');
const app = express(); // Create an app from the express function

app.listen(4500, ()=> {
    console.log(`Listening on port 4500`);
});