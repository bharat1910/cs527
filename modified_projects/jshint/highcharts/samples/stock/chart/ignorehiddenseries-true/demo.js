/* jshint undef: false, unused: false, asi: true */
$(function() {
	$('#container').highcharts('StockChart', {
	    
	    chart: {
	        // ignoreHiddenSeries: true // by default 
	    },
        
	    rangeSelector: {
	    	selected: 1
	    },
	    
	    legend: {
	    	enabled: true
	    },
	    
	    series: [{
	        name: 'GOOGL',
	        data: GOOGL
	    }, {
	        name: 'MSFT',
	        data: MSFT
	    }]
	});
});
