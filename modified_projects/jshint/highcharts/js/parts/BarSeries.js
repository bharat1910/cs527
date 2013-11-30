/* jshint undef: false, unused: false, asi: true */
/* jshint maxerr:10000 */
/**
 * Set the default options for bar
 */
defaultPlotOptions.bar = merge(defaultPlotOptions.column);
/**
 * The Bar series class
 */
var BarSeries = extendClass(ColumnSeries, {
	type: 'bar',
	inverted: true
});
seriesTypes.bar = BarSeries;

