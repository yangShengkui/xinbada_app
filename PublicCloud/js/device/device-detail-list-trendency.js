(function($, doc) {
	$.init({
		pullRefresh: {
			container: "#pullrefresh",
			down: {
				//    	style:'circle',
				callback: pulldownRefresh
			}
			//    down: toolUtil.getDownRefreshConfig(pulldownRefresh, 50, "false")
		}
	});
	mui('.mui-scroll-wrapper').scroll({
		deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	});
	$.plusReady(function() {
		//		$('#pullrefresh').pullRefresh().pulldownLoading();
		pulldownRefresh()
	})

	function pulldownRefresh() {
		var pullObject = $('#pullrefresh').pullRefresh();
		var self = plus.webview.currentWebview();
		var deviceId = self.kpiCode.split('/')[1];
		var instance = self.kpiCode.split('/')[2];
		var kpiCode = Number(self.kpiCode.split('/')[0]);
		console.log('是否获取instance------>' + instance);
		console.log('是否获取kpiCode------>' + kpiCode);
		console.log('是否获取设备Id------>' + deviceId);
		var content = '';
		var kpiName = '';
		//获取标题
		appFutureImpl.getDeviceInfo(deviceId, function(result, success, msg) {
			if(null != msg) {
				futureListener(null, msg);
				return;
			}
			if(success && result.code == 0) {
				futureListener(result.data);
			}
			console.log('设备信信信信息 ：' + result[0])
			for(var i = 0; i < result.length; i++) {
				content += result[i] + "/";
			}
			console.log('设备信信信信息2 : ' + JSON.stringify(content))
			var kpiQueryModel2 = {
				"category": "ci",
				"isRealTimeData": true,
				"nodeIds": [deviceId],
				"kpiCodes": [kpiCode],
				"startTime": null,
				"endTime": null,
				"timeRange": "",
				"statisticType": "psiot",
				"includeInstance": true,
				"condList": []
			}
			//获取设备完全信息
			appFutureImpl.getDevicesByCondition({
				'resourceId': deviceId
			}, function(result, success, msg) {
				var result1 = result;
				console.log('获取设备完全信息 : ' + JSON.stringify(result))
				if(null != msg) {
					plus.nativeUI.toast(msg);
					return;
				}
				var testInstance = '';
				var testItem = eval(result1[0].values.MeasurePointLocate);
				if(testItem[0] && testItem[0].Z) {
					for(var m = 0; m < testItem[0].Z.length; m++) {
						if(testItem[0].Z[m].name == instance) {
							testInstance = testItem[0].Z[m].label;
						}
					}
				}
				console.log('testItem  : ' + JSON.stringify(testItem))
				document.querySelector('.tle1').innerHTML = content + result1[0].label;
				appFutureImpl.getKpiValueList(kpiQueryModel2, function(result, success, msg) {
					console.log('具体数值---> ' + JSON.stringify(result));
					var result2 = result;
					if(null != msg) {
						futureListener(null, msg);
						return;
					}
					if(success && result.code == 0) {
						futureListener(result.data, null);
					}
					for(var i = 0; i < result2.length; i++) {
						if(result2[i].instance == instance) {
							kpiName = result2[i].kpiName;
						}
					}
					document.querySelector('.tle2').innerHTML = testInstance + "/" + kpiName;

					//获取特征趋势图
					var kpiQueryModel = {
						"statisticType": "",
						"category": "time",
						"includeInstance": true,
						"isRealTimeData": true,
						"nodeIds": [deviceId],
						"kpiCodes": [kpiCode],
						//"queryInstances": "01",
						//"queryInstances": "02", 
						"queryInstances": instance,
						"isRealTimeData": true,
						"timePeriod": 3000000,
						"startTime": "",
						"endTime": "",
						"timeRange": ""
					}

					console.log('kpiQueryModel选择的值------>' + JSON.stringify(kpiQueryModel));
					appFutureImpl.getKpiValueList(kpiQueryModel, function(result, msg) {
						console.log('.....特征趋势返回的值 ：' + JSON.stringify(result))
						var kpiResult = result;
						var date = [];
						var data = [];
						if(msg != null) {
							plus.nativeUI.toast(msg);
							return;
						}
						for(var i = 0; i < kpiResult.length; i++) {
							var time = moment(kpiResult[i].insertTime).format("YYYY-MM-DD HH:mm:ss");
							date.push(time.toString());
							data.push(kpiResult[i].value)
						}
						console.log('.....kpi时间：' + JSON.stringify(date))
						console.log('.....kpi数据值：' + JSON.stringify(data))
						//        date = ["2017-08-01 22:13:12","2017-08-02 22:13:12","2017-08-03 22:13:12","2017-08-04 22:13:12","2017-08-05 22:13:12","2017-08-06 22:13:12"]
						//        data = [15.12,23.42,34.12,45.67,54.12,23.54]
						var myChart = echarts.init(document.getElementById('lineChart'));
						var option = {
							tooltip: {
								trigger: 'axis',
								position: function(pt) {
									return [pt[0], '10%'];
								}
							},
							title: {
								left: 'center',
								text: '',
							},
							toolbox: {
								feature: {
									dataZoom: {
										yAxisIndex: 'none'
									},
									//          restore: {},
									//          saveAsImage: {}
								}
							},
							xAxis: {
								type: 'category',
								boundaryGap: false,
								data: date
							},
							yAxis: {
								type: 'value',
								boundaryGap: [0, '100%']
							},
							dataZoom: [{
								type: 'inside',
								start: 0,
								end: 10
							}, {
								start: 0,
								end: 10,
								handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
								handleSize: '80%',
								handleStyle: {
									color: '#fff',
									shadowBlur: 3,
									shadowColor: 'rgba(0, 0, 0, 0.6)',
									shadowOffsetX: 2,
									shadowOffsetY: 2
								}
							}],
							series: [{
								name: kpiName,
								type: 'line',
								smooth: true,
								symbol: 'none',
								sampling: 'average',
								itemStyle: {
									normal: {
										color: 'rgb(255, 70, 131)'
									}
								},
								areaStyle: {
									//              normal: {
									//                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
									//                      offset: 0,
									//                      color: 'rgb(255, 158, 68)'
									//                  }, {
									//                      offset: 1,
									//                      color: 'rgb(255, 70, 131)'
									//                  }])
									//              }
								},
								data: data
							}]
						};

						myChart.setOption(option);

					});
				})
			})
		})
	}
}(mui, document))