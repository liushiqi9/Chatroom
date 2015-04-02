var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongodb = require('mongodb');
var mongodbServer = new mongodb.Server('localhost', 27017, { auto_reconnect: true});
var db = new mongodb.Db('mydb', mongodbServer);

io.on('connection', function(socket){
	console.log('a user connected');
	var client_name;
	var time_start=Date.parse(new Date());
	 
    socket.on('user name', function(user_name){
  		console.log('name received');
  		client_name=user_name;

    });
   //   socket.on('history', function(){
  	// 	db.open(function() {
		 //     db.collection('mycoll', function(err, collection) {
		 //        /* Insert a data */
		 //        console.log('at least database');
		 //         collection.find({ username: client_name,timestart:{"$gt":1}}, function(err, data) {
			//             /* Found this People */
			//             if (data) {
			//             	console.log('at least data');
			//                 collection.find({time: {"$gte":data.timestart,"$lte":data.timeend}},{username:1,message:1},function(err,msg){
			//                 io.emit('chat message',msg.username,msg.message);
			//                 console.log('got something');
			//                 console.log(msg.message);
			//                 });
			//             } else {
			//                 console.log('Cannot found');
			//             }
			//         });
		 //       }); 
		 //    });
	 	// }); 


    socket.on('chat message', function(msg){
	 			io.emit('chat message',client_name,msg);
	 		 db.open(function() {
		     db.collection('mycoll', function(err, collection) {
		        /* Insert a data */
		        collection.insert({
		            message: msg,
		            username: client_name,
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
  	 db.collection('mycoll', function(err, collection) {
  	collection.insert({
            username: client_name,
            timestart: time_start,
            timeend: Date.parse(new Date()),
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

http.listen(8080, function(){
  console.log('listening on *:8080');
});