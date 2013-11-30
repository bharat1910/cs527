/* jshint undef: false, unused: false, asi: true */
'use strict';

describe('$window', function() {
  it("should inject $window", inject(function($window) {
    expect($window).toBe(window);
  }));
});
