const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const User = require('../../models/User');
const {isEmpty, uploadDir} = require('../../helpers/upload-helper');
const fs = require('fs');
const AWS = require('aws-sdk');
//const path = require('path');
const { userAuthenticated } = require('../../helpers/authentication');
const { adminAuthenticated } = require('../../helpers/admin-authentication');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    endpoint: new AWS.Endpoint('s3-ap-southeast-2.amazonaws.com') 
});

router.all('/*', adminAuthenticated, (req, res, next)=> {
    req.app.locals.layout = 'admin';
    next();
}); 

router.get('/', async (req, res) => {
    const posts = await Post.find({})
    .sort({ date: -1 })
    .populate('category')
    .populate('user');

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
    
    res.render('admin/posts', { 
        posts: posts, 
    });

    // Post.find()
    // .populate('category')
    // .populate('user')
    // .then(posts => {
    //     res.render('admin/posts', {posts: posts});
    // }); 
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
            res.redirect('/admin/posts');
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
                res.redirect('/admin/posts');
            });
        }); 
    });
});

module.exports = router;