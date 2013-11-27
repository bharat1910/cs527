/* jshint undef: true, unused: true */
$(function () {
    $('#container').highcharts({
        chart: {
        },
        xAxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },
        
        plotOptions: {
            series: {
                dataLabels: {
                    align: 'left',
                    enabled: true,
                    rotation: 270,
                    x: 2,
                    y: -10
                }
            }
        },
        
        series: [{
            data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]        
        }]
    });
});
