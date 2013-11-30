/* jshint undef: false, unused: false, asi: true */
/* jshint maxerr:10000 */
$(function() {
	$('#container').highcharts('StockChart', {

	    plotOptions: {
	    	series: {
	    		marker: {
	    			enabled: true
	    		}
	    	}
	    },

	    tooltip: {
	    	valueDecimals: 4
	    },

	    rangeSelector: {
	    	selected: 4
	    },

	    series: [{
	        name: 'ADBE',
	        data: ADBE,
	        dataGrouping: {
	        	groupPixelWidth: 10
	        }
	    }, {
	        name: 'MSFT',
	        data: MSFT,
	        dataGrouping: {
	        	groupPixelWidth: 50
	        }
	    }]
	});
});
