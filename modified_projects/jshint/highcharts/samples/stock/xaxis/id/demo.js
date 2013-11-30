/* jshint undef: false, unused: false, asi: true */
/* jshint maxerr:10000 */
$(function() {
	$('#container').highcharts('StockChart', {
	    xAxis: {
	    	id: 'x-axis'
	    },
	    rangeSelector: {
	    	selected: 1
	    },
	    series: [{
	        name: 'USD to EUR',
	        data: usdeur
	    }]
	});

	// the button action
	$('#button').click(function() {
    	var chart = $('#container').highcharts();
        alert('The axis object: '+ chart.get('x-axis'));
	});
});
