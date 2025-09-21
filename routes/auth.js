const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const fs = require('fs');


const settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));

const generateToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({
                service: { name: settings.service.name, ownerName: settings.service.ownerName },
                api: { author: 'system', version: '1.0', category: 'auth' },
                result: null,
                error: 'Name, email, and password are required'
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                service: { name: settings.service.name, ownerName: settings.service.ownerName },
                api: { author: 'system', version: '1.0', category: 'auth' },
                result: null,
                error: 'User already exists with this email'
            });
        }

        const user = new User({ name, email, password });
        await user.save();

        const token = generateToken(user);

        res.json({
            service: { name: settings.service.name, ownerName: settings.service.ownerName },
            api: { author: 'system', version: '1.0', category: 'auth' },
            result: {
                message: 'Signup successful',
                user: { 
                    id: user._id, 
                    name: user.name, 
                    email: user.email, 
                    accountType: user.accountType,
                    createdAt: user.createdAt
                },
                token,
                apiKey: user.apiKey
            },
            error: null
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            service: { name: settings.service.name, ownerName: settings.service.ownerName },
            api: { author: 'system', version: '1.0', category: 'error' },
            result: null,
            error: 'Server error during signup'
        });
    }
};

const signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                service: { name: settings.service.name, ownerName: settings.service.ownerName },
                api: { author: 'system', version: '1.0', category: 'auth' },
                result: null,
                error: 'Email and password are required'
            });
        }

        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                service: { name: settings.service.name, ownerName: settings.service.ownerName },
                api: { author: 'system', version: '1.0', category: 'auth' },
                result: null,
                error: 'Invalid email or password'
            });
        }

        const token = generateToken(user);

        res.json({
            service: { name: settings.service.name, ownerName: settings.service.ownerName },
            api: { author: 'system', version: '1.0', category: 'auth' },
            result: {
                message: 'Signin successful',
                user: { 
                    id: user._id, 
                    name: user.name, 
                    email: user.email, 
                    accountType: user.accountType,
                    createdAt: user.createdAt
                },
                token,
                apiKey: user.apiKey
            },
            error: null
        });

    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({
            service: { name: settings.service.name, ownerName: settings.service.ownerName },
            api: { author: 'system', version: '1.0', category: 'error' },
            result: null,
            error: 'Server error during signin'
        });
    }
};

const profile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                service: { name: settings.service.name, ownerName: settings.service.ownerName },
                api: { author: 'system', version: '1.0', category: 'auth' },
                result: null,
                error: 'Authentication required'
            });
        }

        const user = await User.findById(req.user._id).select('-password');
        
        res.json({
            service: { name: settings.service.name, ownerName: settings.service.ownerName },
            api: { author: 'system', version: '1.0', category: 'auth' },
            result: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    accountType: user.accountType,
                    apiKey: user.apiKey,
                    createdAt: user.createdAt
                }
            },
            error: null
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({
            service: { name: settings.service.name, ownerName: settings.service.ownerName },
            api: { author: 'system', version: '1.0', category: 'error' },
            result: null,
            error: 'Server error fetching profile'
        });
    }
};

module.exports = { signup, signin, profile, generateToken };