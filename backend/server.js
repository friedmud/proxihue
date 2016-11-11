'use strict';

// Module Imports
var http = require('http');
let huejay = require('huejay');
var os = require( 'os' );

let config = require('./config');

let client = config.client
let beacon_to_lights = config.beacon_to_lights

//Lets define a port we want to listen to
const PORT=8080;

var users = [];
var user_beacons = [];
var user_brightness = [];

function set_light(light_id, brightness)
{
	console.log("Setting light", light_id, "to", brightness);
	// Convert brightness percent to phillips 0 to 254 scale
	if( brightness > 0 )
	{
		brightness = (brightness / 100.0) * 254.0;
		var hue_brightness = Math.floor(brightness)
		console.log("Hue brightness = ", hue_brightness);
	}

	// Set Brightness using HueJay API
	client.lights.getAll();

	client.lights.getById(light_id)
	.then(light => {
		if( brightness > 0 )
		{
			light.on = true;
			light.brightness = hue_brightness;
			light.transitionTime = 1.0;
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

	// Set all lights in list to a specific brightness
	if( beacon in beacon_to_lights )
	{
		var lights = beacon_to_lights[beacon]
		for( var i = 0; i < lights.length; i++ )
		{
			set_light(lights[i], brightness);
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
	{
	   console.log("Malformed message received! Need user:beacon:brightness");
	   return;
	}

	console.log("Message received:");
	console.log(data);

	var old_beacon = -1;
	var old_brightness = -1;

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
		old_brightness = user_brightness[uid];
		
		user_beacons[uid] = beacon;
		user_brightness[uid] = brightness;
	}

	// If they're still in the same room, with the same
	// brightness then there is nothing to do
	if( old_beacon == beacon && old_brightness == brightness )
		return

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

	// Get current IP address that we are listening on
	var networkInterfaces = os.networkInterfaces( );
	var ip;
	try {
		// This should be correct for wifi connected tessel2
		ip = networkInterfaces.wlan0[0].address;
	} catch (err) {
		// This is if we're running node server on laptop
		ip = "localhost";
	}

	// Inform user where to connect
    console.log("Server listening on: http://%s:%s", ip, PORT);
});
