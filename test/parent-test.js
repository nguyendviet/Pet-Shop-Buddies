var Nightmare = require('nightmare');
var expect = require('chai').expect;

describe('Foster Me - parent user', function() {
  
    this.timeout(30000);

    it('should try to login as a wrong username', (done)=>{
        Nightmare({show: true})
        .goto('http://localhost:3000/')
        .wait('.link-login')
        .click('.link-login')
        .wait(1000 * 2)
        .type('.email-login', 'anna@example.com')
        .type('.password-login', 'password1234')
        .click('.btn-login')
        .wait(1000 * 3)
        .then(()=>{
            done();
        });
    });

    it('should singup a foster parent to database, then try to change password but fail, then logout', (done)=>{
        Nightmare({show: true})
        .goto('http://localhost:3000/')
        .wait('.link-signup')
        .click('.link-signup')
        .wait(1000 * 2)
        .click('.btn-parent')
        .type('.name-signup', 'Anna Walker')
        .type('.email-signup', 'anna@example.com')
        .type('.password-signup', 'parentone')
        .type('.address-signup', '607 13th St NW, Washington, DC 20005')
        .type('.phone-signup', '2026377000')
        .click('.btn-signup-parent')
        .wait('.link-logout')
        .scrollTo(500, 0)
        .wait(1000 * 5)
        .click('.link-setting')
        .type('.password-new1', 'anewpassword')
        .type('.password-new2', 'awrongpassword')
        .click('.btn-save-password')
        .wait(1000 * 2)
        .click('.link-logout')
        .then(()=>{
            done();
        });
    });

    it('should log user in and change password successfully then logout', (done)=>{
        Nightmare({show: true})
        .goto('http://localhost:3000/')
        .wait('.link-login')
        .click('.link-login')
        .wait(1000 * 2)
        .type('.email-login', 'anna@example.com')
        .type('.password-login', 'parentone')
        .click('.btn-login')
        .wait('.link-logout')
        .click('.link-setting')
        .type('.password-new1', 'therightpassword')
        .type('.password-new2', 'therightpassword')
        .wait(1000 * 2)
        .click('.btn-save-password')
        .wait(1000 * 2)
        .click('.link-logout')
        .then(()=>{
            done();
        });
    });

    it('should try to sign in with the old password then fail', (done)=>{
        Nightmare({show: true})
        .goto('http://localhost:3000/')
        .wait('.link-login')
        .wait(1000 * 2)
        .click('.link-login')
        .type('.email-login', 'anna@example.com')
        .type('.password-login', 'parentone')
        .click('.btn-login')
        .wait(1000 * 2)
        .then(()=>{
            done();
        });
    });

    it('should log user in with the new password successfully then logout', (done)=>{
        Nightmare({show: true})
        .goto('http://localhost:3000/')
        .wait('.link-login')
        .wait(1000 * 2)
        .click('.link-login')
        .type('.email-login', 'anna@example.com')
        .type('.password-login', 'therightpassword')
        .click('.btn-login')
        .wait('.link-logout')
        .wait(1000 * 2)
        .click('.link-logout')
        .then(()=>{
            done();
        });
    });
});
