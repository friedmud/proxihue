'use strict';

let huejay = require('huejay');
let config = require('./config')

let user = new config.client.users.User;

// Optionally configure a device type / agent on the user
user.deviceType = 'proxihue'; // Default is 'huejay'

config.client.users.create(user)
  .then(user => {
    console.log(`New user created - Username: ${user.username}`);
  })
  .catch(error => {
    if (error instanceof huejay.Error && error.type === 101) {
      return console.log(`Link button not pressed. Try again...`);
    }

    console.log(error.stack);
  });
