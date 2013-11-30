/* jshint undef: false, unused: false, asi: true */
/* jshint maxerr:10000 */
var SplineChartMemoryTest = TestCase("SplineChartMemoryTest");

SplineChartMemoryTest.prototype = new ChartMemoryTest();

/**
 * Returns the configuration for the charts that we test.
 */
SplineChartMemoryTest.prototype.getConfig = function () {
	return {
		chart: {
			type: 'spline'
		},

		series: [{
			data: this.randomData(20)
		}]
	};
};

