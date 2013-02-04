# AngularJS-Scope.onReady

This is a helper file to provide support for $scope.onReady and $scope.$whenReady commands within your angularJS application.


## About

AngularJS will execute your template HTML and the controller at the same time when a view is accessed. This means that if you
have to make a HTTP call within your controller and your template relies on that data (plugins, page rendering, etc...) then
you will have to make your directives **wait** until the data is there. The code required to get this to work is messy and can
be redundant if you have to do it each time for each page and directive.

Luckily there's a plugin for that.


## Installation

Very simple, first download the plugin and place it somewhere within your application directory and then
just include it as a dependency for your application module.

```javascript
var App = angular.module('MY_APP', ['Scope.onReady']);
```

Then the methods will be available to every scope in your application.


## Usage

```javascript
//first set this in your controller
$scope.$prepareForReady();

//then set this when you have fetched all your data in your controller
$scope.$onReady();

//or if fails somehow and you need to instruct all your directives about it
$scope.$onFailure();

//this will inform you if it is ready
$scope.$isReady(); //true or false

//this will let you know if there are any events set
$scope.$hasReadyEvents(); //true or false

//then inside any of your directives within your template you can do this
$scope.$whenReady(function() {
  //this will fire automatically after the $onReady() method is fired.
  //this is useful for when you have directives that rely on your template
  //data to be present prior to the directives doing their thing.
});
```


## Example

Here's a better example of it's usage
```javascript
//your controller
var Ctrl = function($scope, $http) {
  $scope.$prepareForReady();
  $http.get('/some.json')
    .success(function(json) {
      var someArgs = ['success'];
      $scope.$onReady(someArgs);
    })
    .error(function() {
      var someArgs = ['failure'];
      $scope.$onFailure(someArgs);
    });
};

//your directive
module.directive('myDirective', function() {

  return function($scope, element, attrs, controller) {
    $scope.$whenReady(
      function(someArgs) { //called when $scope.$onReady() is run
        element.html('your data was loaded fine');
      },
      function(someArgs) { //called when $scope.$onFailure() is run
        element.html('something went wrong when fetching the data');
      }
    );
  };

});
```


## What about if I do not use **$prepareForReady()** in my controller?

Simple. Your directives will automatically assume that your scope is ready and will fire with success right away.

Use the **$prepareForReady()** at the top of each controller that you expect to fetch data from the server. Also for the directives
that do not have to wait for the data then you do not have to use **$whenReady()**.

If **$onReady()** or **$onFailure()** is called and **$prepareForReady()** was not called at the top of the controller then
both methods will still work fine. Keep in mind that if you do not prepare anything then the plugin will fire your onSuccess
callback right away (onFailure is ignored when not prepared).


## More Information

Please visit the link below to read more about this issue:

http://www.yearofmoo.com/2012/10/more-angularjs-magic-to-supercharge-your-webapp.html#how-to-make-sure-your-directives-are-run-after-your-scope-is-ready
