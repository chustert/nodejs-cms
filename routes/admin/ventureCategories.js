const express = require('express');
const router = express.Router();
const faker = require('faker');
const VentureCategory = require('../../models/VentureCategory');
const {userAuthenticated} = require('../../helpers/authentication');
const { adminAuthenticated } = require('../../helpers/admin-authentication');

router.all('/*', adminAuthenticated, (req, res, next)=> {
    req.app.locals.layout = 'admin';
    next();
}); 

router.get('/', (req, res)=> {
    VentureCategory.find({}).then(ventureCategories => {
        res.render('admin/venture-categories', {ventureCategories: ventureCategories});  
    });
});

router.post('/create', (req, res)=> {
    const newVentureCategory = new VentureCategory({
        name: req.body.name
    });

    newVentureCategory.save().then(savedVentureCategory => {
        res.redirect('/admin/venture-categories');
    }).catch(error => {
        console.log(error, "Could not save venture category");
    });
});

router.get('/edit/:id', (req, res)=> {
    VentureCategory.findOne({_id: req.params.id}).then(ventureCategory => {

        res.render('admin/venture-categories/edit', {ventureCategory: ventureCategory});  
    });
});

router.put('/edit/:id', (req, res) => {
    VentureCategory.findOne({_id: req.params.id}).then(ventureCategory => {

        ventureCategory.name = req.body.name;

        ventureCategory.save().then(updatedVentureCategory => {

            req.flash('success_message', `The venture category's new name is "${updatedVentureCategory.name}"`);
            res.redirect('/admin/venture-categories');
        }).catch(error => {
            console.log("could not update venture category");
        });
    }); 
});

router.delete('/:id', (req, res) => {
    VentureCategory.findOne({_id: req.params.id})
    .then(ventureCategory => {
        ventureCategory.remove();
        req.flash('success_message', `Venture category ${ventureCategory.name} was successfully deleted`);
        res.redirect('/admin/venture-categories');
    });
});

module.exports = router;