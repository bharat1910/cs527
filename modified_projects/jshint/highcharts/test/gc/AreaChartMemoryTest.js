/* jshint undef: false, unused: false, asi: true */
/* jshint maxerr:10000 */
var AreaChartMemoryTest = TestCase("AreaChartMemoryTest");

AreaChartMemoryTest.prototype = new ChartMemoryTest();

/**
 * Returns the configuration for the charts that we test.
 */
AreaChartMemoryTest.prototype.getConfig = function () {
	return {
		chart: {
			type: 'area'
		},

		series: [{
			data: this.randomData(20)
		}]
	};
};

