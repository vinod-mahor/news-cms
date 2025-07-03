
const express = require('express');
const mongoose = require('mongoose');

// include model files
const categoryModel = require('../models/Category');
const commentModel = require('../models/Comment');
const userModel = require('../models/User');
const newsModel = require('../models/News');


const allCategory = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            sort: { createdAt: -1 }
        };

        const result = await categoryModel.aggregatePaginate(
            categoryModel.aggregate([
                {
                    $lookup: {
                        from: 'news',
                        localField: '_id',
                        foreignField: 'category',
                        as: 'news'
                    }
                },
                {
                    $addFields: {
                        newsCount: { $size: '$news' }
                    }
                }
            ]),
            options
        );

        res.render('admin/categories/index', {
            role: req.role,
            categories: result.docs,
            totalPages: result.totalPages,
            currentPage: result.page,
            limit: options.limit,
            totalCategories: result.totalDocs,
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

const addCategoryPage = async (req, res) => {
    res.render('admin/categories/create', { role: req.role });
};


const addCategory = async (req, res) => {
    const { name, description } = req.body;
    try {
        const isAlreadyExist = await categoryModel.findOne({ name });
        if (isAlreadyExist) {
            return res.status(400).json({ message: 'Category already exists' });
        }
        const newCategory = await categoryModel.create({ name, description });
        if (newCategory) {
            res.redirect('/admin/category');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

const updateCategoryPage = async (req, res) => {
    const { id } = req.params;
    const category = await categoryModel.findById(id);
    if (!category) {
        return res.status(500).send("category does not exist!");
    }
    res.render('admin/categories/update', { role: req.role, category });
};
const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
        const updateCategory = await categoryModel.findByIdAndUpdate({ _id: id }, { name, description });
        if (!updateCategory) {
            res.status(500).send("Unable to update category");
        }
        res.redirect('/admin/category');
    } catch (error) {
        console.log(error);
        res.error(error);
    }
};
const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const categoryArticle = await newsModel.find({ category: id }).countDocuments();
        const category = await categoryModel.findOne({ _id: id });
        console.log("categoryArticle", categoryArticle);
        console.log("category", category);
        if (!category) {
            return res.status(404).send({ "success": false, "message": "Category not found" });
        }
        if (category && categoryArticle > 0) {
            return res.status(400).send({ "success": false, "message": "Category cannot be deleted because it has associated articles" });
        }
        if (category && categoryArticle == 0) {
            const category = await categoryModel.findByIdAndDelete(id);
            return res.send({ "success": true, "message": "Category deleted successfully" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
};

module.exports = {
    allCategory,
    addCategoryPage,
    addCategory,
    updateCategoryPage,
    updateCategory,
    deleteCategory
}