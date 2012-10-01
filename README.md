# AngularJS-Scope.onReady

This is a helper file to provide support for $scope.onReady and $scope.$whenReady commands within your angularJS application.

## About

AngularJS will execute your template HTML and the controller at the same time when a view is accessed. This means that if you
have to make a HTTP call within your controller and your template relies on that data (plugins, page rendering, etc...) then
you will have to make your directives **wait** until the data is there. The code required to get this to work is messy and can
be redundant if you have to do it each time for each page and directive.

Luckily there's a plugin for that.

## Usage

```javascript
//first set this in your controller
$scope.$prepareForReady();

//then set this when you have fetched all your data in your controller
$scope.$onReady();

//or if fails somehow and you need to instruct all your directives about it
$scope.$onFailure();


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
      $scope.$onReady();
    })
    .error(function() {
      $scope.$onFailure();
    });
};

//your directive
module.directive('myDirective', function() {

  return {
    link : function($scope, element, attrs, controller) {
      $scope.$whenReady(
        function() { //called when $scope.$onReady() is run
          element.html('your data was loaded fine');
        },
        function() { //called when $scope.$onFailure() is run
          element.html('something went wrong when fetching the data');
        }
      );
    }
  };

});
```

## More Information

This issue and solution is covered in more detail on

http://www.yearofmoo.com
