/* jshint undef: false, unused: false, asi: true */
/* jshint maxerr:10000 */
$(function() {
	$('#container').highcharts('StockChart', {

	    rangeSelector: {
	    	selected: 1
	    },

	    series: [{
	        name: 'USD to EUR',
	        data: usdeur
	    }]
	});

	$('#button').click(function() {
		var chart = $('#container').highcharts(),
        	series = chart.series[0];
		if (series.visible) {
			series.hide();
		} else {
			series.show();
		}
	});
});
