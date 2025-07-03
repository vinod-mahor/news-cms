
const JWT = require('jsonwebtoken');

const isLoggedIn = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/admin');
    }
    try {
        const userData = JWT.verify(token, process.env.JWT_SECRATE);
        if(!userData) {
            return res.redirect('/admin');
        }
        req.role = userData.role;
        req.fullname = userData.fullname;
        req.id = userData.id;
        next();
    } catch (error) {
        console.log(error);
        res.redirect('/admin');
    }
}


module.exports = isLoggedIn;