/**
 * Important note: this application is not suitable for benchmarks!

 * all you see is...
 */

var http = require('http')
  , net = require('net')
  , url = require('url')
  , fs = require('fs')
  , io = require('socket.io')
  , sys = require(process.binding('natives').util ? 'util' : 'sys')
  , server;

server = http.createServer(function(req, res){
  // your normal server code
  var path = url.parse(req.url).pathname;
  switch (path){
    case '/':
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write('<h1>Welcome. Try the <a href="/arduino.html">Arduino</a> example.</h1>');
      res.end();
      break;
      
    case '/json.js':
    case '/arduino.html':
      fs.readFile(__dirname + path, function(err, data){
        if (err) return send404(res);
        res.writeHead(200, {'Content-Type': path == 'json.js' ? 'text/javascript' : 'text/html'})
        res.write(data, 'utf8');
        res.end();
      });
      break;
      
    default: send404(res);
  }
}),

send404 = function(res){
  res.writeHead(404);
  res.write('404');
  res.end();
};

server.listen(8090);

//HTTP Socket Connections (living)
var httpGuests = [];

//TCP Socket Connections (undead)
var tcpGuests = [];

//A Socket
var io = io.listen(server)

//for your Buffer					
	, buffer = [];
  
//Connect to the HTTP Server's Socket
io.on('connection', function(client){

	//Send some data back to the client.
	client.send({ 

		//Sync the buffer
		buffer: buffer 

	});
 
	//Broadcast some ish
	client.broadcast.send({ 
	
	//Yeah, you're legit (We're fairly presumptuous)
	announcement: client.sessionId + ', ohhhhhhhhhh bakaw bakaw bakaw' 

  });
  
  //Push the client as a Guest
  httpGuests.push(client);
  
	//When something happens
	client.on('message', function(message){
	
	// Prepare the message for debugging.
	var msg = { message: [client.sessionId, message] };

	// Push the message into the buffer.
	buffer.push(msg);

	//Leaky Pipes
	if (buffer.length > 15) buffer.shift();

	//Send the client a debugging update
	client.broadcast.send(msg);
    
   //For each TCP Connection
	for (g in tcpGuests) {

		//Write a message. 
		tcpGuests[g].write(message);

	}

  });

  //How rude, no goodbye?
  client.on('disconnect', function(){

		//Tell them off.
		client.broadcast.send({ announcement: client.sessionId + ' left the cult.' });

  });

});

//Hey bro, can I interest you in some TCP?
var tcpServer = net.createServer(function (socket) {
 
	//We like to brag.
	console.log('TCP:1337');
	console.log('HTTP:80');

});

tcpServer.on('connection',function(socket){

	//Remind the socket who they're talking to "You talking to me?"
	socket.write('Word, I\'m TCP. Pleasure is all mine I\'m sure.\r\n');

	//Again, we like to brag.
	console.log( tcpServer.connections + ' people are 1337');
    
	//Welcome!
	tcpGuests.push(socket);
    
	//When the TCP connection feels social. 
	socket.on('data',function(data){

		//Jordan's CC number here
		console.log('This just in - ' + data );

		//Verbose.
		socket.write('I got that thing you sent me!\r\n');
        
		//For every blessed being
		for (g in io.clients) {

			//Remind them what they are to me.
			var client = io.clients[g];

			//Yell at them from across the street. 
			client.send({message:["arduino",data.toString('ascii',0,data.length)]});
           
		}
		
	});
	
});

//The walls have ears.
tcpServer.listen(1337);

// ... cryptic revolution.