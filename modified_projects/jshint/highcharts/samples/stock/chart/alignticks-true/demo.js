/* jshint undef: false, unused: false, asi: true */
/* jshint maxerr:10000 */
$(function() {
	$('#container').highcharts('StockChart', {
	    
	    chart: {
	        // alignTicks: true // by default
	    },
	    
	    yAxis: [{
	        title: {
	            text: 'GOOGL'
	        }
	    }, {
	        title: {
	            text: 'MSFT'
	        },
	        gridLineWidth: 0,
	        opposite: true
	    }],
	    
	    rangeSelector: {
	    	selected: 1
	    },
	    
	    series: [{
	        name: 'GOOGL',
	        data: GOOGL
	    }, {
	        name: 'MSFT',
	        data: MSFT,
	        yAxis: 1
	    }]
	});
});
