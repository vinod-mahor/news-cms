




const Category = require('../models/Category'); // Adjust the path as necessary
const News = require('../models/News');
const Settings = require('../models/Settings')

const giveCategoriesAndRecentNews = async (req, res, next) => {
    try {
        const settings = await Settings.findOne();
        // Fetch all categories
        const categories = await Category.find().limit(6);
        // const categories = await Category.aggregate([{ $sample: { size: 6 } }]);
        const recentNews = await News.find().sort({ createdAt: -1 }).populate("category").limit(6);
        // Attach categories to the request object
        req.categories = categories;
        req.recentNews = recentNews;
        res.locals.settings = settings;
        next(); // Call the next middleware or route handler
    } catch (error) {
        console.error('Error fetching categories or news:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = giveCategoriesAndRecentNews;