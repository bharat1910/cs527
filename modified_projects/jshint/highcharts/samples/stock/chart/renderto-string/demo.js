/* jshint undef: false, unused: false, asi: true */
/* jshint maxerr:10000 */
$(function() {
	var chart = new Highcharts.Chart({

		chart: {
			renderTo: 'container'
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
