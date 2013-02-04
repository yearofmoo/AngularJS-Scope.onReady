describe("Testing AngularJS Scope.onReady", function() {

  beforeEach(module('Scope.onReady'));

  var $scope;
  beforeEach(inject(function($rootScope) {
    $scope = $rootScope.$new();
  }));

  afterEach(function() {
    $scope.$destroy();
  });

  describe("Testing Functions", function() {

    it("should contain an $whenReady method", function() {
      expect($scope.$whenReady).to.be.a('function');
    });

    it("should contain an $onReady method", function() {
      expect($scope.$onReady).to.be.a('function');
    });

    it("should contain an $onFailure method", function() {
      expect($scope.$onFailure).to.be.a('function');
    });

    it("should contain an $prepareForReady method", function() {
      expect($scope.$prepareForReady).to.be.a('function');
    });

    it("should contain an $isReady method", function() {
      expect($scope.$isReady).to.be.a('function');
    });

    it("should contain an $hasReadyEvents method", function() {
      expect($scope.$hasReadyEvents).to.be.a('function');
    });

  });

  describe("Testing Behaviour", function() {

    var $q;
    beforeEach(inject(['$q',function(q) {
      $q = q;
    }]));

    it("should prepare an event when functions are added", function() {
      $scope.$prepareForReady();
      expect($scope.$hasReadyEvents()).to.equal(false);
      $scope.$whenReady(
        function() { },
        function() { }
      );
      expect($scope.$hasReadyEvents()).to.equal(true);
    });

    it("should fire success when onReady", function(done) {
      $scope.$prepareForReady();
      $scope.$whenReady(done);
      $scope.$onReady();
    });

    it("should fire success when onReady and $q is custom", function(done) {
      $scope.$prepareForReady($q);
      $scope.$whenReady(done);
      $scope.$onReady();
    });

    it("should fire failure when onFailure", function(done) {
      $scope.$prepareForReady();
      $scope.$whenReady(function() {}, done);
      $scope.$onFailure();
    });

    it("should fire failure when onFailure and q is custom", function(done) {
      $scope.$prepareForReady($q);
      $scope.$whenReady(function() {}, done);
      $scope.$onFailure();
    });

    it("should have ready events when added", function() {
      $scope.$prepareForReady();
      $scope.$whenReady(function() {});
      expect($scope.$hasReadyEvents()).to.equal(true);
    });

    it("should not have ready events if nothing is provided", function() {
      expect($scope.$hasReadyEvents()).to.equal(false);
      $scope.$prepareForReady();
      expect($scope.$hasReadyEvents()).to.equal(false);
      $scope.$prepareForReady(null);
      expect($scope.$hasReadyEvents()).to.equal(false);
      $scope.$prepareForReady(null, null);
      expect($scope.$hasReadyEvents()).to.equal(false);
    });

    it("should not have ready events if only the failure callback is provided", function() {
      expect($scope.$hasReadyEvents()).to.equal(false);
      $scope.$prepareForReady(null, function() {});
      expect($scope.$hasReadyEvents()).to.equal(false);
    });

    it("should not set an event when nothing is provided", function() {
      $scope.$prepareForReady();
      expect($scope.$hasReadyEvents()).to.equal(false);
      $scope.$whenReady();
      expect($scope.$hasReadyEvents()).to.equal(false);
    });

    it("should not set an event when a non-function param is provided", function() {
      $scope.$prepareForReady();
      expect($scope.$hasReadyEvents()).to.equal(false);
      $scope.$whenReady('a');
      expect($scope.$hasReadyEvents()).to.equal(false);
      $scope.$whenReady(1);
      expect($scope.$hasReadyEvents()).to.equal(false);
      $scope.$whenReady([]);
      expect($scope.$hasReadyEvents()).to.equal(false);
      $scope.$whenReady(function() {}, 'a');
      expect($scope.$hasReadyEvents()).to.equal(false);
      $scope.$whenReady(function() {});
      expect($scope.$hasReadyEvents()).to.equal(true);
    });

    it("should not have ready events by default even if prepared", function() {
      $scope.$prepareForReady();
      expect($scope.$hasReadyEvents()).to.equal(false);
    });

    it("should be ready by default", function() {
      expect($scope.$isReady()).to.equal(true);
    });

    it("should not be ready after prepare", function() {
      $scope.$prepareForReady();
      expect($scope.$isReady()).to.equal(false);
    });

    it("should fire instantly when ready", function(done) {
      $scope.$prepareForReady();
      $scope.$onReady();
      $scope.$whenReady(done);
    });

    it("should fire instantly for success if not prepared", function(done) {
      $scope.$whenReady(done);
    });

    it("should not fire instantly for fail if not prepared", function() {
      var bool = false;
      $scope.$whenReady(null, function() {
        bool = true;
      });
      expect(bool).to.equal(false);
    });

    describe("Ordering", function() {

      var counter, inc, succ, response;
      beforeEach(function() {
        succ = function() {};
        response = '';
        counter = 0;
        inc = function() {
          counter++;
        };
      });

      it("should fire all the success events", function(done) {
        $scope.$prepareForReady();
        $scope.$whenReady(inc);
        $scope.$whenReady(inc);
        $scope.$whenReady(inc);
        $scope.$whenReady(function() {
          expect(counter).to.equal(3);
          done();
        });
        $scope.$onReady();
      });

      it("should fire the success events linearly when not prepared", function() {
        $scope.$whenReady(inc);
        expect(counter).to.equal(1);
        $scope.$whenReady(inc);
        expect(counter).to.equal(2);
        $scope.$whenReady(inc);
        expect(counter).to.equal(3);
      });

      it("should fire all the success events in order", function(done) {
        $scope.$prepareForReady();
        $scope.$whenReady(function() {
          response += 'a'
        });
        $scope.$whenReady(function() {
          response += 'b'
        });
        $scope.$whenReady(function() {
          response += 'c'
        });
        $scope.$whenReady(function() {
          expect(response).to.equal('abc');
          done();
        });
        $scope.$onReady();
      });

      it("should fire all the fail events", function(done) {
        $scope.$prepareForReady();
        $scope.$whenReady(succ, inc);
        $scope.$whenReady(succ, inc);
        $scope.$whenReady(succ, inc);
        $scope.$whenReady(succ, function() {
          expect(counter).to.equal(3);
          done();
        });
        $scope.$onFailure();
      });

      it("should fire success for all the fail events linearly when not prepared", function() {
        $scope.$whenReady(succ, inc);
        expect(counter).to.equal(0);
        $scope.$whenReady(succ, inc);
        expect(counter).to.equal(0);
        $scope.$whenReady(succ, inc);
        expect(counter).to.equal(0);
      });

      it("should fire all the fail events in order", function(done) {
        $scope.$prepareForReady();
        $scope.$whenReady(succ, function() {
          response += 'a'
        });
        $scope.$whenReady(succ, function() {
          response += 'b'
        });
        $scope.$whenReady(succ, function() {
          response += 'c'
        });
        $scope.$whenReady(succ, function() {
          expect(response).to.equal('abc');
          done();
        });
        $scope.$onFailure();
      });

    });
  });

});
