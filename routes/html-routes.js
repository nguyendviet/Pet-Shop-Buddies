const jwt = require('jsonwebtoken');
const db = require('../models');
var key = require('./keys.js');

module.exports = (app)=>{
    app.get('/', (req, res)=>{
        res.render('index');
    });

    app.get('/user/:token', (req, res)=>{
        var token = req.params.token;

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

                // user is a parent
                if (usertype == 'parent') {
                    db.Parent.findAll({
                        where: {
                            id: decoded.id
                        }
                    })
                    .then((parent)=>{
                        var parentName = parent[0].name;
                        var parentLat = parent[0].latitude;
                        var parentLong = parent[0].longitude;
                        var userObj = {
                            name: parentName,
                            latitude: parentLat,
                            longitude: parentLong,
                        };

                        res.render('user', userObj);
                    });
                }
                // user is a shelter
                else {
                    db.Shelter.findAll({
                        where: {
                            id: decoded.id
                        }
                    })
                    .then((shelter)=>{
                        var shelterName = shelter[0].name;
                        var shelterLat = shelter[0].latitude;
                        var shelterLong = shelter[0].longitude;
                        var userObj = {
                            name: shelterName,
                            latitude: shelterLat,
                            longitude: shelterLong,
                        };

                        res.render('user', userObj);
                    });
                }
            });
        }
    });

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

                // user is a parent
                if (usertype == 'parent') {
                    db.Shelter.findAll({})
                    .then((shelters)=>{
                        res.json(shelters)
                    });
                }
                else {
                    db.Parent.findAll({})
                    .then((parents)=>{
                        res.json(parents)
                    });
                }
            });
        }
    });

    app.get('/error', (req, res)=>{
        res.render('error');
    });

    app.get('/deleted', (req, res)=>{
        res.render('deleted');
    });
};