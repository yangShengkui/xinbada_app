(function($, doc) {
	$.init({
		pullRefresh: {
			container: "#pullrefresh",
			down: toolUtil.getDownRefreshConfig(pulldownRefresh, 50, "false")
		}
	});

	var firstResultDic = {};
	var nodeIds = [];
	var configsInfo;

	$.plusReady(function() {
		//获取产线下的信息
		mui('.mui-scroll-wrapper').scroll({
			deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		});
		var self = plus.webview.currentWebview();
		var nodeId = self.nodeId;
		console.log('产线下的id' + nodeId)
		var filter = {
			"layer": 1,
			"modelId": 301,
			"domains": nodeId
		};
		plus.nativeUI.showWaiting("正在加载");
		appFutureImpl.getDomains(filter, function(result, success, msg) {
			if(msg != null) {
				plus.nativeUI.toast(msg);
				return;
			}

			var labelArr = new Array();
			var table = document.body.querySelector('.mui-table-view');
			table.innerHTML = "";
			nodeIds = [];
			//循环取得的nodeIds
			for(var i = 0; i < result.length; i++) {
				nodeIds.push(result[i].id);
				firstResultDic[result[i].id] = result[i];
			}
			console.log("firstResultDic" + firstResultDic.toString())
			console.log("nodeIds.toString()" + nodeIds.toString())

			//获取点检信息 (有2050产线时候才获取)
			if(nodeIds.toString().indexOf("554925002946064") != -1) {
				appFutureImpl.queryUser({}, function(result, success, msg) {
					var roleList = [];
					var userIds = []
					result.forEach(function(ele) {
						if(ele.roleID) {
							if(ele.roleID.indexOf("127260997560018") > -1) {
								userIds.push(ele.userID)
								roleList.push(ele)
							}
						}
					})
					console.log(JSON.stringify(roleList))

					var configsParam = {
						"categorys": "100",
						"sendBeginTime": "",
						"sendEndTime": "",
						"userIds": userIds.toString(),
					};
					//"2018-04-08T16:00:00Z"sendEndTime:"2018-04-15T16:00:00Z"
					var now = new Date();
					var nowTime = now.setHours(0, 0, 0, 0);
					var day = now.getDay();
					var oneDayLong = 24 * 60 * 60 * 1000;
					var MondayTime = nowTime - (day - 1) * oneDayLong;
					var SundayTime = nowTime + (8 - day) * oneDayLong;
					var localOffset = now.getTimezoneOffset() * 60000
					configsParam.sendBeginTime = moment(new Date(MondayTime + localOffset)).format('YYYY-MM-DD') + 'T16:00:00'
					configsParam.sendEndTime = moment(new Date(SundayTime + localOffset)).format('YYYY-MM-DD') + 'T16:00:00Z'
					//console.log("成功啦" + JSON.stringify(configsParam))
					appFutureImpl.getConfigs(configsParam, function(result, success, msg) {
						configsInfo = result
						for(var i = 0; i < configsInfo.length; i++) {
							for(var j = 0; j < roleList.length; j++) {
								if(configsInfo[i].userId == roleList[j].userID) {
									configsInfo[i].userId = roleList[j].userName
								}
							}
						}
						plus.nativeUI.closeWaiting()
						pulldownRefresh();
						return false
					})

				})
			} else {
				plus.nativeUI.closeWaiting()
				pulldownRefresh();
				return false
			}

			//			pulldownRefresh();
		}) //请求1

	})

	var pulldownRefresh = function() {
		var pullObject = $('#pullrefresh').pullRefresh();
		var table = document.body.querySelector('.mui-table-view');
		var kpiQueryModel = {
			"category": "ci",
			"isRealTimeData": true,
			"nodeIds": nodeIds,
			"kpiCodes": [6106, 6101], //诊断准确率，检修项目数
			"includeInstance": true
		}
		appFutureImpl.getKpiValueList(kpiQueryModel, function(result, msg) {
			if(pullObject) {
				pullObject.endPulldownToRefresh(true);
				pullObject.refresh(true);
			}
			if(msg != null) {
				plus.nativeUI.toast(msg);
				return;
			}

			//把有数据的排在前面
			result.sort(function(a, b) {
				return a.value < b.value;
			});

			var newDevice = {};
			for(var j = 0; j < result.length; j++) {
				if(!newDevice[result[j].nodeId]) {
					newDevice[result[j].nodeId] = {
						0: 0,
						1: 0,
						2: 0,
						3: 0,
						4: 0,
						5: 0
					};
				}
				if(result[j].instance == "state,0" && result[j].kpiCode == 6101) {
					newDevice[result[j].nodeId][0] = result[j].value;
				} else if(result[j].instance == "state,1" && result[j].kpiCode == 6101) {
					newDevice[result[j].nodeId][1] = result[j].value;
				} else if(result[j].instance == "1,all,values" && result[j].kpiCode == 6106) {
					newDevice[result[j].nodeId][2] = result[j].value;
				} else if(result[j].instance == "2,all,values" && result[j].kpiCode == 6106) {
					newDevice[result[j].nodeId][3] = result[j].value;
				} else if(result[j].instance == "3,all,values" && result[j].kpiCode == 6106) {
					newDevice[result[j].nodeId][4] = result[j].value;
				} else if(result[j].instance == "4,all,values" && result[j].kpiCode == 6106) {
					newDevice[result[j].nodeId][5] = result[j].value;
				}
			}

			for(var key in newDevice) {
				(function(key) {
					//判断2050产线
					var configHtml = ""
					var tableHtml = ""
					if(key == "554925002946064") {
						for(var j = 0; j < configsInfo.length; j++) {
							//configHtml = configHtml +
							tableHtml += '<tr><td class="mui-col-xs-3">' + configsInfo[j].userId + '</td>' +
							'<td class="mui-col-xs-3">' + configsInfo[j].end + '</td>' + 
							'<td class="mui-col-xs-3">' + configsInfo[j].dealreadying + '</td>' +
							'<td class="mui-col-xs-3">' + configsInfo[j].outtimeing + '</td></tr>'
								//'<div class="home_chart" id="config_chart_' + j + '"></div>'

						}
						configHtml = '<div><p><span class="tle" style="margin-bottom:13px;">点检统计(本周内)</span></p>' + 
								'<table style="text-align:center;" id="configTab"><tr><td class="mui-col-xs-3">点检员</td><td class="mui-col-xs-3">已完成项目数</td><td class="mui-col-xs-3">待点检项目数</td><td class="mui-col-xs-3">逾期任务数</td>' +
				                '</tr>' + tableHtml + '</table></div>'
				        //这是用环形图展示点检统计数据
//						for(var j = 0; j < configsInfo.length; j++) {
//							//configHtml = configHtml +
//							tableHtml += '<td>' + configsInfo[j].end + '</td>' +
//							'<td>' + configsInfo[j].userId + '</td>' + 
//							'<td>' + configsInfo[j].dealreadying + '</td>' +
//							'<td>' + configsInfo[j].outtimeing + '</td>'
//								//'<div class="home_chart" id="config_chart_' + j + '"></div>'
//
//						}

					}
					var li = document.createElement('li');
					li.className = 'mui-table-view-cell';
					var template = '<b style="font-size: 26px;display:block">' + firstResultDic[key].label + '</b>' +
						'<span class="tle">诊断绩效(当月内)</span>' +
						'<div style="margin-top:5px;"><p>采集系统诊断准确率' + newDevice[key][2] + '%</p>' +
						'<div id="pro1-' + key + '" class="mui-progressbar mui-progressbar-zh proBar">' +
						'<span></span>' +
						'</div>' +
						'</div>' +
						'<div><p>智能诊断准确率' + newDevice[key][3] + '%</p>' +
						'<div id="pro2-' + key + '" class="mui-progressbar mui-progressbar-zn proBar">' +
						'<span></span>' +
						'</div>' +
						'</div>' +
						'<div><p>大数据预模型预警诊断准确率' + newDevice[key][4] + '%</p>' +
						'<div id="pro3-' + key + '" class="mui-progressbar mui-progressbar-hj proBar">' +
						'<span></span>' +
						'</div>' +
						'</div>' +
						'<div><p>离线诊断准确率' + newDevice[key][5] + '%</p>' +
						'<div id="pro4-' + key + '" class="mui-progressbar mui-progressbar-lx proBar">' +
						'<span></span>' +
						'</div>' +
						'</div>' +
						'<span class="tle">检修实绩(当月内)</span>' +
						'<div class="home_chart" id="home_chart_' + key + '"></div>' + configHtml
					li.innerHTML = template;
					table.appendChild(li);

					mui("#pro1-" + key).progressbar({
						progress: newDevice[key][2]
					}).show();
					mui("#pro2-" + key).progressbar({
						progress: newDevice[key][3]
					}).show();
					mui("#pro3-" + key).progressbar({
						progress: newDevice[key][4]
					}).show();
					mui("#pro4-" + key).progressbar({
						progress: newDevice[key][5]
					}).show();
//				if(key == "554925002946064") {
//						for(var j = 0; j < configsInfo.length; j++) {
//							var configChart = echarts.init(document.getElementById("config_chart_" + j));
//							var options = {
//								title: {
//									text: configsInfo[j].userId,
//									x: '25%',
//									y: '75%',
//									textStyle: {
//										color: 'black',
//									}
//								},
//								tooltip: {
//									trigger: 'item',
//									formatter: "{a} <br/>{b} : {c} ({d}%)"
//								},
//								legend: {
//									x: 0,
//									y: '2%',
//									textStyle: {
//										color: '#84898d'
//									},
//									orient: 'vertical',
//									//data: ['点检任务总数', '已完成任务数', '计划中任务数', '待点检任务数', '逾期任务数']
//									data: ['已完成任务数',  '待点检任务数', '逾期任务数']
//								},
//								calculable: true,
//								series: [{
//										name: '',
//										type: 'pie',
//										radius: '8%',
//										tooltip: {
//											show: false
//										},
//										center: [0, '30%'],
//										hoverAnimation: false,
//										color: ['#dde5e7'],
//										labelLine: {
//											normal: {
//												show: false
//											},
//											emphasis: {
//												show: true
//											}
//										}
//									},
//									{
//										name: '',
//										type: 'pie',
//										radius: ['50%', '80% '],
//										center: ['75%', '60%'],
//										calculable: true,
//										avoidLabelOverlap: true,
//										label: {
//											normal: {
//												position: 'inner',
//												show: true,
//												formatter: ' {c} ',
//												textBorderWidth: 0,
//											}
//										},
//										data: [
//											{
//												value: configsInfo[j].end,
//												name: '已完成任务数',
//												itemStyle: {
//													normal: {
//														color: {
//															type: 'linear',
//															x: 0,
//															y: 0,
//															x2: 0,
//															y2: 1,
//															colorStops: [{
//																offset: 0,
//																color: '#2b97fc' // 0% 处的颜色
//															}, {
//																offset: 1,
//																color: '#2b97fc' // 100% 处的颜色
//															}],
//															globalCoord: false // 缺省为 false
//														},
//														borderColor: '#dde5e7',
//														borderWidth: 3,
//														borderType: 'solid',
//													}
//												}
//											},
//											{
//												value: configsInfo[j].dealreadying,
//												name: '待点检任务数',
//												itemStyle: {
//													normal: {
//														color: {
//															type: 'linear',
//															x: 0,
//															y: 0,
//															x2: 0,
//															y2: 1,
//															colorStops: [{
//																offset: 0,
//																color: '#7dc5e2' // 0% 处的颜色
//															}, {
//																offset: 1,
//																color: '#7dc5e2' // 100% 处的颜色
//															}],
//															globalCoord: false // 缺省为 false
//														},
//														borderColor: '#dde5e7',
//														borderWidth: 3,
//														borderType: 'solid',
//													}
//												}
//											},
//											{
//												value: configsInfo[j].outtimeing,
//												name: '逾期任务数',
//												itemStyle: {
//													normal: {
//														color: {
//															type: 'linear',
//															x: 0,
//															y: 0,
//															x2: 0,
//															y2: 1,
//															colorStops: [{
//																offset: 0,
//																color: '#bb679a' // 0% 处的颜色
//															}, {
//																offset: 1,
//																color: '#bb679a' // 100% 处的颜色
//															}],
//															globalCoord: false // 缺省为 false
//														},
//														borderColor: '#dde5e7',
//														borderWidth: 3,
//														borderType: 'solid',
//													}
//												}
//											},
//										]
//									}
//								]
//							};
//							configChart.setOption(options);
//						}
//					}

					var myChart = echarts.init(document.getElementById("home_chart_" + key));
					var option = {
						title: {
							text: firstResultDic[key].label + '检修 ',
							x: '15%',
							y: '60%',
							textStyle: {
								color: '#babfc3',
							}
						},
						tooltip: {
							trigger: 'item',
							formatter: "{a} <br/>{b} : {c} ({d}%)"
						},
						legend: {
							x: 0,
							y: '2%',
							textStyle: {
								color: '#84898d'
							},
							orient: 'vertical',
							data: ['已完成状态项目维修数', '待完成状态项目维修数']
						},
						calculable: true,
						series: [{
								name: '',
								type: 'pie',
								radius: '8%',
								tooltip: {
									show: false
								},
								center: [0, '30%'],
								hoverAnimation: false,
								color: ['#dde5e7'],
								labelLine: {
									normal: {
										show: false
									},
									emphasis: {
										show: true
									}
								}
							},
							{
								name: '',
								type: 'pie',
								radius: ['50%', '80% '],
								center: ['75%', '60%'],
								calculable: true,
								avoidLabelOverlap: true,
								label: {
									normal: {
										position: 'inner',
										show: true,
										formatter: ' {c} ',
										textBorderWidth: 0,
									}
								},
								data: [{
										value: newDevice[key][1],
										name: '已完成状态项目维修数',
										itemStyle: {
											normal: {
												color: {
													type: 'linear',
													x: 0,
													y: 0,
													x2: 0,
													y2: 1,
													colorStops: [{
														offset: 0,
														color: '#ced2d3' // 0% 处的颜色
													}, {
														offset: 1,
														color: '#a0a0a2' // 100% 处的颜色
													}],
													globalCoord: false // 缺省为 false
												},
												borderColor: '#dde5e7',
												borderWidth: 3,
												borderType: 'solid',
											}
										}
									},
									{
										value: newDevice[key][0],
										name: '待完成状态项目维修数',
										itemStyle: {
											normal: {
												color: {
													type: 'linear',
													x: 0,
													y: 0,
													x2: 0,
													y2: 1,
													colorStops: [{
														offset: 0,
														color: '#0b7cae' // 0% 处的颜色
													}, {
														offset: 1,
														color: '#33ddee' // 100% 处的颜色
													}],
													globalCoord: false // 缺省为 false
												},
												borderColor: '#dde5e7',
												borderWidth: 3,
												borderType: 'solid',
											}
										}
									}
								]
							}
						]
					};
					myChart.setOption(option);
				})(key)
			}
		});
	}
}(mui, document));