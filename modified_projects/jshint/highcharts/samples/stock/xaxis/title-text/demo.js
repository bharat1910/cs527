/* jshint undef: true, unused: true */
$(function() {
	$('#container').highcharts('StockChart', {

	    chart: {
	    },

	    xAxis: {
	    	title: {
	    		text: 'This is a Date/time axis'
	    	}
	    },

	    yAxis: {
	    	title: {
	    		text: 'USD to EUR'
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