(function(){
  'use strict';

	angular.module('drawTogether.hall', [])
	.controller('HallwayCtrl', ['User','$scope', '$location', Hallway ]);

	function Hallway(User, $scope, $location) {
		
		if (!User.name) { $location.path('/index'); }
		
		var hall = this;
		var socket = User.socket;
		socket.onclose = function(evt) { onClose(evt) };
		socket.onerror = function(evt) { onError(evt) };
		
		hall.createRoom = function(room) {
			room = cleanInput(room);
			User.setRoom(room);
			// Join topic:
			socket.send(JSON.stringify({type: "JOIN-TOPIC", to: User.room, data: {watch: true}}))
			$location.path('/room/' + encodeURIComponent(room));
		}

		function cleanInput (input) {
		  return $('<div/>').text(input).text();
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
		
	}
})();	