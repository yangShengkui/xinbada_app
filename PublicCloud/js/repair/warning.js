(function($, doc) {
  $.init();
  //var queryDomain = "";

  //查询待诊断{"taskStatus":10,"sendBeginTime":"","sendEndTime":"","categorys":"50,90,260,120,130,210","tickeTaskStatus":"maintaining"}
  var queryParams = {
    taskStatus: 10,
    categorys:"50,90,260,120,130,210",
    tickeTaskStatus:"maintaining"
  };

  //分页条件
  var queryParams4Page = {
    "start": 0,
    "length": 10,
    "statCount": true
  };

  //工单的查询条件{"categorys":"50,90,130,120,210,260","tickeTaskStatus":"","commitBeginTime":"","commitEndTime":"","processedTickeTaskStatus":"maintaining","taskDealingStatus":"maintaining"}
	var queryTicketParams = {
		categorys: "50,90,130,120,210,260", 
		tickeTaskStatus: "", 
		commitBeginTime: "", 
		commitEndTime: "",
		processedTickeTaskStatus:"maintaining",
		taskDealingStatus:"maintaining",
		validUserFlag: true
}

  $.plusReady(function() {
    var timerIns; //计时器对象

    //清除上次的数据
    window.addEventListener("clearData", function(event) {
      doc.getElementById('deviceSearch').value = "";
      queryParams = {
        taskStatus: 10,
    		categorys:"50,90,260,120,130,210",
    		tickeTaskStatus:"maintaining"
      };
//    queryTicketParams = {
//      ticketType: "normal",
//      validUserFlag: true
//    };
		queryTicketParams = {
			categorys: "50,90,130,120,210,260", 
			tickeTaskStatus: "", 
			commitBeginTime: "", 
			commitEndTime: "",
			processedTickeTaskStatus:"maintaining",
			taskDealingStatus:"maintaining",
			validUserFlag: true
		}

      queryParams4Page = {
        "start": 0,
        "length": 10,
        "statCount": true
      };

      //清除计时器对象
      if(timerIns) {
        console.log("清理告警页面");
        window.clearInterval(timerIns);
        timerIns = null;
      }
    });

    var currentId = plus.webview.currentWebview().id;

    /** 
     * plusReady后，不直接进行数据的获得，因为这个时候还没有登录
     * 这里获得的是当前条件下数量信息
     */
    var getAlertAndDealTicket = function() {
      //获取待诊断
      appFutureImpl.getTicketTasksByConditionAndPage(queryParams, queryParams4Page, function(result, total, msg) {
        if(null != msg && !result) {
          plus.nativeUI.toast(msg);
          return;
        }
        //这个地方用total，表示这次查询的所有长度
        doc.getElementsByClassName('wait_solve')[0].innerHTML = total;
      });
      //获取已诊断工单条数
      appFutureImpl.getDealTicketListByPage(queryTicketParams, queryParams4Page, function(result, total, msg) {
        console.log("已实施" + JSON.stringify(total))
        if(null != msg && !result) {
          plus.nativeUI.toast(msg);
          return;
        }
        doc.getElementsByClassName('has_solve')[0].innerHTML = total;
      })
    }
    window.addEventListener('reloadNum', function(event) {
    	  console.log("重新加载条数")
        getAlertAndDealTicket()
    });

    var fireAlertAndTicket = function() {
      //给列表传递参数，传递queryParams和queryTicketParams，warning-list.js 可以通过queryStates来区分用哪一个条件
      var wbvs = group.getAllWebviews();
      for(var j = 0, len = wbvs.length; j < len; j++) {

        $.fire(wbvs[j], 'getDomain', {
          //        queryDomain: queryDomain,
          queryParams: queryParams,
          queryTicketParams: queryTicketParams
        });
      }
    }

    doc.getElementById("deviceSearch").addEventListener("keydown", function(e) {
      if(13 === e.keyCode) { //点击了“搜索”  
        doc.activeElement.blur(); //隐藏软键盘 
        var queryDevicesParams = {};
        var name = doc.getElementById('deviceSearch').value;
        if(!name) { //没有设备名称的时候，不需要查询设备
          queryParams.nodeIds = "";
          queryTicketParams.nodeIds = "";
          getAlertAndDealTicket();
          fireAlertAndTicket();
        } else {
          name = name.replace(/(^\s*)|(\s*$)/g, '');
          queryDevicesParams.orCondition = name;
          queryDevicesParams.conditionField = ["sn", "label"];
          appFutureImpl.getDevicesByCondition(queryDevicesParams, function(result, msg) {
            var nodeIds = [-1];
            for(var i in result) {
              nodeIds.push(result[i].id);
            }
            queryParams.nodeIds = nodeIds.toString();
            queryTicketParams.nodeIds = nodeIds.toString();
            getAlertAndDealTicket();
            fireAlertAndTicket();
          })
        }
      }
    }, false);

    //select选择框,暂时取消了
    $(".mui-table-view-cell").on('change', 'select', function() {
      if(this.id == "severities") {
        if(this.value) {
          queryParams.severities = this.value
        } else {
          queryParams.severities = "1,2,3,4"
        }
      } else if(this.id == "states") {
        if(this.value) {
          queryParams.states = this.value
        } else {
          queryParams.states = "0,5,10"
        }
      }

      //条件设置完后，更新数量
      getAlertAndDealTicket();
      fireAlertAndTicket()
    });

    var group = new webviewGroup(currentId, {
      styles: {
        top: "145px",
        bottom: "0px",
        render: "always"
      },
      items: [{
        id: "main-subpage-repair-list-processing.html",
        url: "main-subpage-repair-list.html",
        extras: {
          queryStates: 3 //查询的是待诊断工单
        },
        initCallback: function() {
          //按需加载时，需要手动调用一下
          fireAlertAndTicket()
        }
      }, {
        id: "main-subpage-repair-list-processed.html",
        url: "main-subpage-repair-list.html",
        extras: {
          queryStates: 4 //查询的是已诊断工单
        },
        initCallback: function() {
          //按需加载时，需要手动调用一下
          fireAlertAndTicket()
        }
      }],
      nativeConfig: {
        backgroundColor: '#f5f5f5'
      },
      onChange: function(obj) {
        var c = doc.querySelector(".mui-scroll #warning-category-head-active");
        if(c) {
          c.removeAttribute("id");
          c.classList.remove("mui-active");
        }
        doc.querySelector(".mui-scroll .mui-control-item:nth-child(" + (parseInt(obj.index) + 1) + ")").setAttribute('id', "warning-category-head-active");

        var progressBar = doc.querySelector("#sliderProgressBar");
        if(progressBar) {
          progressBar.style.webkitTransform = 'translate3d(' + (parseInt(obj.index) * (window.screen.width / 2)) + 'px, 0px, 0px)  translateZ(0)';
        }

        //切换页面时，重新加载
        var wbvs = group.getAllWebviews();
        for(var j = 0, len = wbvs.length; j < len; j++) {
          if(wbvs[j].__mui_index == obj.index) {
            $.fire(wbvs[j], 'getDomain', {
              //            queryDomain: queryDomain,
              queryParams: queryParams,
              queryTicketParams: queryTicketParams
            });
          }
        }
      }
    });

    $(".mui-scroll").on("tap", ".mui-control-item", function(e) {
      var wid = this.getAttribute("data-wid");
      group.switchTab(wid);
    });
    var reloadViewInfohandler = function(event) {
      //获取告警条数,然后每隔一分钟执行一次检查
      getAlertAndDealTicket();
      if(!timerIns) {
        timerIns = setInterval(function() {
          getAlertAndDealTicket();
        }, 60000);
      }

      fireAlertAndTicket()
    }
    window.addEventListener('reloadViewInfo', function(event) {
      reloadViewInfohandler(event);
    });

    window.addEventListener('WARNING_INFO_UPDATE', function(event) {
      var wbvs = group.getAllWebviews();
      for(var j = 0, len = wbvs.length; j < len; j++) {
        $.fire(wbvs[j], 'WARNING_INFO_UPDATE', event);
      }
    });

    //按需加载的情况下，需要第一次手动调用
    reloadViewInfohandler({})
  })

  //$.back = function() {
  //  var _self = plus.webview.currentWebview();
  //  _self.close("auto");
  //}

}(mui, document))