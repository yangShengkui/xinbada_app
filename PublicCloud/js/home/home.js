(function($, doc) {
  $.init({
    pullRefresh: {
      container: "#pullrefresh",
      down: toolUtil.getDownRefreshConfig(pulldownRefresh)
    }
  });

  var self;
  var KPI_CODES = [3012, //设备总数
                   3014, //在线设备总数
                   3048, //月增设备数
                        
                   3049, //工单总数
                   3004, //待处理工单
                   3022, //客户总数
                        
                   3005, //日新增告警总数
                   3003, //待处理告警总数
                   3051, //处理中告警总数
                   3050, //已处理告警总数
                   ];
  var detail = {}; //初始化条件
  $.plusReady(function() {
    self = plus.webview.currentWebview();  
    
    window.addEventListener('reloadViewInfo', function (event) {
      if (detail == event.detail) return;
      detail = event.detail;
      
      pulldownRefresh();
    });
    
    
    
   
  });
  
  function pulldownRefresh() {
    var userInfo = storageUtil.getUserInfo();

    var kpiQueryModel = {
      "category": "ci",
      "isRealTimeData": true,
      "nodeIds": [userInfo.domainID],
      "kpiCodes": KPI_CODES,
      "startTime": null,
      "endTime": null,
      "timeRange": "",
      "statisticType": "psiot",
      "includeInstance": true,
      "condList": []
    }
    
    
    
    appFutureImpl.getKpiValueList(kpiQueryModel, function(result, msg) {
      $('#pullrefresh').pullRefresh().endPulldownToRefresh();
      if (msg != null) {
        plus.nativeUI.toast(msg);
        return;
      }
      console.log(JSON.stringify(result))
      for (var i = 0, len = result.length; i < len; i++) {
        var element;
        if (result[i].kpiCode === 3051) {
          element = doc.getElementById('warning-processing-count');
        } else if (result[i].kpiCode === 3050) {
          element = doc.getElementById('warning-processed-count');
        } else if (result[i].kpiCode === 3005) {
          element = doc.getElementById('warning-new-bydaily-count');
        } else if (result[i].kpiCode === 3003) {
          element = doc.getElementById('warning-unprocessed-count');
        } else if (result[i].kpiCode === 3012) {
          element = doc.getElementById('device-total-count');
        } else if (result[i].kpiCode === 3014) {
          element = doc.getElementById('device-online-count');
        } else if (result[i].kpiCode === 3048) {
          element = doc.getElementById('device-new-bymonth-count');
        } 
        else if (result[i].kpiCode === 3049) {
          element = doc.getElementById('order-total-count');
        } 
        else if (result[i].kpiCode === 3004) {
          element = doc.getElementById('order-unprocessed-count');
        } else if (result[i].kpiCode === 3022) {
          element = doc.getElementById('customer-total-count');
        }
        if (element) {
        		element.innerHTML = result[i].value;
        }
        
        
      }
    });
    
    //右滑显示菜单	 
   window.addEventListener("swiperight", open);
   var mainMenuWeb = plus.webview.getWebviewById('main-menu')
   function open () {
   		$.fire(mainMenuWeb.opener(), "menu:open");
   }
    
    
    
    
  }
}(mui, document));