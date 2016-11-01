//Lets require/import the HTTP module
var http = require('http');

//Lets define a port we want to listen to
const PORT=8080; 

var users = [];
var user_beacons = [];
var user_brightness = [];

function set_lights(beacon, brightness)
{
	console.log("adjusting beacon", beacon, "lights to", brightness);
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
	set_lights(beacon, avg_brightness);

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
		set_lights(old_beacon, avg_brightness);
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
