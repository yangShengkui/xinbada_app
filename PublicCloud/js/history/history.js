/**
 * Created by zlzsam on 5/5/2017.
 */
(function ($, doc) {
  var option = {
    title: {
      text: '',
      subtext: ''
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      show: false
    },
    toolbox: {
      show: true,
      feature: {
        dataZoom: {
          show: false
        },
        dataView: {
          show: false,
          readOnly: false
        },
        magicType: {
          type: ['line', 'bar']
        },
        restore: {show: false},
        saveAsImage: {show: false}
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: []
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}'
      }
    }, dataZoom: [
      {
        type: 'inside',
        start: 85,
        end: 100
      }
    ],
    series: [{
      name: '',
      type: 'line',
      data: [],
      markPoint: {
        data: [{
          type: 'max',
          name: '最大值'
        },
          {
            type: 'min',
            name: '最小值'
          }
        ]
      },
      markLine: {
        data: [{
          type: 'average',
          name: '平均值'
        }]
      }
    }
    ]
  };
  $.plusReady(function () {
    var self = plus.webview.currentWebview();
    var kpiCode = self.kpiCode;
    var nodeId = self.nodeId;
    var testName = self.testName;
    var uuid = Math.uuid();

    var registerParams = {
      "operation": "register",
      "uuid": uuid,
      "type": "kpi",
      "param": {"ciid": "" + nodeId, "kpi": "" + kpiCode}
    };

    var unregisterParams = {"operation": "unRegister", "uuid": uuid};

    if (null == kpiCode || null == nodeId) {
      return;
    }
    plus.nativeUI.showWaiting();
    var kpiQueryModel = {
      "statisticType": "",
      "category": "time",
      "nodeIds": [nodeId],
      "kpiCodes": [kpiCode],
      "isRealTimeData": true,
      "timePeriod": 1000 * 60 * 60,
      "startTime": "",
      "endTime": "",
      "timeRange": "",
      "queryInstances": null
    };
    appFutureImpl.getKpiValueList(kpiQueryModel, function (result, msg) {
      plus.nativeUI.closeWaiting();
      if (msg != null) {
        plus.nativeUI.toast(msg);
        return;
      }
      if (null != result) {
        insertData(result);
        //打开长连接
        newWebSocket();
      }
    })
    var byId = function (id) {
      return doc.getElementById(id);
    };
    var lineChart;
    var initloadData = function () {
      lineChart = echarts.init(byId('lineChart'));
      lineChart.setOption(option);
    }

    function reverseArray(originArray) {
      var tempArray = [];
      var len3 = originArray.length;
      for (var position = len3 - 1; position >= 0; position--) {
        tempArray.push(originArray[position]);
      }
      return tempArray;
    }

    function insertData(data) {
      var kpiname = doc.getElementById('kpiName');
      kpiname.innerText = testName;
      var containter = doc.getElementById('id-containter');
      option.xAxis.data = [];
      option.series[0].name = testName;
      option.series[0].data = [];
      for (var index = 0, len = data.length; index < len; index++) {
        var obj = data[index];
        //option.xAxis.data.push(toolUtil.json2Time(obj.arisingTime, "hh:mm"));
        option.xAxis.data.push(moment(obj.arisingTime).format('HH:mm'))
        option.series[0].data.push(obj.value);
      }
      data = reverseArray(data);
      for (var index = 0, len = data.length; index < len; index++) {
        var obj = data[index];
        var tr = document.createElement('tr');
//      var htmlCode = '<td style="text-align: left;">' + toolUtil.json2Time(obj.arisingTime, "yyyy-MM-dd hh:mm") + '</td>' +
//        '<td>' + obj.value + '</td>';
		var htmlCode = '<td style="text-align: left;">' + moment(obj.arisingTime).format('YYYY-MM-DD HH:mm') + '</td>' +
          '<td>' + obj.value + '</td>';
        tr.innerHTML = htmlCode;
        containter.appendChild(tr);
      }
      initloadData();
    }

    function insertFirstPosition(obj) {
      if (null == obj) {
        return;
      }

      var containter = doc.getElementById('id-containter');
      var tr = document.createElement('tr');
//    var htmlCode = '<td style="text-align: left;">' + toolUtil.json2Time(obj.arisingTime, "yyyy-MM-dd hh:mm") + '</td>' +
//      '<td>' + obj.value + '</td>';
	  var htmlCode = '<td style="text-align: left;">' + moment(obj.arisingTime).format('YYYY-MM-DD HH:mm') + '</td>' +
        '<td>' + obj.value + '</td>';
      tr.innerHTML = htmlCode;
      var fragment = document.createDocumentFragment();
      fragment.appendChild(tr);
      containter.insertBefore(fragment, containter.firstChild);
      console.log("----------->insertFirstPosition obj:" + JSON.stringify(obj));
    }

    function newWebSocket() {
      var wsURL = "wss://yzt.raonecloud.com/websocket/message";
      var w = new WebSocket(wsURL);

      w.onopen = function () {
        w.send(JSON.stringify(unregisterParams));
        console.log("----------->Websocket:" + wsURL + " onOpen()");
        w.send(JSON.stringify(registerParams));
        console.log("----------->Websocket:" + wsURL + " send()" + JSON.stringify(registerParams));
      }
      w.onmessage = function (e) {
        var reslut = JSON.parse(e.data);
        console.log("----------->Websocket:" + wsURL + " onMessage():" + JSON.stringify(reslut));
        if (uuid == reslut.uuid) {
          var obj = reslut.data;
          if (kpiCode == obj.kpiCode && nodeId == obj.nodeId) {
            insertFirstPosition(obj);
            //option.xAxis.data.push(toolUtil.json2Time(obj.arisingTime, "hh:mm"));
            option.xAxis.data.push(moment(data.arisingTime).format('YYYY-MM-DD HH:mm'));
            option.series[0].data.push(obj.value);
            initloadData();
          }
        }
      }
      w.onclose = function (e) {
        console.log("----------->Websocket:" + wsURL + " onClose()");
        w.send(JSON.stringify(unregisterParams));
      }
      w.onerror = function (e) {
        console.log("----------->Websocket:" + wsURL + " onError()");
      }
    }
  })
}(mui, document))