"use strict";
let huejay = require('huejay');

let client = new huejay.Client({
  host:     '192.168.1.85',
  port:     80,               // Optional
  username: 'bridgeusername', // Optional
  timeout:  15000,            // Optional, timeout in milliseconds (15000 is the default)
});


let user = new client.users.User;

// Optionally configure a device type / agent on the user
//user.deviceType = 'my_device_type'; // Default is 'huejay'

client.users.create(user)
  .then(user => {
    console.log(`New user created - Username: ${user.username}`);
  })
  .catch(error => {
    if (error instanceof huejay.Error && error.type === 101) {
      return console.log(`Link button not pressed. Try again...`);
    }

    console.log(error.stack);
  });

  console.log(user);