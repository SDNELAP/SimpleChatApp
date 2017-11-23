var express = require('express');
var app = express();
var path = require('path');

var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;



http.listen(3000, function(){
  console.log('Server running on port %d',port);
});

app.use(express.static(path.join(__dirname, 'public')));

var numUsers = 0;

io.on('connection', function(socket){
	var addedUser = false;

	socket.on('new message', function (data) {
    	// we tell the client to execute 'new message'
	    socket.broadcast.emit('new message', {
	      username: socket.username,
	      message: data
	    });
	});

	socket.on('add user', function (username){
		if(addedUser) return;

		socket.username = username;
		++numUsers;
		addedUser = true;

		socket.emit('login', {
			numUsers:numUsers
		});

		socket.broadcast.emit('user joined', {
	      username: socket.username,
	      numUsers: numUsers
	    });

	});

	socket.on('typing', function () {
	    socket.broadcast.emit('typing', {
	      username: socket.username
	    });
	});

	socket.on('stop typing', function () {
	    socket.broadcast.emit('stop typing', {
	      username: socket.username
	    });
	});


	socket.on('disconnect', function () {
	    if (addedUser) {
	      --numUsers;

	      // echo globally that this client has left
	      socket.broadcast.emit('user left', {
	        username: socket.username,
	        numUsers: numUsers
	      });
	    }
    });
  
});
    

