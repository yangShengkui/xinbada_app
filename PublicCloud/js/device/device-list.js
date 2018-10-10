(function($, doc) {
	$.init({
		pullRefresh: {
			container: "#pullrefresh",
			down: toolUtil.getDownRefreshConfig(pullDownRefresh, 50, "false"),
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
		//"sort": "createTime",
		//"sortType": "desc",
		"sort": "sn",
		"sortType": "asc",
		"statCount": true
	};
	var detail = {};
	$.plusReady(function() {
		self = plus.webview.currentWebview();
		//清除上次的数据，提问，检索条件是不是清除呢？
		window.addEventListener("clearDevice", function(event) {
			document.body.querySelector('.mui-table-view').innerHTML = "";
			deviceList.clear();
		})
		window.addEventListener('deviceSearchEvent', function(event) {
			//每次查询都是从头开始
			queryParams = {
				"start": 0,
				"length": 10,
				//"sort": "createTime",
				//"sortType": "desc",
				"sort": "sn",
				"sortType": "asc",
				"statCount": true
			}
			var newresourceCondition = event.detail;
			localStorage.setItem('localData', newresourceCondition);
			var localData = localStorage.getItem('localData')
			console.log('newresourceCondition--->' + JSON.stringify(newresourceCondition))
			//初始化客户（产线）的信息，如果有需要的话，还可以获得域和项目（区域）的信息
			customersData = {};
			if(newresourceCondition.customData) {
				for(var i = 0; i < newresourceCondition.customData.length; i++) {
					customersData[newresourceCondition.customData[i].id + ""] = newresourceCondition.customData[i].customerName;
				}
			}

			//如果有设备名称查询的话
			if(newresourceCondition.orCondition) {
				resourceCondition.orCondition = newresourceCondition.orCondition;
				resourceCondition.conditionField = newresourceCondition.conditionField;
			} else {
				delete resourceCondition["orCondition"];
				delete resourceCondition["conditionField"];
			}
			//如果有域的话(可能来源于基地和厂区)
			if(newresourceCondition.domains) {
				resourceCondition.domains = newresourceCondition.domains;
			} else {
				resourceCondition.domains = "";
			}
			if(newresourceCondition.customerId) {
				resourceCondition.customerId = newresourceCondition.customerId;
			} else {
				resourceCondition.customerId = "";
			}
			if(newresourceCondition.projectId) {
				resourceCondition.projectId = newresourceCondition.projectId;
			} else {
				resourceCondition.projectId = "";
			}

			//执行下拉
			$('#pullrefresh').pullRefresh().pulldownLoading();
			pullDownRefresh();

			/**
			 * 预加载设备详情页
			 */
			dispatherManager.initDeviceDetail();
		});
	});

	//上拉下拉对象，用来控制是否可以再次刷新
	var pullObject;
	var initPullHandler = function(state, upstate) {
		if(state == "down") {
			pullObject.endPulldownToRefresh(); //不再执行下拉刷新
			pullObject.refresh(true); //重置上拉刷新
		} else if(state == "up") {
			//upstate:true表示没有更多了  false表示还有
			pullObject.endPullupToRefresh(upstate);
		}
	}
	//下拉刷新逻辑实现
	function pullDownRefresh() {
		if(!pullObject) pullObject = $('#pullrefresh').pullRefresh();

		queryParams.start = 0;
		queryParams.statCount = true;
		queryParams.total = 0;
		var formerPage = plus.webview.getWebviewById('main-subpage-device.html');
		$.fire(formerPage, 'returnData', resourceCondition);
		var userInfo = storageUtil.getUserInfo();
		if(!userInfo.roleFunctionCodeMaps) {
			console.log("首次加载" + JSON.stringify(userInfo.roleFunctionCodeMaps))
			var roleID = userInfo.roleID.split(',');
			userInfo.functionCodeSet = userInfo.roleFunctionCodeMap[roleID[0]]
		} else {
			console.log("切换时候" + JSON.stringify(userInfo.roleFunctionCodeMaps))
			var roleIDs = userInfo.roleIDs.split(',');
			userInfo.functionCodeSet = userInfo.roleFunctionCodeMaps[roleIDs[0]]
		}
		console.log('userInfoDetail--->' + JSON.stringify(userInfo.functionCodeSet))
		if(userInfo.functionCodeSet.indexOf('F07_01') != -1 && userInfo.functionCodeSet.indexOf('F07_12') == -1) {
			resourceCondition.values = {};
		} else {
			if(userInfo.functionCodeSet.indexOf('F07_08') != -1 || userInfo.functionCodeSet.indexOf('F07_12') != -1 || userInfo.functionCodeSet.indexOf('F07_11') != -1 || userInfo.functionCodeSet.indexOf('F07_10') != -1) { //产线工程师||检修
				resourceCondition.values = {
					"diagnosticType": "90"
				};
			} else if(userInfo.functionCodeSet.indexOf('F08_03') != -1) {
				resourceCondition.values = {
					"diagnosticType": "90"
				};
			} else if(userInfo.functionCodeSet.indexOf('F08_02') != -1) { //非2050外所有的总包
				resourceCondition.values = {
					"diagnosticType": {
						"NE": "90"
					}
				};
			} else {
				resourceCondition.values = {};
			}
		}
		console.log('resourceCondition--->' + JSON.stringify(resourceCondition))
		console.log('queryParams---->' + JSON.stringify(queryParams))
		appFutureImpl.getDevicesByConditionWithPage([resourceCondition, queryParams], function(result, total, msg) {
//			console.log('resourceCondition--->' + JSON.stringify(resourceCondition))
//			console.log('queryParams---->' + JSON.stringify(queryParams))
			if(total == 0){
				plus.nativeUI.toast("没有更多数据了");
			}
			if(msg == null) {
				queryParams.start = queryParams.start + queryParams.length;
				queryParams.statCount = false;
				queryParams.total = total;
			} else {
				initPullHandler("down");
				$.toast(msg);
				return;
			}
			var table = document.body.querySelector('.mui-table-view');
			table.innerHTML = ""; //初始化，清空
			deviceList.clear();
			deviceList.addArray(result);
			getDevicesState(result, "down");
		});
	}

	//上拉加载逻辑实现
	function pullUpRefresh() {
		if(!pullObject) pullObject = $('#pullrefresh').pullRefresh();

		if(queryParams.start > queryParams.total) {
			initPullHandler("up", true);
			return;
		}

		appFutureImpl.getDevicesByConditionWithPage([resourceCondition, queryParams], function(result, total, msg) {
			if(msg == null) {
				queryParams.start = queryParams.start + queryParams.length;
				queryParams.statCount = false;
			} else {
				$.toast(msg);
				initPullHandler("up", false);
				return;
			}
			deviceList.addArray(result);
			getDevicesState(result, "up")
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

	function getDevicesState(deviceObj, state) {
		if(null == deviceObj) {
			initPullHandler(state, true);
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
				initPullHandler(state, false);
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
			createDom(deviceObj, state);
		});
	}

	function createDom(deviceObj, state) {
		initPullHandler(state, false);
		if(null == deviceObj) {
			return;
		}
		var table = document.body.querySelector('.mui-table-view');
		appFutureImpl.queryDomainInfoTree([301], function(result, msg) {
			console.log('树结构eeeeeee' + JSON.stringify(result[0]))
			if(null != msg) {
				futureListener(null, msg);
				return;
			}
			var domainsInfosAll = result;
			for(var index = 0; index < deviceObj.length; index++) {
				if(deviceObj[index].severity == -1) {
					setColor = '#00bc79';
				} else if(deviceObj[index].severity == 2) {
					setColor = '#efd709';
				} else if(deviceObj[index].severity == 3) {
					setColor = '#ee6b1c';
				} else if(deviceObj[index].severity == 4) {
					setColor = '#e74e53';
				} else {
					setColor = '#00bc79';
				}
				var li = document.createElement('li');
				li.className = 'mui-table-view-cell';
				li.id = deviceObj[index].id;
//				console.log('ddddd---' + JSON.stringify(deviceObj[index].customerId))
				var customName;
//				console.log('customersData---aa---' + JSON.stringify(customersData))
				if(customersData) {
					if(JSON.stringify(customersData) == '{}') {
						if(domainsInfosAll[0].domainInfos) { //基地
							for(var i = 0; i < domainsInfosAll[0].domainInfos.length; i++) { //基地
								if(domainsInfosAll[0].domainInfos[i].domainInfos) { //厂区
									for(var j = 0; j < domainsInfosAll[0].domainInfos[i].domainInfos.length; j++) { //厂区
										if(domainsInfosAll[0].domainInfos[i].domainInfos[j].domainInfos) { //产线
											projectData = domainsInfosAll[0].domainInfos[i].domainInfos[j].domainInfos;
											for(var m = 0; m < domainsInfosAll[0].domainInfos[i].domainInfos[j].domainInfos.length; m++) { //产线
												if(deviceObj[index].customerId == domainsInfosAll[0].domainInfos[i].domainInfos[j].domainInfos[m].id) {
													customName = domainsInfosAll[0].domainInfos[i].domainInfos[j].domainInfos[m].label;
												}
											}
										}
									}
								}
							}
						}
					} else {
						customName = customersData[deviceObj[index].customerId + ""];
						if(!customName) {
							customName = "未知";
						}
					}
				} else {
					customName = customersData[deviceObj[index].customerId + ""];
					if(!customName) {
						customName = "未知";
					}
				}

				var template = '<a class=""><div class="dvc-hor-layout">' +
					'<div>' +
					'<div class="circle"style="background-color:' + setColor + '">' +
					'</div>' +
					'<span class="mui-ellipsis">' + deviceObj[index].label + '</span>' +
					'</div>' +
					'<div class="dvc-hor-layout-center-wrapper" style="float:right"><div class="dvc-hor-layout-center device-detail-info">' +
					'<div class="mui-ellipsis device-detail">' + customName + '</div>' +
					//          '<div style="margin-top:5px;">' + severityState(deviceObj[index].severity) + judgeState(deviceObj[index].managedStatus) + onlineState(deviceObj[index].onlineStatus) + '</div>' +
					'</div></div>' +
					'</div></a>';
				li.innerHTML = template;
				table.appendChild(li);
			}
		})
	}

	/**
	 * 点击设备后，向设备详情页传递设备的ID
	 * 会触发get_device_detail事件
	 */
	$('#list').on('tap', 'li', function() {
		dispatherManager.toDeviceDetail(this.id);
	});

}(mui, document))