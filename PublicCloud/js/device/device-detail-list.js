(function($, doc) {
	$.init({
		pullRefresh: {
			container: "#pullrefresh",
			down: toolUtil.getDownRefreshConfig(pulldownRefresh, 50, "false")
			//    up: toolUtil.getUpRefreshConfig(pullupRefresh)
		}
	});

	var deviceId;
	var self;
	var alertInfoList = new ArrayList();
	$.plusReady(function() {
		self = plus.webview.currentWebview();
		console.log("我是【" + self.queryStates + "】我是来告警你们我来了");
		var allInfo = storageUtil.getAllInfo();
		if(allInfo && allInfo.eventParams && allInfo.eventParams.queryStates == self.queryStates) {
			deviceId = allInfo.eventParams.deviceId;
			pulldownRefresh();
		}
		console.log('allInfo' + JSON.stringify(allInfo))
		// 监听DEVICE_INFO_UPDATE，进行处理
		window.addEventListener('DEVICE_INFO_UPDATE', function(event) {
			if(event.detail) {
				deviceId = event.detail.deviceId;
				console.log("我是【" + event.detail.queryStates + "】这是传递给我的参数deviceId:" + deviceId)
				// queryStates没有值，或者queryStates和当前页面的queryStates一致
				if(!event.detail.queryStates || event.detail.queryStates == self.queryStates) {
					var table = doc.body.querySelector('.mainContent');
					table.innerHTML = "";
					pulldownRefresh();
				} else {
					var table = doc.body.querySelector('.mainContent');
					table.innerHTML = "";
				}
			}
		});
	})

	function pulldownRefresh() {

		//下拉加载更多业务实现
		var pullObject = $('#pullrefresh').pullRefresh();
		var kpiCodes = [];
		var kpiCodes2 = [];
		var ping = [];
		var ping2 = [];
		var queryParams = [{
			"node": "1",
			"conditionField": ["sn", "label"]
		}, {
			"start": 0,
			"length": 10,
			"sort": "createTime",
			"sortType": "desc",
			"statCount": true
		}]
		console.log('deviceId--->' + JSON.stringify(deviceId));
		var openerWebview = plus.webview.currentWebview().opener();
		var queryParams = {
			"nodeIds": deviceId,
			"severities": "1,2,3,4",
			"states": "0,5,10,20,30",
			"appName": "",
			"firstTimeFrom": "",
			"firstTimeTo": ""
		}
		var queryParams4Page = {
			"start": 0,
			"length": 500,
			"statCount": true
		}

		//获取设备完全信息
		appFutureImpl.getDevicesByCondition({
			'resourceId': deviceId
		}, function(result, success, msg) {
			console.log('获取设备完全信息 : ' + JSON.stringify(result))
			if(pullObject) {
				pullObject.endPulldownToRefresh();
				pullObject.refresh(true);
			}
			var data = result;
			if(null != msg) {
				plus.nativeUI.toast(msg);
				return;
			}
			var externalDevId = '';
			if(self.queryStates == "离线诊断报告" || self.queryStates == "精密检测报告") {
				for(var n = 0; n < result.length; n++) {
					if(result[n].id == deviceId) {
						externalDevId = result[n].externalDevId;
						//离线诊断报告
						appFutureImpl.getDeviceOfflineReportListByCondition({
							'devId': externalDevId
						}, function(result, success, msg) {
							console.log('离线诊断抱抱抱告--->' + JSON.stringify(result))
							if(JSON.stringify(result) == '[]') {
								plus.nativeUI.toast("暂无离线报告"); //出现提示框
								plus.nativeUI.closeWaiting(); //关闭提示框
								return;
							}
							if(null != msg) {
								plus.nativeUI.toast(msg);
								return;
							}
							var table = doc.body.querySelector('.mainContent');
							table.innerHTML = "";
							var ul = doc.createElement('ul');
							for(var i = 0; i < result.length; i++) {
								var li = doc.createElement('li');
								li.className = 'mui-table-view-cell';
								li.id = result[i].id + '/' + result[i].rptNo;
								li.style.borderBottom = "1px solid #e3e3e3"
								var specialty = '';
								if(result[i].conclusion == 4) {
									li.style.borderLeft = "5px solid #e74e53"
								} else if(result[i].conclusion == 3) {
									li.style.borderLeft = "5px solid #ee6b1c"
								} else if(result[i].conclusion == 2) {
									li.style.borderLeft = "5px solid #efd709"
								} else if(result[i].conclusion == -1) {
									li.style.borderLeft = "5px solid #00bc79"
								}
								if(result[i].specialty == 'Z') {
									specialty = '振动';
								} else if(result[i].specialty == 'Y') {
									specialty = '油液';
								} else if(result[i].specialty == 'Q') {
									specialty = '清洁度检测（油质）';
								} else if(result[i].specialty == 'M') {
									specialty = '磨损分析';
								} else if(result[i].specialty == 'J') {
									specialty = '绝缘油分析';
								} else if(result[i].specialty == 'H') {
									specialtyProp = '红外热成像检测';
								} else if(result[i].specialty == 'D') {
									specialty = '电机电流';
								} else if(result[i].specialty == 'K') {
									specialty = '开关温度';
								} else if(result[i].specialty == 'P') {
									specialty = '液压';
								} else if(result[i].specialty == 'N') {
									specialty = '扭矩';
								} else if(result[i].specialty == 'G') {
									specialty = '工艺指标';
								} else if(result[i].specialty == 'W') {
									specialty = '表面温度';
								}
								var rptDate = moment(result[i].rptDate).format("YYYY-MM-DD")
								var template = '<p>报告编号：' + result[i].rptNo + '<span class="mui-pull-right">' + rptDate + '</span></p>' +
									'<p>负责人：' + result[i].reportor + '</p>' +
									'<p>专业类型：' + specialty + '</p>';
								li.innerHTML = template;
								ul.appendChild(li);
								table.appendChild(ul);
							}
						})
					}
				}
				$('.mainContent').on('tap', 'li', function() {
					dispatherManager.toOfflineDetail(this.id, self.queryStates)
				});
			}
			//实时状态
			if(self.queryStates == "实时状态") {
				plus.nativeUI.showWaiting("正在加载");
				//				appFutureImpl.getAttrsByModelId(data[0].modelId, function(result, msg) {
				appFutureImpl.getResourceById(data[0].id, function(result, msg) {
					console.log('获得测点的定义和信息----->' + JSON.stringify(result))
					if(JSON.stringify(result) == '[]') {
						plus.nativeUI.toast("暂无实时数据"); //出现提示框
						return;
					}
					//获得测点的定义和信息，这里
					var mpl4zpoint = [];
					if(result.values.MeasurePointLocate) {
						var measurePointLocate = JSON.parse(result.values.MeasurePointLocate);
						var mpl = measurePointLocate;
						for(var key in mpl[0]) {
							if(key != "G") { //除了工艺以外的测点都显示
								for(var jj = 0; jj < mpl[0][key].length; jj++) {
									var p = mpl[0][key][jj];
									p.specialtyProp = key;
									//name>1000的都不显示  为离线的测点
									if(p.name.length < 4) {
										mpl4zpoint.push(p)
									}

								}
							}
						}
					}
					//					for(var j = 0; j < result.length; j++) {
					//						if(result[j]["name"] == "MeasurePointLocate") {
					//							var mpl = JSON.parse(result[j]["sourceValue"]);
					//							if(mpl && mpl.length > 0) { //说明有数据
					//								for(var key in mpl[0]) {
					//									if(key != "G") { //除了工艺以外的测点都显示
					//										for(var jj = 0; jj < mpl[0][key].length; jj++) {
					//											var p = mpl[0][key][jj];
					//											p.specialtyProp = key;
					//											mpl4zpoint.push(p)
					//										}
					//									}
					//								}
					//							}
					//							break;
					//						}
					//					}
					if(data[0].physicalConfig.accessConfigs != null) {

						for(var i = 0; i < data[0].physicalConfig.accessConfigs.length; i++) {
							if(data[0].physicalConfig.accessConfigs[i].specialtyProp != 'G') {
								if(!(data[0].physicalConfig.accessConfigs[i].kpiName === "速度" || data[0].physicalConfig.accessConfigs[i].kpiName === "冲击")) {
									var obj2 = {
										'specialtyProp': data[0].physicalConfig.accessConfigs[i].specialtyProp,
										"kpiName": data[0].physicalConfig.accessConfigs[i].kpiName,
										"instance": data[0].physicalConfig.accessConfigs[i].instance,
									}
									kpiCodes2.push(data[0].physicalConfig.accessConfigs[i].dataItemId);
									ping2.push(obj2);
								}

							}
						}
					}
					//获取状态颜色999997
					var kpiQueryModel = {
						"category": "ci",
						"isRealTimeData": true,
						"nodeIds": [deviceId],
						"kpiCodes": [999997], //节点告警状态
						"includeInstance": true
					}
					appFutureImpl.getKpiValueList(kpiQueryModel, function(result, msg) {
						var kqiData = result;
						var newKqiData = [];
						console.log('获取状态颜色 ：' + JSON.stringify(kqiData))
						if(msg != null) {
							plus.nativeUI.toast(msg);
							return;
						}
						for(var q = 0; q < kqiData.length; q++) {
							newKqiData.push(kqiData[q].instance.split('_'));
							newKqiData[q].push(kqiData[q].value)
						}
						console.log('拆分后的颜色 ：' + JSON.stringify(newKqiData))
						var kpiQueryModel2 = {
							"category": "ci",
							"isRealTimeData": true,
							"nodeIds": [deviceId],
							"kpiCodes": kpiCodes2,
							"startTime": null,
							"endTime": null,
							"timeRange": "",
							"statisticType": "psiot",
							"includeInstance": true,
							"condList": []
						}
						console.log('kpiQueryModel2 ---> : ' + JSON.stringify(kpiQueryModel2));
						appFutureImpl.getKpiValueList(kpiQueryModel2, function(result, msg) {
							//console.log('kpiCode后得具体数值--->' + JSON.stringify(result));
							for(var a = 0; a < result.length; a++) {
								if(result[a].value.toString().indexOf('.') > -1) {
									if(result[a].value.toString().split('.')[1].length > 4) {
										if(typeof(result[a].value) == 'object') {
											result[a].value = result[a].value[0].toFixed(4);
										} else {
											result[a].value = result[a].value.toFixed(4);
										}
									}
								}
							}
							var resultObj = result;
							plus.nativeUI.closeWaiting();
							if(msg != null) {
								plus.nativeUI.toast(msg);
								return;
							}
							appFutureImpl.getKpisByKpiIds([kpiCodes2], function(result, success, msg) {
								console.log('单位--->' + JSON.stringify(result));
								var units = [];
								for(var i = 0; i < result.length; i++) {
									if(result[i].unit) {
										units.push({
											id: result[i].id,
											unit: result[i].unit,
											label: result[i].label
										})
									} else {
										units.push({
											id: result[i].id,
											unit: '',
											label: result[i].label
										})
									}

								}
								for(var j = 0; j < units.length; j++) {
									for(var z = 0; z < resultObj.length; z++) {
										if(resultObj[z].kpiCode == units[j].id) {
											resultObj[z].kpiName = units[j].label
											resultObj[z].value = (resultObj[z].value + units[j].unit)
										}
									}
								}
								console.log('unit--->' + JSON.stringify(resultObj));
								var arr1 = new Array();
								var finalArray = new Array();
								for(var b = 0; b < resultObj.length; b++) {
									var finalObj = JSON.stringify(resultObj[b]);
									if(arr1.indexOf(finalObj) == -1) {
										arr1.push(finalObj);
										finalArray.push(resultObj[b]);
									}
								}

								for(var i = 0; i < finalArray.length; i++) {
									for(var h = 0; h < newKqiData.length; h++) {
										if(Number(newKqiData[h][0]) == finalArray[i].kpiCode && newKqiData[h][1] == finalArray[i].instance) {
											finalArray[i].color = newKqiData[h][2];
										}

									}
								}
								//								console.log('颜色color ---> ' + JSON.stringify(finalArray))
								var table = doc.body.querySelector('.mainContent');
								table.innerHTML = "";
								table.style.paddingLeft = '10px';
								var tle = '<p style="font-size:18px;margin:0;padding-top:10px">设备：' + data[0].label + '</p>';
								var tle3 = '';
								for(var m = 0; m < mpl4zpoint.length; m++) {
									var num = m + 1;
									var template2 = '<p style="color:#6A7D8F;margin:5px 0">' + num + '.' + mpl4zpoint[m].label + '</p>';
									var tle2 = '';
									for(var i = 0; i < finalArray.length; i++) {
										var bgColor = "#00bc79";
										if(finalArray[i].color == '4') {
											bgColor = '#e74e53';
										} else if(finalArray[i].color == '3') {
											bgColor = '#ee6b1c';
										} else if(finalArray[i].color == '2') {
											bgColor = '#efd709';
										} else if(finalArray[i].color == '1') {
											bgColor = '#00bc79';
										}
										if(mpl4zpoint[m].name == finalArray[i].instance) {
											var template = '<p class="data-list"><span class="tle" style="display:inline-block;width:40%;">' + finalArray[i].kpiName + '</span><span class="mui-badge num" style="color:#fff;background-color:' + bgColor + '" id="' + finalArray[i].kpiCode + '/' + finalArray[i].nodeId + '/' + finalArray[i].instance + '">' + finalArray[i].value + '</span></p>';
											tle2 += template;
										}
									}
									tle3 += template2 + tle2;
								}
								plus.nativeUI.closeWaiting();
								table.innerHTML = tle + tle3;
							})
						});
					});

				})
				$('.mainContent').on('tap', 'p .num', function() {
					dispatherManager.toTrendencyDetail(this.id)
				});
			}
			//工艺参数
			if(self.queryStates == "工艺参数") {
				//				appFutureImpl.getAttrsByModelId(data[0].modelId, function(result, msg) {
				appFutureImpl.getResourceById(data[0].id, function(result, msg) {
					console.log('获得测点的定义和信息----->' + JSON.stringify(result))
					if(JSON.stringify(result) == '[]') {
						plus.nativeUI.toast("暂无实时数据"); //出现提示框
						return;
					}
					//获得测点的定义和信息，这里
					var mpl4zpoint = [];
					if(result.values.MeasurePointLocate) {
						var measurePointLocate = JSON.parse(result.values.MeasurePointLocate);

						var mpl = measurePointLocate;
						for(var key in mpl[0]) {
							if(key == "G") { //除了工艺以外的测点都显示
								for(var jj = 0; jj < mpl[0][key].length; jj++) {
									var p = mpl[0][key][jj];
									p.specialtyProp = key;
									//name>1000的都不显示  为离线的测点
									if(p.name.length < 4) {
										mpl4zpoint.push(p)
									}

								}
							}
						}
					}
					//					for(var j = 0; j < result.length; j++) {
					//						if(result[j]["name"] == "MeasurePointLocate") {
					//							var mpl = JSON.parse(result[j]["sourceValue"]);
					//							if(mpl && mpl.length > 0) { //说明有数据
					//								for(var key in mpl[0]) {
					//									if(key == "G") { //除了工艺以外的测点都显示
					//										for(var jj = 0; jj < mpl[0][key].length; jj++) {
					//											var p = mpl[0][key][jj];
					//											p.specialtyProp = key;
					//											mpl4zpoint.push(p)
					//										}
					//									}
					//								}
					//							}
					//							break;
					//						}
					//					}
					if(data[0].physicalConfig.accessConfigs != null) {
						for(var i = 0; i < data[0].physicalConfig.accessConfigs.length; i++) {
							if(data[0].physicalConfig.accessConfigs[i].specialtyProp == 'G') {
								var obj = {
									'specialtyProp': data[0].physicalConfig.accessConfigs[i].specialtyProp,
									"kpiName": data[0].physicalConfig.accessConfigs[i].kpiName,
									"instance": data[0].physicalConfig.accessConfigs[i].instance,

								}
								kpiCodes.push(data[0].physicalConfig.accessConfigs[i].dataItemId);
								ping.push(obj);
							}
						}
					}
					var kpiQueryModel = {
						"category": "ci",
						"isRealTimeData": true,
						"nodeIds": [deviceId],
						"kpiCodes": kpiCodes,
						"startTime": null,
						"endTime": null,
						"timeRange": "",
						"statisticType": "psiot",
						"includeInstance": true,
						"condList": []
					}
					appFutureImpl.getKpiValueList(kpiQueryModel, function(result, msg) {

						for(var a = 0; a < result.length; a++) {
							if(result[a].value.toString().indexOf('.') > -1) {
								if(result[a].value.toString().split('.')[1].length > 4) {
									result[a].value = result[a].value.toFixed(4);
								}
							}
						}
						var resultObj = result;

						plus.nativeUI.closeWaiting();
						if(msg != null) {
							plus.nativeUI.toast(msg);
							return;
						}
						appFutureImpl.getKpisByKpiIds([kpiCodes], function(result, success, msg) {
							console.log('单位--->' + JSON.stringify(result));
							var units = [];
							for(var i = 0; i < result.length; i++) {
								if(result[i].unit) {
									units.push({
										id: result[i].id,
										unit: result[i].unit,
										label: result[i].label
									})
								} else {
									units.push({
										id: result[i].id,
										unit: '',
										label: result[i].label
									})
								}
							}
							for(var j = 0; j < units.length; j++) {
								for(var z = 0; z < resultObj.length; z++) {
									if(resultObj[z].kpiCode == units[j].id) {
										resultObj[z].kpiName = units[j].label
										resultObj[z].value = (resultObj[z].value + units[j].unit)
									}
								}
							}
							console.log('unit--->' + JSON.stringify(resultObj));
							appFutureImpl.getKpisByModelId(data[0].modelId, function(result, success, msg) {
								//								console.log('mmmmmmmodel--->' + JSON.stringify(result))
								//								console.log('外层的设备信息' + JSON.stringify(resultObj))
								var mdRes = result;
								if(null != msg) {
									futureListener(null, msg);
									return;
								}
								if(success && result.code == 0) {
									futureListener(result.data, null);
								}
								for(var cd = 0; cd < resultObj.length; cd++) {
									for(var md = 0; md < mdRes.length; md++) {
										if(resultObj[cd].kpiCode == mdRes[md].id) {
											if(mdRes[md].range != null) {
												if(resultObj[cd].value) {
													//													console.log('range : '+JSON.stringify(mdRes[md].range))
													//													console.log('unit2222--->' + JSON.stringify(resultObj[cd].value));
													var obj = JSON.parse(mdRes[md].range);
													var objVal = resultObj[cd].value;
													//													console.log('ppparse : ' + JSON.stringify(obj[objVal]))
													//console.log('ppparse222 : '+JSON.stringify(objVal))
													resultObj[cd].value = obj[objVal]
												} else {
													resultObj[cd].value = '-';
												}

											}
										}
									}
								}

								//								})
								var table = doc.body.querySelector('.mainContent');
								table.style.paddingLeft = '10px';
								table.innerHTML = "";
								var tle = '<p style="font-size:18px;margin:0;padding-top:10px">设备：' + data[0].label + '</p>';
								var tle3 = '';
								//								var instanceAlone = [];
								//								var dataAlone = []
								//								for(var i = 0; i < resultObj.length; i++) {
								//									//绝缘辊去重   00是正常设备情况
								//									if(instanceAlone.indexOf(resultObj[i].instance) == -1 || resultObj[i].instance == '00' ||  resultObj[i].instance.indexOf('00') != -1) {
								//										instanceAlone.push(resultObj[i].instance)
								//										dataAlone.push(resultObj[i])
								//									}
								//								}

								for(var m = 0; m < mpl4zpoint.length; m++) {
									var num = m + 1;
									var template2 = '<p style="color:#6A7D8F;margin:5px 0">' + mpl4zpoint[m].label + '</p>';
									var tle2 = '';
									for(var i = 0; i < resultObj.length; i++) {
										if(mpl4zpoint[m].name == resultObj[i].instance) {
											if(resultObj[i].value == undefined) {
												resultObj[i].value = '暂无数据'
											}
											var template = '<p class="data-list" id="' + resultObj[i].nodeId + resultObj[i].instance + '"><span class="tle" style="display:inline-block;width:40%;">' + resultObj[i].kpiName + '</span><span class="mui-badge mui-badge-primary num"id="' + resultObj[i].kpiCode + '">' + resultObj[i].value + '</span></p>';
											tle2 += template;
										}
									}
									tle3 += template2 + tle2;
								}

								table.innerHTML = tle + tle3;

							})

						})
					});
				})
			}
		})

		//诊断履历
		//  function getDeviceDiagnostic(deviceId){
		if(self.queryStates == "诊断履历") {
			appFutureImpl.getDeviceDiagnosticResumeList(deviceId, {}, function(result, success, msg) {
				console.log('诊断履历：' + JSON.stringify(result[5]))
				if(JSON.stringify(result) == '[]') {
					plus.nativeUI.toast("暂无履历"); //出现提示框
					return;
				}
				if(null != msg) {
					futureListener(null, msg);
					return;
				}
				if(success && result.code == 0) {
					futureListener(result.data, null);
				}
				var table = document.body.querySelector('.mainContent');
				table.innerHTML = "";
				var ul = document.createElement('ul');
				for(var i = 0; i < result.length; i++) {
					if(result[i].ticketCategory != -1) {
						var li = doc.createElement('li');
						li.className = 'mui-table-view-cell';
						li.id = result[i].id;
						li.style.border = "1px solid #e3e3e3";
						li.style.margin = "10px"
						if(result[i].severity == 4) {
							li.style.borderLeft = "5px solid #e74e53"
						} else if(result[i].severity == 3) {
							li.style.borderLeft = "5px solid #ee6b1c"
						} else if(result[i].severity == 2) {
							li.style.borderLeft = "5px solid #efd709"
						} else if(result[i].severity == 1) {
							li.style.borderLeft = "5px solid #00bc79"
						}
						if(result[i].specialtyProp == 'Z') {
							specialtyProp = '振动';
						} else if(result[i].specialtyProp == 'Y') {
							specialtyProp = '油液';
						} else if(result[i].specialtyProp == 'Q') {
							specialtyProp = '清洁度检测（油质）';
						} else if(result[i].specialtyProp == 'M') {
							specialtyProp = '磨损分析';
						} else if(result[i].specialtyProp == 'J') {
							specialtyProp = '绝缘油分析';
						} else if(result[i].specialtyProp == 'H') {
							specialtyProp = '红外热成像检测';
						} else if(result[i].specialtyProp == 'D') {
							specialtyProp = '电机电流';
						} else if(result[i].specialtyProp == 'K') {
							specialtyProp = '开关温度';
						} else if(result[i].specialtyProp == 'P') {
							specialtyProp = '液压';
						} else if(result[i].specialtyProp == 'N') {
							specialtyProp = '扭矩';
						} else if(result[i].specialtyProp == 'G') {
							specialtyProp = '工艺指标';
						} else if(result[i].specialtyProp == 'W') {
							specialtyProp = '表面温度';
						}
						if(result[i].position == null) {
							result[i].position = ''
						}
						var responsibleDate;
						if(result[i].responsibleDate == null) {
							responsibleDate = ''
						} else {
							responsibleDate = moment(result[i].responsibleDate).format("YYYY-MM-DD")
						}
						if(result[i].abnType == null) {
							result[i].abnType = ''
						}
						var template = '<p class="former">检测部位：' + result[i].position + '<span class="mui-pull-right">' + responsibleDate + '</span></p>' +
							'<p>异常类型：' + result[i].abnType + '</p>' +
							'<p>检测专业：' + specialtyProp + '</p>';
						li.innerHTML = template;
						ul.appendChild(li)
						table.appendChild(ul);
					}
				}

			})
			$('.mainContent').on('tap', 'li', function() {
				dispatherManager.toResumeListDetail(this.id, deviceId)
			});
		}
		//  }
		if(self.queryStates == "特征指标跟踪") {
			dispatherManager.toTrendency(deviceId);
		}

		//报警记录
		//  function getAlerts(queryParams){
		if(self.queryStates == "报警记录") {
			appFutureImpl.getAlertByPage(queryParams, queryParams4Page, function(result, total, msg) {
				console.log('报警记录--->：' + JSON.stringify(result))
				if(JSON.stringify(result) == '[]') {
					plus.nativeUI.toast("暂无报警记录"); //出现提示框
					return;
				}
				var data = result;
				if(null != msg) {
					futureListener(null, msg);
					return;
				}
				if(total && result.code == 0) {
					futureListener(result.data, null);
				}
				//	      function createWarningDetailCell(data) {
				//					console.log('渲染页面得数据'+JSON.stringify(data))
				var table = doc.body.querySelector('.mainContent');
				table.innerHTML = "";
				alertInfoList.clear();
				alertInfoList.addArray(data);
				var ul = doc.createElement('ul');
				for(var i = 0; i < data.length; i++) {
					var li = doc.createElement('li');
					li.className = 'mui-table-view-cell';
					if(data[i].orderId == null) { //告警与工单的区分
						data[i].orderId = data[i].alertId;
						li.id = data[i].orderId;
					} else {
						li.id = data[i].orderId;
					}
					li.style.borderBottom = '1px solid #e3e3e3';
					li.style.borderTop = 0;
					var severity = data[i].severity;
					var severityStr;
					var severityValue = "未知";
					var severityClass = "";
					var severityBgColor = "";
					var appName = data[i].appName;
					var appSource = '';
					var customerName = '';
					if(data[i].customerName) {
						customerName = data[i].customerName
					}
					if(appName == '1') {
						appSource = '在线预警'
					} else if(appName == '2') {
						appSource = '智能诊断'
					} else if(appName == '3') {
						appSource = '大数据分析'
					} else if(appName == '4') {
						appSource = '离线诊断'
					}
					if(severity == 4) {
						severityValue = "危险";
						severityClass = "warning-sec-serious";
						severityBgColor = "#e74e53";
					} else if(severity == 3) {
						severityValue = "警告";
						severityClass = "mui-btn-purple";
						severityBgColor = "#ee6b1c";
					} else if(severity == 2) {
						severityValue = "注意";
						severityClass = "warning-sec-secondary";
						severityBgColor = "#efd709";
					} else {
						severityValue = "正常";
						severityClass = "mui-btn-warning";
						severityBgColor = "#00bc79";
					}
					var stateStr;
					var stateValue;
					var stateClass = "";
					if(data[i].state == 0) {
						stateValue = "新产生";
						stateClass = "mui-btn-primary";
					} else if(data[i].state == 5 || data[i].state == 10) {
						stateValue = "已确认";
						stateClass = "warning-sec-secondary";
					} else if(data[i].state == 20) {
						//						stateValue = "已解决";
						stateValue = "关闭";
						stateClass = "mui-btn-green";
					} else if(data[i].state == 30) {
						stateValue = "已忽略";
						stateClass = "mui-btn-grey";
					} else {
						stateValue = "未知";
					}
					stateStr = '<button type="button" class="mui-badge mui-btn ' + stateClass + ' mui-btn-outlined clear-background label-title">' + stateValue + '</button>';

					var closeTime = "未关闭";
					if(data[i].closeTime) {
						closeTime = toolUtil.json2Time(data[i].closeTime, "yyyy-MM-dd")
					}
					var arisingTime = moment(data[i].arisingTime).format("YYYY-MM-DD HH:mm:ss")
					var template = '<p><span class="circle"style="vertical-align: middle;border-radius:50%;display:inline-block;margin:0;width:15px;height:15px;background-color:' + severityBgColor + '"></span>' +
						'<span style="width:48%;text-align: left;vertical-align: middle;margin-left:5px">' + data[i].devName + data[i].message + '</span>' +
						'<span class="mui-pull-right" style="margin:0;text-align: right;">' + stateStr + '</span></p>' +
						'<p style="width:100%;text-align: right;">' + data[i].devName + '</p>' +
						'<p><span>来源：' + appSource + '</span><span class="mui-pull-right" style="width:40%;text-align: right;margin:0;">' + arisingTime + '</span></p>'

					li.innerHTML = template;
					ul.appendChild(li);
					table.appendChild(ul);
					//return htmlValue;
				}
			})
			//根据alertId来获取alert对象
			var getAlertInfo = function(orderId) {
				var alertInfo;
				for(var position = 0, len = alertInfoList.size(); position < len; position++) {
					if(alertInfoList.get(position).orderId == orderId) {
						alertInfo = alertInfoList.get(position);
						alertInfo.alertId = orderId;
						break;
					}
				}
				return alertInfo;

			}
			$('.mainContent').on('tap', 'li', function() {
				console.log('aaaalertInfo : ' + JSON.stringify(this.id))
				dispatherManager.toWarningDetail(getAlertInfo(this.id))
			});
		}

		//  }
		//设备信息
		//  function getDeviceInfos(deviceId){
		if(self.queryStates == "设备信息") {
			appFutureImpl.getResourceById([deviceId], function(result, success, msg) {
				console.log('设备信息：' + JSON.stringify(result))
				var deviceInfos = result;
				if(null != msg) {
					futureListener(null, msg);
					return;
				}
				if(success && result.code == 0) {
					futureListener(result.data, null);
				}
				appFutureImpl.getAllDicts(function(result, success, msg) {
					console.log('字典查询 ---> ' + JSON.stringify(result))
					var getDics = result;
					if(null != msg) {
						futureListener(null, msg);
						return;
					}
					if(success && result.code == 0) {
						futureListener(result.data, null);
					}
					var deviceType;
					if(deviceInfos.values.DEVICE_TYPE != undefined) {
						for(var aa = 0; aa < getDics.length; aa++) {
							if(deviceInfos.values.DEVICE_TYPE == getDics[aa].valueCode) {
								deviceType = getDics[aa].label;
								break;
							} else {
								deviceType = deviceInfos.values.DEVICE_TYPE
							}
						}
					} else {
						deviceType = '';
					}
					var deviceFactory;
					var deviceSpec;
					if(deviceInfos.values.FACTROY != undefined) {
						deviceFactory = deviceInfos.values.FACTROY;
						deviceSpec = deviceInfos.values.TYPE_SPEC;
					} else {
						deviceFactory = '';
						deviceSpec = '';
					}

					var table = doc.body.querySelector('.mainContent');
					var template =
						'<ul class="mui-table-view" id="list">' +
						'<li class="mui-table-view-cell">' +
						'<p style="color:#0099ff;font-size:18px;margin-bottom:10px">基本信息：</p>' +
						'<p>设备编号：' + deviceInfos.externalDevId + '</p>' +
						'<p>设备名称：' + deviceInfos.label + '</p>' +
						'<p>设备类别：' + deviceType + '</p>' +
						'<p>岗位代码：</p>' +
						'<p>设备等级：</p>' +
						'<p style="color:#0099ff;font-size:18px;margin:10px 0">属性描述：</p>' +
						'<p>制造商：' + deviceFactory + '</p>' +
						'<p>规格型号：' + deviceSpec + '</p>' +
						'<p>精度数据：</p>' +
						'</li></ul>'
					table.innerHTML = template;
				})
			})
		}
	}
}(mui, document))