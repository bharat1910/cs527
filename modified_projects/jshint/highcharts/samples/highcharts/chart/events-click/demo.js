/* jshint undef: false, unused: false, asi: true */
/* jshint maxerr:10000 */
$(function () {
    // create the chart
    $('#container').highcharts({
        chart: {
            events: {
                click: function(event) {
                    alert ('x: '+ event.xAxis[0].value +', y: '+
                          event.yAxis[0].value);
                }
            }        
        },
        xAxis: {
        },
        
        series: [{
            data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]        
        }]
    });
});
