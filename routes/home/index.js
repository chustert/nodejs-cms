const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const Comment = require('../../models/Comment');
const Message = require('../../models/Message');
const PostLikes = require('../../models/PostLikes');
const User = require('../../models/User');
const bcrypt = require('bcryptjs')
const crypto = require("crypto");
const passport = require('passport');
const { disconnect } = require('mongoose');
const {isEmpty, uploadDir} = require('../../helpers/upload-helper');
const fs = require('fs');
const AWS = require('aws-sdk');
const LocalStrategy = require('passport-local').Strategy;
const {userAuthenticated} = require('../../helpers/authentication');
const Token = require('../../models/Token');
const sendEmail = require("../../helpers/email/sendEmail");
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const qs = require('qs');
const path = require('path');
const compress_images = require('compress-images');
const pngquant = require('pngquant-bin');
const gifsicle = require('gifsicle');

let clientURL = '';
// let protocol = '';

if(process.env.NODE_ENV === 'production') {
    clientURL = process.env.BASE_URL;
    // protocol = "https://";
} else {
    clientURL = process.env.CLIENT_URL_DEV;
    // protocol = "http://";
}

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    endpoint: new AWS.Endpoint('s3-ap-southeast-2.amazonaws.com') 
});

// const clientURL = process.env.BASE_URL || process.env.CLIENT_URL_DEV;

router.all('/*', (req, res, next)=> {
    req.app.locals.layout = 'home';
    next();
}); 



//************ HOME ************//
// router.get('/', (req, res)=> {
//     const perPage = 10;
//     const page = req.query.page || 1;
//     Post.find({})
//         .skip((perPage * page) - perPage)
//         .limit(perPage)
//         .populate('user')
//         .populate('category')
//         .then(posts => {
            
            

//             Post.count().then(postCount => {
//                 Category.find({}).then(categories=> {


//                     const imgUrls = [];


//                     for (let i = 0; i < posts.length; i++) {

//                         const params = {
//                             Bucket: process.env.S3_BUCKET_NAME,
//                             Key: posts[i].file
//                         };
        
//                         s3.getObject(params, (err, file) => {
//                             if (err) {
//                                 return console.log(err);        
//                             }
//                             let dataSrc = `data:${file.ContentType};base64,${Buffer.from(file.Body).toString('base64')}`;
//                             imgUrls.push(dataSrc);
//                         });        
                        
//                     }
//                     console.log(imgUrls);


//                             res.render('home/index', { 
//                                 posts: posts, 
//                                 categories: categories,
//                                 current: parseInt(page),
//                                 pages: Math.ceil(postCount / perPage),  
//                             });
//                 });
//             });
//         });            
// });

router.get('/', async (req, res) => {
    let featuredPost;
    try {
        featuredPost = await Post.findOne({ featured: true })
        .sort({ date: -1 })
        .populate('category')
        .populate('user');
    
        if (!featuredPost.file) {
            return console.log(`No file found for featured post ${featuredPost._id}`);
        }
    
        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: featuredPost.file
        };
    
        try {
            const file = await s3.getObject(params).promise();
            featuredPost.imgUrl = `data:${file.ContentType};base64,${Buffer.from(file.Body).toString('base64')}`;
        } catch (err) {
            console.log(err);
            featuredPost.imgUrl = null;
        }
    } catch (err) {
        console.log(err);
    }

    const postsPopular = await Post.find({})
    .sort({ comments: -1 })
    .limit(3)
    .populate('user')
    .populate('category');

    await Promise.all(
        postsPopular.map(async post => {
            if (!post.file) {
                return console.log(`No file found for post ${post._id}`);
            }
            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: post.file
            };
            try {
                const file = await s3.getObject(params).promise();
                post.imgUrl = `data:${file.ContentType};base64,${Buffer.from(file.Body).toString('base64')}`;
            } catch (err) {
                console.log(err);
                post.imgUrl = null;
            }
        })
    );

    const perPage = 10;
    const page = req.query.page || 1;
    
    const posts = await Post.find({})
        .sort({ date: -1 })
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .populate('user')
        .populate('category');

    const postCount = await Post.count();
    const categories = await Category.find({});

    await Promise.all(
        posts.map(async post => {
            if (!post.file) {
                return console.log(`No file found for post ${post._id}`);
            }
            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: post.file
            };
            try {
                const file = await s3.getObject(params).promise();
                post.imgUrl = `data:${file.ContentType};base64,${Buffer.from(file.Body).toString('base64')}`;
            } catch (err) {
                console.log(err);
                post.imgUrl = null;
            }
        })
    );

    res.render('home/index', { 
        posts: posts, 
        featuredPost: featuredPost,
        postsPopular: postsPopular,
        categories: categories,
        current: parseInt(page),
        pages: Math.ceil(postCount / perPage),  
    });
});




