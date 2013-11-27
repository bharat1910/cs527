/* jshint undef: true, unused: true */
$(function () {
    $.getJSON('http://www.highcharts.com/samples/data/jsonp.php?filename=range.json&callback=?', function(data) {
    
    	$('#container').highcharts('StockChart', {
    	
		    chart: {
		        type: 'arearange'
		    },
		    
		    rangeSelector: {
		    	selected: 2
		    },
		    
		    title: {
		        text: 'Temperature variation by day'
		    },
		
		    tooltip: {
		        valueSuffix: '°C'
		    },
		    
		    series: [{
		        name: 'Temperatures',
		        data: data
		    }]
		
		});
    });
    
});
