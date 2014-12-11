Ionic Contrib: Tinder Cards
===================

Swipeable tinder-style cards. Check out the [Demo](http://codepen.io/ionic/pen/nxEdH)

## Usage

Include `ionic.tdcards.js` after the rest of your Ionic and Angular includes. Then use the following AngularJS directives:

```html
<td-cards>
  <td-card ng-repeat="card in cards" on-destroy="cardDestroyed($index)"
   on-swipe-left="cardSwipedLeft($index)" on-swipe-right="cardSwipedRight($index)"
   on-partial-swipe="cardPartialSwipe(amt)" class="card-{{card.index}}" ng-controller="CardCtrl">

    Card content here
  </td-card>
</td-cards>
```

To add new cards dynamically, just add them to the cards array:

```javascript
$scope.cards = [
  { 
    // card 1 
  },
  { 
    // card 2 
  }
];

$scope.addCard = function() {
  var newCard = cardTypes[Math.floor(Math.random() * cardTypes.length)];
  newCard.id = Math.random();
  $scope.cards.push(angular.extend({}, newCard));
}

$scope.cardSwipedLeft = function(index) {
  console.log('LEFT SWIPE');
  $scope.addCard();
};
$scope.cardSwipedRight = function(index) {
  console.log('RIGHT SWIPE');
  $scope.addCard();
};
```



