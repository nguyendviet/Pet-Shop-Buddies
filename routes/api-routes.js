const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models');
var key = require('./keys.js');
const saltRounds = 10;

module.exports = (app)=>{
    // sign up - parent
    app.post('/signup', (req, res)=>{
        var usertype = req.body.usertype;

        // if user sign up as parent
        if (usertype == 'parent') {
            // look in database if email registered
            db.Parent.findAll({
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
                    
                    // encrypt password before saving
                    bcrypt.hash(password, saltRounds, (err, hash)=>{
                        if (err) throw err;
                        
                        // save user's info into database
                        db.Parent.create({
                            name: req.body.name,
                            email: req.body.email,
                            password: hash,
                            address: req.body.address,
                            phone: req.body.phone,
                            cat: req.body.cat,
                            dog: req.body.dog,
                            longitude: req.body.longitude,
                            latitude: req.body.latitude
                        })
                        .then((result)=>{
                            var token = jwt.sign({usertype: 'parent', id: result.id}, key.secret, {expiresIn: '1h'});
                            // send token to client
                            res.send({token: token});
                        });
                    });
                }
            });
        }
        // if user sign up as shelter
        else {
            // look in database if email registered
            db.Shelter.findAll({
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
                    
                    // encrypt password before saving
                    bcrypt.hash(password, saltRounds, (err, hash)=>{
                        if (err) throw err;
                        
                        // save user's info into database
                        db.Shelter.create({
                            name: req.body.name,
                            email: req.body.email,
                            password: hash,
                            address: req.body.address,
                            phone: req.body.phone,
                            longitude: req.body.longitude,
                            latitude: req.body.latitude
                        })
                        .then((result)=>{
                            var token = jwt.sign({usertype: 'shelter', id: result.id}, key.secret, {expiresIn: '1h'});
                            // send token to client
                            res.send({token: token});
                        });
                    });
                }
            });
        }
    });

    // login
    app.post('/login', (req, res)=>{
        var password = req.body.password;

        // search parent table for entered email
        db.Parent.findAll({
            where: {
                email: req.body.email
            }
        })
        .then((parent)=>{
            // if email not registered as parent
            if (parent.length === 0) {
                // look in shelter table
                db.Shelter.findAll({
                    where: {
                        email: req.body.email
                    }
                }).then((shelter)=>{
                    // if email not registered as shelter also
                    if (shelter.length === 0) {
                        res.status(401).send({message: 'User not found.'});
                    }
                    // if email registered as shelter
                    else {
                        var hash = shelter[0].password;
                        
                        // compare entered password with saved password
                        bcrypt.compare(password, hash, (err, match)=>{
                            if (err) throw err;
                            
                            if (!match) {
                                res.status(401).send({message: 'Wrong password.'});
                            }
                            else {
                                var id = shelter[0].id;
                                var name = shelter[0].name;
                                var token = jwt.sign({usertype: 'shelter', id: id}, key.secret, {expiresIn: '1h'});

                                // send token to client
                                res.send({token: token, name: name});
                            }
                        });
                    }
                });
            }
            // if email registered as parent
            else {
                var hash = parent[0].password;

                // compare entered password with saved password
                bcrypt.compare(password, hash, (err, match)=>{
                    if (err) throw err;
                    
                    if (!match) {
                        res.status(401).send({message: 'Wrong password.'});
                    }
                    else {
                        var id = parent[0].id;
                        var name = parent[0].name;
                        var token = jwt.sign({usertype: 'parent', id: id}, key.secret, {expiresIn: '1h'});

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
                    
                    // save encrypted password to parent table if user is a parent
                    if (usertype == 'parent') {
                        db.Parent.update(
                            {
                                password: hash
                            }, {
                                where: {
                                    id: userId
                                }
                            }
                        )
                        .then((parent)=>{
                            res.json(parent);
                        });
                    }
                    // save encrypted password to shelter table if user is a shelter
                    else {
                        db.Shelter.update(
                            {
                                password: hash
                            },{
                                where: {
                                    id: userId
                                }
                            }
                        )
                        .then((shelter)=>{
                            res.json(shelter);
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

                if (usertype == 'parent') {
                    db.Parent.destroy({
                        where: {
                            id: userId
                        }
                    })
                    .then((confirm)=>{
                        res.json(confirm);
                    })
                }
                else {
                    db.Shelter.destroy({
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
            res.redirect('/user/' + token);
        }
    });
};