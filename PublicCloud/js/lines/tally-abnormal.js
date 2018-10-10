(function($, doc) {
	$.init({

	});
	mui('.mui-scroll-wrapper').scroll({
		deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	});
	var params;
	var newParams;
	$.plusReady(function() {
		var self = plus.webview.currentWebview();
		params = self.alertInfo;
		console.log('params' + JSON.stringify(params))

		//告警的查询条件
		if(params.origId) {
			var params1 = {
				"alertId": params.origId[0],
				"severities": "1,2,3,4",
				"states": "0,5,10,20,30",

			};
		} else {
			var params1 = {
				"alertId": params.alertId,
				"severities": "1,2,3,4",
				"states": "0,5,10,20,30",

			};
		}

		//告警的分页条件
		var params2 = {
			"start": 0,
			"length": 10,
			"statCount": true
		};

		//今日任务查询条件
		var allInfoList = new ArrayList();
		var queryParams = {
			"severities": "1,2,3,4",
			"states": "0",
			"ticketNo": params.variables.ticket.ticketNo
		};
		var queryParams2 = {
			taskStatus: 10
		};

		//分页条件
		var queryParams4Page = {
			"start": 0,
			//"length": 10,
			"length": 999,
			"statCount": true
		};

		appFutureImpl.getAlertByPage(params1, params2, function(result, success, msg) {
			//              if(pullObject) {
			//                  pullObject.endPulldownToRefresh();
			//                  pullObject.refresh(true);
			//              }
			console.log('数据和依据：' + JSON.stringify(result))
			if(null != msg) {
				futureListener(null, msg);
				return;
			}
			if(success && result.code == 0) {
				futureListener(result.data, null);
			}
			if(JSON.stringify(result) == '[]') {
				params.diagnoseDesc = '';
				params.dealOption = '';
			} else {
				if(result[0].diagnoseDesc == null || result[0].diagnoseDesc == 'null') {
					params.diagnoseDesc = '';
				} else {
					params.diagnoseDesc = result[0].diagnoseDesc;
				}
				if(result[0].dealOption == null || result[0].dealOption == 'null') {
					params.dealOption = '';
				} else {
					params.dealOption = result[0].dealOption;
				}

			}

			//document.querySelector('#subDoTask').disabled = true;
			//定性的参数
			var qualitativeParams = [{
				"id": ''
			}];

			//			function buttonShow(data) {
			//				for(var i = 0; i < data.length; i++) {
			//					if(data[i].dataType == "定性") {
			//						document.querySelector('#subDoTask').disabled = false;
			//					} else {
			//						//document.querySelector('#subDoTask').disabled = true;
			//					}
			//				}
			//			}

			plus.nativeUI.showWaiting("正在加载..."); //这里是开始显示原生等待框
			//plus.nativeUI.toast("获取数据中......");
			appFutureImpl.getComplexHandleListWithCategorys(queryParams, queryParams2, queryParams4Page, function(result, total, msg) {
				console.log('当前任务条数--->' + JSON.stringify(result.length))
				console.log('当前任务--->' + JSON.stringify(result))
				if(null != msg) {
					plus.nativeUI.toast(msg);
					return;
				}
				for(var i = 0; i < result.length; i++) {
					if(result[i].variables) {
						if(result[i].variables.ticket.ticketNo == params.variables.ticket.ticketNo) {
							newParams = result[i];
							qualitativeParams[0].id = newParams.id;
						}
					}
				}
				var data = newParams.variables.standardInfo.pointCheckItemList;
				var taskFlag = [];
				for(var j = 0; j < data.length; j++) {
					if(data[j].checkState == 0 || data[j].checkState == 1) {
						data[j].checkState = data[j].checkState.toString();
						taskFlag.push(data[j].checkState);
					}
				}
				newParams.values = {
					pollingDescribe: '',
					standardInfoResult: {}
				};
				newParams.values.standardInfoResult = newParams.variables.standardInfo;
				delete(newParams.variables);
				var nature;
				if(data[0].dataType == "定性") {
					nature = true
				} else {
					nature = false
				}

				if(nature) {
					var abnormalLength = [];
					var normalLength = [];
					for(var j = 0; j < data.length; j++) {
						if(data[j].checkState == 1) {
							abnormalLength.push(data[j].checkState)
						} else {
							normalLength.push(data[j].checkState)
						}
					}
					if(abnormalLength.length == data.length || normalLength.length == data.length) {
						document.querySelector('#subDoTask').disabled = false;
						//定性异常的时候
						if(abnormalLength.length == data.length) {
							document.querySelector('#subDoTask').addEventListener('tap', function() {
								plus.nativeUI.showWaiting("提交中...");
								newParams.taskStatus = 200;
								console.log('newParams2--->' + JSON.stringify(newParams))
								appFutureImpl.doTask(newParams, function(result, success, msg) {
									console.log('result--->' + JSON.stringify(result))
									if(result) {
										plus.nativeUI.closeWaiting();
										plus.nativeUI.toast("提交成功");
										document.querySelector('#subDoTask').disabled = true;
										setTimeout(function() {
											var parentview = plus.webview.currentWebview().opener();
											//console.log("获取页面啊" + JSON.stringify(parentview))
											var targetview = plus.webview.getWebviewById("main-subpage-lines.html");
											//console.log("获取页面啊" + JSON.stringify(targetview))
											mui.fire(targetview, "newLoading", {})
											parentview.reload(true);
											plus.webview.currentWebview().close();
										}, 2000);
									}
									if(null != msg) {
										futureListener(null, msg);
										return;
									}
									if(success && result.code == 0) {
										futureListener(result.data, null);
									}
								})
							})
						} else {
							//定性正常和默认的时候
							document.querySelector('#subDoTask').addEventListener('tap', function() {
								appFutureImpl.doBatchDeal(qualitativeParams, function(result, success, msg) {
									console.log('笑嘻嘻--->' + JSON.stringify(qualitativeParams))
									if(result) {
										plus.nativeUI.closeWaiting();
										plus.nativeUI.toast("提交成功");
										document.querySelector('#subDoTask').disabled = true;
										setTimeout(function() {
											var parentview = plus.webview.currentWebview().opener();
											var targetview = plus.webview.getWebviewById("main-subpage-lines.html");
											mui.fire(targetview, "newLoading", {})
											parentview.reload(true);
											plus.webview.currentWebview().close();
										}, 2000);
									}
									if(null != msg) {
										futureListener(null, msg);
										return;
									}
									if(success && result.code == 0) {
										futureListener(result.data, null);
									}
								})
							})
						}
					} else {
						document.querySelector('#subDoTask').disabled = true;
					}

				} else {
					console.log("定量")
					if(newParams.taskStatus == 200) {
						document.querySelector('#subDoTask').disabled = true;
					} else {
						if(taskFlag.length == data.length) {
							console.log('定性没问题')
							document.querySelector('#subDoTask').disabled = false;
							document.querySelector('#subDoTask').addEventListener('tap', function() {
								plus.nativeUI.showWaiting("提交中...");
								newParams.taskStatus = 200;
								console.log('newParams2--->' + JSON.stringify(newParams))
								appFutureImpl.doTask(newParams, function(result, success, msg) {
									console.log('result--->' + JSON.stringify(result))
									if(result) {
										plus.nativeUI.closeWaiting();
										plus.nativeUI.toast("提交成功");
										document.querySelector('#subDoTask').disabled = true;
										setTimeout(function() {
											var parentview = plus.webview.currentWebview().opener();
											//console.log("获取页面啊" + JSON.stringify(parentview))
											var targetview = plus.webview.getWebviewById("main-subpage-lines.html");
											//console.log("获取页面啊" + JSON.stringify(targetview))
											mui.fire(targetview, "newLoading", {})
											parentview.reload(true);
											plus.webview.currentWebview().close();
										}, 2000);
									}
									if(null != msg) {
										futureListener(null, msg);
										return;
									}
									if(success && result.code == 0) {
										futureListener(result.data, null);
									}
								})
							})
						} else {
							document.querySelector('#subDoTask').disabled = true;
						}
					}
				}

				//          console.log('qqqqqqq' + JSON.stringify(params.nodeId))
				//          console.log(JSON.stringify(newParams.nodeId))
				var nodeId = params.nodeId;
				createDom1(params);
				createDom(data, nodeId);
				//				buttonShow(data);
				plus.nativeUI.closeWaiting(); //这里监听页面是否加载完毕，完成后关闭等待框
			})
			window.addEventListener('customEvent', function(event) {
				// mui.fire()传过来的额外的参数，在event.detail中；
				var detail = event.detail;
				location.reload();
			});

			//结束

		})

		//拼接页面   报警信息
		var table = document.body.querySelector('#tally-detail');

		function createDom1(data) {
			var self = plus.webview.currentWebview();
			var hostName = self.hostName;
			console.log('详情' + JSON.stringify(data))
			if(null == data) {
				return;
			}
			//var table = document.body.querySelector('.inner-content');
			//var chartSel = document.body.querySelector('.selCode');
			table.innerHTML = "";
			//chartSel.innerHTML = "";
			var stateStr;
			var stateValue;
			var stateClass = "";
			var appName = data.appName;
			var appSource = '';
			var customerName = '';
			if(data.customerName) {
				customerName = data.customerName
			}
			if(appName == '1') {
				appSource = '在线预警'
			} else if(appName == '2') {
				appSource = '智能诊断'
			} else if(appName == '3') {
				appSource = '大数据分析'
			} else if(appName == '4') {
				appSource = '离线诊断'
			} else if(appName == '100') {
				appSource = '当日点检'
			} else if(appName == '130') {
				appSource = '点检异常'
			} else if(appName == '110') {
				appSource = '精密检测'
			} else if(appName == '120') {
				appSource = '检修计划'
			} else if(appName == '140') {
				appSource = '备修委托'
			} else if(appName == '200') {
				appSource = '总包多专业'
			} else if(appName == '210') {
				appSource = '临时委托'
			}
			//if(data.theTicketType) {
			if(data.category || data.theTicketType) {
				//if(data.theTicketType == 'normal') {
				if(data.category == 50 || data.theTicketType == 'normal') {
					if(data.state == "checking") {
						if(data.isAudit != undefined) {
							if(data.isAudit == 0) {
								stateValue = "被驳回";
								stateClass = "warning-sec-serious";
							} else {
								stateValue = "待诊断";
								stateClass = "mui-btn-warning";
							}
						} else {
							stateValue = "待诊断";
							stateClass = "mui-btn-warning";
						}
					} else if(data.state == "auditing") {
						stateValue = "待审核";
						stateClass = "warning-sec-secondary";
					} else if(data.state == "trusting") {
						stateValue = "待委托";
						stateClass = "mui-btn-purple";
					} else if(data.state == "maintaining") {
						stateValue = "待检修";
						stateClass = "mui-btn-green";
					} else if(data.state == "assessingAgain") {
						stateValue = "待评价";
						stateClass = "mui-btn-green";
					} else if(data.state == "accepting") {
						stateValue = "待验收";
						stateClass = "mui-btn-primary";
					} else if(data.state == "assessing") {
						stateValue = "待评价";
						stateClass = "mui-btn-primary";
					} else if(data.state == "explaining") {
						if(data.isClose != undefined) {
							if(data.isClose == 0) {
								stateValue = "被驳回";
								stateClass = "warning-sec-serious";
							} else {
								stateValue = "待说明";
								stateClass = "mui-btn-warning";
							}
						} else {
							stateValue = "待说明";
							stateClass = "mui-btn-warning";
						}

					} else if(data.state == "closing") {
						stateValue = "待关闭";
						stateClass = "mui-btn-grey";
					} else if(data.state == "end") {
						stateValue = "已完成";
						stateClass = "warning-sec-secondary";
					} else {
						stateValue = "未知";
					}
				}
				//else if(data.theTicketType == 'join') {data.category == 60
				else if(data.category == 60 || data.theTicketType == 'join') {
					if(data.taskStatus == 10) {
						stateValue = "待协同";
						stateClass = "mui-btn-primary";
					} else if(data.taskStatus == 200) {
						stateValue = "已协同";
						stateClass = "mui-btn-green";
					}
				}
				//else if(data.theTicketType == 'normal2') {
				else if(data.category == 90 || data.theTicketType == 'normal2') {
					//这儿要根据检修和产线工程师分别处理  data.tickeTaskStatus
					//if(data.variables.ticket.values.tickeTaskStatus ==  "accepting" ){
					if(data.tickeTaskStatus == "accepting") {
						stateValue = "待验收";
						stateClass = "mui-btn-primary";
					} else if(data.tickeTaskStatus == "assessing") {
						stateValue = "待评价";
						stateClass = "mui-btn-primary";
					} else if(data.tickeTaskStatus == "assessingAgain") {
						stateValue = "待评价";
						stateClass = "mui-btn-green";
					} else if(data.tickeTaskStatus == "maintaining") {
						stateValue = "待检修";
						stateClass = "mui-btn-green";
					} else if(data.tickeTaskStatus == "dealing") {
						stateValue = "待处理";
						stateClass = "mui-btn-green";
					} else if(data.tickeTaskStatus == "dealreadying") {
						stateValue = "待点检";
						stateClass = "mui-btn-green";
					} else if(data.tickeTaskStatus == "end") {
						stateValue = "已完成";
						stateClass = "warning-sec-secondary";
					} else {
						stateValue = "未知";
						stateClass = "mui-btn-green";
					}
				}
				//else if(data.theTicketType == 'pointCheckError') {
				else if(data.category == 130 || data.theTicketType == 'pointCheckError') {
					//点检异常
					if(data.tickeTaskStatus == "accepting") {
						stateValue = "待验收";
						stateClass = "mui-btn-primary";
					} else if(data.tickeTaskStatus == "assessing") {
						stateValue = "待评价";
						stateClass = "mui-btn-primary";
					} else if(data.tickeTaskStatus == "maintaining") {
						stateValue = "待检修";
						stateClass = "mui-btn-green";
					} else if(data.tickeTaskStatus == "dealing") {
						stateValue = "待处理";
						stateClass = "mui-btn-green";
					} else if(data.tickeTaskStatus == "end") {
						stateValue = "已完成";
						stateClass = "warning-sec-secondary";
					} else {
						stateValue = "未知";
						stateClass = "mui-btn-green";
					}
				}
				//else if(data.theTicketType == 'pointCheckPlan' ) {
				else if(data.category == 100 || data.theTicketType == 'pointCheckPlan') {
					//当日点检
					if(data.tickeTaskStatus == "accepting") {
						stateValue = "待验收";
						stateClass = "mui-btn-primary";
					} else if(data.tickeTaskStatus == "assessing") {
						stateValue = "待评价";
						stateClass = "mui-btn-primary";
					} else if(data.tickeTaskStatus == "maintaining") {
						stateValue = "待检修";
						stateClass = "mui-btn-green";
					} else if(data.tickeTaskStatus == "dealing") {
						//data.tickeTaskStatus == "dealreadying"  带点检  为了和平台一致叫待处理
						stateValue = "待处理";
						stateClass = "mui-btn-green";
					} else if(data.tickeTaskStatus == "dealreadying") {
						//data.tickeTaskStatus == "dealreadying"  带点检  为了和平台一致叫待处理
						stateValue = "待点检";
						stateClass = "mui-btn-green";
					} else if(data.tickeTaskStatus == "assessingAgain") {
						stateValue = "待评价";
						stateClass = "mui-btn-primary";
					} else if(data.tickeTaskStatus == "end") {
						stateValue = "已完成";
						stateClass = "warning-sec-secondary";
					} else {
						stateValue = "未知";
						stateClass = "mui-btn-green";
					}
				}
				//else if(data.theTicketType == 'correctCheck' ) {
				else if(data.category == 110 || data.theTicketType == 'correctCheck') {
					//精密检测
					if(data.tickeTaskStatus == "maintaining") {
						stateValue = "待检修";
						stateClass = "mui-btn-green";
					} else if(data.tickeTaskStatus == "dealing") {
						stateValue = "待处理";
						stateClass = "mui-btn-green";
					} else if(data.tickeTaskStatus == "accepting") {
						stateValue = "待验收";
						stateClass = "mui-btn-primary";
					} else if(data.tickeTaskStatus == "assessing") {
						stateValue = "待评价";
						stateClass = "mui-btn-primary";
					} else if(data.tickeTaskStatus == "end") {
						stateValue = "已完成";
						stateClass = "warning-sec-secondary";
					} else {
						stateValue = "未知";
						stateClass = "mui-btn-green";
					}
				}
				//else if(data.theTicketType == 'maintainCheck' ) {
				else if(data.category == 120 || data.theTicketType == 'maintainCheck') {
					if(data.tickeTaskStatus == "accepting") {
						stateValue = "待验收";
						stateClass = "mui-btn-primary";
					} else if(data.tickeTaskStatus == "assessing") {
						stateValue = "待评价";
						stateClass = "mui-btn-primary";
					} else if(data.tickeTaskStatus == "maintaining") {
						stateValue = "待检修";
						stateClass = "mui-btn-green";
					} else if(data.tickeTaskStatus == "dealing") {
						stateValue = "待处理";
						stateClass = "mui-btn-green";
					} else if(data.tickeTaskStatus == "end") {
						stateValue = "已完成";
						stateClass = "warning-sec-secondary";
					} else if(data.tickeTaskStatus == "backing") {
						stateValue = "被退回";
						stateClass = "warning-sec-secondary";
					} else {
						stateValue = "未知";
						stateClass = "mui-btn-green";
					}
				}
				//else if(data.theTicketType == 'readyMaintainCheck') {
				else if(data.category == 140 || data.theTicketType == 'readyMaintainCheck') {
					//备修委托
					if(data.tickeTaskStatus == "maintaining") {
						stateValue = "待检修";
						stateClass = "mui-btn-green";
					} else if(data.tickeTaskStatus == "dealing") {
						stateValue = "待处理";
						stateClass = "mui-btn-green";
					} else if(data.tickeTaskStatus == "accepting") {
						stateValue = "待验收";
						stateClass = "mui-btn-primary";
					} else if(data.tickeTaskStatus == "assessing") {
						stateValue = "待评价";
						stateClass = "mui-btn-primary";
					} else if(data.tickeTaskStatus == "end") {
						stateValue = "已完成";
						stateClass = "warning-sec-secondary";
					} else {
						stateValue = "未知";
						stateClass = "mui-btn-green";
					}
				}
				//else if(data.theTicketType == 'tempTrust' ) {
				else if(data.category == 210 || data.theTicketType == 'tempTrust') {
					//临时委托
					if(data.tickeTaskStatus == "maintaining") {
						stateValue = "待检修";
						stateClass = "mui-btn-green";
					} else if(data.tickeTaskStatus == "dealing") {
						//stateValue = "待检修"; //为了和平台保持一致
						stateValue = "待处理";
						stateClass = "mui-btn-green";
					} else if(data.tickeTaskStatus == "accepting") {
						stateValue = "待验收";
						stateClass = "mui-btn-primary";
					} else if(data.tickeTaskStatus == "assessing") {
						stateValue = "待评价";
						stateClass = "mui-btn-primary";
					} else if(data.tickeTaskStatus == "end") {
						stateValue = "已完成";
						stateClass = "warning-sec-secondary";
					} else if(data.tickeTaskStatus == "backing") {
						stateValue = "被退回";
						stateClass = "warning-sec-secondary";
					} else {
						stateValue = "未知";
						stateClass = "mui-btn-green";
					}
				}
				//else if(data.theTicketType == 'multiMaintain') {
				else if(data.category == 200 || data.theTicketType == 'multiMaintain') {
					//总包多专业
					if(data.tickeTaskStatus == "maintaining") {
						stateValue = "待检修";
						stateClass = "mui-btn-green";
					} else if(data.tickeTaskStatus == "dealing") {
						stateValue = "待处理";
						stateClass = "mui-btn-green";
					} else if(data.tickeTaskStatus == "accepting") {
						stateValue = "待验收";
						stateClass = "mui-btn-primary";
					} else if(data.tickeTaskStatus == "assessing") {
						stateValue = "待评价";
						stateClass = "mui-btn-primary";
					} else if(data.tickeTaskStatus == "end") {
						stateValue = "已完成";
						stateClass = "warning-sec-secondary";
					} else {
						stateValue = "未知";
						stateClass = "mui-btn-green";
					}
				} else if(data.category == 260) {
					if(data.tickeTaskStatus == "assessingAgain") {
						stateValue = "待评价";
						stateClass = "mui-btn-primary";
					} else if(data.tickeTaskStatus == "maintaining") {
						stateValue = "待检修";
						stateClass = "mui-btn-green";
					} else if(data.tickeTaskStatus == "dealing") {
						stateValue = "待处理";
						stateClass = "mui-btn-green";
					} else if(data.tickeTaskStatus == "accepting") {
						stateValue = "待验收";
						stateClass = "mui-btn-primary";
					} else if(data.tickeTaskStatus == "assessing") {
						stateValue = "待评价";
						stateClass = "mui-btn-primary";
					} else if(data.tickeTaskStatus == "end") {
						stateValue = "已完成";
						stateClass = "warning-sec-secondary";
					} else if(data.tickeTaskStatus == "closed") {
						stateValue = "忽略";
						stateClass = "warning-sec-secondary";
					} else {
						stateValue = "未知";
						stateClass = "mui-btn-green";
					}
				}
			} else {
				if(data.state == 0 || data.state == -100) {
					stateValue = "新产生";
					stateClass = "mui-btn-primary";
				} else if(data.state == 5 || data.state == 10) {
					stateValue = "已确认";
					stateClass = "warning-sec-secondary";
				} else if(data.state == 20) {
					//stateValue = "已解决";
					stateValue = "关闭";
					stateClass = "mui-btn-green";
				} else if(data.state == 30) {
					stateValue = "已忽略";
					stateClass = "mui-btn-grey";
				} else if(data.state == 999) {
					stateValue = "待确认";
					stateClass = "mui-btn-primary";
				} else if(data.state == "dealing") {
					stateValue = "待处理";
					stateClass = "mui-btn-primary";
				} else if(data.state == "dealreadying") {
					stateValue = "待点检";
					stateClass = "mui-btn-primary";
				} else {
					stateValue = "未知";
					//stateValue = "待检修";
					stateClass = "mui-btn-green";
				}
			}
			//判断级别
			var severityValue = "";
			var severityClass = "";
			var severityBgColor;
			if(data.severity == 4) {
				severityValue = "危险";
				severityClass = "warning-sec-serious";
				severityBgColor = "#e74e53";
			} else if(data.severity == 3) {
				severityValue = "警告";
				severityClass = "mui-btn-purple";
				severityBgColor = "#ee6b1c";
			} else if(data.severity == 2) {
				severityValue = "注意";
				severityClass = "warning-sec-secondary";
				severityBgColor = "#efd709";
			} else if(data.severity == -1) {
				severityValue = "正常";
				severityClass = "mui-btn-warning";
				severityBgColor = "#00bc79";
			} else {
				severityValue = "未知";
			}

			var arisingTime = moment(data.arisingTime).format('YYYY-MM-DD HH:mm:ss');
			stateStr = '<button type="button" class="mui-badge mui-btn ' + stateClass + ' mui-btn-outlined clear-background label-title" style="position:absolute;top:8px;right:10px;background-color:white;">' + stateValue + '</button>';
			var template = '<div class="mui-icon systemicon warning-exclam-mark" style="background-color:' + severityBgColor + '"></div>' +
			'<div class="mui-pull-right">' + stateStr + '</div>' +
			'<div class="text-wrap-dot warning-message">' + customerName + '</div>' +
			'<div class="text-wrap-dot warning-message" style="color: #828282;">' + data.devName + '</div>' +
			'<div class="warning-msg">' + data.message + '</div>' +
			'<div style="clear:both"></div>' +
				'<p class="admin"><span>' + '编码：' + data.alertId + '</span>' + '<span class="mui-pull-right">' + arisingTime + '</span></p>' +
				'<span class="p-mark">' + '任务来源：' + appSource + '</span>';
			table.innerHTML = template;
		}

		//拼接页面  点检异常
		function createDom(data, nodeId) {
			console.log('dataaaaaaaaa:' + JSON.stringify(data))
			//var table = document.body.querySelector('#tally-detail');
			//table.innerHTML = "";
			allInfoList.clear();
			allInfoList.addArray(data);
			for(var i = 0; i < data.length; i++) {
				//              console.log('createDate : ' + JSON.stringify(data[i].createDate))
				var li = document.createElement('li');
				li.className = 'detail';
				li.id = data[i].itemNumber;
				var checkState;
				data[i].standard = data[i].standard ? data[i].standard : "无"
				if(data[i].checkState == 0) {
					checkState = '正常';
				} else if(data[i].checkState == 1) {
					checkState = '异常';
				} else {
					checkState = '待判定'
				}
				var template =
					'<div class="tit">' +
					'<span class="mui-badge mui-badge-primary">' + data[i].itemNumber + '</span>' +
					'<span style="font-weight: bold;vertical-align: middle;margin-left:8px;">' + data[i].itemContent + '</span>' +
					'</div>' +
					'<div class="rich-content">' +
					'<div class="mui-row">' +
					'<div class="mui-col-xs-6">' + '点检方法：' + data[i].pointCheckMethod + '</div>' +
					'<div class="mui-col-xs-6">' + '项次判定：' + checkState + '</div>' +
					'<div class="mui-col-xs-6">' + '点检标准：' + data[i].standard + '</div>' +
					'<div class="mui-col-xs-6">' + '数据类别：' + data[i].dataType + '</div>' +
					'</div>' +
					'</div>';
				li.innerHTML = template;
				table.appendChild(li);
			}

			var footer = '<button type="button" class="mui-btn mui-btn-outlined mui-pull-right btn-detail" style="margin:10px">设备详情</button>'
			table.innerHTML += footer;
			doc.querySelector('.btn-detail').addEventListener('tap', function() {
				console.log('alertId的值------>' + JSON.stringify(nodeId));
				dispatherManager.toDeviceDetail(nodeId);
			});

		}

		//根据alertId来获取alert对象
		var getAllInfo = function(itemNumber) {
			var allInfo;
			for(var position = 0, len = allInfoList.size(); position < len; position++) {
				if(allInfoList.get(position).itemNumber == itemNumber) {
					allInfo = allInfoList.get(position);
					break;
				}
			}
			return allInfo;
		}

		$('#tally-detail').on('tap', 'li', function() {
			console.log('checkState--->' + JSON.stringify(getAllInfo(this.id).checkState))
			//			if(getAllInfo(this.id).dataType == "定性") {

			//			} else {
			if(getAllInfo(this.id).checkState == null) {
				dispatherManager.toChecking(getAllInfo(this.id), params.alertId);
			} else {
				plus.nativeUI.toast("该项次已判定");
			}
			//			}

		});
	})
	//监听事件
	//  var old_back = mui.back;
	//  mui.back = function() {
	//      // 获取目标口窗口对象、
	//      console.log("返回事件")
	//      var parentview = plus.webview.currentWebview().opener();
	//      //console.log("获取页面啊" + JSON.stringify(parentview))
	//      var targetview = plus.webview.getWebviewById("main-subpage-lines.html");
	//      //console.log("获取页面啊" + JSON.stringify(targetview))
	//      mui.fire(targetview, "newLoading", {})
	//      parentview.reload(true);
	//      //targetview.reload(true);
	//
	//      plus.webview.currentWebview().close();
	//      old_back();
	//  };
}(mui, document))