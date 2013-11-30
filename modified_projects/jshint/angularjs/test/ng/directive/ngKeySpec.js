/* jshint undef: false, unused: false, asi: true */
/* jshint maxerr:10000 */
'use strict';

describe('ngKeyup and ngKeydown directives', function() {
  var element;

  afterEach(function() {
    dealoc(element);
  });

  it('should get called on a keyup', inject(function($rootScope, $compile) {
    element = $compile('<input ng-keyup="touched = true">')($rootScope);
    $rootScope.$digest();
    expect($rootScope.touched).toBeFalsy();

    browserTrigger(element, 'keyup');
    expect($rootScope.touched).toEqual(true);
  }));

  it('should get called on a keydown', inject(function($rootScope, $compile) {
    element = $compile('<input ng-keydown="touched = true">')($rootScope);
    $rootScope.$digest();
    expect($rootScope.touched).toBeFalsy();

    browserTrigger(element, 'keydown');
    expect($rootScope.touched).toEqual(true);
  }));

  it('should get called on a keypress', inject(function($rootScope, $compile) {
    element = $compile('<input ng-keypress="touched = true">')($rootScope);
    $rootScope.$digest();
    expect($rootScope.touched).toBeFalsy();

    browserTrigger(element, 'keypress');
    expect($rootScope.touched).toEqual(true);
  }));

  it('should get called on focus', inject(function($rootScope, $compile) {
    element = $compile('<input ng-focus="touched = true">')($rootScope);
    $rootScope.$digest();
    expect($rootScope.touched).toBeFalsy();

    browserTrigger(element, 'focus');
    expect($rootScope.touched).toEqual(true);
  }));

  it('should get called on blur', inject(function($rootScope, $compile) {
    element = $compile('<input ng-blur="touched = true">')($rootScope);
    $rootScope.$digest();
    expect($rootScope.touched).toBeFalsy();

    browserTrigger(element, 'blur');
    expect($rootScope.touched).toEqual(true);
  }));

});

