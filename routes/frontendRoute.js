

const express = require('express');
const router = express.Router();
const isLoggedIn  = require('../middlewares/isLoggedIn')

const siteController = require('../controllers/siteController');
const commentController = require('../controllers/commentController')
const giveCategories = require( '../middlewares/giveCategories');


router.get('/',giveCategories, siteController.home);
router.get('/category/:name',giveCategories, siteController.articleByCategories);
router.get('/single/:id',giveCategories, siteController.singleArticle);
router.get('/search',giveCategories, siteController.search);
router.get('/author/:id',giveCategories, siteController.author);

// this will add the comment
router.post('/single/:id/add-comment', isLoggedIn, commentController.addComment);

module.exports = router;