//************ SINGLE POST ************//
// router.get('/post/:slug', (req, res) => {
//     Post.findOne({slug: req.params.slug})
//     .populate({path: 'comments', match: {approveComment: true}, populate: {path: 'user', model: 'users'}})
//     .populate('user')
//     .then(post => {
//         Category.find({}).then(categories => {

//             if (!post.file) {
//                 console.log("No file found for post " + post._id);
//                 res.render('home/post', { post: post, categories: categories, imgUrl: null });
//                 return;
//             }

//             AWS.config.update({
//                 region: 'ap-southeast-2'
//              });

//             const params = {
//                 Bucket: process.env.S3_BUCKET_NAME,
//                 Key: post.file
//             };

//             s3.getObject(params, (err, file) => {
//                 if (err) {
//                     return console.log(err);        
//                 }
//                 var dataSrc = `data:${file.ContentType};base64,${Buffer.from(file.Body).toString('base64')}`;
//                 res.render('home/post', { post: post, categories: categories, imgUrl: dataSrc });
//             });

//         });
//     }); 
// });
router.get('/post/:slug', async (req, res) => {
    const post = await Post.findOne({slug: req.params.slug})
    .populate({path: 'comments', match: {approveComment: true}, populate: {path: 'user', model: 'users'}})
    .populate('user');

    let postLikes = [];
    if (req.user) {
      // Query the postLikes collection to find the likes associated with the current user and post
      postLikes = await PostLikes.find({user: req.user.id, post: post._id});
    }

    const categories = await Category.find({});

    AWS.config.update({
        region: 'ap-southeast-2'
     });

    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: post.file
    };

    try {
        const file = await s3.getObject(params).promise();
        var dataSrc = `data:${file.ContentType};base64,${Buffer.from(file.Body).toString('base64')}`;
        res.render('home/post', { post: post, categories: categories, imgUrl: dataSrc, postLikes: postLikes });
    } catch (err) {
        console.log(`Error: ${err}`);
        res.render('home/post', { post: post, categories: categories, imgUrl: null, postLikes: postLikes });
    }

});

