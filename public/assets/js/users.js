// display google map
function initMap(data) {
    $.ajax({
        url: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAQRPht-fE8RI3ZmfR6ckJ9rwW8WRPok8I',
        method: 'GET',
        dataType: 'jsonp',
        cache: false, 
    })
    .done(()=>{
        // get lat long of current user
        var myLat = parseFloat($('.myPlace').data('lat'));
        var myLong = parseFloat($('.myPlace').data('long'));
        var myPlace = {lat: myLat, lng: myLong};
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 13,
            center: myPlace
        });

        // display user's location on map with marker
        var marker = new google.maps.Marker({
            icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
            animation: google.maps.Animation.DROP,
            position: myPlace,
            map: map
        });

        // loop through data received from the server, display on map with markers
        for (var i = 0; i < data.length; i++) {
            var coorLat = data[i].latitude;
            var coorLng = data[i].longitude; 
            var latLng = new google.maps.LatLng(coorLat,coorLng);
            var marker = new google.maps.Marker({
                icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                animation: google.maps.Animation.DROP,
                position: latLng,
                map: map
            });
            var contentString = '<p>Name: ' + data[i].name + '</p>';
            contentString += '<p>Address: ' + data[i].address + '</p>';
            contentString += '<p>Phone: ' + data[i].phone + '</p>';
            var infowindow = new google.maps.InfoWindow({
                content: contentString
            });
            
            google.maps.event.addListener(marker,'click', (function(marker, infowindow){ 
                return function() {
                   infowindow.open(map, marker);
                };
            })(marker, infowindow));
        }
    });
}

// prepare user's info
function prepareUser(type) {
    var name = $('.name-signup').val().trim();
    var email = $('.email-signup').val().trim();
    var password = $('.password-signup').val().trim();
    var address = $('.address-signup').val().trim();
    var phone = $('.phone-signup').val().trim();

    // check if any field is left empty
    if (!name || !email || !password || !address || !phone) {
        message = 'All fields are required.';
        $('.signup-notice').html('<div class="alert alert-danger" role="alert">' + message + '</div>');
        return;
    }
    // if all fields are filled
    else {
        signUser(type, name, email, password, address, phone);
    }
}

// send request to save user to database
function signUser(type, name, email, password, address, phone) {
    // create new user object with details
    var newUser = {
        usertype: type,
        name: name,
        email: email,
        password: password,
        address: address,
        phone: phone
    };

    // send signup request with new user's details
    $.ajax({
        url: '/signup',
        method: 'POST',
        data: newUser,
        error: (err)=>{
            message = err.responseJSON.message;
            $('.signup-notice').html('<div class="alert alert-danger" role="alert">' + message + '</div>');
        }
    })
    .done((authData)=>{
        authUser(authData);
    });
}

// send request to authenticate user
function authUser(data) {
    // save token to localstorage
    localStorage.setItem('token', data.token);

    var token = localStorage.getItem('token'); // get token from localstorage
    var tokenObj = {
        token: token
    };
    var name = data.name.replace(/\s/g,''); // remove spaces from user's name

    // send user's authentication request to server
    $.ajax({
        url: '/auth/' + name,
        method: 'POST',
        headers: tokenObj
    })
    .done((content)=>{
        // window.location.replace('/user/' + name);

        $('body').html(content);
        $.ajax({
            url: '/map',
            method: 'GET',
            headers: tokenObj
        })
        .done((userOnMap)=>{
            initMap(userOnMap);
        });
    });
}

