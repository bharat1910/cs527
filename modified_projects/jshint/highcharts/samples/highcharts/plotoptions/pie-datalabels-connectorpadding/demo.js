/* jshint undef: false, unused: false, asi: true */
/* jshint maxerr:10000 */
$(function () {
    $('#container').highcharts({
        chart: {
            type: 'pie'
        },
        title: {
            text: 'connectorPadding is set to zero'
        },
        plotOptions: {
            pie: {
                dataLabels: {
                    connectorPadding: 0
                }
            }
        },

        series: [{
            data: [
                ['Firefox',   44.2],
                ['IE7',       26.6],
                ['IE6',       20],
                ['Chrome',    3.1],
                ['Other',    5.4]
            ]
        }]
    });
});
