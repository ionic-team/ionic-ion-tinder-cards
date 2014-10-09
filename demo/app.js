// Ionic Starter App, v0.9.20

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ionic.contrib.ui.tinderCards'])


.config(function($stateProvider, $urlRouterProvider) {

})

.controller('CardsCtrl', function($scope, TDCardDelegate) {
  console.log('CARDS CTRL');
  var cardTypes = [
    { image: 'max.jpg' },
/*
    { title: 'Where is this?', image: 'img/pic.png' },
    { title: 'What kind of grass is this?', image: 'img/pic2.png' },
    { title: 'What beach is this?', image: 'img/pic3.png' },
    { title: 'What kind of clouds are these?', image: 'img/pic4.png' }
    */
  ];

  $scope.cards = Array.prototype.slice.call(cardTypes, 0);

  $scope.cardSwipedLeft = function(index) {
    console.log('LEFT SWIPE');
    //$scope.addCard();
  };
  $scope.cardSwipedRight = function(index) {
    console.log('RIGHT SWIPE');
    //$scope.addCard();
  };

  $scope.cardPartialSwipe = function(amt) {
    $scope.leftTextOpacity = {
      'opacity': amt > 0 ? amt : 0
    };
    $scope.rightTextOpacity = {
      'opacity': amt < 0 ? Math.abs(amt) : 0
    };
  };

  $scope.cardDestroyed = function(index) {
    $scope.cards.splice(index, 1);
  };

  $scope.addCard = function() {
    var newCard = cardTypes[Math.floor(Math.random() * cardTypes.length)];
    newCard.id = Math.random();
    $scope.cards.push(angular.extend({}, newCard));
  }
})

.controller('CardCtrl', function($scope, TDCardDelegate) {
  $scope.goAway = function() {
    var card = TDCardDelegate.getSwipebleCard($scope);
    card.swipe();
  };
});
