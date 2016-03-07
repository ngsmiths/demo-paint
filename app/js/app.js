'use strict';

angular.module('drawTogether', [
  'ngRoute',
  'drawTogether.main',
  'drawTogether.hall',
  'drawTogether.room'
])
.config(['$routeProvider', function($routeProvider) {
  $routeProvider
    .when('/index', {
      templateUrl: 'views/main.html',
    })
    .when('/hallway', {
      templateUrl: 'views/hallway.html',
      controller: 'HallwayCtrl as hall',
    })
    .when('/room/:id', {
      templateUrl: 'views/room.html',
      controller: 'RoomCtrl as room',
    })
    .otherwise({ redirectTo: '/index' });
}]);