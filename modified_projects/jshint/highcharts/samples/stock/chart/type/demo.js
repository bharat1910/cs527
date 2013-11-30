/* jshint undef: false, unused: false, asi: true */
/* jshint maxerr:10000 */
$(function() {
	$('#container').highcharts('StockChart', {
	    title: {
	    	text: 'chart.type is set to \'areaspline\''
	    },
	    chart: {
	        type: 'areaspline'
	    },

	    rangeSelector: {
	    	selected: 1
	    },

	    series: [{
	        name: 'USD to EUR',
	        data: usdeur,
	        threshold: null // default is 0
	    }]
	});
});
