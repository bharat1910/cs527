/* jshint undef: false, unused: false, asi: true */
$(function () {
    $('#container').highcharts({
    
        chart: {
        },
    
        xAxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },
        
        yAxis: {
            type: 'logarithmic'
        },
    
        series: [{
            data: [0.1, 2, 45, 1001, 200, 0.33, 10000]
        }]
    
    });
});
