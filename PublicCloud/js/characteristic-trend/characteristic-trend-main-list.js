(function($, doc) {
	$.init({
		pullRefresh: {
			container: "#pullrefresh",
			down: toolUtil.getDownRefreshConfig(pulldownRefresh, 50, "false")
		}
	});
	var self;
	var nodeId;
	var detail = {};
	var myChart; //echart对象
	$.plusReady(function() {
		//清除上次的数据
		window.addEventListener("clearData", function(event) {
			document.body.querySelector('.mui-table-view').innerHTML = "";
		})
		self = plus.webview.currentWebview();
		nodeId = self.queryStates.nodeId;
		/**
		 * 监听从warning上传递过来的参数
		 */
		window.addEventListener('getParamas', function(event) {
			console.log('参数获取' + JSON.stringify(event.detail))
			if(detail == event.detail) return; //条件一样的时候不处理
			detail = event.detail;
			// 刷新
			$("#pullrefresh").pullRefresh().pulldownLoading();
		});

		window.addEventListener('WARNING_INFO_UPDATE', function(event) {
			$("#pullrefresh").pullRefresh().pulldownLoading();
		});
		pulldownRefresh()
	});

	function pulldownRefresh() {
		//下拉加载更多业务实现
		var pullObject = $('#pullrefresh').pullRefresh();

		if(JSON.stringify(self.queryStates.num) == "1") { //固有特征
			/**
			 * 获得设备信息，如果有传递的告警中已经有设备的信息话，不用获取
			 */
			var deviceInfoHandler = function(nodeInfo) {
				console.log('nnnodeINNN : ' + JSON.stringify(nodeInfo))
				//				appFutureImpl.getAttrsByModelId(nodeInfo.modelId, function(result, msg) {
				appFutureImpl.getResourceById(nodeInfo.id, function(result, msg) {
					console.log('获得测点的定义和信息----->' + JSON.stringify(result))
					//获得测点的定义和信息，这里
					var mpl4zpoint = [];
					if(result.values.MeasurePointLocate) {
						var measurePointLocate = JSON.parse(result.values.MeasurePointLocate);
						var mpl = measurePointLocate;
						for(var key in mpl[0]) {
							//if(key != "G") { //除了工艺以外的测点都显示
								for(var jj = 0; jj < mpl[0][key].length; jj++) {
									var p = mpl[0][key][jj];
									p.specialtyProp = key;
									//name>1000的都不显示  为离线的测点
									if(p.name.length < 4) {
										mpl4zpoint.push(p)
									}

								}
							//}
						}
					}
					var selPoint; //选择的测点
					var selPointGroup; //测点的专业
					console.log('。。。nodeInfo : ' + JSON.stringify(nodeInfo))
					if(mpl4zpoint.length > 0) {
						var val = '';
						for(var i = 0; i < mpl4zpoint.length; i++) {
							val += '<option value=' + '"' + mpl4zpoint[i].name + '"' + '>' + mpl4zpoint[i].label + '</option>';
						}
						selPoint = mpl4zpoint[0].name;
						selPointGroup = mpl4zpoint[0].specialtyProp;
						doc.querySelector('#point-select').innerHTML = val;
					}

					//测点的select选择框
					$(".chart-sel").on('change', '#point-select', function(e) {
						var op = doc.getElementById("point-select")
						selPoint = op.value;
						selPointGroup = mpl4zpoint[op.selectedIndex].specialtyProp;
						op.options[op.selectedIndex].selected = true; //保持选中状态
						creatCodeSelect();
					})
					var selVal = []; //选中的数据项
					var selkpiName = []; //选中的数据名
					var creatCodeSelect = function() {
						console.log('测点下的数据项---->' + JSON.stringify(nodeInfo.physicalConfig.accessConfigs))
						console.log('seeeel---->' + selPointGroup)
						console.log('seeeel2222---->' + selPoint)
						for(var i = 0; i < nodeInfo.physicalConfig.accessConfigs.length; i++) {
							var ac = nodeInfo.physicalConfig.accessConfigs[i];
							if(ac.focus == true) {
								if(ac.specialtyProp == selPointGroup && ac.instance == selPoint) {
									if(!selVal) selVal = ac.dataItemId;
									if(!selkpiName) selkpiName = ac.kpiName;
									if(selVal.indexOf(ac.dataItemId) == -1) {
										selVal.push(ac.dataItemId);
										selkpiName.push(ac.kpiName);
									}
								}
							}

						}
						console.log('vvvvvvvvvvv111---->' + JSON.stringify(selVal))
						console.log('vvvvvvvvvvv222---->' + JSON.stringify(selkpiName))
						getTrendencyData();
					}
					creatCodeSelect();
					var date = new Date();
					var endYear = date.getFullYear();
					var strYear = date.getFullYear() - 1;
					var strDay = date.getDate();
					var strMonth = date.getMonth() + 1;
					var strHour = date.getHours();
					var strMinute = date.getMinutes();
					var strSecond = date.getSeconds();
					if(strMonth < 10) {
						strMonth = "0" + strMonth;
					}
					if(strDay < 10) {
						strDay = "0" + strDay;
					}
					if(strHour < 10) {
						strHour = "0" + strHour;
					}
					if(strMinute < 10) {
						strMinute = "0" + strMinute;
					}
					if(strSecond < 10) {
						strSecond = "0" + strSecond;
					}
					var startTime = strYear + "-" + strMonth + "-" + strDay + "T" + strHour + ":" + strMinute + ":" + strSecond + "Z";
					var endTime = endYear + "-" + strMonth + "-" + strDay + "T" + strHour + ":" + strMinute + ":" + strSecond + "Z";
					console.log('endTime------>' + JSON.stringify(endTime))
					console.log('startTime------>' + JSON.stringify(startTime))

					function getTrendencyData() {
						var kpiQueryModel = {
							category: "time",
							condList: [],
							endTime: endTime,
							granularityUnit: "DAY",
							includeInstance: true,
							isRealTimeData: false,
							kpiCodes: selVal,
							nodeIds: [nodeId],
							queryInstances: selPoint,
							startTime: startTime,
							statisticType: "psiot",
							timePeriod: 0,
							timeRange: ""
						}
						appFutureImpl.getKpiValueList(kpiQueryModel, function(result, msg) {
							if(msg != null) {
								plus.nativeUI.toast(msg);
								return;
							}
							var kpiResult = result;
							console.log('kpiResult---->' + JSON.stringify(kpiResult))
							var newKpiRes = [];
							var newVal = [];
							var date = [];
							var data = [];
							for(var k = 0; k < kpiResult.length; k++) {
								if(kpiResult[k].instance == selPoint) {
									newKpiRes.push(kpiResult[k]);
								}
							}
							var wonderNew = [];
							console.log('newKpiRes---->' + JSON.stringify(newKpiRes))
							for(var m = 0; m < selVal.length; m++) {
								var obj = {
									'kpiCode': selVal[m],
									'val': [],
									'time': []
								}
								wonderNew.push(obj)
								for(var n = 0; n < newKpiRes.length; n++) {
									if(selVal[m] == newKpiRes[n].kpiCode) {
										var time = moment(newKpiRes[n].arisingTime).format('YYYY-MM-DD HH:mm:ss');
										wonderNew[m].val.push(newKpiRes[n].value);
										wonderNew[m].time.push(time.toString())
									}
								}
							}
							console.log('筛选后的wonderNew---->' + JSON.stringify(wonderNew[0]))
							var kpiNameRes = [];
							var seriesInfos = [];
							var seriesName = [];
							var seriesTime = [];
							for(var i = 0; i < selkpiName.length; i++) {
								var obj = {
									'name': selkpiName[i],
									'type': 'line',
									//									'stack': '总量',
									'data': wonderNew[i].val
								}
								seriesInfos.push(obj)
								seriesName.push(selkpiName[i]);
								seriesTime.push(wonderNew[i].time)
							}
							console.log('seriesInfos---->' + JSON.stringify(seriesInfos))
							if(!myChart)
								myChart = echarts.init(doc.getElementById('lineChart'));
							var option = {
								tooltip: {
									trigger: 'axis'
								},
								legend: {
									data: seriesName
								},
								toolbox: {
									show: true,
								},
								calculable: true,
								xAxis: [{
									type: 'category',
									boundaryGap: false,
									data: seriesTime[0]
								}],
								yAxis: [{
									type: 'value'
								}],
								series: seriesInfos
							};
							myChart.setOption(option);
						});
					}
				})
			}
			appFutureImpl.getDevicesByCondition({
				'resourceId': nodeId
			}, function(result, success, msg) {
				console.log('获取设备完全信息----->' + JSON.stringify(result))
				if(null != msg) {
					plus.nativeUI.toast(msg);
					return;
				}
				deviceInfoHandler(result[0])
			})
			var table = document.body.querySelector('.mui-scroll');
			table.innerHTML = "";
			table.style.backgroundColor = '#fff';
			var template = '<div class="chart-sel">' +
				'<select class="mui-icon selCode header-bg" id="point-select" style="width: 200px;">' +
				'</select>' +
				'<span class="mui-icon mui-icon mui-icon-arrowdown header-bg"></span>' +
				'</div>' +
				'<div class="tredency_chart" id="lineChart" style="height:200px;">' +
				'</div>';
			table.innerHTML = template;
		} else {
			console.log('node打印--->' + JSON.stringify(nodeId))
			appFutureImpl.getDeviceResumeList([nodeId, {}], function(result, success, msg) { //重大事件
				console.log('重大事件' + JSON.stringify(result))
				if(pullObject) {
					pullObject.endPulldownToRefresh();
					pullObject.refresh(true);
				}
				if(JSON.stringify(result) == '[]') {
					plus.nativeUI.toast("暂无事件跟踪"); //出现提示框
					return;
				}
				if(null != msg) {
					futureListener(null, msg);
					return;
				}
				var ul = document.body.querySelector('.mui-table-view');
				ul.innerHTML = "";
				ul.appendChild(createBigEventDetailList(result, ul));
			})
		}
	}
})(mui, document);