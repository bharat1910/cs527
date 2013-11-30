/* jshint undef: false, unused: false, asi: true */
/* jshint maxerr:10000 */
$(function() {
	$('#container').highcharts('StockChart', {
	    
	    chart: {
	    },
	    
	    tooltip: {
	    	backgroundColor: 'white',
	    	borderWidth: 0,
	    	borderRadius: 0,
	    	headerFormat: '{point.key} ',
	    	pointFormat: ' | <span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b>',
	    	positioner: function () {
	    		return { x: 10, y: 35 };
	    	},
	    	shadow: false
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
