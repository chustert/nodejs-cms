const express = require('express');
const router = express.Router();
const faker = require('faker');
const Category = require('../../models/Category');

router.all('/*', (req, res, next)=> {
    req.app.locals.layout = 'admin';
    next();
}); 

router.get('/', (req, res)=> {
    Category.find({}).then(categories => {
        res.render('admin/categories', {categories: categories});  
    });
});

router.post('/create', (req, res)=> {
    const newCategory = new Category({
        name: req.body.name
    });

    newCategory.save().then(savedCategory => {
        res.redirect('/admin/categories');
    }).catch(error => {
        console.log(error, "Could not save category");
    });
});

router.get('/edit/:id', (req, res)=> {
    Category.findOne({_id: req.params.id}).then(category => {

        res.render('admin/categories/edit', {category: category});  
    });
});

router.put('/edit/:id', (req, res) => {
    Category.findOne({_id: req.params.id}).then(category => {

        category.name = req.body.name;

        category.save().then(updatedCategory => {

            req.flash('success_message', `The category's new name is "${updatedCategory.name}"`);
            res.redirect('/admin/categories');
        }).catch(error => {
            console.log("could not update category");
        });
    }); 
});

module.exports = router;