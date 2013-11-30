/* jshint undef: false, unused: false, asi: true */
/* jshint maxerr:10000 */
'use strict';

describe('$document', function() {


  it("should inject $document", inject(function($document) {
    expect($document).toEqual(jqLite(document));
  }));
});
