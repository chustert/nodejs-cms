const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Venture = require('../../models/Venture');
const Category = require('../../models/Category');
const VentureCategory = require('../../models/VentureCategory');
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
const Stage = require('../../models/Stage');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    endpoint: new AWS.Endpoint('s3-ap-southeast-2.amazonaws.com') 
});

//************ MY ACCOUNT ************//
router.all('/*', userAuthenticated, (req, res, next)=> {
    req.app.locals.layout = 'home';
    next();
}); 

router.get('/', userAuthenticated, (req, res)=> {
    const promises = [
        Post.count({user: req.user.id}).exec(),
        Comment.count({user: req.user.id}).exec()
    ];

    Promise.all(promises).then(([postCount, commentCount]) => {
        res.render('home/my-account', {postCount: postCount, commentCount: commentCount});       
    })
});

//************ PROFILE ************//
router.get('/profile', userAuthenticated, (req, res)=> {
    User.findById(req.user.id)
    .then(user => {
        res.render('home/my-account/profile', {user: user});
    }); 
});

router.get('/profile/edit', userAuthenticated, (req, res) => {
    User.findOne({_id: req.user.id}).then(user => {
        res.render('home/my-account/profile/edit', {user: user})
    });
}); 

router.put('/profile/edit', userAuthenticated, (req, res) => {
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

router.get('/profile/password', userAuthenticated, (req, res) => {
    User.findOne({_id: req.user.id}).then(user => {
        res.render('home/my-account/profile/password', {user: user})
    });
}); 

router.put('/profile/password', userAuthenticated, (req, res) => {

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

//************ VENTURES ************//
router.get('/ventures', userAuthenticated, async (req, res)=> {
    const ventures = await Venture.find({user: req.user._id})
    .sort({ date: -1 })
    .populate('ventureCategory')
    .populate('stage');

    // const categories = await Category.find({});

    await Promise.all(
        ventures.map(async venture => {
            if (!venture.logoFile) {
                return console.log(`No file found for venture ${venture._id}`);
            }
            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: venture.logoFile
            };
            try {
                const file = await s3.getObject(params).promise();
                venture.imgUrl = `data:${file.ContentType};base64,${Buffer.from(file.Body).toString('base64')}`;
            } catch (err) {
                console.log(err);
                venture.imgUrl = null;
            }
        })
    );
    
    res.render('home/my-account/ventures', { 
        ventures: ventures, 
    });
});

router.get('/ventures/create', userAuthenticated, (req, res) => {
    VentureCategory.find({}).then(ventureCategories => {
        Stage.find({}).then(stages => {
            res.render('home/my-account/ventures/create', {ventureCategories: ventureCategories, stages: stages})
        });        
    });
});

router.post('/ventures/create', userAuthenticated, async (req, res) => {
    let errors = [];

    if(!req.body.name) {
        errors.push({message: 'Please add a name.'});
    }
    if(!req.body.description) {
        errors.push({message: 'Please add a description.'});
    }
    if(!req.body.elevatorPitch) {
        errors.push({message: 'Please add an elevator pitch.'});
    }
    if(!req.body.stage) {
        errors.push({message: 'Please add a stage.'});
    }

    if (errors.length > 0) {
        res.render('home/my-account/ventures/create', {
            errors: errors
        })
    } else {
        let fileName = '';

        async function uploadFile() {
            
            if(req.files != null) {
                let file = req.files.logoFile;
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

        User.findOne({_id: req.user.id}).then(loggedUser => {
            const newVenture = new Venture({
                user: req.user.id,
                name: req.body.name,
                status: req.body.status,
                website: req.body.website,
                description: req.body.description,
                elevatorPitch: req.body.elevatorPitch,
                logoFile: fileName,
                stage: req.body.stage,
                ventureCategory: req.body.ventureCategory
            });
            loggedUser.ventures.push(newVenture);
            loggedUser.save().then(savedUser => {
                newVenture.save().then(savedVenture => {
                    req.flash('success_message', `Venture "${savedVenture.name}" was created successfully`);
                    res.redirect('/my-account/ventures');
                }).catch(error => {
                    console.log(error, "could not save venture");
                });
            })
        })
    }
});

router.get('/ventures/edit/:id', userAuthenticated, async (req, res) => {
    const venture = await Venture.findOne({_id: req.params.id})
    
    const ventureCategories = await VentureCategory.find({});
    const stages = await Stage.find({});

    AWS.config.update({
        region: 'ap-southeast-2'
     });

    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: venture.logoFile
    };


    if (venture.user.toString() === req.user.id) {
        try {
            const file = await s3.getObject(params).promise();
            var dataSrc = `data:${file.ContentType};base64,${Buffer.from(file.Body).toString('base64')}`;
            res.render('home/my-account/ventures/edit', { venture: venture, ventureCategories: ventureCategories, imgUrl: dataSrc, stages: stages });
        } catch (err) {
            console.log(`Error: ${err}`);
            res.render('home/my-account/ventures/edit', { venture: venture, ventureCategories: ventureCategories, imgUrl: null, stages: stages });
        }
        // res.render('home/my-account/posts/edit', {post: post, categories: categories})
    } else {
        res.status(401).json({
            msg: "You cannot edit someone else's venture.",
        });
    }
});

router.put('/ventures/edit/:id', async (req, res) => {

    let fileName = '';

    async function uploadFile() {
    
        if(req.files != null) {
            let file = req.files.logoFile;
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

    const venture = await Venture.findOne({_id: req.params.id});

    venture.user = req.user.id;
    venture.name = req.body.name;
    venture.status = req.body.status;
    venture.website = req.body.website;
    venture.description = req.body.description;
    venture.elevatorPitch = req.body.elevatorPitch;
    venture.stage = req.body.stage;
    venture.ventureCategory = req.body.ventureCategory;

    if (fileName) {
        async function deleteFile() {
            AWS.config.update({
                region: 'ap-southeast-2'
            });
            const s3 = new AWS.S3();
            
            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: venture.logoFile
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

        venture.logoFile = fileName;
    } else {
        venture.logoFile = venture.logoFile;
    }

    const updatedVenture = await venture.save();
        
    req.flash('success_message', `Venture ${updatedVenture.name} was successfully updated`);
    res.redirect('/my-account/ventures');

});

router.delete('/ventures/:id', async (req, res) => {
    const venture = await Venture.findOne({_id: req.params.id})

    const ventureLikes = await VentureLikes.findOne({venture: venture._id})

    console.log(`Post file name: ${venture.logoFile}`);
    console.log(`VentureLike Id: ${ventureLikes._id}`);

    AWS.config.update({
        region: 'ap-southeast-2'
    });
    const s3 = new AWS.S3();
    
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: venture.logoFile
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
    
    await ventureLikes.remove();
    await venture.remove();
    req.flash('success_message', `Venture "${venture.name}" was successfully deleted`);
    res.redirect('/my-account/ventures');

});

//************ POSTS ************//
router.get('/posts', userAuthenticated, async (req, res)=> {
    const posts = await Post.find({user: req.user._id})
    .sort({ date: -1 })
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
});

router.get('/posts/create', userAuthenticated, (req, res) => {
    Category.find({}).then(categories => {
        res.render('home/my-account/posts/create', {categories: categories})
    })
});

router.post('/posts/create', userAuthenticated, async (req, res) => {
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

router.get('/posts/edit/:id', userAuthenticated, async (req, res) => {
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

router.put('/posts/edit/:id', async (req, res) => {

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

router.delete('/posts/:id', async (req, res) => {
        const post = await Post.findOne({_id: req.params.id})
        .populate('comments')

        const postLikes = await PostLikes.findOne({post: post._id})

        console.log(`Post file name: ${post.file}`);
        console.log(`PostLike Id: ${postLikes._id}`);

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
        
        // Remove post, comments and likes from the database
        if (!post.comments.length < 1) {
            post.comments.forEach(comment => {
                comment.remove();
            })
        }
        await postLikes.remove();
        await post.remove();
        req.flash('success_message', `Post "${post.title}" was successfully deleted`);
        res.redirect('/my-account/posts');

});

//************ COMMENTS ************//
router.get('/comments', userAuthenticated, (req, res)=> {
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

router.post('/comments', (req, res) => {
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

//************ MESSAGES ************//
router.get('/messages', userAuthenticated, (req, res)=> {
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

router.get('/messages/:id', userAuthenticated, (req, res)=> {
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

router.post('/messages', (req, res) => {
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

module.exports = router;