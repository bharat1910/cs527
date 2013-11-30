/* jshint undef: false, unused: false, asi: true */
/* jshint maxerr:10000 */
'use strict';

/**
 * Generates JSON output into a context.
 */
angular.scenario.output('json', function(context, runner, model) {
  model.on('RunnerEnd', function() {
    context.text(angular.toJson(model.value));
  });
});
