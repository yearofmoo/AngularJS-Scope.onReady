angular.injector().invoke(function($rootScope) {

  //this is the special key that tells the scope when it's ready
  var successKey  = '_scope_success';
  var readyKey    = '_scope_ready';

  //this is set as the default just incase you forget to call $scope.$prepareForReady() in your controller
  $rootScope[successKey] = true;
  $rootScope[readyKey] = true;

  //this is just here for code reuse
  var cleanUp = function($scope) {
    $scope.defer = null;
    $scope.promise = null;
  };

  //you will need to call this first at the top of the controller
  $rootScope.$prepareForReady = function($q) {
    $q = $q || angular.injector().get('$q');
    cleanUp(this);
    this[successKey] = null;
    this[readyKey] = false;
    this.$q = $q;
  }

  //this is used within each directive
  $rootScope.$whenReady = function(success, fail) {
    fail = fail || function() { }; //just incase this is not set
    if(this[readyKey]) { //this means it's already ready
      this[successKey] ? success() : fail();
    }
    else { //this means it needs to wait for the controller to complete it's job
      if(!this.promise) {
        if(!this.defer) {
          this.defer = this.$q.defer();
        }
        this.promise = this.defer.promise;
      }
      this.promise = this.promise.then(success, fail);
    }
  };

  //this is called in your controller when all your data is ready
  $rootScope.$onReady = function() {
    if(this.defer) {
      this.defer.resolve();
    }
    cleanUp(this);
    this[successKey] = true;
    this[readyKey] = true;
  };

  //this is called in your controller when there is a failure of somesort
  $rootScope.$onFailure = function() {
    if(this.defer) {
      this.defer.reject();
    }
    cleanUp(this);
    this[successKey] = false;
    this[readyKey] = true;
  };

});
