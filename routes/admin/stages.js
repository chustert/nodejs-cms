const express = require('express');
const router = express.Router();
const faker = require('faker');
const Stage = require('../../models/Stage');
const {userAuthenticated} = require('../../helpers/authentication');
const { adminAuthenticated } = require('../../helpers/admin-authentication');

router.all('/*', adminAuthenticated, (req, res, next)=> {
    req.app.locals.layout = 'admin';
    next();
}); 

router.get('/', (req, res)=> {
    Stage.find({}).then(stages => {
        res.render('admin/stages', {stages: stages});  
    });
});

router.post('/create', (req, res)=> {
    const newStage = new Stage({
        name: req.body.name
    });

    newStage.save().then(savedStage => {
        res.redirect('/admin/stages');
    }).catch(error => {
        console.log(error, "Could not save stage");
    });
});

router.get('/edit/:id', (req, res)=> {
    Stage.findOne({_id: req.params.id}).then(stage => {

        res.render('admin/stages/edit', {stage: stage});  
    });
});

router.put('/edit/:id', (req, res) => {
    Stage.findOne({_id: req.params.id}).then(stage => {

        stage.name = req.body.name;

        stage.save().then(updatedStage => {

            req.flash('success_message', `The stage's new name is "${updatedStage.name}"`);
            res.redirect('/admin/stages');
        }).catch(error => {
            console.log("could not update stage");
        });
    }); 
});

router.delete('/:id', (req, res) => {
    Stage.findOne({_id: req.params.id})
    .then(stage => {
        stage.remove();
        req.flash('success_message', `Stage ${stage.name} was successfully deleted`);
        res.redirect('/admin/stages');
    });
});

module.exports = router;