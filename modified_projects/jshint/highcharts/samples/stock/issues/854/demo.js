/* jshint undef: false, unused: false, asi: true */
/* jshint maxerr:10000 */
$(function () {
    $('#container').highcharts('StockChart', {
        chart: {
        },
        rangeSelector: {
            enabled: false
        },
        title: {
            text: 'Chart with no series option and no data'
        }
    });
 });
