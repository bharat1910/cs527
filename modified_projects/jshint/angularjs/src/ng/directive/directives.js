/* jshint undef: false, unused: false, asi: true */
/* jshint maxerr:10000 */
'use strict';

function ngDirective(directive) {
  if (isFunction(directive)) {
    directive = {
      link: directive
    };
  }
  directive.restrict = directive.restrict || 'AC';
  return valueFn(directive);
}
