const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const bcrypt = require('bcryptjs')
const {isEmpty, uploadDir} = require('../../helpers/upload-helper');
const fs = require('fs');
//const path = require('path');
const {userAuthenticated} = require('../../helpers/authentication');

router.all('/*', (req, res, next)=> {
    req.app.locals.layout = 'admin';
    next();
}); 

router.get('/', (req, res) => {
    User.find().then(users => {
        res.render('admin/users', {users: users});
    }); 
});

router.get('/me', (req, res) => {
    User.findOne({user: req.user.id}).then(user => {
        res.render('admin/users/me', {user: user});
    }); 
});

router.get('/edit/:id', (req, res) => {
    User.findOne({_id: req.params.id}).then(user => {
            res.render('admin/users/edit', {user: user})
        });
    }); 

router.put('/edit/:id', (req, res) => {
    User.findOne({_id: req.params.id}).then(user => {

        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        user.email = req.body.email;

        user.save().then(updatedUser => {

            req.flash('success_message', `User ${updatedUser.email} was successfully updated`);
            res.redirect('/admin/users');
        }).catch(error => {
            console.log("could not save user");
        });
    }); 
});

router.get('/password/:id', (req, res) => {
    User.findOne({_id: req.params.id}).then(user => {
            res.render('admin/users/password', {user: user})
        });
    }); 

router.put('/password/:id', (req, res) => {

    let errors = [];

    if(!req.body.password) {
        errors.push({message: 'Please add a password.'});
    }
    if(!req.body.passwordConfirm) {
        errors.push({message: 'The password confirmation field cannot be blank.'});
    }
    if(req.body.password !== req.body.passwordConfirm) {
        errors.push({message: "Password fields don't match."});
    }

    if (errors.length > 0) {
        res.render('admin/users/password', {
            errors: errors
        })
    } else {

        User.findOne({_id: req.params.id}).then(user => {

            user.password = req.body.password;

            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(user.password, salt, (err, hash) => {

                    user.password = hash;
                    
                    user.save().then(updatedUser => {
                        req.flash('success_message', `Password of user ${updatedUser.email} was successfully updated`);
                        res.redirect('/admin/users');
                    }).catch(error => {
                        console.log(error, "could not save user password");
                    });
                })
            });
        }); 
    }
});

// router.delete('/:id', (req, res) => {
//     User.findOne({_id: req.params.id})
//     .populate('posts')
//     .then(user => {




//         // also delete all posts and comments from this user
//         Post.findOne({_id: req.params.id})
//         .populate('comments')
//         .then(post => {
//             fs.unlink(uploadDir + post.file, (err)=> {
//                 if(!post.comments.length < 1) {
//                     post.comments.forEach(comment => {
//                         comment.remove();
//                     })
//                 }
//                 post.remove().then(postRemoved => {
//                     req.flash('success_message', `Post "${post.title}" was successfully deleted`);
//                     res.redirect('/admin/posts/my-posts');
//                 });
//             }); 
//         });
        




//         fs.unlink(uploadDir + post.file, (err)=> {
//             if(!post.comments.length < 1) {
//                 post.comments.forEach(comment => {
//                     comment.remove();
//                 })
//             }
//             post.remove().then(postRemoved => {
//                 req.flash('success_message', `Post "${post.title}" was successfully deleted`);
//                 res.redirect('/admin/posts/my-posts');
//             });
//         }); 
//     });
// });

module.exports = router;