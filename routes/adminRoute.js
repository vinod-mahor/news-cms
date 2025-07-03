

const express = require('express');
const router = express.Router();
const upload = require("../middlewares/multer.js")
const categoriesAndNews = require('../middlewares/giveCategories.js')

// Import the admin controller
const siteController = require('../controllers/siteController');
const categoryController = require('../controllers/categoryController');
const articleController = require('../controllers/articleController');
const commentController = require('../controllers/commentController');
const userController = require('../controllers/userController');

//middleware
const isLoggedIn = require('../middlewares/isLoggedIn.js');
const isAdmin = require('../middlewares/isAdmin.js');

// login routes
router.get('/', userController.loginPage);
router.post('/index', userController.adminLogin);
router.get('/logout', userController.logout);
router.get('/dashboard', isLoggedIn,categoriesAndNews, userController.dashboard);
router.get('/settings', isLoggedIn, isAdmin, userController.settings);
router.post('/save-settings', isLoggedIn, isAdmin, upload.single("siteLogo"), userController.saveSettings);

// user curd routes

router.get('/users', isLoggedIn, isAdmin,categoriesAndNews, userController.allUser);
router.get('/add-user', isLoggedIn, isAdmin,categoriesAndNews, userController.addUserPage);
router.post('/add-user', isLoggedIn, isAdmin, userController.addUser);
router.get('/update-user/:id', isLoggedIn, isAdmin,categoriesAndNews, userController.updateUserPage);
router.post('/update-user/:id', isLoggedIn, isAdmin, userController.updateUser);
router.get('/delete-user/:id', isLoggedIn, isAdmin, userController.deleteUser);


// category curd routes
router.get('/categories', isLoggedIn, isAdmin,categoriesAndNews, categoryController.allCategory);
router.get('/add-category', isLoggedIn, isAdmin,categoriesAndNews, categoryController.addCategoryPage);
router.post('/add-category', isLoggedIn, isAdmin, categoryController.addCategory);
router.get('/update-category/:id', isLoggedIn, isAdmin,categoriesAndNews, categoryController.updateCategoryPage);
router.post('/update-category/:id', isLoggedIn, isAdmin, categoryController.updateCategory);
router.get('/delete-category/:id', isLoggedIn, isAdmin, categoryController.deleteCategory);

// article curd routes
router.get('/articles', isLoggedIn,categoriesAndNews, articleController.allArticle);
router.get('/add-article', isLoggedIn,categoriesAndNews, articleController.addArticlePage);
router.post('/add-article', isLoggedIn, upload.single("image"), articleController.addArticle);
router.get('/update-article/:id', isLoggedIn,categoriesAndNews, articleController.updateArticlePage);
router.post('/update-article/:id', isLoggedIn, upload.single("image"), articleController.updateArticle);
router.get('/delete-article/:id', isLoggedIn, articleController.deleteArticle);


// comment routes
router.put('/comments/:id/update-status',commentController.updateStatus);
router.delete('/comments/:id/delete-comment',commentController.deleteComment);
router.get('/comments', isLoggedIn,categoriesAndNews, commentController.allComments);



module.exports = router;