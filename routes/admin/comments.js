const express = require('express');
const { route } = require('../home');
const router = express.Router();
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');
const {userAuthenticated} = require('../../helpers/authentication');
const { adminAuthenticated } = require('../../helpers/admin-authentication');

router.all('/*', adminAuthenticated, (req, res, next)=> {
    req.app.locals.layout = 'admin';
    next();
}); 

router.get('/', (req, res) => {
    Comment.find()
    .populate('user')
    .populate('post')
    .then(comments => {
        res.render('admin/comments', {comments: comments});
    })
});

router.delete('/:id', (req, res) => {
    Comment.findByIdAndRemove(req.params.id).then(deleteItem => {
        Post.findOneAndUpdate({comments: req.params.id}, {$pull: {comments: req.params.id}}, (err, data) => {
            if(err) console.log(err);
            res.redirect('/admin/comments');
        });
    });
});

router.post('/approve-comment', (req, res) => {
    Comment.findByIdAndUpdate(req.body.id, {$set: {approveComment: req.body.approveComment}}, (err, result) => {
        if(err) return err;
        res.send(result);
    })
});

module.exports = router;