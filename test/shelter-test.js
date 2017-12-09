var Nightmare = require('nightmare');
var expect = require('chai').expect;

describe('Foster Me - shelter user', function() {
  
    this.timeout(30000);

    it('should signup an animal shelter then logout', (done)=>{
        Nightmare({show: true})
        .goto('http://localhost:3000/')
        .wait('.link-signup')
        .click('.link-signup')
        .wait(1000 * 2)
        .click('.btn-shelter')
        .type('.name-signup', 'Bark Bark Hotel')
        .type('.email-signup', 'bark@example.com')
        .type('.password-signup', 'shelterone')
        .type('.address-signup', '1910 Sunderland Pl NW, Washington, DC 20036')
        .type('.phone-signup', '2022897591')
        .click('.btn-signup-shelter')
        .wait('.link-logout')
        .scrollTo(500, 0)
        .wait(1000 * 5)
        .click('.link-logout')
        .then(()=>{
            done();
        });
    });

    it('should login as an animal shelter then delete account', (done)=>{
        Nightmare({show: true})
        .goto('http://localhost:3000/')
        .wait('.link-login')
        .click('.link-login')
        .wait(1000 * 2)
        .type('.email-login', 'bark@example.com')
        .type('.password-login', 'shelterone')
        .click('.btn-login')
        .wait('.link-setting')
        .click('.link-setting')
        .wait(1000 * 2)
        .click('.btn-delete-account')
        .wait(1000 * 2)
        .click('.btn-cancel-delete-account')
        .wait(1000 * 2)
        .click('.btn-delete-account')
        .wait(1000 * 2)
        .click('.btn-confirm-delete-account')
        .wait(1000 * 5)
        .then(()=>{
            done();
        });
    });
});
