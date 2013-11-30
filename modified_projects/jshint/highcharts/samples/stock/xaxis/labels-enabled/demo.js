/* jshint undef: false, unused: false, asi: true */
/* jshint maxerr:10000 */
$(function() {
	$('#container').highcharts('StockChart', {
		title: {
			text: 'xAxis.labels.enabled = false'
		},
	    xAxis: {
	    	labels: {
	    		enabled: false
	    	}
	    },

	    rangeSelector: {
	    	selected: 1
	    },

	    series: [{
	        name: 'USD to EUR',
	        data: usdeur
	    }]
	});
});
