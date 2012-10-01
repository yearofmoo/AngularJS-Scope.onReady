# AngularJS-Scope.onReady

This is a helper file to provide support for $scope.onReady and $scope.$whenReady commands within your angularJS application.

```javascript
//first set this in your controller
$scope.$prepare($q);

//then inside any of your directives within your template you can do this
$scope.$whenReady(function() {
  //this will fire automatically after the $onReady() method is fired.
  //this is useful for when you have directives that rely on your template
  //data to be present prior to the directives doing their thing.
});

//then set this when you have fetched all your data in your controller
$scope.$onReady();
```

## More Information

This issue and solution is covered in more detail on

http://www.yearofmoo.com
