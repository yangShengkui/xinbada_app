function createWarningDetailCell(data) {
  var severity = data.severity;
  var severityStr;
  var severityValue = "未知";
  var severityClass = "";
  var severityBgColor = "";
  if (severity == 4) {
    severityValue = "严重";
    severityClass = "warning-sec-serious";
    severityBgColor = "#FF6B6B";
  } else if(severity == 3) {
    severityValue = "重要";
    severityClass = "mui-btn-purple";
    severityBgColor = "#8a6de9";
  } else if(severity == 2) {
    severityValue = "次要";
    severityClass = "warning-sec-secondary";
    severityBgColor = "#F6854F";
  } else {
    severityValue = "警告";
    severityClass = "mui-btn-warning";
    severityBgColor = "#f0ad4e";
  }

  var state = data.state;
  var stateStr;
  var stateValue;
  var stateClass = "";
  if(state == 0) {
    stateValue = "新产生";
    stateClass = "mui-btn-primary";    
  } else if(state == 5) {
    stateValue = "已确认";
    stateClass = "mui-btn-royal";
  } else if(state == 10) {
    stateValue = "处理中";
    stateClass = "mui-btn-warning";
  } else if(state == 20) {
    stateValue = "已解决";
    stateClass = "mui-btn-success";
  } else if(state == 30) {
    stateValue = "已忽略";
  } else {
    stateValue = "未知";
  }
  stateStr = '<button type="button" class="mui-badge mui-btn ' + stateClass + ' mui-btn-outlined clear-background label-title">' + stateValue + '</button>';
  severityStr = '<button type="button" class="mui-badge mui-btn mui-btn-outlined ' + severityClass + ' clear-background label-title">' + severityValue + '</button>';
  
  var closeTime = "未关闭";
  if (data.closeTime) {
    //closeTime = toolUtil.json2Time(data.closeTime, "yyyy-MM-dd")
    closeTime = moment(data.closeTime).format('YYYY-MM-DD');
  }
  
  var htmlValue = '<a class="">' +
    '<div class="warning-info wn-hor-layout">' +
      '<div class="wn-hor-layout-left">' + 
        '<div class="mui-icon systemicon system-icon-wn-exclam-mark warning-exclam-mark" style="background-color:' + severityBgColor + '"></div>' +
      '</div>' +
      '<div class="wn-hor-layout-center-wrapper"><div class="wn-hor-layout-center">' + 
        '<div class="hor-layout">' +
          '<div class="mui-pull-right">'  + stateStr + '</div>' +
          '<div class="mui-pull-right">'  + severityStr + '</div>' +
          '<div class="wn-hor-layout-center-wrapper""><div class="wn-hor-layout-center">' + 
            '<div class="text-wrap-dot warning-title">'+data.devName + data.title + '</div>' +
          '</div></div>' +
        '</div>' +
        '<div class="text-wrap-dot warning-message">' + data.message + '</div>' +
      '</div></div>' +
    '</div>' +
    '<div class="warning-time-detail">' +
      '<div class="mui-pull-left warning-time-column mui-col-xs-4 warning-border-right">' +
        '<div class="warning-time-content">' +
          '<div class="wn-hor-layout">' +
            '<div class="wn-hor-layout-left warning-time-content-icon">' + 
              '<div class="mui-icon systemicon system-icon-wn-time-first"></div>' +
            '</div>' +
            '<div class="wn-hor-layout-center-wrapper"><div class="wn-hor-layout-center">' + 
              '<div class="warning-time-content-detail">首次告警时间</div>' +
              //'<div class="warning-time-content-detail">' + toolUtil.json2Time(data.firstArisingTime, "yyyy-MM-dd") + '</div>' +
              '<div class="warning-time-content-detail">' + moment(data.firstArisingTime).format('YYYY-MM-DD') + '</div>' +
            '</div></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="mui-pull-left warning-time-column mui-col-xs-4 warning-border-right">' +
        '<div class="warning-time-content">' +
          '<div class="wn-hor-layout">' +
            '<div class="wn-hor-layout-left warning-time-content-icon">' + 
              '<div class="mui-icon systemicon system-icon-wn-time-last"></div>' +
            '</div>' +
            '<div class="wn-hor-layout-center-wrapper"><div class="wn-hor-layout-center">' + 
              '<div class="warning-time-content-detail">最近告警时间</div>' +
              //'<div class="warning-time-content-detail">' + toolUtil.json2Time(data.arisingTime, "yyyy-MM-dd") + '</div>' +
            	'<div class="warning-time-content-detail">' + moment(data.arisingTime).format('YYYY-MM-DD') + '</div>' +
            '</div></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="mui-pull-left warning-time-column mui-col-xs-4">' +
        '<div class="warning-time-content">' +
          '<div class="wn-hor-layout">' +
            '<div class="wn-hor-layout-left warning-time-content-icon">' + 
              '<div class="mui-icon systemicon system-icon-wn-time-close"></div>' +
            '</div>' +
            '<div class="wn-hor-layout-center-wrapper"><div class="wn-hor-layout-center">' + 
              '<div class="warning-time-content-detail">关闭告警时间</div>' +
              '<div class="warning-time-content-detail">' + closeTime + '</div>' +
            '</div></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div></a>';
  return htmlValue;
}

var createWarningDetailList = function(data) {
  if(null == data) {
    return;
  }
  var fragment = document.createDocumentFragment();
  var li;
  var len = data.length;
  for(var i = 0; i < len; i++) {
    li = document.createElement('li');
    li.className = 'mui-table-view-cell';
    li.id = data[i].alertId;
    li.innerHTML = createWarningDetailCell(data[i]);
    fragment.appendChild(li);
  }
  return fragment;
};