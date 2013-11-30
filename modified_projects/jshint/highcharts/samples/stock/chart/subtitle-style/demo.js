/* jshint undef: false, unused: false, asi: true */
/* jshint maxerr:10000 */
$(function() {
	$('#container').highcharts('StockChart', {
	    
	    chart: {
	    },
	    
	    title: {
	    	text: 'The title'
	    },
	    
	    subtitle: {
        	text: 'The subtitle',
        	style: {
            	color: '#FF00FF',
            	fontWeight: 'bold'
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
