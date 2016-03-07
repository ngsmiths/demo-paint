(function(){
  'use strict';

	angular.module('drawTogether.room', [])
	.controller('RoomCtrl', ['User','$scope', '$location', '$http', Room ]);

	function Room(User, $scope, $location, $http) {

		var socket;

		if (!User.name) { $location.path('/index') }
		else { 
			socket = User.socket;
			
			// Register WebSocket events:
			socket.onopen = function(evt) { onOpen(evt) };
			socket.onclose = function(evt) { onClose(evt) };
			socket.onmessage = function(evt) { onMessage(evt) };
			socket.onerror = function(evt) { onError(evt) };
			
			if (!User.room) { User.room = decodeURIComponent(decodeURIComponent(window.location.href.split('room/')[1])); } 
			// Send my color selection:
			socket.send(JSON.stringify({type: "COLOR", to: User.roomUri, data: {color: User.color}}));
			// Send PING:
			socket.send(JSON.stringify({type: "PING"}));
		}

		var room = this;
		room.user = User;
		room.lastUser = false;
		room.eraseCursor = false;
		room.users = {};
		room.colors = ['rgb(21,177,240)','rgb(52,173,101)', 'rgb(228,0,121)', 'rgb(247,159,75)', 'rgb(255,242,9)', 'rgb(113,73,151)', 'rgb(41,41,41)', 'rgb(229,0,28)', 'lightgray' ]

		// User exits room if they navigate away from page
		$scope.$on('$destroy', function() {
			socket.send(JSON.stringify({type: "LEAVE-TOPIC", to: User.room, data: {}}))
			delete User.room;
		});

		// Set canvas  defaults
		var canvas = document.getElementById('canvas');
		var ctx = canvas.getContext('2d');
		ctx.fillStyle = "solid";
		ctx.lineWidth = 5;
		ctx.lineCap = "round";
		ctx.strokeStyle = User.color;
		var drawing = false;
		var safariPrevX, safariPrevY;

		/************* DRAWING FUNCTIONS ***************/

		function draw(xFrom, yFrom, xTo, yTo, color) {
			ctx.beginPath(); 
			ctx.strokeStyle = color;
			color === 'lightgray' ? ctx.lineWidth = 80 : ctx.lineWidth = 5;
			ctx.moveTo(xFrom, yFrom);
			ctx.lineTo(xTo, yTo);
			ctx.stroke();
			ctx.closePath();
		}

		canvas.addEventListener('mousedown', function(e) {
		  drawing = true;
		  if (/Safari/.test(navigator.userAgent)) {
			  safariPrevX = e.layerX;
			  safariPrevY = e.layerY;
			}
		  draw(e.layerX-1, e.layerY, e.layerX, e.layerY, User.color);
		  
		  socket.send(JSON.stringify({type: "DRAW", to: User.roomUri, data: {x: e.layerX, y: e.layerY, x1: e.layerX-1, y1: e.layerY, color: User.color}}));
		})

		window.addEventListener('mouseup', function(e) {
		  drawing = false;
		})

		canvas.addEventListener('mousemove', function(e) {
			e.preventDefault();
		  if (drawing) {
				var X, Y, X1, Y1, movementX, movementY;
		  	if (/Firefox/.test(navigator.userAgent)) {
					movementX = e.mozMovementX;
					movementY = e.mozMovementY;
		  	} else if (/Chrome/.test(navigator.userAgent)) {
					movementX = e.movementX;
					movementY = e.movementY;
		  	} else if (/Safari/.test(navigator.userAgent)) {
					movementX = e.layerX - safariPrevX;
					movementY = e.layerY - safariPrevY;
					safariPrevX = e.layerX;
					safariPrevY = e.layerY;
		  	}
		  	X1 = e.layerX - movementX;
		  	Y1 = e.layerY - movementY;
		    X = e.layerX;
		    Y = e.layerY;
		    draw(X1, Y1, X, Y, User.color);
		    socket.send(JSON.stringify({type: "DRAW", to: User.roomUri, data: {x: X, y: Y, x1: X1, y1: Y1, color: User.color}}));
		  }
		});

		room.setColor = function(color) {
			User.setColor(color);
			color === 'lightgray' ? room.eraseCursor = true : room.eraseCursor = false;
			socket.send(JSON.stringify({type: "COLOR", to: User.roomUri, data: {color: color}}));
			ctx.strokeStyle = color;
		}

		room.clearCanvas = function() {
			ctx.clearRect (0, 0, canvas.width, canvas.height);
			socket.send(JSON.stringify({type: "CLEAR", to: User.roomUri, data: {}}));
			room.clearSure = false;
		}

		/************* SOCKET LISTENERS *************/
		
		function executeAsync(func) {
			setTimeout(func, 30000);
		}

		function onClose(evt)
		{
			console.log("Disconnected from socket server");
			$location.path('/main/');
		};
		
		function onError(evt)
		{
			console.log("Disconnected from socket server due to error");
			$location.path('/main/');
		}

		function onMessage(evt)
		{
			var message = JSON.parse(evt.data);
			
			if (message.type === "MEMBER-JOINED") {
				// Send your color to a guest:
				socket.send(JSON.stringify({type: "COLOR", to: User.roomUri, data: {color: User.color}}));
			}
			else if (message.type === "MEMBER-LEFT") {
				// Guest has left:
				delete room.users[message.data.member];
				Object.keys(room.users).length ? room.lastUser = false : room.lastUser = true;
				$scope.$apply();
			}
			else if (message.type === "COLOR") {
				// Get a color from a guest:
				room.users[message.from] = {
					name: message.from.split("@")[0],
					color: message.data.color
				};
				Object.keys(room.users).length ? room.lastUser = false : room.lastUser = true;
				$scope.$apply();
			}
			else if (message.type === "DRAW") {
				draw(message.data.x1, message.data.y1, message.data.x, message.data.y, message.data.color);
			}
			else if (message.type === "CLEAR") {
				ctx.clearRect (0, 0, canvas.width, canvas.height);
			}
			else if (message.type === "PONG") {
				// Schedule new PING:
				executeAsync(function() {
					socket.send(JSON.stringify({type: "PING"}));
				});
			}
		};
	}
})();
