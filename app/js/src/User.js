angular.module('drawTogether')
.factory('User', function() {
	var user = {};
	
	user.createSocket = function(name) {
		user.socket = new WebSocket("ws://broker.ngsmiths.com?key=demokey&id=" + name + "@" + user.id);
	}
	
	user.setName = function(name) {
		user.name = name;
	}

	user.setColor = function(color) {
		user.color = color;
	}

	user.setRoom = function(room) {
		user.room = "demo-paint-topic-" + room;
		user.roomUri = "tc://" + user.room;
	}

	user.exitRoom = function() {
		user.room = undefined;
	}

	user.setID = function() {
		user.id = uid();
	}


	function uid() {
     var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	}

  return user;
});