/* jshint undef: true, unused: true */
$(function () {
    $('#container').highcharts({
        chart: {
        },
        title: {
            text: 'Browser market shares at a specific website, 2010'
        },
        plotOptions: {
            pie: {
                dataLabels: {
                    // softConnector: true // by default
                }
            }
        },
        series: [{
            type: 'pie',
            name: 'Browser share',
            data: [
                ['Firefox', 45.0],
                ['IE', 26.8],
            {
                name: 'Chrome',
                y: 12.8,
                sliced: true,
                selected: true},
                ['Safari', 8.5],
                ['Opera', 6.2],
                ['Others', 0.7]
                ]}]
    });
});
