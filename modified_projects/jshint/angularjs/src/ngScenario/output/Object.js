/* jshint undef: false, unused: false, asi: true */
/* jshint maxerr:10000 */
'use strict';

/**
 * Creates a global value $result with the result of the runner.
 */
angular.scenario.output('object', function(context, runner, model) {
  runner.$window.$result = model.value;
});
