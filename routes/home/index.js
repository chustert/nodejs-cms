const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const Comment = require('../../models/Comment');
const Message = require('../../models/Message');
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
    const perPage = 10;
    const page = req.query.page || 1;
    const posts = await Post.find({})
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

    // Could also use a for of loop, but it's not as efficient
    // for (const post of posts) {
    //     if (!post.file) {
    //         console.log(`No file found for post ${post._id}`);
    //         continue;
    //     }
    //     const params = {
    //         Bucket: process.env.S3_BUCKET_NAME,
    //         Key: post.file
    //     };
    //     try {
    //         const file = await s3.getObject(params).promise();
    //         post.imgUrl = `data:${file.ContentType};base64,${Buffer.from(file.Body).toString('base64')}`;
    //     } catch (err) {
    //         console.log(err);
    //         post.imgUrl = null;
    //     }
    // }

    res.render('home/index', { 
        posts: posts, 
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
        res.render('home/post', { post: post, categories: categories, imgUrl: dataSrc });
    } catch (err) {
        console.log(`Error: ${err}`);
        res.render('home/post', { post: post, categories: categories, imgUrl: null });
    }

});


//************ CATEGORIES ************//
router.get('/category/:id', (req, res)=> {
    const perPage = 10;
    const page = req.query.page || 1;

    Category.findOne({_id: req.params.id})
    .then(category => {
        Post.find({category: category})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .populate('user')
        .populate('category')
        .then(posts => {
            Post.count()
            .then(postCount => {
                Category.find({}).then(categories=> {
                    res.render('home/category', {
                        posts: posts, 
                        category: category,
                        categories: categories,
                        current: parseInt(page),
                        pages: Math.ceil(postCount / perPage)
                    });    
                });
            });
        });    
    })        
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


//************ MY ACCOUNT ************//
router.get('/my-account', userAuthenticated, (req, res)=> {
    const promises = [
        Post.count({user: req.user.id}).exec(),
        Comment.count({user: req.user.id}).exec()
    ];

    Promise.all(promises).then(([postCount, commentCount]) => {
        res.render('home/my-account', {postCount: postCount, commentCount: commentCount});       
    })
});

router.get('/my-account/profile', userAuthenticated, (req, res)=> {
    User.findById(req.user.id)
    .then(user => {
        res.render('home/my-account/profile', {user: user});
    }); 
});

router.get('/my-account/profile/edit', userAuthenticated, (req, res) => {
    User.findOne({_id: req.user.id}).then(user => {
        res.render('home/my-account/profile/edit', {user: user})
    });
}); 

router.put('/my-account/profile/edit', userAuthenticated, (req, res) => {
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

router.get('/my-account/profile/password', userAuthenticated, (req, res) => {
    User.findOne({_id: req.user.id}).then(user => {
        res.render('home/my-account/profile/password', {user: user})
    });
}); 

router.put('/my-account/profile/password', userAuthenticated, (req, res) => {

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

router.get('/my-account/posts', userAuthenticated, async (req, res)=> {
    const posts = await Post.find({})
        .populate('category');

    // const categories = await Category.find({});

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
    
    res.render('home/my-account/posts', { 
        posts: posts, 
    });
    
    
    
    // Post.find({user: req.user.id})
    // .populate('category')
    // .then(posts => {
    //     res.render('home/my-account/posts', {posts: posts});
    // }); 
});

router.get('/my-account/posts/create', userAuthenticated, (req, res) => {
    Category.find({}).then(categories => {
        res.render('home/my-account/posts/create', {categories: categories})
    })
});

router.post('/my-account/posts/create', userAuthenticated, async (req, res) => {
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
        let fileName = '';

        async function uploadFile() {
            
            if(req.files != null) {
                let file = req.files.file;
                fileName = Date.now() + '-' + file.name; 

                const uploadPath = path.join(__dirname, "..", "..", "public", "uploads");



                await file.mv(uploadPath + '/' + fileName, (err) => {
                    if(err) {
                        console.log(`There was an error: ${err}`) 
                    }
                });




                // INPUT_path = uploadPath + "/*.{jpg,JPG,jpeg,JPEG,png,svg,gif}";
                INPUT_path = uploadPath + '/' + fileName;
                OUTPUT_path = uploadPath + '/optimized/';

                const optimizedImage = await compress_images(INPUT_path, OUTPUT_path, { compress_force: false, statistic: true, autoupdate: true }, false,
                                { jpg: { engine: "mozjpeg", command: ["-quality", "60"] } },
                                { png: { engine: "pngquant", command: ["--quality=20-50", "-o"] } },
                                { svg: { engine: "svgo", command: "--multipass" } },
                                { gif: { engine: "gifsicle", command: ["--colors", "64", "--use-col=web"] } },
                                async function (error, completed, statistic) {
                                    console.log("-------------");
                                    console.log(`ERROR: ${error}`);
                                    console.log(`COMPLETED: ${completed}`);
                                    console.log(`STATISTIC: ${statistic}`);
                                    console.log("-------------");

                                    try {
                                        const fileContent = await fs.promises.readFile(path.join(uploadPath + '/optimized', fileName));
                    
                                        const s3 = new AWS.S3({
                                            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                                            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
                                        });
                    
                                        // Setting up S3 upload parameters
                                        const params = {
                                            Bucket: process.env.S3_BUCKET_NAME,
                                            Key: fileName, // File name you want to save as in S3
                                            Body: fileContent
                                        };
                    
                                        try {
                                            await s3.upload(params).promise();
                                            console.log(`File uploaded successfully. ${params.Key}`);
                                            await fs.promises.unlink(path.join(uploadPath, fileName));
                                            await fs.promises.unlink(path.join(uploadPath + '/optimized/', fileName));
                                        } catch (err) {
                                            console.log(`There was an error: ${err}`);
                                        }
                                    } catch(err) {
                                        console.log(err);
                                    }
                                }
                );



                
            }
        }

        await uploadFile();

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
                file: fileName,
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

router.get('/my-account/posts/edit/:id', userAuthenticated, async (req, res) => {
    const post = await Post.findOne({_id: req.params.id})
    
    const categories = await Category.find({});

    AWS.config.update({
        region: 'ap-southeast-2'
     });

    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: post.file
    };


    if (post.user.toString() === req.user.id) {
        try {
            const file = await s3.getObject(params).promise();
            var dataSrc = `data:${file.ContentType};base64,${Buffer.from(file.Body).toString('base64')}`;
            res.render('home/my-account/posts/edit', { post: post, categories: categories, imgUrl: dataSrc });
        } catch (err) {
            console.log(`Error: ${err}`);
            res.render('home/my-account/posts/edit', { post: post, categories: categories, imgUrl: null });
        }
        // res.render('home/my-account/posts/edit', {post: post, categories: categories})
    } else {
        res.status(401).json({
            msg: "You cannot edit someone else's post.",
        });
    }
});

router.put('/my-account/posts/edit/:id', async (req, res) => {

        let fileName = '';

        async function uploadFile() {
        
            if(req.files != null) {
                let file = req.files.file;
                fileName = Date.now() + '-' + file.name; 

                const uploadPath = path.join(__dirname, "..", "..", "public", "uploads");

                await file.mv(uploadPath + '/' + fileName, (err) => {
                    if(err) {
                        console.log(`There was an error: ${err}`) 
                    }
                });

                // INPUT_path = uploadPath + "/*.{jpg,JPG,jpeg,JPEG,png,svg,gif}";
                INPUT_path = uploadPath + '/' + fileName;
                OUTPUT_path = uploadPath + '/optimized/';

                const optimizedImage = await compress_images(INPUT_path, OUTPUT_path, { compress_force: false, statistic: true, autoupdate: true }, false,
                                { jpg: { engine: "mozjpeg", command: ["-quality", "60"] } },
                                { png: { engine: "pngquant", command: ["--quality=20-50", "-o"] } },
                                { svg: { engine: "svgo", command: "--multipass" } },
                                { gif: { engine: "gifsicle", command: ["--colors", "64", "--use-col=web"] } },
                                async function (error, completed, statistic) {
                                    console.log("-------------");
                                    console.log(`ERROR: ${error}`);
                                    console.log(`COMPLETED: ${completed}`);
                                    console.log(`STATISTIC: ${statistic}`);
                                    console.log("-------------");

                                    try {
                                        const fileContent = await fs.promises.readFile(path.join(uploadPath + '/optimized', fileName));
                    
                                        const s3 = new AWS.S3({
                                            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                                            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
                                        });
                    
                                        // Setting up S3 upload parameters
                                        const params = {
                                            Bucket: process.env.S3_BUCKET_NAME,
                                            Key: fileName, // File name you want to save as in S3
                                            Body: fileContent
                                        };
                    
                                        try {
                                            await s3.upload(params).promise();
                                            console.log(`File uploaded successfully. ${params.Key}`);
                                            await fs.promises.unlink(path.join(uploadPath, fileName));
                                            await fs.promises.unlink(path.join(uploadPath + '/optimized/', fileName));
                                        } catch (err) {
                                            console.log(`There was an error: ${err}`);
                                        }
                                    } catch(err) {
                                        console.log(err);
                                    }
                                }
                );

            }
        }

        await uploadFile();

        const post = await Post.findOne({_id: req.params.id});

        let allowComments = req.body.allowComments ? true : false;
    
        post.user = req.user.id;
        post.title = req.body.title;
        post.status = req.body.status;
        post.allowComments = allowComments;
        post.body = req.body.body;
        post.category = req.body.category;

        if (fileName) {
            async function deleteFile() {
                AWS.config.update({
                    region: 'ap-southeast-2'
                });
                const s3 = new AWS.S3();
                
                const params = {
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: post.file
                }
                try {
                    await s3.headObject(params).promise()
                    console.log("File Found in S3")
                    try {
                        await s3.deleteObject(params).promise()
                        console.log("file deleted Successfully")
                    }
                    catch (err) {
                        console.log("ERROR in file Deleting : " + JSON.stringify(err))
                    }
                } catch (err) {
                        console.log("File not Found ERROR : " + err.code)
                }
            }
            
            await deleteFile();

            post.file = fileName;
        } else {
            post.file = post.file;
        }

        const updatedPost = await post.save();
            
        req.flash('success_message', `Post ${updatedPost.title} was successfully updated`);
        res.redirect('/my-account/posts');

});

router.delete('/my-account/posts/:id', async (req, res) => {
        const post = await Post.findOne({_id: req.params.id})
        .populate('comments');

        console.log(`Post file name: ${post.file}`);

        // try {
        //     AWS.config.update({
        //         region: 'ap-southeast-2'
        //     });

        //     const params = {
        //         Bucket: process.env.S3_BUCKET_NAME,
        //         Key: post.file
        //     };

        //     const data = await s3.deleteObject(params).promise();
        //     console.log(`The file ${post.file} was successfully deleted from the S3 bucket ${process.env.S3_BUCKET_NAME}`);
        // } catch (err) {
        //     if (err.code === 'NoSuchKey') {
        //         console.log(`Error: The file ${post.file} was not found in the S3 bucket ${process.env.S3_BUCKET_NAME}`);
        //     } else {
        //         console.log(err, err.stack);
        //     }
        // }

        AWS.config.update({
            region: 'ap-southeast-2'
        });
        const s3 = new AWS.S3();
        
        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: post.file
        }
        try {
            await s3.headObject(params).promise()
            console.log("File Found in S3")
            try {
                await s3.deleteObject(params).promise()
                console.log("file deleted Successfully")
            }
            catch (err) {
                console.log("ERROR in file Deleting : " + JSON.stringify(err))
            }
        } catch (err) {
                console.log("File not Found ERROR : " + err.code)
        }
        
        // Remove post and comments from the database
        if (!post.comments.length < 1) {
            post.comments.forEach(comment => {
                comment.remove();
            })
        }
        await post.remove();
        req.flash('success_message', `Post "${post.title}" was successfully deleted`);
        res.redirect('/my-account/posts');

});

router.get('/my-account/comments', userAuthenticated, (req, res)=> {
    Comment.find({user: req.user.id})
    .populate('user')
    .populate('post')
    .then(comments => {
        let notAllowedComment = comments.find(el => {
            if (el.approveComment === false) return true;
        });
        res.render('home/my-account/comments', {comments: comments, notAllowedComment: notAllowedComment});
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

router.get('/my-account/messages', userAuthenticated, (req, res)=> {
    Message.find({$or: [{fromUser: req.user.id}, {toUser: req.user.id}]})
    .populate('fromUser')
    .populate('toUser')
    .then(messages => {
        const usersArray = [];
        Promise.all(messages.map(message => {
            return User.find({$or: [{_id: message.fromUser._id}, {_id: message.toUser._id}]})
            .where('_id').ne(req.user.id)
            .then(user => {                
                let userId = user[0]._id
                usersArray.push(userId.toString());
            })
        }))
        .then(() => {
            let uniqueUsersArray = usersArray.filter((v, i, a) => a.indexOf(v) === i);
            User.find({_id: uniqueUsersArray})
            .then(users => {
                res.render('home/my-account/messages', {messages: messages, users: users});
            });
        });
    });
});

router.get('/my-account/messages/:id', userAuthenticated, (req, res)=> {
    Message.find({$or: [{$and: [{fromUser: req.user.id}, {toUser: req.params.id}]}, {$and: [{fromUser: req.params.id}, {toUser: req.user.id}]}]})
    .populate('fromUser')
    .populate('toUser')
    .then(singleStreamMessages => {
        Message.find({$or: [{fromUser: req.user.id}, {toUser: req.user.id}]})
        .then(messages => {
            const usersArray = [];
            Promise.all(messages.map(message => {
                return User.find({$or: [{_id: message.fromUser._id}, {_id: message.toUser._id}]})
                .where('_id').ne(req.user.id)
                .then(user => {                
                    let userId = user[0]._id
                    usersArray.push(userId.toString());
                })
            }))
            .then(() => {
                let uniqueUsersArray = usersArray.filter((v, i, a) => a.indexOf(v) === i);
                User.find({_id: uniqueUsersArray})
                .then(users => {
                    User.findOne({_id: req.params.id})
                    .then(messagedUser => {
                        res.render('home/my-account/messages', {messages: singleStreamMessages, users: users, messagedUser: messagedUser});
                    })
                });
            });
        })
    });
});

router.post('/my-account/messages', (req, res) => {
    User.findOne({_id: req.user.id})
    .then(fromUser => {
        User.findOne({_id: req.body.id})
        .then(toUser => {
            const newMessage = new Message({
                fromUser: req.user.id,
                body: req.body.body,
                toUser: req.body.id            
            });
            fromUser.sentMessages.push(newMessage);
            toUser.receivedMessages.push(newMessage);
            fromUser.save().then(savedFromUser => {
                toUser.save().then(savedToUser => {
                    newMessage.save().then(savedMessage => {
                        req.flash('success_message', `Message successfully sent.`);
                        res.redirect(`/my-account/messages/${toUser._id}`);
                    })
                });
            });
        })
    })
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