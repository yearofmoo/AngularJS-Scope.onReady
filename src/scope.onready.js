/**
 * Copyright (C) 2012 by Matias Niemela
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
angular.module('Scope.onReady', []).run(['$rootScope', '$injector', function($rootScope, $injector) {

  //this is the special key that tells the scope when it's ready
  var successKey  = '_scope_success';
  var readyKey    = '_scope_ready';

  //this is set as the default just incase you forget to call $scope.$prepareForReady() in your controller
  $rootScope[successKey] = true;
  $rootScope[readyKey] = true;

  //this is just here for code reuse
  var cleanUp = function($scope) {
    $scope.$q = null;
    $scope.defer = null;
    $scope.promise = null;
  };

  //you will need to call this first at the top of the controller
  $rootScope.$prepareForReady = function($q) {
    cleanUp(this);
    if($q) {
      this.$q = $q;
    }
    this[successKey] = null;
    this[readyKey] = false;
  }

  //this is used within each directive
  $rootScope.$whenReady = function(success, fail) {
    fail = fail || function() { }; //just incase this is not set
    if(this.$isReady()) { //this means it's already ready
      this[successKey] ? success() : fail();
    }
    else { //this means it needs to wait for the controller to complete it's job
      if(!this.promise) {
        if(!this.defer) {
          if(!this.$q) {
            this.$q = $injector.get('$q');
          }
          this.defer = this.$q.defer();
        }
        this.promise = this.defer.promise;
      }
      this.promise = this.promise.then(success, fail);
    }
  };

  //this will inform you if it is ready
  $rootScope.$isReady = function() {
    return !!this[readyKey];
  };

  //this will inform you if there are any events set
  $rootScope.$hasReadyEvents = function() {
    return !!this.promise && !!this.defer;
  };

  //this is called in your controller when all your data is ready
  $rootScope.$onReady = function(args) {
    var $scope = this;
    var C = function() {
      cleanUp($scope);
      $scope[successKey] = true;
      $scope[readyKey] = true;
    };
    if($scope.$hasReadyEvents()) {
      var F = function() {
        $scope.defer.resolve(args);
        C();
      };
      $scope.$$phase ? F() : $scope.$apply(F);
    }
    else {
      C();
    }
  };

  //this is called in your controller when there is a failure of somesort
  $rootScope.$onFailure = function(args) {
    var $scope = this;
    var C = function() {
      cleanUp($scope);
      $scope[successKey] = false;
      $scope[readyKey] = true;
    };
    if($scope.$hasReadyEvents()) {
      var F = function() {
        $scope.defer.reject(args);
        C();
      };
      $scope.$$phase ? F() : $scope.$apply(F);
    }
    else {
      C();
    }
  };

}]);
