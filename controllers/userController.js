
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
const path = require('path');
const fs = require('fs')
const cookie = require('cookie-parser');

// include model files
const categoryModel = require('../models/Category');
const commentModel = require('../models/Comment');
const userModel = require('../models/User');
const newsModel = require('../models/News');
const Settings = require('../models/Settings')


// login controller
const loginPage = async (req, res) => {
    const getToken = req.cookies.token;
    if (getToken) {
        const { id } = JWT.verify(getToken, process.env.JWT_SECRATE);
        if (id) {
            return res.redirect("/admin/dashboard");
        }
    }

    res.render("admin/login", {
        layout: false
    });
};
const adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await userModel.findOne({ username });
        const isMatched = await bcrypt.compare(password, user.password);
        if (isMatched) {
            const token = JWT.sign({ id: user._id, fullname: user.fullname, role: user.role }, process.env.JWT_SECRATE, { expiresIn: '1h' });
            res.cookie('token', token, { httpOnly: true, maxAge: 60 * 60 * 1000 });
            res.redirect('/admin/dashboard');
        } else {
            res.status(401).json({ message: 'username or password invalid!' });
        }
    } catch (error) {
        console.log(error);
        res.redirect('/admin')
    }

};
const logout = async (req, res) => {
    res.clearCookie('token');
    res.redirect('/admin')
};


const allUser = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 }
    };
    try {
        const allUsers = await userModel.paginate({}, options);
        res.render('admin/users/index', {
            allUsers: allUsers.docs,
            role: req.role,
            currentPage: allUsers.page,
            totalPages: allUsers.totalPages,
            limit: options.limit,
            totalUsers: allUsers.totalDocs
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const addUserPage = async (req, res) => {
    res.render('admin/users/create', { role: req.role });
};
const addUser = async (req, res) => {
    try {
        const existingUser = await userModel.findOne({ username: req.body.username.trim().toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        const user = await userModel.create(req.body);
        res.redirect('/admin/users');
    } catch (error) {
        console.log(error)
    }
};
const updateUserPage = async (req, res) => {
    const { id } = req.params;
    const user = await userModel.findOne({ _id: id });
    res.render('admin/users/update', { user, role: req.role });
};
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { fullname, password, role } = req.body;
    try {
        const user = await userModel.findById(id);
        if (!user) {
            res.redirect('/admin/users');
        }
        user.fullname = fullname || user.fullname;
        if (password) {
            user.password = password;
        }
        user.role = role || user.role;
        const updatedUser = await userModel.findByIdAndUpdate(id, { fullname, password, role });
        updatedUser.save();
        res.redirect('/admin/users');

    } catch (error) {
        console.log(error);
        res.redirect('/admin/users');
    }
};
const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const totalUser = await userModel.countDocuments();
        const totalAdmin = await userModel.find({ role: "admin" }).countDocuments();
        const totalNewsOfUser = await newsModel.find({ author: id }).countDocuments();
        if ((totalUser > 1 && totalAdmin > 1)) {
            if (totalNewsOfUser > 0) {
                // Handle case where user has news articles
                return res.status(400).json({ success: false, message: 'User has news articles and cannot be deleted' });
            } else {
                // Handle case where user has no news articles
                if (totalNewsOfUser === 0) {
                    const deletedUser = await userModel.findByIdAndDelete(id);
                    // Delete associated comments
                    await commentModel.deleteMany({ user: id });
                    if (!deletedUser) {
                        return res.status(404).json({ success: false, message: 'User not found' });
                    }
                    res.redirect('/admin/users');
                }

            }
        }
        else {
            res.status(500).send("Last Admin can't be delete!");
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
const dashboard = async (req, res) => {
    let totalNews;
    if (req.role === 'admin') {
        totalNews = await newsModel.countDocuments();
    } else {
        totalNews = await newsModel.countDocuments({ author: req.id });
    }
    const totalCategories = await categoryModel.countDocuments();
    const totalUsers = await userModel.countDocuments();
    res.render('admin/dashboard', { totalNews, totalCategories, totalUsers, role: req.role, fullname: req.fullname });
};

const settings = async (req, res) => {
    try {
        const settings = await Settings.findOne();
        res.render('admin/settings', { role: req.role, fullname: req.fullname, id: req.id, settings });
    } catch (error) {
        res.status(500).send('Internal server error');
    }

};
const saveSettings = async (req, res) => {
    try {
        let { siteName, siteFooter, adminEmail, siteLogo, removeLogo } = req.body;
        if (req.file) {
            siteLogo = req.file.filename;
        } else if (removeLogo) {
            const settings = await Settings.findOne();
            if (settings && settings.siteLogo) {
                const logoPath = path.join(__dirname, '../public/uploads', settings.siteLogo);
                fs.unlinkSync(logoPath);
            }
            siteLogo = '';
        }

        const settings = await Settings.findOneAndUpdate(
            {},
            { siteName, siteFooter, adminEmail, siteLogo },
            { new: true, upsert: true }
        );
        res.redirect('/admin/settings');
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};





module.exports = { allUser, addUserPage, addUser, updateUserPage, updateUser, deleteUser, adminLogin, loginPage, logout, dashboard, settings, saveSettings }
