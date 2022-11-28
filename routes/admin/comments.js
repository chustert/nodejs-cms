const express = require('express');
const { route } = require('../home');
const router = express.Router();
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');

router.all('/*', (req, res, next)=> {
    req.app.locals.layout = 'admin';
    next();
}); 

router.get('/', (req, res) => {
    Comment.find({user: '637ea6f72fb1bc0ab24620fb'}).populate('user') // req.user.id
    .then(comments => {
        res.render('admin/comments', {comments: comments});
    })
});

router.post('/', (req, res) => {
    Post.findOne({_id: req.body.id}).then(post => {
        const newComment = new Comment({
            user: req.user.id,
            body: req.body.body
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