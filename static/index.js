var username = null;
        var socket = io();

       $('#sign').click(function(e){
        e.preventDefault();
        username = $("#name").val();
        socket.emit('user_name', $('#name').val());
          $('#name').val('');
        });
       $('#send').click(function(e){
        e.preventDefault();
        socket.emit('chat_message', $('#message').val());
          $('#message').val('');
        });
       $('#clear').click(function(e){
        e.preventDefault();
        $('#messages').empty();
       });
        socket.on('chat_message',function(msg_name,msg){
          $('#messages').append($('<li>').text(msg_name+':'+msg));
        });
        socket.on('user_list',function(name){
          $('#users').append($('<li>').text(name));
        });
        socket.on('remove_user',function(name){
          $('#users').empty();
          $('#users').append($('<li>').text('Users:'));
          socket.emit('get_user');
        });