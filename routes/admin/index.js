const express = require('express');
const router = express.Router();
const faker = require('faker');
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');
const Category = require('../../models/Category');
const {userAuthenticated} = require('../../helpers/authentication');
const { adminAuthenticated } = require('../../helpers/admin-authentication');

router.all('/*', adminAuthenticated, (req, res, next)=> {
    req.app.locals.layout = 'admin';
    next();
}); 

router.get('/', (req, res)=> {
    const promises = [
        Post.count().exec(),
        Category.count().exec(),
        Comment.count().exec()
    ];

    Promise.all(promises).then(([postCount, categoryCount, commentCount]) => {
        res.render('admin/index', {postCount: postCount, categoryCount: categoryCount, commentCount: commentCount});       
    })


    // Post.count({}).then(postCount => {
    //     Comment.count({}).then(commentCount => {
    //         Category.count({}).then(categoryCount => {
    //             res.render('admin/index', {postCount: postCount, commentCount: commentCount, categoryCount: categoryCount});
    //         });
    //     });
    // });
});

// router.post('/generate-fake-posts', (req, res) => {
//     for(let i = 0; i < req.body.amount; i++) {
//         let post = new Post();

//         post.title = faker.name.title();
//         post.status = 'public';
//         post.allowComments = faker.random.boolean();
//         post.body = faker.lorem.sentence();
//         post.slug = faker.name.title();
        
//         post.save(function(err) {
//             if (err) throw err;
//         });
//     }
//     res.redirect('/admin/posts');
// });

module.exports = router;