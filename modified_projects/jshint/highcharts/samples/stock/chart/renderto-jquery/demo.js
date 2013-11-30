/* jshint undef: false, unused: false, asi: true */
/* jshint maxerr:10000 */
$(function() {
	var chart = new Highcharts.StockChart({    
	    chart: {
	        renderTo: $('#container')[0] 
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
