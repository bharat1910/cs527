/* jshint undef: true, unused: true */
$(function () {
    var data1 = [
        [1301616000000, 5.33],
        [1301875200000, 5.54],
        [1301961600000, 5.87],
        [1302048000000, 5.98],
        [1302134400000, 5.44],
        [1302220800000, 5.69],
        [1302480000000, 5.4],
        [1302566400000, 3.72],
        [1302652800000, 4.46],
        [1302739200000, 4.11],
        [1302825600000, 4.57],
        [1303084800000, 2.94],
        [1303171200000, 3.47],
        [1303257600000, 5.39],
        [1303344000000, 6.06],
        [1303776000000, 6.4],
        [1303862400000, 6.75],
        [1303948800000, 7.11],
        [1304035200000, 7.4],
        [1304294400000, 7.7],
        [1304380800000, 7.2],
        [1304467200000, 5.75],
        [1304553600000, 5.61],
        [1304640000000, 6.96],
        [1304899200000, 6.7],
        [1304985600000, 7.72],
        [1305072000000, 7.82],
        [1305158400000, 7.14],
        [1305244800000, 6.8],
        [1305504000000, 6.82],
        [1305590400000, 5.65],
        [1305676800000, 6.11],
        [1305763200000, 6.78],
        [1305849600000, 6.68],
        [1306108800000, 5],
        [1306195200000, 5.36],
        [1306281600000, 5.89],
        [1306368000000, 5.65],
        [1306454400000, 6.58],
        [1306713600000, 6.72],
        [1306800000000, 7.66],
        [1306886400000, 6.92],
        [1307059200000, 5.25],
        [1307318400000, 4.82],
        [1307404800000, 4.59],
        [1307491200000, 3.36],
        [1307577600000, 4.36],
        [1307664000000, 2.95],
        [1308009600000, 4.27],
        [1308096000000, 3.12],
        [1308182400000, 2.46],
        [1308268800000, 2.64],
        [1308528000000, 2.03],
        [1308614400000, 3.67],
        [1308700800000, 3.18],
        [1308873600000, 1.76],
        [1309132800000, 1.72],
        [1309219200000, 2.29],
        [1309305600000, 4.17],
        [1309392000000, 5.18],
        [1309478400000, 5.98],
        [1309737600000, 6.48],
        [1309824000000, 6.53],
        [1309910400000, 6.33],
        [1309996800000, 7.19],
        [1310083200000, 6.21],
        [1310342400000, 4.69],
        [1310428800000, 3.96],
        [1310515200000, 4.87],
        [1310601600000, 3.61],
        [1310688000000, 3.36],
        [1310947200000, 1.65],
        [1311033600000, 2.66],
        [1311120000000, 3.94],
        [1311206400000, 4.86],
        [1311292800000, 5.41],
        [1311552000000, 5.52],
        [1311638400000, 5.15],
        [1311724800000, 3.8],
        [1311811200000, 3.5],
        [1311897600000, 2.87],
        [1312156800000, 1.66],
        [1312243200000, -0.53],
        [1312329600000, -0.46],
        [1312416000000, -1.22],
        [1312502400000, -1.82],
        [1312761600000, -2.79],
        [1312848000000, -1.78],
        [1312934400000, -0.9],
        [1313020800000, -2.65],
        [1313107200000, -3.64],
        [1313366400000, -3.34],
        [1313452800000, -3.62],
        [1313539200000, -3.92],
        [1313625600000, -4.22],
        [1313712000000, -4.56],
        [1313971200000, -4.22],
        [1314057600000, -3.46],
        [1314144000000, -3.09],
        [1314230400000, -2.03],
        [1314316800000, -2.3],
        [1314576000000, -1.21],
        [1314662400000, -1.42],
        [1314748800000, -2.68],
        [1314835200000, -2.17],
        [1314921600000, -0.39],
        [1315180800000, -1.08],
        [1315267200000, -3.75],
        [1315353600000, -4.86],
        [1315440000000, -4.36],
        [1315526400000, -5.47],
        [1315785600000, -5.57],
        [1315872000000, -5.75],
        [1315958400000, -5.31],
        [1316044800000, -4.65],
        [1316131200000, -4.17],
        [1316390400000, -4.07],
        [1316476800000, -4.51],
        [1316563200000, -5.82],
        [1316649600000, -5.72],
        [1316736000000, -5.5],
        [1316995200000, -6.11],
        [1317081600000, -6.3],
        [1317168000000, -6.15],
        [1317254400000, -7.71],
        [1317340800000, -7.16],
        [1317686400000, -7.59],
        [1317772800000, -8.22],
        [1317859200000, -8.89],
        [1317945600000, -8.36],
        [1318204800000, -8.55],
        [1318291200000, -8.56],
        [1318377600000, -7.1],
        [1318464000000, -7.74],
        [1318550400000, -6.93],
        [1318809600000, -7.79],
        [1318896000000, -7.76],
        [1318982400000, -7.57],
        [1319068800000, -8.67],
        [1319155200000, -6.45],
        [1319414400000, -5.17],
        [1319500800000, -5.89],
        [1319587200000, -5.87],
        [1319673600000, -2.6],
        [1319760000000, -2.74],
        [1320019200000, -5.03],
        [1320105600000, -8.09],
        [1320192000000, -7.04],
        [1320278400000, -5.22],
        [1320364800000, -6.25],
        [1320624000000, -6.82],
        [1320710400000, -5.57],
        [1320796800000, -7.14],
        [1320883200000, -7.49],
        [1320969600000, -5.46],
        [1321228800000, -6.27],
        [1321315200000, -6.78],
        [1321401600000, -6.68],
        [1321488000000, -7.92],
        [1321574400000, -8.78],
        [1321833600000, -8.51],
        [1321920000000, -8.27],
        [1322006400000, -8.29],
        [1322092800000, -8.29],
        [1322179200000, -9.59],
        [1322438400000, -9.53],
        [1322524800000, -8.85],
        [1322611200000, -5.6],
        [1322697600000, -6.16],
        [1322784000000, -5.24],
        [1323043200000, -4.64],
        [1323129600000, -4.85],
        [1323216000000, -5.12],
        [1323302400000, -6.53],
        [1323388800000, -5.58],
        [1323648000000, -7.45],
        [1323734400000, -7.08],
        [1323820800000, -8.7],
        [1323907200000, -7.81],
        [1323993600000, -8.14],
        [1324252800000, -8.1],
        [1324339200000, -6.31],
        [1324425600000, -6.74],
        [1324512000000, -5.78],
        [1324598400000, -5.02],
        [1324944000000, -5.01],
        [1325030400000, -5.61],
        [1325116800000, -4.79],
        [1325203200000, -4.17],
        [1325462400000, -3.11],
        [1325548800000, -1.78],
        [1325635200000, -2.14],
        [1325721600000, -2.65],
        [1325808000000, -2.52],
        [1326067200000, -2.69],
        [1326153600000, -1.04],
        [1326240000000, -1.42],
        [1326326400000, -1.56],
        [1326412800000, -1.81],
        [1326672000000, -0.95],
        [1326758400000, 0.02],
        [1326844800000, 0.33],
        [1326931200000, 1.17],
        [1327017600000, 0.82],
        [1327276800000, 1.21],
        [1327363200000, 0.91],
        [1327449600000, 0.72],
        [1327536000000, 1.83],
        [1327622400000, 1.08],
        [1327881600000, -0.07],
        [1327968000000, 0.72],
        [1328054400000, 2.78],
        [1328140800000, 3.23],
        [1328227200000, 4.8],
        [1328486400000, 4.76],
        [1328572800000, 4.27],
        [1328659200000, 4.13],
        [1328745600000, 4.28],
        [1328832000000, 3.48],
        [1329091200000, 4.21],
        [1329177600000, 4.16],
        [1329264000000, 5.13],
        [1329350400000, 5.19],
        [1329436800000, 5.73],
        [1329696000000, 6.62],
        [1329782400000, 6.12],
        [1329868800000, 5.25],
        [1329955200000, 5.29],
        [1330041600000, 5.66],
        [1330300800000, 5.45],
        [1330387200000, 5.74],
        [1330473600000, 5.4],
        [1330560000000, 6.55],
        [1330646400000, 6.63],
        [1330905600000, 6.02],
        [1330992000000, 3.23],
        [1331078400000, 3.95],
        [1331164800000, 5.74],
        [1331251200000, 6.26],
        [1331510400000, 6.27],
        [1331596800000, 7.83],
        [1331683200000, 8.06],
        [1331769600000, 8.42],
        [1331856000000, 8.8],
        [1332115200000, 8.66],
        [1332201600000, 7.36],
        [1332288000000, 7.31],
        [1332374400000, 6.29],
        [1332460800000, 6.31],
        [1332720000000, 7.58],
        [1332806400000, 7.31],
        [1332892800000, 6.49],
        [1332979200000, 5.24],
        [1333065600000, 6.19],
        [1333324800000, 7.99],
        [1333411200000, 7.2],
        [1333497600000, 4.78],
        [1333584000000, 5.18],
        [1334016000000, 2.69],
        [1334102400000, 3.37],
        [1334188800000, 4.91],
        [1334275200000, 3.48],
        [1334534400000, 4.02],
        [1334620800000, 6.02],
        [1334707200000, 5.41],
        [1334793600000, 5.2],
        [1334880000000, 5.72],
        [1335139200000, 3.32],
        [1335225600000, 4.13],
        [1335312000000, 5.38],
        [1335398400000, 5.84],
        [1335484800000, 6.37],
        [1335744000000, 5.96],
        [1335916800000, 6.1],
        [1336003200000, 6.25],
        [1336089600000, 4.46],
        [1336348800000, 5.04],
        [1336435200000, 3.02],
        [1336521600000, 2.93],
        [1336608000000, 3.42],
        [1336694400000, 4.04],
        [1336953600000, 2.13],
        [1337040000000, 1.67],
        [1337126400000, 1.26],
        [1337299200000, -1.05],
        [1337558400000, -0.31],
        [1337644800000, 1.66],
        [1337731200000, -0.64],
        [1337817600000, 0.32],
        [1337904000000, 0.58],
        [1338249600000, 1.9],
        [1338336000000, 0.19],
        [1338422400000, 0.09],
        [1338508800000, -2.17],
        [1338768000000, -2.96],
        [1338854400000, -2.7],
        [1338940800000, -0.44],
        [1339113600000, 0.4],
        [1339372800000, 0.52],
        [1339459200000, 0.96],
        [1339545600000, 0.88],
        [1339632000000, 0.26],
        [1339718400000, 1.08],
        [1339977600000, 1.48],
        [1340064000000, 3.1],
        [1340150400000, 3.56],
        [1340236800000, 3.17],
        [1340323200000, 2.23],
        [1340582400000, 0.62],
        [1340668800000, 0.48],
        [1340755200000, 1.81],
        [1340841600000, 1.3],
        [1340928000000, 4.03],
        [1341187200000, 5.54],
        [1341273600000, 6.85],
        [1341360000000, 6.81],
        [1341446400000, 6.7],
        [1341532800000, 5.58],
        [1341792000000, 5.14],
        [1341878400000, 6.29],
        [1341964800000, 6.15],
        [1342051200000, 5.33],
        [1342137600000, 6.6],
        [1342396800000, 6.87],
        [1342483200000, 6.74],
        [1342569600000, 8.22],
        [1342656000000, 9.46],
        [1342742400000, 8.25],
        [1343001600000, 5.43],
        [1343088000000, 5.05],
        [1343174400000, 5.01],
        [1343260800000, 7.35],
        [1343347200000, 8.67],
        [1343606400000, 10],
        [1343692800000, 9.22],
        [1343779200000, 9.61],
        [1343865600000, 8.33],
        [1343952000000, 10.84],
        [1344211200000, 11.34],
        [1344297600000, 11.77],
        [1344384000000, 11.71],
        [1344470400000, 12.17],
        [1344556800000, 11.91],
        [1344816000000, 11.37],
        [1344902400000, 12.06],
        [1344988800000, 12.08],
        [1345075200000, 12.4],
        [1345161600000, 12.92],
        [1345420800000, 12.39],
        [1345507200000, 12.99],
        [1345593600000, 11.64],
        [1345680000000, 11.13],
        [1345766400000, 11.11],
        [1346025600000, 11.47],
        [1346112000000, 10.73],
        [1346198400000, 10.86],
        [1346284800000, 10.07],
        [1346371200000, 10.59],
        [1346630400000, 11.51],
        [1346716800000, 10.2],
        [1346803200000, 10.38],
        [1346889600000, 12.84],
        [1346976000000, 12.81],
        [1347235200000, 12.42],
        [1347321600000, 12.7],
        [1347408000000, 12.66],
        [1347494400000, 12.58],
        [1347580800000, 13.9],
        [1347840000000, 13.6],
        [1347926400000, 13.33],
        [1348012800000, 13.81],
        [1348099200000, 13.85],
        [1348185600000, 14.43],
        [1348444800000, 14.01],
        [1348531200000, 14.5],
        [1348617600000, 12.61],
        [1348704000000, 13],
        [1348790400000, 11.98],
        [1349049600000, 13.65],
        [1349136000000, 13.43],
        [1349308800000, 13.49],
        [1349395200000, 14.71],
        [1349654400000, 13.69],
        [1349740800000, 13.14],
        [1349827200000, 12.5],
        [1349913600000, 13.29],
        [1350000000000, 12.67],
        [1350259200000, 13.25],
        [1350345600000, 14.66],
        [1350432000000, 14.98],
        [1350518400000, 15.17],
        [1350604800000, 14.54],
        [1350864000000, 14.17],
        [1350950400000, 12.25],
        [1351036800000, 12.79],
        [1351123200000, 13.28],
        [1351209600000, 13.42],
        [1351468800000, 13.16],
        [1351555200000, 14],
        [1351641600000, 13.11],
        [1351728000000, 14.32],
        [1351814400000, 14.9],
        [1352073600000, 14.24],
        [1352160000000, 14.78],
        [1352246400000, 13.52],
        [1352332800000, 13.24],
        [1352419200000, 13.3],
        [1352678400000, 13.01],
        [1352764800000, 13.4],
        [1352851200000, 12.56],
        [1352937600000, 11.33],
        [1353024000000, 10.36],
        [1353283200000, 12.68],
        [1353369600000, 13.25],
        [1353456000000, 13.4],
        [1353542400000, 14.19],
        [1353628800000, 14.77],
        [1353888000000, 14.41],
        [1353974400000, 14.99],
        [1354060800000, 15.15],
        [1354147200000, 16.17],
        [1354233600000, 16.03],
        [1354492800000, 16.14],
        [1354579200000, 15.87],
        [1354665600000, 16],
        [1354752000000, 16.85],
        [1354838400000, 17.13],
        [1355097600000, 17.15],
        [1355184000000, 17.48],
        [1355270400000, 17.52],
        [1355356800000, 17.04],
        [1355443200000, 17.02],
        [1355702400000, 16.65],
        [1355788800000, 17.16],
        [1355875200000, 17.51],
        [1355961600000, 17.41],
        [1356048000000, 17.15],
        [1356566400000, 16.96],
        [1356652800000, 16.31],
        [1356912000000, 16.61],
        [1357084800000, 18.76],
        [1357171200000, 19.39],
        [1357257600000, 19.75],
        [1357516800000, 19.35],
        [1357603200000, 19.26],
        [1357689600000, 19.87],
        [1357776000000, 19.55],
        [1357862400000, 19.41],
        [1358121600000, 18.91],
        [1358208000000, 18.72],
        [1358294400000, 19.03],
        [1358380800000, 19.68],
        [1358467200000, 19.57],
        [1358726400000, 19.81],
        [1358812800000, 19.57],
        [1358899200000, 20.19],
        [1358985600000, 20.7],
        [1359072000000, 21.13],
        [1359331200000, 21.06],
        [1359417600000, 21.26],
        [1359504000000, 20.49],
        [1359590400000, 19.74],
        [1359676800000, 20.94],
        [1359936000000, 18.72],
        [1360022400000, 19.44],
        [1360108800000, 19.1],
        [1360195200000, 18.77],
        [1360281600000, 19.92],
        [1360540800000, 19.31],
        [1360627200000, 19.85],
        [1360713600000, 20.43],
        [1360800000000, 20.05],
        [1360886400000, 20.16],
        [1361145600000, 19.84],
        [1361232000000, 21.28],
        [1361318400000, 21.12],
        [1361404800000, 19.47],
        [1361491200000, 20.96],
        [1361750400000, 20.82],
        [1361836800000, 19.74],
        [1361923200000, 20.71],
        [1362009600000, 21.51],
        [1362096000000, 21.41],
        [1362355200000, 21.31],
        [1362441600000, 23.31],
        [1362528000000, 23.08],
        [1362614400000, 23.2],
        [1362700800000, 23.93],
        [1362960000000, 23.91],
        [1363046400000, 23.9],
        [1363132800000, 24.13],
        [1363219200000, 25.12],
        [1363305600000, 24.67],
        [1363564800000, 24.57],
        [1363651200000, 23.96],
        [1363737600000, 24.58],
        [1363824000000, 23.67]
    ];

    var data2 = [
        [1350259200000, 0],
        [1350345600000, 0.08],
        [1350432000000, 0.54],
        [1350518400000, 0.56],
        [1350604800000, 0.53],
        [1350864000000, 0.79],
        [1350950400000, 0.67],
        [1351036800000, 0.68],
        [1351123200000, 0.65],
        [1351209600000, 0.67],
        [1351468800000, 0.66],
        [1351555200000, 0.45],
        [1351641600000, 0.45],
        [1351728000000, 0.59],
        [1351814400000, 1.19],
        [1352073600000, 0.53],
        [1352160000000, 0.61],
        [1352246400000, 0.53],
        [1352332800000, 0.54],
        [1352419200000, 0.21],
        [1352678400000, 0.28],
        [1352764800000, 0.14],
        [1352851200000, -0.02],
        [1352937600000, -0.48],
        [1353024000000, -0.57],
        [1353283200000, -0.21],
        [1353369600000, -0.06],
        [1353456000000, 0.04],
        [1353542400000, 0.01],
        [1353628800000, 0.08],
        [1353888000000, 0.27],
        [1353974400000, 0.56],
        [1354060800000, 0.67],
        [1354147200000, 0.93],
        [1354233600000, 1.16],
        [1354492800000, 1.48],
        [1354579200000, 1.34],
        [1354665600000, 1.76],
        [1354752000000, 1.93],
        [1354838400000, 2.11],
        [1355097600000, 2.24],
        [1355184000000, 2.46],
        [1355270400000, 2.58],
        [1355356800000, 2.61],
        [1355443200000, 2.62],
        [1355702400000, 2.68],
        [1355788800000, 2.86],
        [1355875200000, 2.87],
        [1355961600000, 2.94],
        [1356048000000, 2.92],
        [1356566400000, 2.91],
        [1356652800000, 2.92],
        [1356912000000, 2.97],
        [1357084800000, 3.37],
        [1357171200000, 3.66],
        [1357257600000, 3.82],
        [1357516800000, 3.99],
        [1357603200000, 4.05],
        [1357689600000, 4.18],
        [1357776000000, 4.31],
        [1357862400000, 4.41],
        [1358121600000, 4.43],
        [1358208000000, 4.42],
        [1358294400000, 4.42],
        [1358380800000, 4.61],
        [1358467200000, 4.66],
        [1358726400000, 4.68],
        [1358812800000, 4.73],
        [1358899200000, 4.79],
        [1358985600000, 4.85],
        [1359072000000, 4.76],
        [1359331200000, 4.78],
        [1359417600000, 4.46],
        [1359504000000, 4.38],
        [1359590400000, 3.82],
        [1359676800000, 3.87],
        [1359936000000, 3.64],
        [1360022400000, 3.57],
        [1360108800000, 3.48],
        [1360195200000, 3.23],
        [1360281600000, 3.24],
        [1360540800000, 3.21],
        [1360627200000, 3.25],
        [1360713600000, 3.43],
        [1360800000000, 3.53],
        [1360886400000, 3.62],
        [1361145600000, 3.63],
        [1361232000000, 3.73],
        [1361318400000, 3.81],
        [1361404800000, 3.82],
        [1361491200000, 3.69],
        [1361750400000, 3.92],
        [1361836800000, 3.75],
        [1361923200000, 3.86],
        [1362009600000, 4.04],
        [1362096000000, 4.03],
        [1362355200000, 4.11],
        [1362441600000, 4.32],
        [1362528000000, 4.57],
        [1362614400000, 4.68],
        [1362700800000, 4.68],
        [1362960000000, 4.73],
        [1363046400000, 4.78],
        [1363132800000, 4.83],
        [1363219200000, 4.89],
        [1363305600000, 4.85],
        [1363564800000, 4.86],
        [1363651200000, 4.75],
        [1363737600000, 4.77],
        [1363824000000, 4.75]
    ];

    var chart = new Highcharts.StockChart({
        chart: {
            renderTo: 'container',
        },
        plotOptions: {
            series: {
                dataGrouping: {
                    groupPixelWidth: 5
                }
            }
        },
        title: {
        	text: 'Both series should have same data grouping'
        },
        series: [{
            data: data1,
            type: 'column'
        }, {
            data: data2,
            type: 'line'
        }]
    });
});
