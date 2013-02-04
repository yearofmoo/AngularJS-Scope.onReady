/**
 * Copyright (C) 2013 by Matias Niemela
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
  var successKey  = '__scope_success__';
  var readyKey    = '__scope_ready__';
  var qKey        = '__q__';
  var deferKey    = '__defer__';
  var promiseKey  = '__promise__';

  //this is set as the default just incase you forget to call $scope.$prepareForReady() in your controller
  $rootScope[successKey] = true;
  $rootScope[readyKey] = true;

  //this is just here for code reuse
  var cleanUp = function($scope) {
    $scope[qKey] = null;
    $scope[deferKey] = null;
    $scope[promiseKey] = null;
  };

  //you will need to call this first at the top of the controller
  $rootScope.$prepareForReady = function($q) {
    cleanUp(this);
    if($q) {
      this[qKey] = $q;
    }
    this[successKey] = null;
    this[readyKey] = false;
  }

  //this is used within each directive
  $rootScope.$whenReady = function(success, fail) {
    fail = fail || function() { }; //just incase this is not set
    if((typeof success != 'function') || (typeof fail != 'function')) return;
    if(this.$isReady()) { //this means it's already ready
      this[successKey] ? success() : fail();
    }
    else { //this means it needs to wait for the controller to complete it's job
      if(!this[promiseKey]) {
        if(!this[deferKey]) {
          if(!this[qKey]) {
            this[qKey] = $injector.get('$q');
          }
          this[deferKey] = this[qKey].defer();
        }
        this[promiseKey] = this[deferKey].promise;
      }
      var $q = this[qKey];
      this[promiseKey] = this[promiseKey].then(
        success,
        function(reason) {
          fail();
          return $q.reject(reason);
        }
      );
    }
  };

  //this will inform you if it is ready
  $rootScope.$isReady = function() {
    return this[readyKey] ? true : false;
  };

  //this will inform you if there are any events set
  $rootScope.$hasReadyEvents = function() {
    return this[promiseKey] && this[deferKey] ? true : false;
  };

  //this is called in your controller when all your data is ready
  $rootScope.$onReady = function(args) {
    var $scope = this;
    if($scope.$isReady()) return;
    var C = function() {
      cleanUp($scope);
      $scope[successKey] = true;
      $scope[readyKey] = true;
    };
    if($scope.$hasReadyEvents()) {
      var F = function() {
        $scope[deferKey].resolve(args);
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
    if($scope.$isReady()) return;
    var C = function() {
      cleanUp($scope);
      $scope[successKey] = false;
      $scope[readyKey] = true;
    };
    if($scope.$hasReadyEvents()) {
      var F = function() {
        $scope[deferKey].reject(args);
        C();
      };
      $scope.$$phase ? F() : $scope.$apply(F);
    }
    else {
      C();
    }
  };

}]);
