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
    .done((auth)=>{
        // save token to localstorage
        localStorage.setItem('token', auth.token);

        var userName = newUser.name.replace(/\s/g,''); // remove spaces from user's name
        authUser(userName);
    });
}

// send request to authenticate user
function authUser(name) {
    var token = localStorage.getItem('token'); // get token from localstorage
    var tokenObj = {
        token: token
    };

    // send user's authentication request to server
    $.ajax({
        url: '/auth/' + name,
        method: 'POST',
        headers: tokenObj
    })
    .done((content)=>{
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

    $('.link-login').on('click', ()=>{
        $('.user-account').show();
        $('.logIn').show();
        $('.signUp').hide();
    });

    $('.link-signup').on('click', ()=>{
        $('.user-account').show();
        $('.logIn').hide();
        $('.signUp').show();
        $('.btn-signup-shelter').hide();
    });

    $('.btn-parent').on('click', ()=>{
        // switch button colours
        $('.btn-parent').attr('class', 'btn btn-primary btn-parent');
        $('.btn-shelter').attr('class', 'btn btn-secondary btn-shelter');
        // show signup form to parent
        $('.signUp').show();
        // show the right sign up button
        $('.btn-signup-parent').show();
        $('.btn-signup-shelter').hide();
        // switch form title
        $('.parent-title').show();
        $('.shelter-title').hide();
    });

    $('.btn-shelter').on('click', ()=>{
        // switch button colours
        $('.btn-parent').attr('class', 'btn btn-secondary btn-parent');
        $('.btn-shelter').attr('class', 'btn btn-primary btn-shelter');
        // show signup form for shelter
        $('.signUp').show();
        // show the right sign up button
        $('.btn-signup-parent').hide();
        $('.btn-signup-shelter').show();
        // switch form title
        $('.parent-title').hide();
        $('.shelter-title').show();
    });

    // sign up as parent
    $('.btn-signup-parent').on('click', (e)=>{
        e.preventDefault();
        prepareUser('parent');
    });
       

    // sign up as shelter
    $('.btn-signup-shelter').on('click', (e)=>{
        e.preventDefault();
        prepareUser('shelter');
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
        .done((auth)=>{
            // save token to localstorage
            localStorage.setItem('token', auth.token);
            
            var userName = auth.name.replace(/\s/g,''); // remove spaces from user's name
            var token = localStorage.getItem('token'); // get token from localstorage
            var tokenObj = {
                token: token
            }

            // send user's authentication request to server
            $.ajax({
                url: '/auth/' + userName,
                method: 'POST',
                headers: tokenObj
            })
            .done((content)=>{
                console.log(content);
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

    // change pass-word
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