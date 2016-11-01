//Lets require/import the HTTP module
var http = require('http');

//Lets define a port we want to listen to
const PORT=8080; 

var users = [];
var user_beacons = [];
var user_brightness = [];

//We need a function which handles requests and send response
function handleRequest(request, response){
    response.end('Message Received');

	// Parse message into useable data
	var data_string = request.url.substring(1, request.url.length);
	var data = data_string.split(":");
	var user =       data[0];
	var beacon =     data[1];
	var brightness = data[2];

	// Ensure message was ok
	if( data.length != 3 )
	   console.log("Malformed message received! Need user:beacon:brightness");	

	// Check if user is known
	var uid = -1;
	for( var i = 0; i < users.length; i++ )
	{
		if(users[i] == user)
		{
			uid = i;
		}
	}

	var old_beacon = -1;

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

	// Check if beacon is in use by another user
	var other_users = [];
	for( var i = 0; i < user_beacons.length; i++ )
	{
		// If beacon found, add to shared list
		if( user_beacons[i] == beacon && i != uid)
		{
			other_users.push(i);
		}
	}	

	// If no other users are using beacon, set lights
	if( other_users.length < 1 )
	{
		// Turn new beacon lights on
		set_lights(beacon, brightness);
		
		// Turn old beacon lights off
		set_lights(beacon, 0);

	}
	// If there are other users sharing that beacon,
	// average out brightness levels
	else
	{
		// Determine avg. brightness for new beacon
		var avg_brightness = brightness;
		for( var i = 0; i < other_users.length; i++ )
		{
			avg_brightness = avg_brightness + user_brightness[other_users[i]];
		}
		var num_users = 1 + other_users.length;
		avg_brightness = avg_brightness / num_users;

		// Turn new beacon lights on
		set_lights(beacon, avg_brightness);

		// Adjust old beacon lights, or turn off

	}

	



	console.log(data);
}

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
});
