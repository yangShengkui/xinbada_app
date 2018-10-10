(function($, doc) {
	$.init({
		pullRefresh: {
			container: "#pullrefresh",
			down: {
				callback: pullDownRefresh, //刷新函数
				auto: true
			},
			up: toolUtil.getUpRefreshConfig(pullUpRefresh)
		}
	});
	var self;
	var customersData = {};
	var resourceCondition = {};
	var deviceList = new ArrayList();
	var queryParams = {
		"start": 0,
		"length": 10,
		"sort": "createTime",
		"sortType": "desc",
		"statCount": true
	};
	var detail = {};
	$.plusReady(function() {
		
		self = plus.webview.currentWebview();
		//webscoket()
		var timerIns; //计时器对象
		//清除上次的数据
		window.addEventListener("clearDevice", function(event) {
			document.body.querySelector('.mui-table-view').innerHTML = "";
			deviceList.clear();
			//清除计时器对象
			if(timerIns) {
				window.clearInterval(timerIns);
				timerIns = null;
			}
		})
		//重新加载数据
		window.addEventListener("reloadDeviceList", function(event) {
			console.log("还不进来吗")
			//			pullDownRefresh();
			$('#pullrefresh').pullRefresh().pulldownLoading();
		})
		function updateInfo() {
			if(!timerIns) {
				timerIns = setInterval(function() {
					//$('#pullrefresh').pullRefresh().pulldownLoading();
				}, 6000);
			}
		}
		//按需加载的情况下，需要第一次手动调用
		//updateInfo()


		//		window.addEventListener('reloadViewInfo', function(event) {
		//		    if(detail == event.detail) return;
		//		    detail = event.detail;
		//		    if(event.detail) {
		//		      if(event.detail.projectId) {
		//		        if(resourceCondition.projectId != event.detail.projectId) {
		//		          resourceCondition.projectId = event.detail.projectId;
		//		          pullDownRefresh();
		//		        }
		//		      } else {
		//		        resourceCondition.projectId = "";
		//		        pullDownRefresh();
		//		      }
		//		    } else {
		//		      resourceCondition.projectId = "";
		//		      pullDownRefresh();
		//		    }
		//		  });
		window.addEventListener('getProjectId', function(event) {
			console.log('是否传过来2----' + JSON.stringify(event.detail))
			console.log('原始数据---' + JSON.stringify(detail))
			//			if(detail == event.detail) return;
			detail = event.detail;
			if(event.detail) {
				if(event.detail.projectId) {
					if(resourceCondition.projectId != event.detail.projectId) {
						resourceCondition.projectId = event.detail.projectId;
						pullDownRefresh();
					}
				} else {
					resourceCondition.projectId = "";
					pullDownRefresh();
				}
			} else {
				resourceCondition.projectId = "";
				pullDownRefresh();
			}
		});

		window.addEventListener('deviceSearchEvent', function(event) {
			var searchKey = event.detail.deviceSearchKey;
			if(searchKey) {
				resourceCondition.orCondition = searchKey;
				resourceCondition.conditionField = ["sn", "label"];
			} else {
				delete resourceCondition["orCondition"];
				delete resourceCondition["conditionField"];
			}
			$('#pullrefresh').pullRefresh().pulldownLoading();
		});
		/*
		document.getElementById("deviceSearch").addEventListener('input', function() {
		  console.log("输入值变为：" + this.value);
		});
		*/
		/*
		document.getElementById("deviceSearch").addEventListener("keydown", function(e) {
		  if (13 === e.keyCode) { //点击了“搜索”  
		    document.activeElement.blur(); //隐藏软键盘 

		    var name = document.getElementById('deviceSearch').value;

		    if (name != undefined) {
		      resourceCondition.orCondition = name;
		      resourceCondition.conditionField = ["sn","label"];
		    } else {
		      delete resourceCondition["orCondition"];
		      delete resourceCondition["conditionField"];
		    }
		    $('#pullrefresh').pullRefresh().pulldownLoading();
		  }
		}, false);
    
		$(".mui-icon-clear")[0].addEventListener('tap', function() {
		   console.log("点击了清除按钮");
		});
		*/

	});

	//下拉刷新逻辑实现
	function pullDownRefresh() {
		var pullObject = $('#pullrefresh').pullRefresh();
		appFutureImpl.getAllCustomerInfoList(function(result, msg) {
				if(msg != null) {
					plus.nativeUI.toast(msg);
					return;
				}
				if(null != result) {
					customersData = {};
					for(var i = 0; i < result.length; i++) {
						customersData[result[i].id + ""] = result[i].customerName;
					}
				}
				queryParams.start = 0;
				queryParams.statCount = true;
				queryParams.total = 0;
				appFutureImpl.getDevicesByConditionWithPage([resourceCondition, queryParams], function(result, total, msg) {
					pullObject.endPulldownToRefresh();
					pullObject.refresh(true);
					if(msg == null) {
						queryParams.start = queryParams.start + queryParams.length;
						queryParams.statCount = false
						queryParams.total = total;
					} else {
						$.toast(msg);
						return;
					}
					var table = document.body.querySelector('.mui-table-view');
					table.innerHTML = ""; //初始化，清空
					deviceList.clear();
					deviceList.addArray(result);
					getDevicesState(result, function() {
						createDom(result);
					});
				});
			});

	}

	//上拉加载逻辑实现
	function pullUpRefresh() {
		var pullObject = $('#pullrefresh').pullRefresh();
		if(queryParams.start > queryParams.total) {
			pullObject.endPullupToRefresh(true); //参数为true代表没有更多数据了。
			return;
		}

		appFutureImpl.getDevicesByConditionWithPage([resourceCondition, queryParams], function(result, total, msg) {
			if(msg == null) {
				queryParams.start = queryParams.start + queryParams.length;
				queryParams.statCount = false;
				queryParams.total = total;
			} else {
				$.toast(msg);
				pullObject.endPullupToRefresh(false);
				return;
			}
			pullObject.endPullupToRefresh(false);
			deviceList.addArray(result);
			getDevicesState(result, function() {
				createDom(result);
			});
		});
	}

	function getDeviceInfoById(deviceId) {
		var deviceInfo;
		for(var index = 0, len = deviceList.size(); index < len; index++) {
			if(deviceList.get(index).id == deviceId) {
				deviceInfo = deviceList.get(index);
				break;
			}
		}
		return deviceInfo;
	}

	window.addEventListener('DEVICE_INFO_UPDATE', function(event) {
		$.toast("我收到信息了");
		var flag = event.detail.flag;
		var deviceId = event.detail.deviceId;
		pullDownRefresh();
	});

	function judgeState(managedStatus) {
		var txt = "";
		var iconClass = "";
		var txtColor = "";
		if(managedStatus == "active") {
			txt = "启用";
			iconClass = "system-icon-dvc-mgstatus-start";
			txtColor = " mui-badge-success mui-badge-inverted ";
		} else {
			txt = "停用";
			iconClass = "system-icon-dvc-mgstatus-stop";
			txtColor = " mui-badge-warning mui-badge-inverted ";
		}
		return '<span class"mui-pull-left" style="padding-right:5px;"><div class="mui-icon systemicon ' + iconClass + txtColor + ' dvc-status-icon"></div><span class="' + txtColor + '">' + txt + '</span></span>';
	}

	function onlineState(onlineStatus) {
		var txt = "无数据";
		var iconClass = "system-icon-dvc-olstatus-off";
		var txtColor = " mui-badge-default mui-badge-inverted ";
		if(onlineStatus === 1) {
			txt = "在线";
			iconClass = "system-icon-dvc-olstatus-on";
			txtColor = " mui-badge-success mui-badge-inverted ";
		} else if(onlineStatus === 0) {
			txt = "离线";
			iconClass = "system-icon-dvc-olstatus-off";
			txtColor = " mui-badge-warning mui-badge-inverted ";
		}
		return '<span class"mui-pull-left" style="padding-right:5px;"><div class="mui-icon systemicon ' + iconClass + txtColor + ' dvc-status-icon"></div><span class="' + txtColor + '">' + txt + '</span></span>';
	}

	function severityState(severity) {
		var txt = "";
		var iconClass = "";
		var txtColor = "";
		if(!severity || severity < 1) {
			txt = "正常";
			iconClass = "system-icon-dvc-status-normal";
			txtColor = " mui-badge-success mui-badge-inverted ";
		} else {
			txt = "告警";
			iconClass = "system-icon-dvc-status-warning";
			txtColor = " mui-badge-warning mui-badge-inverted ";
		}
		return '<span class"mui-pull-left" style="padding-right:5px;"><div class="mui-icon systemicon ' + iconClass + txtColor + ' dvc-status-icon"></div><span class="' + txtColor + '">' + txt + '</span></span>';
	}

	function getDevicesState(deviceObj, callbackFun) {
		if(null == deviceObj) {
			return;
		}
		var nodeIds = [];
		var deviceDic = storageUtil.getAllDevicesInfoList();
		if(!deviceDic)
			deviceDic = {};
		if(deviceDic && (deviceDic instanceof Array))
			deviceDic = {};
		for(var i = 0; i < deviceObj.length; i++) {
			deviceDic[deviceObj[i].id] = deviceObj[i];
			nodeIds.push(deviceObj[i].id)
		}
		storageUtil.setAllDevicesInfoList(deviceDic);
		var kpiQueryModel = {
			"category": "ci",
			"isRealTimeData": true,
			"nodeIds": nodeIds,
			"kpiCodes": [999999, 999998],
			"startTime": null,
			"endTime": null,
			"timeRange": "",
			"statisticType": "psiot",
			"includeInstance": true,
			"condList": []
		}
		appFutureImpl.getKpiValueList(kpiQueryModel, function(result, msg) {
			if(msg != null) {
				plus.nativeUI.toast(msg);
				return;
			}
			for(var i = 0; i < deviceObj.length; i++) {
				deviceObj[i].severity = "";
				deviceObj[i].onlineStatus = "";
				for(var j = result.length - 1; j > -1; j--) {
					if(deviceObj[i].id == result[j].nodeId) {
						if(result[j].kpiCode == 999999) { //故障状态
							deviceObj[i].severity = result[j].value;
							result.splice(j, 1);
						} else if(result[j].kpiCode == 999998) { //在线状态
							deviceObj[i].onlineStatus = result[j].value;
							result.splice(j, 1);
						}
					}
				}
			}
			if(callbackFun)
				callbackFun();
		});
	}

	function createDom(deviceObj) {
		if(null == deviceObj) {
			return;
		}
		var table = document.body.querySelector('.mui-table-view');
		for(var index = 0; index < deviceObj.length; index++) {
			var li = document.createElement('li');
			li.className = 'mui-table-view-cell';
			li.id = deviceObj[index].id;

			var customName = customersData[deviceObj[index].customerId + ""];
			if(!customName) {
				customName = "未知";
			}

			var template = '<a class=""><div class="dvc-hor-layout">' +
				'<div class="dvc-hor-layout-left">' +
				'<img class="device-img" src="../images/device/kongtiao.jpg">' +
				'</div>' +
				'<div class="dvc-hor-layout-center-wrapper"><div class="dvc-hor-layout-center device-detail-info">' +
				'<div class="mui-ellipsis">设备名称：' + deviceObj[index].label + '</div>' +
				'<div class="mui-ellipsis device-detail">序列号：' + deviceObj[index].sn + '</div>' +
				'<div class="mui-ellipsis device-detail">使用用户：' + customName + '</div>' +
				'<div style="margin-top:5px;">' + severityState(deviceObj[index].severity) + judgeState(deviceObj[index].managedStatus) + onlineState(deviceObj[index].onlineStatus) + '</div>' +
				'</div></div>' +
				'</div></a>';
			li.innerHTML = template;
			table.appendChild(li);
		}
	}
	$('#list').on('tap', 'li', function() {
		console.log("sh设备ID" + this.id)
		//dispatherManager.toDeviceDetail(getDeviceInfoById(this.id));
		
		dispatherManager.toDeviceDetail(this.id);
	});



}(mui, document))