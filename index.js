var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongodb = require('mongodb');
var mongodbServer = new mongodb.Server('localhost', 27017, { auto_reconnect: true});
var db = new mongodb.Db('mydb', mongodbServer);

var storeMessage = function(name,data){
	console.log('message stored');
	db.open(function() {
	db.collection('cappedMessageCollection', function(err, collection) {
        /* Insert a data */
        collection.insert({
        	"name":name, 
        	"data":data,
        });
       }); 
	}); 
};
io.on('connection', function(socket){
	console.log('a user connected');
	var client_name=null;
	var time_start=Date.parse(new Date());
	db.open(function() {
		db.collection('usersCollection', function(err, collection) {
			collection.find({}).toArray(function(err,users){
				users.forEach(function(user){
					socket.emit('user_list',user.name);
					});
				});
			 }); 
		db.collection('cappedMessageCollection', function(err, collection) {
			collection.find({}).toArray(function(err,messages){
				messages.forEach(function(message){
					if (message.name!=client_name)
						{
							socket.emit('chat_message',message.name,message.data);
						}
					});
				});
			 }); 
		}); 
    socket.on('user_name', function(user_name){
  		console.log('name received');
  		if (client_name!=null)
  		{
  			db.collection('usersCollection', function(err, collection) {
			    /* Delete a data */
			    collection.remove({
			        "name":client_name,
			    });
			    }); 
  		}
  		db.open(function() {
  		
		db.collection('usersCollection', function(err, collection) {
	        /* Insert a data */
	        collection.insert({
	            "name":user_name
	        }, function(err, data) {
	            if (data) {
	                client_name=user_name;
	                io.emit('user_list',user_name);
					console.log('CN received');

					
	            } else {
	                socket.emit('chat_message',"System:","the name has been taken");
	            }
	        	});
	       }); 
		});
    }); 


    socket.on('chat_message', function(msg){
 		io.emit('chat_message',client_name,msg);
 		storeMessage(client_name,msg);
 		db.open(function() {
	    db.collection('mycoll', function(err, collection) {
	        /* Insert a data */
	        collection.insert({
	            "message": msg,
	            "username": client_name,
	            "time": Date.parse(new Date()),
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
  	io.emit("remove_user",client_name);
  	db.collection('usersCollection', function(err, collection) {
        /* Delete a data */
        collection.remove({
            "name":client_name,
        });
       }); 
  	db.collection('mycoll', function(err, collection) {
  		collection.insert({
            "username": client_name,
            "timestart": time_start,
            "timeend": Date.parse(new Date()),
        }, function(err, data) {
            if (data) {
                console.log('Successfully Insert');
            } else {
                console.log('Failed to Insert');
            }
        });
  	 });

  });
  socket.on('get_user',function(){
  	db.collection('usersCollection', function(err, collection) {
			collection.find({}).toArray(function(err,users){
				users.forEach(function(user){
					socket.emit('user_list',user.name);
					});
				});
			 }); 
  });

});

http.listen(8080, function(){
  console.log('listening on *:8080');
});