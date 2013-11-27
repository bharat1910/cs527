/* jshint undef: true, unused: true */
$(function () {
    $('#container').highcharts({
        chart: {
            type: 'area'
        },
        xAxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },
        
        plotOptions: {
            series: {
                fillColor: {
                    linearGradient: [0, 0, 0, 300],
                    stops: [
                        [0, 'rgb(69, 114, 167)'],
                        [1, 'rgba(2,0,0,0)']
                    ]
                }
            }
        },
        
        series: [{
            data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]        
        }]
    });
});