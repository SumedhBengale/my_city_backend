// authMiddleware.js
const passport = require('passport');
const axios = require('axios');

const requireAuth = passport.authenticate('jwt', { session: false, });

const verifyEmailMSG91 = (userName, email, verificationToken) => {
  const verificationLink = `${process.env.AWS_URL}verify-email/${verificationToken}`;
  const options = {
    method: 'POST',
    url: 'https://control.msg91.com/api/v5/email/send',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authkey: process.env.MSG91_AUTH_KEY
    },
    data: {
      recipients: [
        {
          to: [{ name: userName, email: email }],
          variables: { company_name: 'My City Residences', otp: verificationLink }
        },
      ],
      from: { name: 'Sumedh Bengale', email: process.env.MSG91_EMAIL },
      domain: process.env.MSG91_DOMAIN,
      template_id: 'global_otp'
    }
  }
  axios
    .request(options)
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.error(error);
    });


  axios
    .request(options)
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.error(error);
    });
}

module.exports = { requireAuth, verifyEmailMSG91 };
