'use strict';

// Module Imports
var http = require('http');
let huejay = require('huejay');


//Lets define a port we want to listen to
const PORT=8080; 

// Phillips Hue Bridge Client
let client = new huejay.Client({
  host:     '192.168.1.85',
  port:     80,               // Optional
  username: 'B0noiskmvMoWf1-3MTik8WeZAaAlBwpBFpPHibob', // Optional
  timeout:  15000,            // Optional, timeout in milliseconds (15000 is the default)
});

var users = [];
var user_beacons = [];
var user_brightness = [];

function set_light(light_id, brightness)
{
	console.log("Setting light", light_id, "to", brightness);
	// Convert brightness percent to phillips 0 to 254 scale
	brightness = (brightness / 100.0) * 254.0;
	var hue_brightness = Math.floor(brightness)
	console.log("Hue brightness = ", hue_brightness);

	// Set Brightness using HueJay API
	client.lights.getAll();

	client.lights.getById(light_id)
	.then(light => {
		if( brightness > 1 )
		{
			light.on = true;
			light.brightness = hue_brightness;
		}
		else
		{
			light.on = false;
		}


	return client.lights.save(light);
	})
	.then(light => {
	console.log(`Updated light [${light.id}]`);
	})
	.catch(error => {
	console.log('Something went wrong');
	console.log(error.stack);
	});

}

function set_beacon_lights(beacon, brightness)
{
	console.log("adjusting beacon", beacon, "lights to", brightness);
	
	// Basic one, with zone A being light 1, zone B being light 2
	var beacons = ["A", "B"];
	var lights = [];
	lights.push([1]);
	lights.push([2]);

	// Correlate a beacon to a list of lights
	var beacon_id = -1;
	for( var i = 0; i < beacons.length; i++ )
	{
		if( beacons[i] == beacon )
			beacon_id = i;
	}

	// Set all lights in list to a specific brightness
	if( beacon_id != -1 )
	{
		for( var i = 0; i < lights[beacon_id].length; i++ )
		{
			set_light(lights[beacon_id][i], brightness);
		}
	}
}


//We need a function which handles requests and send response
function handleRequest(request, response){
    response.end('Message Received');

	// Parse message into useable data
	var data_string = request.url.substring(1, request.url.length);
	var data = data_string.split(":");
	var user =       data[0];
	var beacon =     data[1];
	var brightness = parseInt(data[2]);

	// Ensure message was ok
	if( data.length != 3 )
	   console.log("Malformed message received! Need user:beacon:brightness");	

	console.log("Message received:");
	console.log(data);
	
	var old_beacon = -1;

	// Check if user is known
	var uid = -1;
	for( var i = 0; i < users.length; i++ )
	{
		if(users[i] == user)
		{
			uid = i;
		}
	}

	// If it's a new user, add to list
	if( uid == -1 )
	{
		users.push(user);
		user_beacons.push(beacon);
		user_brightness.push(brightness);
		uid = 0;
	}
	// If it's a known user, update their beacon
	else
	{
		old_beacon = user_beacons[uid];
		user_beacons[uid] = beacon;
		user_brightness[uid] = brightness;
	}

	// Adjust new beacon lights
	/////////////////////////////////
	var avg_brightness = 0;
	var num_beacon_users = 0;
	for( var i = 0; i < users.length; i++ )
	{
		if( user_beacons[i] == beacon )
		{
			avg_brightness += user_brightness[i];
			num_beacon_users++;
		}	
	}
	avg_brightness /= num_beacon_users;

	// Set new beacon lights on
	set_beacon_lights(beacon, avg_brightness);

	// Adjust old beacon lights
	/////////////////////////////////
	
	// If this is a new user, don't do anything
	// otherwise, set old beacon to average for its users
	if( old_beacon != -1 )
	{
		var avg_brightness = 0;
		var num_beacon_users = 0;
		for( var i = 0; i < users.length; i++ )
		{
			if( user_beacons[i] == old_beacon )
			{
				avg_brightness += user_brightness[i];
				num_beacon_users++;
			}	
		}
		avg_brightness /= num_beacon_users;

		// Set new beacon lights on
		set_beacon_lights(old_beacon, avg_brightness);
	}

	console.log("State:");
	console.log("usernames:");
	console.log(users);
	console.log("beacon IDs:");
	console.log(user_beacons);
	console.log("brightnesses:");
	console.log(user_brightness);
}

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
});
