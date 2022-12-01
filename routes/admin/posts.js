const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const User = require('../../models/User');
const {isEmpty, uploadDir} = require('../../helpers/upload-helper');
const fs = require('fs');
//const path = require('path');
const { userAuthenticated } = require('../../helpers/authentication');
const { adminAuthenticated } = require('../../helpers/admin-authentication');

router.all('/*', userAuthenticated, (req, res, next)=> {
    req.app.locals.layout = 'admin';
    next();
}); 

router.get('/', adminAuthenticated, (req, res) => {
    Post.find().populate('category').populate('user').then(posts => {
        res.render('admin/posts', {posts: posts});
    }); 
});

router.get('/my-posts', (req, res) => {
    Post.find({user: req.user.id})
    .populate('category')
    .then(posts => {
        res.render('admin/posts/my-posts', {posts: posts});
    }); 
});

router.get('/create', (req, res) => {
    Category.find({}).then(categories => {
        res.render('admin/posts/create', {categories: categories})
    })
});

router.post('/create', (req, res) => {
    let errors = [];

    if(!req.body.title) {
        errors.push({message: 'Please add a title.'});
    }
    if(!req.body.body) {
        errors.push({message: 'Please add a text.'});
    }

    if (errors.length > 0) {
        res.render('admin/posts/create', {
            errors: errors
        })
    } else {
        let filename = '1661485874214-66412784_2389658641291513_5607738796563291225_n.jpg';

        if(req.files != null) {
            let file = req.files.file;
            filename = Date.now() + '-' + file.name; 
        
            const uploadPath = __dirname + "/../../public/uploads/";
            file.mv(uploadPath + filename, (err) => {
                 if(err) {
                    console.log(`There was an error: ${err}`) 
                 }
            });
        }

        let allowComments = true;
        
        if(req.body.allowComments) {
            allowComments = true;
        } else {
            allowComments = false;
        }

        User.findOne({_id: req.user.id}).then(loggedUser => {
            const newPost = new Post({
                user: req.user.id,
                title: req.body.title,
                status: req.body.status,
                allowComments: allowComments,
                body: req.body.body,
                file: filename,
                category: req.body.category
            });
            loggedUser.posts.push(newPost);
            loggedUser.save().then(savedUser => {
                newPost.save().then(savedPost => {
                    req.flash('success_message', `Post "${savedPost.title}" was created successfully`);
                    res.redirect('/admin/posts');
                }).catch(error => {
                    console.log(error, "could not save post");
                });
            })
        })
    }
});

router.get('/edit/:id', (req, res) => {
    Post.findOne({_id: req.params.id}).then(post => {
        Category.find({}).then(categories => {
            res.render('admin/posts/edit', {post: post, categories: categories})
        });
    }); 
});

router.put('/edit/:id', (req, res) => {
    Post.findOne({_id: req.params.id}).then(post => {
        if(req.body.allowComments) {
            allowComments = true;
        } else {
            allowComments = false;
        }

        post.user = req.user.id;
        post.title = req.body.title;
        post.status = req.body.status;
        post.allowComments = allowComments;
        post.body = req.body.body;
        post.category = req.body.category;

        if(req.files != null) {
            let file = req.files.file;
            filename = Date.now() + '-' + file.name; 
            post.file = filename;
        
            const uploadPath = __dirname + "/../../public/uploads/";
            file.mv(uploadPath + filename, (err) => {
                 if(err) {
                    console.log(`There was an error: ${err}`) 
                 }
            });
        }

        post.save().then(updatedPost => {

            req.flash('success_message', `Post ${updatedPost.title} was successfully updated`);
            res.redirect('/admin/posts/my-posts');
        }).catch(error => {
            console.log("could not save post");
        });
    }); 
});

router.delete('/:id', (req, res) => {
    Post.findOne({_id: req.params.id})
    .populate('comments')
    .then(post => {
        fs.unlink(uploadDir + post.file, (err)=> {
            if(!post.comments.length < 1) {
                post.comments.forEach(comment => {
                    comment.remove();
                })
            }
            post.remove().then(postRemoved => {
                req.flash('success_message', `Post "${post.title}" was successfully deleted`);
                res.redirect('/admin/posts/my-posts');
            });
        }); 
    });
});

module.exports = router;