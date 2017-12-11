const express = require('express');
const bParse = require('body-parser');
const eHandle = require('express-handlebars');
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
    // create some default shops
    db.Shop.bulkCreate([
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
    db.User.bulkCreate([
        {
            name: 'Nat Geo',
            email: 'nat@example.com',
            password: 'passnat',
            address: '1145 17th St NW, Washington, DC 20036',
            phone: '2028577700',
            latitude: 38.9017561,
            longitude: -77.0339626
        },
        {
            name: 'Smith Post',
            email: 'smith@example.com',
            password: 'passsmith',
            address: '2 Massachusetts Ave NE, Washington, DC 20002',
            phone: '2026335555',
            latitude: 38.8952824,
            longitude: -77.0197608
        },
        {
            name: 'Albert Einstein',
            email: 'a;bert@example.com',
            password: 'passalbert',
            address: '2101 Constitution Ave NW, Washington, DC 20418',
            phone: '2023342000',
            latitude: 38.8930845,
            longitude: -77.0477411
        }
    ]);
    
    app.listen(PORT, ()=>{
        console.log('Pet Shop Buddies listening on port ' + PORT);
    });
});