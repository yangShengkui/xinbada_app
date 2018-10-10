(function($, doc) {
	$.init({});

	$.plusReady(function() {
		var self = plus.webview.currentWebview();
		var timerIns; //计时器对象
		//var deviceObj = self.deviceInfo;
		var deviceObj;
		var id = self.deviceId;
		var getDevice = function() {
			appFutureImpl.getResourceById(id, function(result, msg) {
				//console.log("设备信息" + JSON.stringify(result)) 
				if(msg != null) {
					plus.nativeUI.toast(msg);
					return;
				}
				deviceObj = result;
				var deviceId = deviceObj.id;
				var openerWebview = plus.webview.currentWebview().opener();

				if(deviceObj) {
					getModelInfo(deviceObj, function() {
						getDeviceState(deviceObj, function() {
							initData();
						})
					})
				} else {
					plus.nativeUI.toast('无法获得该设备的信息，请刷新')
				}
				plus.nativeUI.showWaiting();
				//获得该设备的模板定义
				function getModelInfo(deviceObj, callbackFun) {
					if(null == deviceObj) {
						return;
					}
					var loadingCount = 3;
					getModelKpis(deviceObj, function() {
						loadingCount--;
						if(loadingCount == 0 && callbackFun)
							callbackFun();
					})
					getAttrsByModelId(deviceObj, function() {
						loadingCount--;
						if(loadingCount == 0 && callbackFun)
							callbackFun();
					})
					appFutureImpl.getAllUnits(function() {
						loadingCount--;
						if(loadingCount == 0 && callbackFun)
							callbackFun();
					})
				}

				function getModelKpis(deviceObj, callbackFun) {
					var allInfo = storageUtil.getAllInfo()
					if(!allInfo) allInfo = {
						modelDic: {}
					};
					if(!allInfo.modelDic) allInfo.modelDic = {};
					if(!allInfo.modelDic[deviceObj.modelId + "_KPIS"]) {
						appFutureImpl.getKpisByModelId([deviceObj.modelId], function(modelKpis) {

							allInfo.modelDic[deviceObj.modelId + "_KPIS"] = modelKpis;
							storageUtil.setAllInfo(allInfo);
							var kpiCodes = [];
							for(var i = 0; i < modelKpis.length; i++) {
								kpiCodes.push(modelKpis[i].id);
							}
							deviceObj.kpiCodes = kpiCodes;
							deviceObj.modelKpis = modelKpis;
							plus.nativeUI.closeWaiting();
							if(callbackFun)
								callbackFun();
						});
					} else {
						var kpiCodes = [];
						var modelKpis = allInfo.modelDic[deviceObj.modelId + "_KPIS"]
						for(var i = 0; i < modelKpis.length; i++) {
							kpiCodes.push(modelKpis[i].id);
						}
						deviceObj.kpiCodes = kpiCodes;
						deviceObj.modelKpis = modelKpis;
						if(callbackFun)
							callbackFun();
					}
				}

				function getAttrsByModelId(deviceObj, callbackFun) {
					var allInfo = storageUtil.getAllInfo()
					if(!allInfo) allInfo = {
						modelDic: {}
					};
					if(!allInfo.modelDic) allInfo.modelDic = {};
					if(!allInfo.modelDic[deviceObj.modelId + "_ATTRS"]) {
						appFutureImpl.getAttrsByModelId([deviceObj.modelId], function(modelAttrs) {
							allInfo.modelDic[deviceObj.modelId + "_ATTRS"] = modelAttrs;
							storageUtil.setAllInfo(allInfo);
							deviceObj.modelAttrs = modelAttrs;
							if(callbackFun)
								callbackFun();
						});
					} else {
						deviceObj.modelAttrs = allInfo.modelDic[deviceObj.modelId + "_ATTRS"];
						if(callbackFun)
							callbackFun();
					}
				}

				function getDeviceState(deviceObj, callbackFun) {
					var kpiQueryModel = {
						"category": "ci",
						"isRealTimeData": true,
						"nodeIds": [deviceObj.id],
						"kpiCodes": deviceObj.kpiCodes,
						"startTime": null,
						"endTime": null,
						"timeRange": "",
						"statisticType": "psiot",
						"includeInstance": true,
						"condList": []
					}
					appFutureImpl.getKpiValueList(kpiQueryModel, function(result, msg) {
						plus.nativeUI.closeWaiting();
						if(msg != null) {
							plus.nativeUI.toast(msg);
							return;
						}
						var allInfo = storageUtil.getAllInfo();
						var modelKpis = deviceObj.modelKpis;
						for(var j = 0; j < modelKpis.length; j++) {
							modelKpis[j].arisingTime = "";
							modelKpis[j].value = "";
							for(var i = 0; i < result.length; i++) {
								if(modelKpis[j].id == result[i].kpiCode) {
									modelKpis[j].value = result[i].value;
									modelKpis[j].arisingTime = result[i].arisingTime;
									modelKpis[j].nodeId = result[i].nodeId;
								}
							}
						}
						deviceObj.modelKpis = modelKpis;
						if(callbackFun)
							callbackFun();
					});
				}

				var startBtn;
				var stopBtn;
				//var orderBtn;

				function initData() {
					if(null == deviceObj) {
						return;
					}
					createDom(deviceObj);
					startBtn = doc.getElementById('btn-id-start');
					stopBtn = doc.getElementById('btn-id-stop');
					orderBtn = doc.getElementById('btn-id-order');

					startBtn.addEventListener('tap', function(event) {
						if(deviceObj.managedStatus == "active") {
							plus.nativeUI.toast("该设备已经启用，无需重复操作!");
							return;
						}
						appFutureImpl.deviceActivateGateway(deviceId, function(result, msg) {
							if(msg != null) {
								plus.nativeUI.toast(msg);
								return;
							}
							if(null != result) {
								if(result.managedStatus == "active") {
									plus.nativeUI.toast("该设备启用成功");
									deviceObj.managedStatus = result.managedStatus;
									updateBtnCssState(0);
								}
							}
						});
					});

					stopBtn.addEventListener('tap', function(event) {
						if(deviceObj.managedStatus == "deactive") {
							plus.nativeUI.toast("该设备已经停用，无需重复操作!");
							return;
						}
						appFutureImpl.deviceDeactivateGateway(deviceId, function(result, msg) {
							if(msg != null) {
								plus.nativeUI.toast(msg);
								return;
							}
							if(null != result) {
								if(result.managedStatus == "deactive") {
									plus.nativeUI.toast("该设备停用成功");
									deviceObj.managedStatus = result.managedStatus;
									updateBtnCssState(1);
								}
							}
						})
					});

					orderBtn.addEventListener('tap', function(event) {
						dispatherManager.toOrder(deviceObj.modelId, deviceObj.id);
					})
				}

				//0：启用；1：停用；
				function sendBroadcast(flag) {
					$.fire(openerWebview, 'DEVICE_INFO_UPDATE', {
						flag: flag,
						deviceId: deviceId
					});
				}

				//0：启用；1：停用；
				function updateBtnCssState(flag) {

					var deviceDic = storageUtil.getAllDevicesInfoList();
					deviceDic[deviceObj.id] = deviceObj;
					storageUtil.setAllDevicesInfoList(deviceDic);

					var label = doc.getElementById('id-label');
					if(flag == 0) {
						startBtn.classList.remove('btn-start');
						startBtn.classList.add('btn-grey');
						stopBtn.classList.remove('btn-grey');
						stopBtn.classList.add('btn-stop');
						label.classList.remove('state_outline');
						label.classList.add('state_online');
						label.innerHTML = "正常";
					} else {
						startBtn.classList.remove('btn-grey');
						startBtn.classList.add('btn-start');
						stopBtn.classList.remove('btn-stop');
						stopBtn.classList.add('btn-grey');
						label.classList.remove('state_online');
						label.classList.add('state_outline');
						label.innerHTML = "告警";
					}
					sendBroadcast(flag);
				}

				function addStartClassName(managedStatus) {
					if(managedStatus == "active") {
						return 'btn-grey';
					} else {
						return 'btn-start';
					}
				}

				function addStopClassName(managedStatus) {
					if(managedStatus == "deactive") {
						return 'btn-grey';
					} else {
						return 'btn-stop';
					}
				}

				function severityState(severity) {
					if(!severity || severity < 1) {
						return '<span id="id-label" class="state_online">正常</span>';
					} else {
						return '<span id="id-label" class="state_outline ">告警</span>';
					}
				}

				function createTRDom(data) {
					var allInfo = storageUtil.getAllInfo();
					var trs = "";
					for(var index = 0; index < data.modelKpis.length; index++) {
						var time = "";
						var valueGroup = "";
						var testName = "";
						if(null != data.modelKpis[index].arisingTime && 0 != data.modelKpis[index].arisingTime.length) {
							//time = toolUtil.json2Time(data.modelKpis[index].arisingTime, "yyyy-MM-dd</br>hh:mm:ss");
							time = moment(data.modelKpis[index].arisingTime).format('YYYY-MM-DD</br>HH:mm:ss')
						}
						if(null != data.modelKpis[index].value && 0 != data.modelKpis[index].value.length) {
							valueGroup = data.modelKpis[index].value + (allInfo.unitDics[data.modelKpis[index].unit] ? allInfo.unitDics[data.modelKpis[index].unit] : "");
						}
						if(null != data.modelKpis[index].name) {
							testName += data.modelKpis[index].name;
						}
						if(null != allInfo.unitDics[data.modelKpis[index].unit]) {
							testName = testName + '(' + allInfo.unitDics[data.modelKpis[index].unit] + ')';
						}
						var htmlCode = '<tr testName="' + testName + '" kpiCode="' + data.modelKpis[index].id + '" nodeId="' + data.modelKpis[index].nodeId + '">' +
							'<td>' + data.modelKpis[index].name + '</td>' +
							'<td>' + valueGroup + '</td>' +
							'<td>' + time + '</td>' +
							'<td style="color:#f2ac19; padding-left:8px;">' + "查看 >>" + '</td></tr>';
						trs += htmlCode;
					}
					return trs;
				}

				function createDom(deviceObj) {
					var containter = document.body.querySelector('.mui-content');
					var htmlCode = '<div class="mui-card">' +
						'<div class="mui-card-content dvc-detail-head">' +
						'<div class="mui-pull-left" style="background-color: transparent;">' +
						'<div class="mui-icon appicon app-icon-data dvc-detail-head-icon" style="background-color: transparent;"></div>' +
						'</div>' +
						'<div class="ddl-hor-layout-center-wrapper"><div class="ddl-hor-layout-center dvc-detail-head-detail">' +
						'<div class="dvc-detail-head-title text-wrap-dot">' + deviceObj.label + '</div>' +
						'<div style="background: transparent;">' + severityState(deviceObj.severity) + '</div>' +
						'</div></div>' +
						'</div>' +

						'<div class="mui-card-footer dvc-detail-head-info">' +
						'<div style="height:40px;">' +
						'<div class="mui-pull-right">' +
						'<button id="btn-id-order" class="mui-btn order-btn btn-start">指令发送</button>' +
						'<button id="btn-id-start" class="mui-btn ' + addStartClassName(deviceObj.managedStatus) + '">启用</button>' +
						'</div>' +
						'<div class="ddl-hor-layout-center-wrapper"><div class="ddl-hor-layout-center">' +
						'<div class="dvc-detail-dvcinfo text-wrap-dot">序列号：' + deviceObj.sn + '</div>' +
						'</div></div>' +
						'</div>' +
						'<div style="height:40px;">' +
						'<div class="mui-pull-right">' +
						'<button id="btn-id-stop" class="mui-btn ' + addStopClassName(deviceObj.managedStatus) + '">停用</button>' +
						'</div>' +
						'<div class="ddl-hor-layout-center-wrapper"><div class="ddl-hor-layout-center">' +
						'<div class="dvc-detail-dvcinfo text-wrap-dot">出厂日期：' + deviceObj.createTime.substring(0, 10) + '</div>' +
						'</div></div>' +
						'</div>' +
						'</div>' +
						'</div>' +

						'<div>' +
						'<div class="mui-card-content" style="border: none;">' +
						'<span class="mui-icon appicon app-icon-data" style="font-size: 1.3rem; vertical-align: middle;margin:0.2rem 0.3rem 0.1rem 0.5rem;"></span>' +
						'<span class="his-name">工况</span>' +
						'</div>' +
						'<div class="mui-card-footer" style="background-color:white;">' +
						'<table class="mui-table">' +
						'<thead>' +
						'<tr>' +
						'<th style="text-align: center;">' +
						'  <div class="mui-icon systemicon system-icon-dvc-dtl-sample-name dvc-monitor-detail-head-icon main-color"></div>' +
						'  <div class="dvc-monitor-detail-head-title">测点名称</div>' +
						'</th>' +
						'<th style="text-align: center;">' +
						'  <div class="mui-icon systemicon system-icon-dvc-dtl-current-value dvc-monitor-detail-head-icon main-color"></div>' +
						'  <div class="dvc-monitor-detail-head-title">当前值</div>' +
						'</th>' +
						'<th style="text-align: center;">' +
						'  <div class="mui-icon systemicon system-icon-dvc-dtl-sample-time dvc-monitor-detail-head-icon main-color"></div>' +
						'  <div class="dvc-monitor-detail-head-title">采集时间</div>' +
						'</th>' +
						'<th style="text-align: center;">' +
						'  <div class="mui-icon systemicon system-icon-dvc-dtl-history-data dvc-monitor-detail-head-icon main-color"></div>' +
						'  <div class="dvc-monitor-detail-head-title">历史值</div>' +
						'</th>' +
						'</tr>' +
						'</thead>' +
						'<tbody id="id-containter">' + createTRDom(deviceObj) + '</tbody>' +
						'</table>' +
						'</div>' +
						'</div>';
					containter.innerHTML = htmlCode;

					$('#id-containter').on('tap', 'tr', function() {
						var kpiCode = parseInt(this.getAttribute("kpiCode"));
						var nodeId = parseInt(this.getAttribute("nodeId"));
						var testName = this.getAttribute("testName");
						dispatherManager.toDeviceHistoryData(kpiCode, nodeId, testName);
					});
				}

			})
		}

		function updateInfo() {
			getDevice()
			if(!timerIns) {
				timerIns = setInterval(function() {
					getDevice()
				}, 60000);
			}
		}
		//按需加载的情况下，需要第一次手动调用
		updateInfo()

	});
}(mui, document))