(function($, doc) {
  $.init({});
  var btnArray = ['确认', '取消'];
  var closeBtn = doc.getElementById('alert-id-close-btn');
  var sureBtn = doc.getElementById('alert-id-sure-btn');
  var orderBtn = doc.getElementById('alert-id-order-btn');
  var openerWebview;
  var queryParams = {
    "domain": "",
    "nodeType": "",
    "alertCodes": "",
    "createTimeFrom": "",
    "pageSize": 10,
    "createTimeTo": "",
    "messageFilter": "",
    "severities": "1,2,3,4",
    "states": "0,5,10,20"
  };
  var queryParams4Page = {
    "start": 0,
    "length": 10,
    "sort": "createTime",
    "sortType": "desc",
    "statCount": true,
    "total": 0
  };
mui('.mui-scroll-wrapper').scroll({
	  scrollY: true, //是否竖向滚动
 		scrollX: false, //是否横向滚动
 		startX: 0, //初始化时滚动至x
 		startY: 0, //初始化时滚动至y
 		indicators: true, //是否显示滚动条
 		deceleration:0.0006, //阻尼系数,系数越小滑动越灵敏
 		bounce: true //是否启用回弹
});

  $.plusReady(function() {
    var self = plus.webview.currentWebview();
    var warningObj = self.alertInfo;
    openerWebview = plus.webview.currentWebview().opener();
    console.log("---------->warningObj:" + JSON.stringify(warningObj));
    if(null != warningObj) {
      initData(warningObj);
    }

    function initData(data) {
      if(null == data) {
        return;
      }
      var table = document.body.querySelector('.mui-table-view');
      var li = document.createElement('li');
      li.className = 'mui-table-view-cell';
      li.id = "warning-detail-info";
      li.innerHTML = createWarningDetailCell(data);
      table.appendChild(li);
      addFunctionBtn(data);
    };

    function addFunctionBtn(data) {
      var functionBtns = document.body.querySelector('.warning-deal');
      if(data.state < 10) {
        orderBtn.classList.add('mui-btn-primary')
      } else {
        orderBtn.classList.add('mui-btn-grey');
      }

      if(data.state == 0) {
        sureBtn.classList.add('mui-btn-primary')
      } else {
        sureBtn.classList.add('mui-btn-grey');
      }

      if(data.state < 20) {
        closeBtn.classList.add('mui-btn-primary')
      } else {
        closeBtn.classList.add('mui-btn-grey');
      }
      functionBtns.style.visibility = "visible";

      sureBtn.addEventListener('tap', function(event) {
        if(data.state == 5) {
          plus.nativeUI.toast("该告警已经确认，无需重复操作");
          return;
        }
        if(data.state == 20) {
          plus.nativeUI.toast("该告警已经解决");
          return;
        }
        if(data.state == 10) {
        	plus.nativeUI.toast("该告警已转工单");
          return;
        }
        var param1 = [data.alertId];
        var params = {
          actionType: "claim",
          alertIds: param1
        };
        appFutureImpl.sendAlertClaimAction(params, function(result, msg) {
          if(msg != null) {
            plus.nativeUI.toast(msg);
            return;
          }
          if(result.done) {
            plus.nativeUI.toast("确认成功！");
            sendBroadcast();
            sureBtn.classList.remove('mui-btn-primary');
            sureBtn.classList.add('mui-btn-grey');
            warningObj.state = 5;
            updateWarningInfo(warningObj);
          } else {
            plus.nativeUI.toast("确认失败！");
          }
        })
      });

      closeBtn.addEventListener('tap', function(event) {
        if(data.state == 20) {
          plus.nativeUI.toast("该告警已经关闭，无需重复操作");
          return;
        }
        $.confirm('确认关闭该条告警吗？', '操作提示', btnArray, function(e) {
          if(e.index == 0) {
            var param1 = [data.alertId];
            var params = {
              "actionType": "recover",
              "alertIds": param1,
              "recoverAll": true,
              "resolved": true,
              "clearOut": true
            };
            appFutureImpl.sendAlertRecoverAction(params, function(result, msg) {
              if(msg != null) {
                plus.nativeUI.toast(msg);
                return;
              }
              if(result.done) {
                plus.nativeUI.toast("关闭成功！");
                sendBroadcast();
                closeBtn.classList.remove('mui-btn-primary');
                closeBtn.classList.add('mui-btn-grey');
                orderBtn.classList.remove('mui-btn-primary');
                orderBtn.classList.add('mui-btn-grey');
                sureBtn.classList.remove('mui-btn-primary');
                sureBtn.classList.add('mui-btn-grey');
                warningObj.state = 20;
                updateWarningInfo(warningObj);
              } else {
                plus.nativeUI.toast("关闭失败！");
              }
            })
          }
        });
      });
      
      orderBtn.addEventListener('tap', function(event) {
      	console.log(JSON.stringify(event))
      	console.log(data.state)
        if(data.state == 20) {
          plus.nativeUI.toast("该告警已经解决,无法转工单");
          return;
        } 
        
        if(data.state == 10) {
        	plus.nativeUI.toast("该告警已经转工单,请勿重复操作");
          return;
        }
        
        if(data.state == 0 || data.state == 5) {
        	
        console.log("---------->warningObj:" + JSON.stringify(warningObj));
        mui('.mui-popover').popover('show',orderBtn);
				document.getElementById("orderName").value = warningObj.title;
        document.getElementById("devideName").value = warningObj.devName;
        if (warningObj.severity == 4) {
        	  document.getElementById("emergencyDegree").value = "200"
        }else if(warningObj.severity == 3) {
        	  document.getElementById("emergencyDegree").value = "100"
        }else {
        	  document.getElementById("emergencyDegree").value = "0"
        }
        appFutureImpl.getTicket(function (result,msg) {
        		console.log(JSON.stringify(result))
        		var orderType = document.getElementById('orderType').value;
        		var matchOrder = [];
        		console.log(orderType)
        		for(var i = 0; i < result.length;i++) {
        			 if(result[i].category == orderType ) {
        			 	  matchOrder.push(result[i])
        			 }
        		}
        		var html = "<option> ---请选择--- </option>"
        		for(var i = 0; i < matchOrder.length;i++) {
        			var orderText = matchOrder[i].name;
        			var id = matchOrder[i].id;
        			//var option = document.createElement('option');
        			html += ("<option value=" + id + ">" + orderText + "</option>");
        		}
        		console.log(html)
        		document.getElementById("orderFlow").innerHTML = html
        })
        
        
    //监听select改变事件
    mui(".mui-table-view-cell").on('change','#orderType',function(){
    		appFutureImpl.getTicket(function (result,msg) {
        		console.log(JSON.stringify(result))
        		var orderType = document.getElementById('orderType').value;
        		var matchOrder = [];
        		console.log(orderType)
        		for(var i = 0; i < result.length;i++) {
        			 if(result[i].category == orderType ) {
        			 	   matchOrder.push(result[i])
        			 }
        		}
        		var html = "<option> ---请选择--- </option>"
        		for(var i = 0; i < matchOrder.length;i++) {
        			var orderText = matchOrder[i].name;
        			var id = matchOrder[i].id;
        			html += ("<option value=" + id + ">" + orderText + "</option>");
        		}
        		console.log(html)
        		document.getElementById("orderFlow").innerHTML = html
        })	
    })
        
  document.getElementById("cansel").addEventListener("tap",function () {
        	  mui('.mui-popover').popover('hide',orderBtn);
        });
  
  
    
document.getElementById("sure").addEventListener("tap",function () {
	var ticket = {
            "title": warningObj.title,  //"title":"通用告警"
            "category":document.getElementById('orderType').value,  //工单类型
            "ticketCategoryId": document.getElementById("orderFlow").value,     //工单流程
            "priorityCode": document.getElementById("emergencyDegree").value,  // $scope.orderData.priorityCode = severity;
            "faultId": "",     
            "deviceId": warningObj.nodeId,   //rowData.nodeId 
            "message": warningObj.message  // "message":"压缩机过载或高温 #1:1 [1] 异常"
          };
          
    var alertInfo = {
            "actionType": "forward",
            "alertIds": [warningObj.alertId],
            "severity": 0,
            "target": "EOMS://auttest/auttest"
          };
          console.log(JSON.stringify(alertInfo))
    			console.log(JSON.stringify(ticket))
    if(ticket.category == "01" || ticket.ticketCategoryId == "---请选择---") {
    	  plus.nativeUI.toast("请填写完整");
    	  return 
    }else {
    		appFutureImpl.sendTicket(alertInfo,ticket,function (result,msg) {
							console.log(JSON.stringify(result))
							plus.nativeUI.toast("转工单成功");
							
					})
    		if(data.state == 0) {
    			sureBtn.classList.remove('mui-btn-primary');
          sureBtn.classList.add('mui-btn-grey');
    		}
    		  orderBtn.classList.remove('mui-btn-primary');
          orderBtn.classList.add('mui-btn-grey');
        	mui('.mui-popover').popover('hide',orderBtn);
        	warningObj.state = 10;
          updateWarningInfo(warningObj);
        	
    }
            	  
      })
        
        }
      });
      
      
    }

    function sendBroadcast() {
      $.fire(plus.webview.getWebviewById('main-subpage-warning.html'), 'WARNING_INFO_UPDATE', {});
    }

    function updateWarningInfo(data) {
      var detailLi = document.body.querySelector('#warning-detail-info');
      detailLi.innerHTML = createWarningDetailCell(data);
    }
   
     
     
  });
}(mui, document));