'use strict';

let huejay = require('huejay');

let client = new huejay.Client({
  host:     '192.168.1.85',
  port:     80,               // Optional
  username: 'B0noiskmvMoWf1-3MTik8WeZAaAlBwpBFpPHibob', // Optional
  timeout:  15000,            // Optional, timeout in milliseconds (15000 is the default)
});

client.lights.getAll()
  .then(lights => {
    for (let light of lights) {
      console.log(`Light [${light.id}]: ${light.name}`);
      console.log(`  Type:             ${light.type}`);
      console.log(`  Unique ID:        ${light.uniqueId}`);
      console.log(`  Manufacturer:     ${light.manufacturer}`);
      console.log(`  Model Id:         ${light.modelId}`);
      console.log('  Model:');
      console.log(`    Id:             ${light.model.id}`);
      console.log(`    Manufacturer:   ${light.model.manufacturer}`);
      console.log(`    Name:           ${light.model.name}`);
      console.log(`    Type:           ${light.model.type}`);
      console.log(`    Color Gamut:    ${light.model.colorGamut}`);
      console.log(`    Friends of Hue: ${light.model.friendsOfHue}`);
      console.log(`  Software Version: ${light.softwareVersion}`);
      console.log('  State:');
      console.log(`    On:         ${light.on}`);
      console.log(`    Reachable:  ${light.reachable}`);
      console.log(`    Brightness: ${light.brightness}`);
      console.log(`    Color mode: ${light.colorMode}`);
      console.log(`    Hue:        ${light.hue}`);
      console.log(`    Saturation: ${light.saturation}`);
      //console.log(`    X/Y:        ${light.xy[0]}, ${light.xy[1]}`);
      //console.log(`    Color Temp: ${light.colorTemp}`);
      console.log(`    Alert:      ${light.alert}`);
      console.log(`    Effect:     ${light.effect}`);
      console.log();
    }
  });

  client.lights.getById(1)
  .then(light => {
    console.log('Found light:');
    console.log(`  Light [${light.id}]: ${light.name}`);
  })
  .catch(error => {
    console.log('Could not find light');
    console.log(error.stack);
  });

  client.lights.getById(1)
  .then(light => {
    //light.name = 'New light name';

    //light.brightness = 254;
    //light.hue        = 32554;
    //light.saturation = 254;

    light.on = true;

    return client.lights.save(light);
  })
  .then(light => {
    console.log(`Updated light [${light.id}]`);
  })
  .catch(error => {
    console.log('Something went wrong');
    console.log(error.stack);
  });
