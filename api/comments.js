const express = require('express'); 
const { getComments, addComment, deleteComment, getCommentById } = require('../services/commentService');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const csrf = require('csurf');

const router = express.Router();
const csrfProtection = csrf({ cookie: true });

router.use(csrfProtection);

router.get('/', async (req, res) => {
    try {
        const comments = await getComments();
        return res.status(200).json({ comments });
    } catch (error) {
        console.error('Error fetching comments:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/', isAuthenticated, async (req, res) => {
    const { content } = req.body; 
    const userId = req.user.id; 

    if (!content) {
        return res.status(400).json({ message: 'Content is required' });
    }

    try {
        const newComment = await addComment({ content, userId });
        return res.status(201).json({ comment: newComment });
    } catch (error) {
        console.error('Error adding comment:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.delete('/:id', isAuthenticated, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id; 

    try {
        const comment = await getCommentById(id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.userId !== userId) {
            return res.status(403).json({ message: 'Unauthorized to delete this comment' });
        }

        await deleteComment(id);
        return res.status(204).send();
    } catch (error) {
        console.error('Error deleting comment:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
