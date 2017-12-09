const express = require('express');
const bParse = require('body-parser');
const eHandle = require('express-handlebars');
const jwt = require('jsonwebtoken');
// use models to sync data
const db = require('./models');
// set up express
const app = express();
const PORT = process.env.PORT || 3000;

// use express to parse data
app.use(bParse.json());
app.use(bParse.urlencoded({extended: true}));
app.use(bParse.text());
app.use(bParse.json({type: 'application/vnd.api+json'}));
// static directory
app.use(express.static('public'));

// Set Handlebars as the default templating engine
app.engine('handlebars', eHandle({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

require('./routes/api-routes.js')(app);
require("./routes/html-routes.js")(app);

// sync sequelize models
db.sequelize.sync({force: true}).then(()=>{
    // create some default shelters
    db.Shelter.bulkCreate([
        {
            name: 'American Humane',
            email: 'info@americanhumane.org',
            password: 'amehum',
            address: '1400 16th St NW #360, Washington, DC 20036',
            phone: '8002274645',
            latitude: 38.909035,
            longitude: -77.039242
        },
        {
            name: 'City Dogs Rescue & City Kitties',
            email: 'info@citydogsrescuedc.org',
            password: 'citydog',
            address: '2121 Decatur Pl NW #3, Washington, DC 20008',
            phone: '2025677364',
            latitude: 38.9135097,
            longitude: -77.0501535
        },
        {
            name: 'Wagtime',
            email: 'info@wagtimedc.com',
            password: 'wagwag',
            address: '1232 9th St NW, Washington, DC 20001',
            phone: '2027890870',
            latitude: 38.9065657,
            longitude: -77.0265479
        },
        {
            name: 'Humane Rescue Alliance',
            email: 'info@humanerescuealliance.org',
            password: 'humresall',
            address: '1201 New York Ave NE, Washington, DC 20002',
            phone: '2025766664',
            latitude: 38.9135668,
            longitude: -76.9925556
        }
    ]);

    // create some default users
    db.Parent.bulkCreate([
        {
            name: 'Peter Washington',
            email: 'peter@mail.com',
            password: 'peterpass',
            address: '1416 12th St NW, Washington, DC 20005',
            phone: '2022347387',
            cat: false,
            dog: false,
            latitude: 38.9090194,
            longitude: -77.0305502
        },
        {
            name: 'Pandora Angryladies',
            email: 'pan@mail.com',
            password: 'angrypan',
            address: '1536 16th St NW, Washington, DC 20036',
            phone: '2024837382',
            cat: true,
            dog: true,
            latitude: 38.9109778,
            longitude: -77.0390737
        },
        {
            name: 'Adam Morgan',
            email: 'adam@mail.com',
            password: 'adampass',
            address: '2112 18 St NW #1, Washington, DC 20009',
            phone: '2026387470',
            cat: true,
            dog: false,
            latitude: 38.9183334,
            longitude: -77.0440605
        },
        {
            name: 'David Veternari',
            email: 'david@mail.com',
            password: 'davidpass',
            address: '2022 P St NW, Washington, DC 20036',
            phone: '2024662211',
            cat: false,
            dog: true,
            latitude: 38.9094284,
            longitude: -77.0480979
        },
        {
            name: 'Harry Horseman',
            email: 'harry@mail.com',
            password: 'harrypass',
            address: '1000 29th St NW # T100, Washington, DC 20007',
            phone: '2029650500',
            cat: true,
            dog: false,
            latitude: 38.9029249,
            longitude: -77.0604903
        },
        {
            name: 'Cadie Arena',
            email: 'cadie@mail.com',
            password: 'cadiepass',
            address: '601 F St NW, Washington, DC 20004',
            phone: '2026283200',
            cat: false,
            dog: true,
            latitude: 38.898129,
            longitude: -77.0231517
        }
    ]);
    
    app.listen(PORT, ()=>{
        console.log('Foster-Me listening on port ' + PORT);
    });
});