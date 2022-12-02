const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const Comment = require('../../models/Comment');
const User = require('../../models/User');
const bcrypt = require('bcryptjs')
const passport = require('passport');
const { disconnect } = require('mongoose');
const {isEmpty, uploadDir} = require('../../helpers/upload-helper');
const fs = require('fs');
const LocalStrategy = require('passport-local').Strategy;
const {userAuthenticated} = require('../../helpers/authentication');


router.all('/*', (req, res, next)=> {
    req.app.locals.layout = 'home';
    next();
}); 

router.get('/', (req, res)=> {
    const perPage = 10;
    const page = req.query.page || 1;

    Post.find({})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .then(posts => {
            Post.count().then(postCount => {
                Category.find({}).then(categories=> {
                    res.render('home/index', {
                        posts: posts, 
                        categories: categories,
                        current: parseInt(page),
                        pages: Math.ceil(postCount / perPage)
                    });    
                });
            });
        });            
});

router.get('/about', (req, res)=> {
    res.render('home/about');
});

router.get('/my-account', userAuthenticated, (req, res)=> {
    res.render('home/my-account');
});

router.get('/my-account/profile', userAuthenticated, (req, res)=> {
    User.findById(req.user.id)
    .then(user => {
        res.render('home/my-account/profile', {user: user});
    }); 
});

router.get('/my-account/profile/edit', (req, res) => {
    User.findOne({_id: req.user.id}).then(user => {
        res.render('home/my-account/profile/edit', {user: user})
    });
}); 

router.put('/my-account/profile/edit', (req, res) => {
    User.findOne({_id: req.user.id}).then(user => {

        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        user.email = req.body.email;

        user.save().then(updatedUser => {

            // req.flash('success_message', `User ${updatedUser.email} was successfully updated`);
            res.redirect('/my-account/profile');
        }).catch(error => {
            console.log("could not save user");
        });
    }); 
});

router.get('/my-account/profile/password', (req, res) => {
    User.findOne({_id: req.user.id}).then(user => {
        res.render('home/my-account/profile/password', {user: user})
    });
}); 

router.put('/my-account/profile/password', (req, res) => {

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
        res.render('home/my-account/profile/password', {
            errors: errors
        })
    } else {

        User.findOne({_id: req.user.id}).then(user => {

            user.password = req.body.password;

            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(user.password, salt, (err, hash) => {

                    user.password = hash;
                    
                    user.save().then(updatedUser => {
                        req.flash('success_message', `Password of user ${updatedUser.email} was successfully updated`);
                        res.redirect('/my-account/profile');
                    }).catch(error => {
                        console.log(error, "could not save user password");
                    });
                })
            });
        }); 
    }
});

router.get('/my-account/posts', userAuthenticated, (req, res)=> {
    Post.find({user: req.user.id})
    .populate('category')
    .then(posts => {
        res.render('home/my-account/posts', {posts: posts});
    }); 
});

router.get('/my-account/posts/create', (req, res) => {
    Category.find({}).then(categories => {
        res.render('home/my-account/posts/create', {categories: categories})
    })
});

router.post('/my-account/posts/create', (req, res) => {
    let errors = [];

    if(!req.body.title) {
        errors.push({message: 'Please add a title.'});
    }
    if(!req.body.body) {
        errors.push({message: 'Please add a text.'});
    }

    if (errors.length > 0) {
        res.render('home/my-account/posts/create', {
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
                    res.redirect('/my-account/posts');
                }).catch(error => {
                    console.log(error, "could not save post");
                });
            })
        })
    }
});

router.get('/my-account/posts/edit/:id', (req, res) => {
    Post.findOne({_id: req.params.id}).then(post => {
        Category.find({}).then(categories => {
            res.render('home/my-account/posts/edit', {post: post, categories: categories})
        });
    }); 
});

router.put('/my-account/posts/edit/:id', (req, res) => {
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
            res.redirect('/my-account/posts');
        }).catch(error => {
            console.log("could not save post");
        });
    }); 
});

router.delete('/my-account/posts/:id', (req, res) => {
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
                res.redirect('/my-account/posts');
            });
        }); 
    });
});

router.get('/my-account/comments', userAuthenticated, (req, res)=> {
    Comment.find({user: req.user.id})
    .populate('user')
    .populate('post')
    .then(comments => {
        res.render('home/my-account/comments', {comments: comments});
    })
});

router.post('/my-account/comments', (req, res) => {
    Post.findOne({_id: req.body.id})
    .then(post => {
        const newComment = new Comment({
            user: req.user.id,
            body: req.body.body,
            post: req.body.id
        });
        post.comments.push(newComment);
        post.save().then(savedPost => {
            newComment.save().then(savedComment => {
                req.flash('success_message', `Comment successfully submitted and is currently being reviewed.`);
                res.redirect(`/post/${post.slug}`);
            })
        });
    })
});










router.get('/login', (req, res)=> {
    res.render('home/login');
});

// APP LOGIN

passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
    User.findOne({ email: email }).then(user => {
        if(!user) return done(null, false, {message: 'No user found.'});

        bcrypt.compare(password, user.password, (err, matched) => {
            if(err) return err;
            if(matched) {
                return done(null, user)
            } else {
                return done(null, false, { message: 'Incorrect password.' });
            }
        });
    })
}));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

router.post('/login', (req, res, next)=> {
    passport.authenticate('local', {
        successRedirect: '/my-account',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
})

router.get('/register', (req, res)=> {
    res.render('home/register');
});

router.post('/register', (req, res)=> {

    let errors = [];

    if(!req.body.firstName) {
        errors.push({message: 'Please add your first name.'});
    }
    if(!req.body.lastName) {
        errors.push({message: 'Please add your last name.'});
    }
    if(!req.body.email) {
        errors.push({message: 'Please add your email address.'});
    }
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
        res.render('home/register', {
            errors: errors,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email
        })
    } else {

        User.findOne({email: req.body.email}).then(user => {
            if(!user) {
                const newUser = new User({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    password: req.body.password
                });
        
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
        
                        newUser.password = hash;
                        
                        newUser.save().then(savedUser => {
                            req.flash('success_message', 'You are now registered. Please log in.');
                            res.redirect('/login');
                        }).catch(error => {
                            console.log(error, "could not save user");
                        });
                    })
                });
            } else {
                req.flash('error_message', 'Email exists already. Please log in.');
                res.redirect('/login');
            }
        })
    }
});

router.get('/post/:slug', (req, res) => {
    Post.findOne({slug: req.params.slug})
    .populate({path: 'comments', match: {approveComment: true}, populate: {path: 'user', model: 'users'}})
    .populate('user')
    .then(post => {
        Category.find({}).then(categories => {
            res.render('home/post', {post: post, categories: categories});
        });
        
    }); 
});

module.exports = router;