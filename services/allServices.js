const express = require('express');

exports.dotenv = require('dotenv').config();

exports.isAuthorized = (req, res, next) => {
    try {
        var apikey = req.headers['apikey']
        if (apikey == process.env.API_KEY) {
            next();
        }
        else {
            res.send({
                "code": 300,
                "message": "Authorization Failed..!"
            });
        }
    } catch (error) {
        res.send({
            "code": 400,
            "message": "Server not found..."
        });
    }
}

exports.isHasToken = (req, res, next) => {
    let bearerHeader = req.headers['token'];
    if (typeof bearerHeader !== 'undefined') {
        jwt.verify(bearerHeader, process.env.SECRET, (err, authData) => {
            if (err) {
                res.send({
                    'code': 400,
                    'message': 'Invalid token'
                });
            }
            else {
                req.authData = authData;
                next();
            }
        });
    }
    else {
        res.send({
            'code': 400,
            'message': 'Authorization Failed..!'
        });
    }
}