$(()=>{
    var message = '';

    // open login box
    $('.link-login').on('click', ()=>{
        $('.user-account').show();
        $('.logIn').show();
        $('.signUp').hide();
    });

    // open signup box
    $('.link-signup').on('click', ()=>{
        $('.user-account').show();
        $('.logIn').hide();
        $('.signUp').show();
        $('.btn-signup-shop').hide();
    });

    // show user from
    $('.btn-user').on('click', ()=>{
        // switch button colours
        $('.btn-user').attr('class', 'btn btn-primary btn-user');
        $('.btn-shop').attr('class', 'btn btn-secondary btn-shop');
        // show signup form to user
        $('.signUp').show();
        // show the right sign up button
        $('.btn-signup-user').show();
        $('.btn-signup-shop').hide();
        // switch form title
        $('.user-title').show();
        $('.shop-title').hide();
    });

    // show shop form
    $('.btn-shop').on('click', ()=>{
        // switch button colours
        $('.btn-user').attr('class', 'btn btn-secondary btn-user');
        $('.btn-shop').attr('class', 'btn btn-primary btn-shop');
        // show signup form for shop
        $('.signUp').show();
        // show the right sign up button
        $('.btn-signup-user').hide();
        $('.btn-signup-shop').show();
        // switch form title
        $('.user-title').hide();
        $('.shop-title').show();
    });

    // sign up as user
    $('.btn-signup-user').on('click', (e)=>{
        e.preventDefault();
        prepareUser('user');
    });
       
    // sign up as shop
    $('.btn-signup-shop').on('click', (e)=>{
        e.preventDefault();
        prepareUser('shop');
    });

    // log in
    $('.btn-login').on('click', (e)=>{
        e.preventDefault();

        var user = {
            email: $('.email-login').val().trim(),
            password: $('.password-login').val().trim()
        };

        $.ajax({
            url: '/login',
            method: 'POST',
            data: user,
            headers: {
                'Authorization': 'Basic ' + btoa(user.email + ':' + user.password)
            },
            error: (err)=>{
                message = err.responseJSON.message;
                $('.login-notice').html('<div class="alert alert-danger" role="alert">' + message + '</div>');
            }
        })
        .done((authData)=>{
            authUser(authData);
        });
    });

    // logout
    $('.link-logout').on('click', ()=>{

        // send request to logout
        $.ajax({
            url: '/logout',
            method: 'POST'
        })
        .done((content)=>{
            $('body').html(content);
        });
    });

    // change password
    $('.link-setting').on('click', ()=>{
        $('.user-setting').toggle();
    });

    // save new password
    $('.btn-save-password').on('click', (e)=>{
        e.preventDefault();

        var newPassword = $('.password-new1').val().trim();
        var confirmPassword = $('.password-new2').val().trim();

        // if entered passwords don't match
        if (newPassword !== confirmPassword) {
            $('.change-password-notice').html('<div class="alert alert-danger" role="alert">The passwords you entered don\'t match.</div>');
        }
        // if entered passwords match
        else {
            var token = localStorage.getItem('token'); // get token from localstorage
            var tokenObj = {
                token: token
            };
            var newPassObj = {
                password: newPassword
            };
            
            // send request to update password
            $.ajax({
                url: '/user',
                method: 'PUT',
                data: newPassObj,
                headers: tokenObj,
                error: (err)=>{
                    message = err.responseJSON.message;
                    $('.login-notice').html('<div class="alert alert-danger" role="alert">' + message + '</div>');
                }
            })
            .done((newpass)=>{
                $('.change-password-notice').html('<div class="alert alert-success" role="alert">Your new password has been successfully saved.</div>');
            })
        }
    });

    // delete account
    $('.btn-delete-account').on('click', ()=>{
        $('.btn-delete-account').hide();
        $('.confirm-delete').show();
    });

    // confirm delete account
    $('.btn-confirm-delete-account').on('click', ()=>{
        var token = localStorage.getItem('token'); // get token from localstorage
        var tokenObj = {
            token: token
        };
        var deleteObj = {
            token: token
        };

        // send delete request
        $.ajax({
            url: '/user',
            method: 'DELETE',
            data: deleteObj,
            headers: tokenObj,
            error: (err)=>{
                message = err.responseJSON.message;
                $('.login-notice').html('<div class="alert alert-danger" role="alert">' + message + '</div>');
            }
        })
        .done((confirm)=>{
            // if get confirm == 1
            if(confirm) {
                // send request to render deleted page
                $.ajax({
                    url: '/deleted',
                    method: 'GET'
                })
                .done((content)=>{
                    $('body').html(content);
                });
            }
            else {
                $('.notice').html('<div class="alert alert-danger" role="alert">There\'s an error. Please try again.</div>');
            }
        });
    });

    // cancel delete account
    $('.btn-cancel-delete-account').on('click', ()=>{
        $('.btn-delete-account').show();
        $('.confirm-delete').hide();
    });
});