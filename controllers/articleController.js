
const express = require('express');
const mongoose = require('mongoose');
const JWT = require("jsonwebtoken");
const fs = require('fs')
require("dotenv").config();

// include model files
const categoryModel = require('../models/Category');
const commentModel = require('../models/Comment');
const userModel = require('../models/User');
const newsModel = require('../models/News');


const allArticle = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    let allArticles;
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 },
        populate: [
            { path: 'category', select: 'name' },
            { path: 'author', select: 'fullname' } // if you want to show author's name too
        ]
    };
    if (req.role !== 'admin') {
        allArticles = await newsModel.paginate({ author: req.id }, options);
    } else {
        allArticles = await newsModel.paginate({}, options);
    }
    res.render('admin/articles/index', {
        role: req.role,
        articles: allArticles.docs,
        totalPages: allArticles.totalPages,
        currentPage: allArticles.page,
        limit: allArticles.limit,
        totalArticles: allArticles.totalDocs
    });
};
const addArticlePage = async (req, res) => {
    try {
        const allCategories = await categoryModel.find();
        res.render('admin/articles/create', { role: req.role, categories: allCategories });
    } catch (error) {
        res.status(500).send(error);
    }

};
const addArticle = async (req, res) => {
    const token = req.cookies.token;
    const writerData = JWT.verify(token, process.env.JWT_SECRATE);
    const authorObjectId = new mongoose.Types.ObjectId(writerData.id);
    const { title, content, category } = req.body;
    const image = req.file.filename;
    const article = await newsModel.create({ title, content, category, author: authorObjectId, image });
    if (!article) {
        res.status(500).send("can't add article");
    }
    res.redirect('/admin/articles');
};
const updateArticlePage = async (req, res) => {
    try {
        const { id } = req.params;
        const article = await newsModel.findById(id).populate("author category");
        if (req.role !== 'admin' && req.id !== article.author._id.toString()) {
            return res.status(403).send("You are not allowed to edit this article!");
        }

        const allCategories = await categoryModel.find();
        if (!article) {
            return res.status(500).send("Unable to find article!");
        }
        res.render('admin/articles/update', { role: req.role, article, allCategories });
    } catch (error) {
        res.status(500).send(error);
    }

};
const updateArticle = async (req, res) => {
    const { id } = req.params;
    const articleForUpdate = await newsModel.findById(id);
    if (req.role !== 'admin' && req.id !== articleForUpdate.author.toString()) {
        return res.status(403).send("You are not allowed to edit this article!");
    }
    const { title, content, category } = req.body;
    const image = req.file ? req.file.filename : undefined;
    const updateData = { title, content, category };
    if (image) {
        updateData.image = image;
        const oldImg = await newsModel.findById(id);
        fs.unlink(`public/uploads/${oldImg.image}`, (err) => {
            if (err) {
                throw err
            }
        });
    }
    const article = await newsModel.findByIdAndUpdate(id, updateData);
    if (!article) {
        return res.status(500).send("Unable to update article!");
    }
    res.redirect('/admin/article');
};

const deleteArticle = async (req, res) => {
    const { id } = req.params;
    const article = await newsModel.findById(id);
    if (req.role !== 'admin' && req.id !== article.author.toString()) {
        return res.status(403).send("You are not allowed to edit this article!");
    }
    if (!article) {
        return res.status(500).send("Unable to find article!");
    }
    // Delete the image file from the server
    fs.unlink(`public/uploads/${article.image}`, (err) => {
        if (err) {
            throw err;
        }
    });
    await newsModel.findByIdAndDelete(id);
    res.redirect('/admin/article');
};

module.exports = {
    allArticle,
    addArticlePage,
    addArticle,
    updateArticlePage,
    updateArticle,
    deleteArticle,
}
