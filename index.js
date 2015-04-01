var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongodb = require('mongodb');
var mongodbServer = new mongodb.Server('localhost', 27017, { auto_reconnect: true});
var db = new mongodb.Db('mydb', mongodbServer);

io.on('connection', function(socket){
	console.log('a user connected');
  socket.on('chat message', function(user_name,msg){
  	console.log('message received');
    io.emit('chat message',user_name,msg);
    db.open(function() {
    db.collection('mycoll', function(err, collection) {
        /* Insert a data */
        collection.insert({
            message: msg,
            username: user_name,
            time: Date.parse(new Date()),
        }, function(err, data) {
            if (data) {
                console.log('Successfully Insert');
            } else {
                console.log('Failed to Insert');
            }
        });
       }); 
    });

  });
  socket.on('disconnect',function(){
  	console.log('user disconnect');
  });

});

http.listen(8080, function(){
  console.log('listening on *:8080');
});