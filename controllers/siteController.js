const mongoose = require('mongoose');

// include model files

const categoryModel = require('../models/Category');
const commentModel = require('../models/Comment')
const userModel = require('../models/User');
const newsModel = require('../models/News');
const articleModel = require('../models/News');

const home = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const latestArticles = await articleModel.paginate({}, {
        page,
        limit: 5,
        sort: { createdAt: -1 },
        populate: [
            { path: 'category', select: 'name slug' },
            { path: 'author', select: 'fullname _id username' }
        ]
    });
    // Fetch popular articles (assuming popularity is determined by views or comments)
    // Replace 'views' with your actual popularity field
    const popularArticles = await newsModel.paginate({}, {
        page,
        limit: 5,
        populate: ("category author"),
    });
    res.render("frontend/index", {
        recentNews: req.recentNews,
        categories: req.categories, // Assuming categories are passed from middleware
        latestArticles: latestArticles._docs,
        popularArticles: popularArticles.docs,
        currentPage: page,
        totalPages: latestArticles.totalPages,
        limit: latestArticles.limit,
        totalArticles: latestArticles.totalDocs
    });
};
const articleByCategories = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const { name } = req.params;
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 },
        populate: ("category author")
    };
    const category = await categoryModel.findOne({ slug: name });
    if (!category) {
        return res.status(404).render("frontend/404", { message: "Category not found" });
    }
    const newsAccordingCategory = await newsModel.paginate({ category: category._id }, options);
    res.render("frontend/category",
        {
            recentNews: req.recentNews,
            categories: req.categories,
            categoryName: category.name,
            categoryNews: newsAccordingCategory.docs,
            categories: req.categories, // Assuming categories are passed from middleware
            currentPage: newsAccordingCategory.page,
            totalPages: newsAccordingCategory.totalPages,
            limit: options.limit,
            totalArticles: newsAccordingCategory.totalDocs
        });
};
const singleArticle = async (req, res) => {
    try {
        const articleId = req.params.id;
        const article = await articleModel.findById(articleId);

        const articleComments = await commentModel.find({ article: article._id, status: 'approved' });

        res.render("frontend/single", {
            article,
            categories: req.categories,
            recentNews: req.recentNews,
            articleComments
        });

    } catch (error) {
        console.error("Error rendering single article page:", error);
        res.status(500).send("Server Error");
    }

};
const search = async (req, res) => {
    const keyword = req.query.q?.trim() || "";
    const page = parseInt(req.query.page) || 1;
    const limit = 5;

    try {
        // Step 1: Basic query for title/content
        const baseQuery = {
            $or: [
                { title: { $regex: keyword, $options: 'i' } },
                { content: { $regex: keyword, $options: 'i' } }
            ]
        };

        // Step 2: Paginate and populate category and author
        const result = await newsModel.paginate(baseQuery, {
            page,
            limit,
            populate: ['category', 'author'],
            lean: true // required for filtering plain objects
        });

        // Step 3: Filter category.name and author.name manually
        const lowerKeyword = keyword.toLowerCase();
        const filteredDocs = result.docs.filter(article =>
            article.title?.toLowerCase().includes(lowerKeyword) ||
            article.content?.toLowerCase().includes(lowerKeyword) ||
            article.category?.name?.toLowerCase().includes(lowerKeyword) ||
            article.author?.name?.toLowerCase().includes(lowerKeyword)
        );

        // Step 4: Render with filteredDocs, update totalPages if needed
        res.render("frontend/search", {
            categories: req.categories,
            recentNews: req.recentNews,
            articles: filteredDocs,
            keyword,
            currentPage: result.page,
            totalPages: result.totalPages,
            hasNextPage: result.hasNextPage,
            hasPrevPage: result.hasPrevPage,
            nextPage: result.nextPage,
            prevPage: result.prevPage
        });

    } catch (error) {
        console.error("Error in search:", error);
        res.status(500).send("Server Error");
    }
};

const author = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const authorId = req.params.id;
    const author = await userModel.findById(authorId);
    if (!author) {
        return res.status(404).render("frontend/404", { message: "Author not found" });
    }
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        populate: ("category")
    }
    const articlesByAuthor = await newsModel.paginate({}, options)
    if (!articlesByAuthor.docs || articlesByAuthor.docs.length === 0) {
        return res.status(404).render("frontend/404", { message: "No articles found for this author" });
    }

    // Render the author page with the author's details and their articles
    res.render("frontend/author", {
        categories: req.categories,
        author: author,
        recentNews: req.recentNews,
        articlesByAuthor: articlesByAuthor.docs,
        totalPages: articlesByAuthor.totalPages,
        currentPage: articlesByAuthor.page,
        limit: articlesByAuthor.limit,

    });
};





module.exports = { home, articleByCategories, singleArticle, search, author }
