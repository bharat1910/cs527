/* jshint undef: false, unused: false, asi: true */
/* jshint maxerr:10000 */
//Create HighStock with empty data and min max

var chart;
$(function () {
    chart = new Highcharts.StockChart({
        chart: {
            renderTo: "container"
        },
        xAxis: {
            min: 1378449361033,
            max: 1378452780067
        },
        series: [{
            data: []
        }]
    });   
});
