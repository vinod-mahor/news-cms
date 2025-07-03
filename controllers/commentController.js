
const express = require('express');
const mongoose = require('mongoose');

// include model files
const categoryModel = require('../models/Category');
const commentModel = require('../models/Comment');
const userModel = require('../models/User');
const newsModel = require('../models/News');

const allComments = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            sort: { createdAt: -1 },
            populate: "article"
        };
        const userRole = req.role;
        if (userRole == 'admin') {
            const comments = await commentModel.paginate({}, options);
            return res.render('admin/comments/index', {
                comments: comments.docs,
                role: req.role,
                totalPages: comments.totalPages,
                currentPage: comments.page,
                limit: options.limit,
                totalComments: comments.totalDocs
            });
        }
        if (userRole == 'author') {
            const comments = await commentModel.paginate({ author: req.id }, options);
            return res.render('admin/comments/index',
                {
                    comments: comments.docs,
                    role: req.role,
                    totalPages: comments.totalPages,
                    currentPage: comments.page,
                    limit: options.limit,
                    totalComments: comments.totalDocs
                }
            );
        }
    } catch (error) {
        console.error("Error fetching comments:", error);
        return res.status(500).send('Server Error');
    }

};
const addComment = async (req, res) => {
    const path = req.path;
    const articleId = req.params.id;
    const { email, content, } = req.body;
    if (!content) {
        return res.status(400).json({ message: "Content is required" });
    }
    try {
        const newComment = await commentModel.create({
            article: new mongoose.Types.ObjectId(articleId),
            name: req.fullname || "Anonymous",
            email,
            content: content,
            status: 'pending', // Default status for new comments
        });
        if (!newComment) {
            return res.send("Unable to add your comment!");
        }

        const parts = path.split('/');
        const redirectionPath = '/' + parts.slice(1, 2 + 1).join('/') + '/';
        res.redirect(`${redirectionPath}`);
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
const updateStatus = async (req, res) => {
    const commentId = req.params.id;
    const { status } = req.body;
    if (!commentId || !status) {
        return res.status(400).json({ message: "Comment ID and status are required" });
    }
    try {
        const updatedComment = await commentModel.findByIdAndUpdate(
            commentId,
            { status: status }
        );
        if (!updatedComment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        await res.status(200).json({ message: "Comment status updated successfully", comment: updatedComment });
    } catch (error) {
        console.error("Error updating comment status:", error);
        await res.status(500).json({ message: "Internal server error" });
    }
}
const deleteComment = async (req, res) => {
    const commentId = req.params.id;
    if (!commentId) {
        return res.status(400).json({ message: "Comment ID is required" });
    }
    try {
        const deletedComment = await commentModel.findByIdAndDelete(commentId);
        if (!deletedComment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        await res.status(200).json({ message: "Comment deleted successfully", comment: deletedComment });
    } catch (error) {
        console.error("Error deleting comment:", error);
        await res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = { allComments, addComment, updateStatus, deleteComment }