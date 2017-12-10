const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models');
const request = require('request');
var key = require('../config/keys.js');
const saltRounds = 10;

module.exports = (app)=>{
    // sign up - user
    app.post('/signup', (req, res)=>{
        var usertype = req.body.usertype;

        // if user sign up as user
        if (usertype == 'user') {
            // look in database if email registered
            db.User.findAll({
                where: {
                    email: req.body.email
                }
            })
            .then((result)=>{
                // if found matching email
                if (result.length !== 0) {
                    res.send({message: 'Your email is already registered.'});
                }
                // if email not registered
                else {
                    var password = req.body.password;
                    var addressLink = req.body.address.replace(/\s/g, '+');

                    // get user's latitude and longitude
                    request
                    .get('https://maps.googleapis.com/maps/api/geocode/json?address='+ addressLink + '&key=' + key.map, (error, geoResult, body)=>{
                        var bodyObj = JSON.parse(body);
                        var geoLoc = bodyObj.results[0].geometry.location;
                        var geoLat = geoLoc.lat;
                        var geoLng = geoLoc.lng;

                        // encrypt password before saving
                        bcrypt.hash(password, saltRounds, (err, hash)=>{
                            if (err) throw err;
                            
                            // save user's info into database
                            db.User.create({
                                name: req.body.name,
                                email: req.body.email,
                                password: hash,
                                address: req.body.address,
                                phone: req.body.phone,
                                latitude: geoLat,
                                longitude: geoLng
                            })
                            .then((result)=>{
                                var token = jwt.sign({usertype: 'user', id: result.id}, key.secret, {expiresIn: '1h'});
                                var name = result.name;
                                // send token to client
                                res.send({token: token, name: name});
                            });
                        });
                    });
                }
            });
        }
        // if user sign up as shop
        else {
            // look in database if email registered
            db.Shop.findAll({
                where: {
                    email: req.body.email
                }
            })
            .then((result)=>{
                // if found matching email
                if (result.length !== 0) {
                    res.send({message: 'Your email is already registered.'});
                }
                // if email not registered
                else {
                    var password = req.body.password;
                    var addressLink = req.body.address.replace(/\s/g, '+');
                    
                    // get user's latitude and longitude
                    request
                    .get('https://maps.googleapis.com/maps/api/geocode/json?address='+ addressLink + '&key=' + key.map, (error, geoResult, body)=>{
                        var bodyObj = JSON.parse(body);
                        var geoLoc = bodyObj.results[0].geometry.location;
                        var geoLat = geoLoc.lat;
                        var geoLng = geoLoc.lng;

                        // encrypt password before saving
                        bcrypt.hash(password, saltRounds, (err, hash)=>{
                            if (err) throw err;
                            
                            // save user's info into database
                            db.Shop.create({
                                name: req.body.name,
                                email: req.body.email,
                                password: hash,
                                address: req.body.address,
                                phone: req.body.phone,
                                latitude: geoLat,
                                longitude: geoLng
                            })
                            .then((result)=>{
                                var token = jwt.sign({usertype: 'shop', id: result.id}, key.secret, {expiresIn: '1h'});
                                var name = result.name;
                                // send token to client
                                res.send({token: token, name: name});
                            });
                        });
                    });
                }
            });
        }
    });

    // login
    app.post('/login', (req, res)=>{
        var password = req.body.password;

        // search user table for entered email
        db.User.findAll({
            where: {
                email: req.body.email
            }
        })
        .then((user)=>{
            // if email not registered as user
            if (user.length === 0) {
                // look in shop table
                db.Shop.findAll({
                    where: {
                        email: req.body.email
                    }
                }).then((shop)=>{
                    // if email not registered as shop also
                    if (shop.length === 0) {
                        res.status(401).send({message: 'User not found.'});
                    }
                    // if email registered as shop
                    else {
                        var hash = shop[0].password;
                        
                        // compare entered password with saved password
                        bcrypt.compare(password, hash, (err, match)=>{
                            if (err) throw err;
                            
                            if (!match) {
                                res.status(401).send({message: 'Wrong password.'});
                            }
                            else {
                                var id = shop[0].id;
                                var name = shop[0].name;
                                var token = jwt.sign({usertype: 'shop', id: id}, key.secret, {expiresIn: '1h'});

                                // send token to client
                                res.send({token: token, name: name});
                            }
                        });
                    }
                });
            }
            // if email registered as user
            else {
                var hash = user[0].password;

                // compare entered password with saved password
                bcrypt.compare(password, hash, (err, match)=>{
                    if (err) throw err;
                    
                    if (!match) {
                        res.status(401).send({message: 'Wrong password.'});
                    }
                    else {
                        var id = user[0].id;
                        var name = user[0].name;
                        var token = jwt.sign({usertype: 'user', id: id}, key.secret, {expiresIn: '1h'});

                        // send token to client
                        res.send({token: token, name: name});
                    }
                });
            }
        });
    });

    // logout
    app.post('/logout', (req, res)=>{
        res.redirect('/');
    });

    // change password
    app.put('/user', (req, res)=>{
        var token = req.headers.token;
        var newPassword = req.body.password;

        // check if token exists
        if (!token) {
            res.status(401).redirect('/error');
        }
        else {
            // decode token
            jwt.verify(token, key.secret, (err, decoded)=>{
                if (err) {
                    res.status(401).redirect('/error');
                };

                var usertype = decoded.usertype;
                var userId = decoded.id;

                // encrypt password
                bcrypt.hash(newPassword, saltRounds, (errEncrypt, hash)=>{
                    if (errEncrypt) throw errEncrypt;
                    
                    // save encrypted password to user table if user is a user
                    if (usertype == 'user') {
                        db.User.update(
                            {
                                password: hash
                            }, {
                                where: {
                                    id: userId
                                }
                            }
                        )
                        .then((user)=>{
                            res.json(user);
                        });
                    }
                    // save encrypted password to shop table if user is a shop
                    else {
                        db.Shop.update(
                            {
                                password: hash
                            },{
                                where: {
                                    id: userId
                                }
                            }
                        )
                        .then((shop)=>{
                            res.json(shop);
                        });
                    }
                }); 
            });
        }
    });

    // delete account
    app.delete('/user', (req, res)=>{
        var token = req.headers.token;

        // check if token exists
        if (!token) {
            res.status(401).redirect('/error');
        }
        else {
            // decode token
            jwt.verify(token, key.secret, (err, decoded)=>{
                if (err) {
                    res.status(401).redirect('/error');
                };

                var usertype = decoded.usertype;
                var userId = decoded.id;

                if (usertype == 'user') {
                    db.User.destroy({
                        where: {
                            id: userId
                        }
                    })
                    .then((confirm)=>{
                        res.json(confirm);
                    })
                }
                else {
                    db.Shop.destroy({
                        where: {
                            id: userId
                        }
                    })
                    .then((confirm)=>{
                        res.json(confirm);
                    });
                }
            });
        }
    });

    // authenticate user
    app.post('/auth/:name', (req, res)=>{
        var token = req.headers.token;

        if (!token) {
            res.status(401).redirect('/error');
        }
        else {
            // res.redirect('/user/' + token);
            // check if token exists
            if (!token) {
                res.status(401).redirect('/error');
            }
            else {
                // decode token
                jwt.verify(token, key.secret, (err, decoded)=>{
                    if (err) {
                        res.status(401).redirect('/error');
                    };

                    var usertype = decoded.usertype;

                    // user is a user
                    if (usertype == 'user') {
                        db.User.findAll({
                            where: {
                                id: decoded.id
                            }
                        })
                        .then((user)=>{
                            var userName = user[0].name;
                            var userLat = user[0].latitude;
                            var userLong = user[0].longitude;
                            var userObj = {
                                name: userName,
                                latitude: userLat,
                                longitude: userLong,
                            };

                            res.render('user', userObj);
                        });
                    }
                    // user is a shop
                    else {
                        db.Shop.findAll({
                            where: {
                                id: decoded.id
                            }
                        })
                        .then((shop)=>{
                            var shopName = shop[0].name;
                            var shopLat = shop[0].latitude;
                            var shopLong = shop[0].longitude;
                            var userObj = {
                                name: shopName,
                                latitude: shopLat,
                                longitude: shopLong,
                            };

                            res.render('user', userObj);
                        });
                    }
                });
            }
        }
    });

    // handle map request
    app.get('/map', (req, res)=>{
        var token = req.headers.token;
        
        // check if token exists
        if (!token) {
            res.status(401).redirect('/error');
        }
        else {
            // decode token
            jwt.verify(token, key.secret, (err, decoded)=>{
                if (err) {
                    res.status(401).redirect('/error');
                };

                var usertype = decoded.usertype;

                // user is a user
                if (usertype == 'user') {
                    db.Shop.findAll({})
                    .then((shops)=>{
                        res.json(shops)
                    });
                }
                else {
                    db.User.findAll({})
                    .then((users)=>{
                        res.json(users)
                    });
                }
            });
        }
    });
};