router.put('/post/:slug/like', userAuthenticated, async (req, res) => {
    try {
        const post = await Post.findOne({slug: req.params.slug});
        const postId = post._id;
        const user = await User.findOne({_id: req.user.id})

        const existingLike = await PostLikes.findOne({ user: user._id, post: post._id });

        console.log(`Existing Like: ${existingLike}`);

        if (existingLike) {
            await existingLike.remove();
            await Post.findOneAndUpdate({_id: postId}, { $inc: { likes: -1 } });
            await User.findOneAndUpdate({_id: user._id}, { $pull: { likes: existingLike._id } });
            res.json({ message: "Like removed" });
        } else {
            const newPostLike = new PostLikes({ 
                user: user._id, 
                post: post._id 
            });
            
            await newPostLike.save();
            await User.findOneAndUpdate({_id: user._id}, { $push: { likes: newPostLike._id } });
            await Post.findOneAndUpdate({_id: postId}, {$inc: {likes: 1}});
            res.json({ success: true });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
})


//************ CATEGORIES ************//
// router.get('/category/:id', (req, res)=> {
//     const perPage = 10;
//     const page = req.query.page || 1;

//     Category.findOne({_id: req.params.id})
//     .then(category => {
//         Post.find({category: category})
//         .skip((perPage * page) - perPage)
//         .limit(perPage)
//         .populate('user')
//         .populate('category')
//         .then(posts => {
//             Post.count()
//             .then(postCount => {
//                 Category.find({}).then(categories=> {
//                     res.render('home/category', {
//                         posts: posts, 
//                         category: category,
//                         categories: categories,
//                         current: parseInt(page),
//                         pages: Math.ceil(postCount / perPage)
//                     });    
//                 });
//             });
//         });    
//     })        
// });


router.get('/category/:id', async (req, res) => {
    const perPage = 10;
    const page = req.query.page || 1;

    try {
        const category = await Category.findOne({_id: req.params.id});
        const posts = await Post.find({category: category})
            .skip((perPage * page) - perPage)
            .limit(perPage)
            .populate('user')
            .populate('category');
        const postCount = await Post.count();
        const categories = await Category.find({});

        await Promise.all(
            posts.map(async post => {
                if (!post.file) {
                    return console.log(`No file found for post ${post._id}`);
                }
                const params = {
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: post.file
                };
                try {
                    const file = await s3.getObject(params).promise();
                    post.imgUrl = `data:${file.ContentType};base64,${Buffer.from(file.Body).toString('base64')}`;
                } catch (err) {
                    console.log(err);
                    post.imgUrl = null;
                }
            })
        )

        res.render('home/category', {
            posts: posts,
            category: category,
            categories: categories,
            current: parseInt(page),
            pages: Math.ceil(postCount / perPage)
        });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});



//************ ABOUT ************//
router.get('/about', (req, res)=> {
    res.render('home/about');
});



//************ ACCOUNTS ************//
// Profile
router.get('/account/profile/:id', userAuthenticated, (req, res)=> {
    User.findById(req.params.id)
    .then(user => {
        res.render('home/account/profile', {user: user});
    }); 
});
// Posts
router.get('/account/profile/:id/posts', userAuthenticated, (req, res)=> {
    User.findById(req.params.id)
    .then(user => {
        Post.find({user: req.params.id})
        .populate('category')
        .then(posts => {
            res.render('home/account/posts', {posts: posts, user: user});
        });
    }); 
     
});









//************ AUTHENTICATION ************//

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

router.get('/forgot-password', (req, res)=> {
    res.render('home/forgot-password');
});

router.post('/forgot-password', (req, res) => {
    let errors = [];

    if(!req.body.email) {
        errors.push({message: 'Please add your email address.'});
    }

    if (errors.length > 0) {
        res.render('home/forgot-password', {
            errors: errors,
            email: req.body.email
        })
    } else {
        User.findOne({email: req.body.email}).then(user => {
            if(!user) {
                req.flash('error_message', 'Email does not exists. Please register or try another email address.');
                res.redirect('/forgot-password');
            } else {
                // If the email address is valid, generate a reset token and send token/instrcutions to the user via email. 
                // The reset token should be a unique, cryptographically secure string that can be used to 
                // verify the user's identity when they request to reset their password.

                // Check if there is an existing token that has been created for this user. 
                // If one exists, we delete the token.
                Token.findOne({ userId: user._id }).then(token => {
                    if (token) {
                        token.remove();
                    }

                    let resetToken = crypto.randomBytes(32).toString("hex");
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(resetToken, salt, (err, hash) => {
                            const newToken = new Token({
                                userId: user._id,
                                token: hash,
                                createdAt: Date.now(),
                            }).save();
                            let link = new URL(`${clientURL}/reset-password?token=${resetToken}&id=${user._id}`);
                            sendEmail(user.email, "Password Reset Request TEST", {name: user.name, link: link}, "./template/requestResetPasswordEmail.handlebars");
                            // return link;
                            req.flash('success_message', `We sent you an email with a link to reset your password. Don't forget to check your spam folder!`);
                            res.redirect('/forgot-password');
                        });
                    });
                })
            }
        })
    }

})

router.get('/reset-password', (req, res)=> {
    res.render('home/reset-password');
});

router.post('/reset-password', (req, res) => {
    Token.findOne({ userId: req.body.id }).then(token => {
        if(!token) {
            req.flash('error_message', 'Invalid or expired password reset token. Try again.');
            return res.redirect('/forgot-password');
        }
        
        console.log(token.token);
        console.log(req.body.token);
        bcrypt.compare(req.body.token, token.token, (err, match) => {
            if (!match) {
                req.flash('error_message', 'Reset token does not match. Try again.');
                return res.redirect('/forgot-password');
            }
        });

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
            req.flash('error_message', errors.map(error => error.message).join(' '));
            res.redirect(302, `/reset-password?token=${req.body.token}&id=${req.body.id}`);
        } else {
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(req.body.password, salt, (err, hash) => {
                    User.updateOne(
                        {_id: req.body.id},
                        {$set: {password: hash}},
                        {new: true}
                        ).then(() => {
                            User.findOne({_id: req.body.id}).then(user => {
                                let contactLink = new URL(`${clientURL}/contact`);
                                sendEmail(user.email, "Password Reset Confirmation TEST", {name: user.name, contactLink: contactLink}, "./template/confirmResetPasswordEmail.handlebars");
                                req.flash('success_message', `User ${user.email} was successfully updated. Please log in.`);
                                token.remove();
                                res.redirect('/login');
                            });
                        });
                });
            });
        }
    })
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

module.exports = router;