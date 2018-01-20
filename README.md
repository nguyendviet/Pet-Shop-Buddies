# Pet Shop Buddies

## Overview
A full stack app that connects pet owners with pet care services.

### Demo
* Heroku: [Pet Shop Buddies](https://pet-shop-buddies.herokuapp.com/)

<img src="https://media.giphy.com/media/l49JBZW1Y3TSc90RO/giphy.gif" width="800"/>

### Logic
* If user signs up as a pet owner (user), the app will log the user in, show the map with the user as a red marker and nearby pet shops as blue markers, vice versa. 
* Users can click on markers to see each location's information. For pet owners, the locations will be nearby pet shops with names, addresses and phone numbers. For shops, the locations will be nearby pet owners with their information.
* Password is encrypted before being saved to the database and decrypted to check user's input password when signing in.
* User's connections are authenticated with a token (expires after a few hours) generated by the server and the token is decoded each time user makes a request.
* User can change password or delete account. If user deletes account, old notes will be removed from database.

## Installation
After cloning the repo to your local machine, go to its folder and run:
```
$ npm install --save
```
Next, you need to install mysql2 manually, so run:
```
$ npm install --save mysql2
```

## Test
Go to folder /test and run:
```
$ mocha <test-file-name>
```

## Technologies
* MySQL, Express, NodeJS.
* npm: mocha, chai, brcypt, jsonwebtoken, handlebars, body-parser.
* Google Geocoding, jQuery, Bootstrap 4.

## Author
* **Viet Nguyen** - *Solo developer*
* In memory of my cat: Athena (2015 - 2016)
<img src="https://github.com/nguyendviet/Pet-Shop-Buddies/blob/master/public/assets/img/athena.png" width="400"/>
You can read more about her <a href="https://athenacat.blogspot.com/2015/10/athena_4.html">here</a>.

### Disclaimers:
* All default locations (including names, addresses and phone numbers) are public places (museums, animal shelters...). They're for testing purposes.
* I don't claim to have the original idea of making an app that connects pet owners with pet shops or shelters with potential pet owners.