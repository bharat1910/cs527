/* jshint undef: false, unused: false, asi: true */
/* jshint maxerr:10000 */
$(function() {
	$('#container').highcharts('StockChart', {
	    
	    chart: {
	        type: 'area'
	    },
	    
	    plotOptions: {
	    	series: {
	    		stacking: 'normal'
	    	}
	    },
	    
	    rangeSelector: {
	    	selected: 1
	    },
	    
	    series: [{
	        name: 'ADBE',
	        data: ADBE
	    }, {
	        name: 'MSFT',
	        data: MSFT
	    }]
	});
});
