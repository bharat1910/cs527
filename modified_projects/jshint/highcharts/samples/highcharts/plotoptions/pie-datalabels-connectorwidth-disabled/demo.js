/* jshint undef: false, unused: false, asi: true */
$(function () {
    $('#container').highcharts({
        chart: {
            type: 'pie'
        },
        title: {
            text: 'Connectorline is not visible, with setting connectorWidth to zero'
        },
        plotOptions: {
            pie: {
                dataLabels: {
                    connectorWidth: 0
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
