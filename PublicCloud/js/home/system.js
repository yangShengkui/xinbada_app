(function($, doc) {
  $.init({});
  var id;
  var title;
  var project;
  var systemIconCss;
  var systemDomain;
  var deviceCount = 0;
  var warningCount = 0;
  var orderCount = 0;
  var self;
  $.plusReady(function() {
    self = plus.webview.currentWebview();
    title = self.titleValue;
    id = self.systemId;
    systemIconCss = self.systemIconCss;
    systemDomain = self.domains;
    doc.getElementById('title').innerHTML = title;

    var kpiQueryModel = {
      "category": "ci",
      "isRealTimeData": true,
      "nodeIds": [id],
      "kpiCodes": [3001, 3003, 3004],
      "startTime": null,
      "endTime": null,
      "timeRange": "",
      "statisticType": "psiot",
      "includeInstance": true,
      "condList": []
    }
    plus.nativeUI.showWaiting();
    appFutureImpl.getKpiValueList(kpiQueryModel, function(result, msg) {
      if(msg != null) {
        plus.nativeUI.closeWaiting();
        plus.nativeUI.toast(msg);
        return;
      }
      if(null != result) {
        console.log("--------->systemdetail:" + JSON.stringify(result));
        var len = result.length;
        for(var index = 0; index < len; index++) {
          if(result[index].kpiCode == 3001) { //设备
            deviceCount = result[index].value;
          } else if(result[index].kpiCode == 3003) { //告警
            warningCount = result[index].value;
          } else {
            orderCount = result[index].value;
          }
        }
        createDom(project);
        plus.nativeUI.closeWaiting();
      }
    });
  })

  function createDom() {
    var table = document.body.querySelector('.mui-list-unstyled');
    var li = document.createElement('li');
    var htmlCode = '<div class="mui-card">' +
      '<div class="mui-card-content">' +
      '<span class="mui-icon systemicon ' + systemIconCss + '" style="font-size: 1.5rem; vertical-align: middle;margin:0.2rem 0.3rem 0.1rem 0.5rem;"></span>' +
      '<span class="his-name">' + title + '</span>' +
      '</div><div class="mui-card-footer">' +
      '<ul class="mui-table-view" style="width: 100%;">' +
      '<li class="mui-table-view-cell">' +
      '<a id="' + id + '" name="3" class="mui-navigate-right mui-icon mui-icon-circle">&nbsp;&nbsp;<span>设备总数：<span' +
      'class="device-num">' + deviceCount + '</span></span></a>' +
      '</li><li class="mui-table-view-cell">' +
      '<a id="' + id + '" name="4" class="mui-navigate-right mui-icon mui-icon-circle">&nbsp;&nbsp;<span>告警总数：<span' +
      'class="warning-num">' + warningCount + '</span></span></a>' +
      '</li><li class="mui-table-view-cell">' +
      '<a id="' + id + '" name="5" class="mui-navigate-right mui-icon mui-icon-circle">&nbsp;&nbsp;<span>工单总数：<span' +
      'class="order-num">' + orderCount + '</span></span></a>' +
      '</li></ul></div></div>';
    li.innerHTML = htmlCode;
    table.appendChild(li);
  }

  $('#list').on('tap', 'a', function(event) {
    var mainWebview = plus.webview.getWebviewById("main");
    $.fire(mainWebview, 'TAB_SELECT', {
      params: {
        parentId: "main-subpage-system-detail.html",
        title: title,
        projectId: this.id,
        domains: systemDomain
      },
      type: "openWindow",
      selectPosition: this.name
    });
    self.hide();
  });
}(mui, document))