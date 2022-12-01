const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const Comment = require('../../models/Comment');
const User = require('../../models/User');
const bcrypt = require('bcryptjs')
const passport = require('passport');
const { disconnect } = require('mongoose');
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

router.get('/my-account/posts', userAuthenticated, (req, res)=> {
    Post.find({user: req.user.id})
    .populate('category')
    .then(posts => {
        res.render('home/my-account/posts', {posts: posts});
    }); 
});

router.get('/my-account/comments', userAuthenticated, (req, res)=> {
    Comment.find({user: req.user.id}).populate('user')
    .then(comments => {
        res.render('home/my-account/comments', {comments: comments});
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
        successRedirect: '/admin',
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