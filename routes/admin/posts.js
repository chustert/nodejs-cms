const express = require('express');
const router = express.Router();

router.all('/*', (req, res, next)=> {
    req.app.locals.layout = 'admin';
    next();
}); 

router.get('/', (req, res) => {
    res.send('IT WORKS!')
});

router.get('/create', (req, res) => {
    res.render('admin/posts/create')
});

router.post('/create', (req, res) => {
    console.log(req.body);
});

module.exports = router;