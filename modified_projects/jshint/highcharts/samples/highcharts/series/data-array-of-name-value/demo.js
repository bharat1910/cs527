/* jshint undef: false, unused: false, asi: true */
/* jshint maxerr:10000 */
$(function () {
    $('#container').highcharts({
        xAxis: {
            minPadding: 0.05,
            maxPadding: 0.05
        },
        series: [{
            data: [
                ['First', 29.9],
                ['Second', 71.5],
                ['Third', 106.4]
            ]
        }]
    });
});
