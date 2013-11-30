/* jshint undef: false, unused: false, asi: true */
/* jshint maxerr:10000 */
$(function () {
    $('#container').highcharts({
        chart: {
        },
        xAxis: {
            minPadding: 0.05,
            maxPadding: 0.05
        },
        
        series: [{
            data: [
                [0, 29.9], 
                [1, 71.5], 
                [3, 106.4]
            ]
        }]
    });
});
