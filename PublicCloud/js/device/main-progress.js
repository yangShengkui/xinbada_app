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

		pulldownRefresh()
		$('#pullrefresh').pullRefresh().pulldownLoading();
	})

	function pulldownRefresh() {
		var pullObject = $('#pullrefresh').pullRefresh();
		var self = plus.webview.currentWebview();
		var ticketNo = self.alertId;
		var hostName = window.getHostName();
		console.log('ticketNo' + ticketNo)
		var params1 = {
			"attrs": {
				"origId": Number(ticketNo)
			}
		}
		var params2 = {
			"start": 0,
			"length": 10
		}
		if(ticketNo.toString().length < 15) {
			appFutureImpl.getDealTicketListByPage(params1, params2, function(result, success, msg) {
				console.log('通过告警查询工单号 ： ' + JSON.stringify(result))
				if(null != msg) {
					futureListener(null, 0, msg);
					return;
				}
				if(success && result.code == 0) {
					futureListener(result.data.data, result.data.total, null);
				}
				if(JSON.stringify(result) == '[]') {
					appFutureImpl.queryActionLog([Number(ticketNo), null, 1], function(result, success, msg) {
						console.log('queryActionLog ---> ' + JSON.stringify(result))
						var queryRes = result;
						if(null != msg) {
							futureListener(null, msg);
							return;
						}
						if(success && result.code == 0) {
							futureListener(result.data);
						}
						var p1 = {
							"alertId": ticketNo
						}
						console.log("p1"+JSON.stringify(p1))
						appFutureImpl.getAlertByPage(p1, params2, function(result, success, msg) {
							console.log('重复查告警 --->' + JSON.stringify(result))
							var data = result;
							if(null != msg) {
								futureListener(null, msg);
								return;
							}
							if(success && result.code == 0) {
								futureListener(result.data, null);
							}
							var table = document.body.querySelector('.tle-content');
							table.innerHTML = "";
							var li = document.createElement('div');
							li.className = 'mui-table-view-cell';
							li.style.backgroundColor = '#fff';
							var tm1 = moment(result[0].actTime).format("MM-DD");
							var tm2 = moment(result[0].actTime).format("HH:mm");
							var arisingTime1 = moment(data[0].arisingTime).format("MM-DD");
							var arisingTime2 = moment(data[0].arisingTime).format("HH:mm");
							if(data[0].appName == 1) {
								appName = '在线预警'
							} else if(data[0].appName == 2) {
								appName = '智能诊断'
							} else if(data[0].appName == 3) {
								appName = '大数据分析'
							} else if(data[0].appName == 4) {
								appName = '离线诊断'
							}
							if(data[0].severity == 4) {
								severity = '危险'
							} else if(data[0].severity == 3) {
								severity = '警告'
							} else if(data[0].severity == 2) {
								severity = '注意'
							} else {
								severity = '正常'
							}
							if(data[0].specialty == 'Z') {
								specialtyProp = '振动'
							} else if(data[0].specialty == 'G') {
								specialtyProp = '工艺指标'
							} else if(data[0].specialty == 'Y') {
								specialtyProp = '油液'
							} else if(data[0].specialty == 'Q') {
								specialtyProp = '清洁度检测（油质）'
							} else if(data[0].specialty == 'M') {
								specialtyProp = '磨损分析'
							} else if(data[0].specialty == 'J') {
								specialtyProp = '绝缘油分析'
							} else if(data[0].specialty == 'H') {
								specialtyProp = '红外热成像检测'
							} else if(data[0].specialty == 'D') {
								specialtyProp = '电机电流'
							} else if(data[0].specialty == 'K') {
								specialtyProp = '开关温度'
							} else if(data[0].specialty == 'P') {
								specialtyProp = '液压'
							} else if(data[0].specialty == 'N') {
								specialtyProp = '扭矩'
							} else if(data[0].specialty == 'W') {
								specialtyProp = '表面温度'
							} else {
								specialtyProp = '未知'
							}
							var dealMode;
							if(data[0].state == 30){
								dealMode = '忽略'
							}else{
								dealMode = '分配'
							}
							var alertTitle;
							if(data[0].message){
								alertTitle = data[0].message
							}else{
								alertTitle = ''
							}
							var comments ;
							if(data[0].comments){
								comments = data[0].comments
							}else{
								comments = ''
							}
							var template = '<div class="mui-table-view-cell" style="margin:0;padding:0">' +
								'<div class="time">' +
								'<p>' + tm1 + '</p>' +
								'<p>' + tm2 + '</p>' +
								'</div>' +
								'<span class="mui-icon mui-icon-person"></span>' +
								'<span style="margin-left:20px;color:#0099FF;font-size:12px;">报警处理</span>' +
								'<span class="mui-pull-right origin-state"style="color:#0099FF">处理人：报警管理虚拟工作台</span>' +
								'<div class="line-progress">' +
								'<p>处理方式：'+dealMode+'</p>' +
								'<p>处理原因：' + comments + '</p>' +
								'</div>' +
								'</div>' +
								'<div class="time">' +
								'<p>' + arisingTime1 + '</p>' +
								'<p>' + arisingTime1 + '</p>' +
								'</div>' +
								'<span class="mui-icon mui-icon-info first-state"></span>' +
								'<span class="origin-state" style="margin-left:20px">报警产生</span>' +
								//		      				'<span class="mui-pull-right origin-state" style="display:inline-block;width:100px;">报警描述：速度峰值过高</span>'+
								'<div class="line-progress">' +
								'<p>报警类型：' + specialtyProp + '</p>' +
								'<p>报警级别：' + severity + '</p>' +
								'<p>报警描述：' + alertTitle + '</p>' +
								'<p>报警来源：' + appName + '</p>' +
								'</div>'
							li.innerHTML = template;
							table.appendChild(li);
						})
					})
				} else {
					var newNo = result[0].ticketNo;
					appFutureImpl.getTicketLog(newNo, function(result, success, msg) {
						//	  		pullObject.endPulldownToRefresh(true);
						//				 pullObject.refresh(true);
						console.log('报警流程跟踪' + JSON.stringify(result[result.length - 1]))
						if(null != msg) {
							futureListener(null, msg);
							return;
						}
						if(success && result.code == 0) {
							futureListener(result.data);
						}
						createDom(result, hostName);
					})
				}
			})
		} else {
			appFutureImpl.getTicketLog(ticketNo, function(result, success, msg) {
				//	  		pullObject.endPulldownToRefresh(true);
				//				 pullObject.refresh(true);
				console.log('工单流程跟踪' + JSON.stringify(result))
				if(null != msg) {
					futureListener(null, msg);
					return;
				}
				if(success && result.code == 0) {
					futureListener(result.data);
				}
				createDom(result, hostName);
			})
		}

		$('.tle-content').on('tap', '.mui-table-view-cell #weituo', function() {

			dispatherManager.toEntrustDetail((this.parentElement).parentElement.id)
		});
		$('.tle-content').on('tap', '.mui-table-view-cell #fangan', function() {
			dispatherManager.toRepairScheme((this.parentElement).parentElement.id)

		});
		$('.tle-content').on('tap', '.mui-table-view-cell #shiji', function() {
			dispatherManager.toRepairPlan((this.parentElement).parentElement.id)
		});
		$('.tle-content').on('tap', '.mui-table-view-cell #pdfReport', function() {
			window.location.href = this.href;
		});
	}

	function createDom(data, hostName) {
		// 	data.splice(0,1);
		var params = {
			'ticketNo': data[0].ticketNo
		}
		appFutureImpl.getDeviceCheckTrustByCondition(params, function(result, success, msg) {
			console.log('报警处理-------------->' + JSON.stringify(result))
			var warningRes = result;
			if(null != msg) {
				futureListener(null, msg);
				return;
			}
			if(success && result.code == 0) {
				futureListener(result.data, null);
			}
			var table = document.body.querySelector('.tle-content');
			table.innerHTML = "";
			console.log('流程长度' + JSON.stringify(data))
			for(var len = data.length, i = len - 1; i >= 0; i--) {
				var li = document.createElement('div');
				li.className = 'mui-table-view-cell';
				li.style.backgroundColor = '#fff';
				li.id = data[i].ticketNo;
				var isAudit = '';
				var isClose = '';
				var template = '';
				var dealType = '';
				var appName = '';
				var severity = '';
				var specialtyProp = '';
				var executeTime1 = moment(data[i].executeTime).format("MM-DD");
				var executeTime2 = moment(data[i].executeTime).format("HH:mm");
				var alertArisingTime1 = moment(data[1].ticketTask.variables.ticket.values.alertArisingTime).format("MM-DD");
				var alertArisingTime2 = moment(data[1].ticketTask.variables.ticket.values.alertArisingTime).format("HH:mm");
				var createTime1 = moment(data[1].ticketTask.sendTime).format("MM-DD");
				var createTime2 = moment(data[1].ticketTask.sendTime).format("HH:mm");
				if(i == 0) {
					if(data[1].ticketTask.variables.ticket.values.appName == 1) {
						appName = '在线预警'
					} else if(data[1].ticketTask.variables.ticket.values.appName == 2) {
						appName = '智能诊断'
					} else if(data[1].ticketTask.variables.ticket.values.appName == 3) {
						appName = '大数据分析'
					} else if(data[1].ticketTask.variables.ticket.values.appName == 4) {
						appName = '离线诊断'
					}
					if(data[1].ticketTask.variables.ticket.values.severity == 4) {
						severity = '危险'
					} else if(data[1].ticketTask.variables.ticket.values.severity == 3) {
						severity = '警告'
					} else if(data[1].ticketTask.variables.ticket.values.severity == 2) {
						severity = '注意'
					} else {
						severity = '正常'
					}
					if(data[1].ticketTask.variables.ticket.values.specialtyProp == 'Z') {
						specialtyProp = '振动'
					} else if(data[1].ticketTask.variables.ticket.values.specialtyProp == 'G') {
						specialtyProp = '工艺指标'
					} else if(data[1].ticketTask.variables.ticket.values.specialtyProp == 'Y') {
						specialtyProp = '油液'
					} else if(data[1].ticketTask.variables.ticket.values.specialtyProp == 'Q') {
						specialtyProp = '清洁度检测（油质）'
					} else if(data[1].ticketTask.variables.ticket.values.specialtyProp == 'M') {
						specialtyProp = '磨损分析'
					} else if(data[1].ticketTask.variables.ticket.values.specialtyProp == 'J') {
						specialtyProp = '绝缘油分析'
					} else if(data[1].ticketTask.variables.ticket.values.specialtyProp == 'H') {
						specialtyProp = '红外热成像检测'
					} else if(data[1].ticketTask.variables.ticket.values.specialtyProp == 'D') {
						specialtyProp = '电机电流'
					} else if(data[1].ticketTask.variables.ticket.values.specialtyProp == 'K') {
						specialtyProp = '开关温度'
					} else if(data[1].ticketTask.variables.ticket.values.specialtyProp == 'P') {
						specialtyProp = '液压'
					} else if(data[1].ticketTask.variables.ticket.values.specialtyProp == 'N') {
						specialtyProp = '扭矩'
					} else if(data[1].ticketTask.variables.ticket.values.specialtyProp == 'W') {
						specialtyProp = '表面温度'
					} else {
						specialtyProp = '未知'
					}
					var alertTitles;
							if(data[1].ticketTask.variables.ticket.values.alertTitle){
								alertTitles = data[1].ticketTask.variables.ticket.values.alertTitle
							}else{
								alertTitles = ''
							}
					template = '<div class="mui-table-view-cell" style="margin:0;padding:0">' +
						'<div class="time">' +
						'<p>' + createTime1 + '</p>' +
						'<p>' + createTime2 + '</p>' +
						'</div>' +
						'<span class="mui-icon mui-icon-person"></span>' +
						'<span style="margin-left:20px;color:#0099FF;font-size:12px;">报警处理</span>' +
						'<span class="mui-pull-right origin-state"style="color:#0099FF">处理人：报警管理虚拟工作台</span>' +
						'<div class="line-progress">' +
						'<p>处理方式：分配</p>' +
						'<p>处理原因：无</p>' +
						'</div>' +
						'</div>' +
						'<div class="time">' +
						'<p>' + alertArisingTime1 + '</p>' +
						'<p>' + alertArisingTime2 + '</p>' +
						'</div>' +
						'<span class="mui-icon mui-icon-info first-state"></span>' +
						'<span class="origin-state" style="margin-left:20px">报警产生</span>' +
						//		      				'<span class="mui-pull-right origin-state" style="display:inline-block;width:100px;">报警描述：速度峰值过高</span>'+
						'<div class="line-progress">' +
						'<p>报警类型：' + specialtyProp + '</p>' +
						'<p>报警级别：' + severity + '</p>' +
						'<p>报警描述：' + alertTitles + '</p>' +
						'<p>报警来源：' + appName + '</p>' +
						'</div>'

				} else if(i == len - 1) {
					if(data[i].ticketTask.variables.ticket.values.tickeTaskStatus == 'checking') { //诊断分析
						template = '<div class="time">' +
							'<p>' + executeTime1 + '</p>' +
							'<p>' + executeTime2 + '</p>' +
							'</div>' +
							'<span class="mui-icon mui-icon-person first-state" style="background-color:orange"></span>' +
							'<span class="mui-pull-right origin-state"style="color:orange">诊断人：' + data[i].ticketTask.handlerName + '</span>' +
							'<span class=" origin-state" style="width:100px;margin-left:20px;color:orange">' + data[i].message + '</span>' +
							'<div class="line-progress">' +
							'<p>诊断说明：待诊断</p>' +
							'</div>'
					} else if(data[i].ticketTask.variables.ticket.values.tickeTaskStatus == 'auditing') { //诊断审核
						template = '<div class="time">' +
							'<p>' + executeTime1 + '</p>' +
							'<p>' + executeTime2 + '</p>' +
							'</div>' +
							'<span class="mui-icon mui-icon-person first-state" style="background-color:orange"></span>' +
							'<span class="mui-pull-right origin-state"style="color:orange">审核人：' + data[i].ticketTask.handlerName + '</span>' +
							'<span class=" origin-state" style="width:100px;margin-left:20px;color:orange">' + data[i].message + '</span>' +
							'<div class="line-progress">' +
							'<p>审核结果：待审核</p>' +
							'</div>'
					} else if(data[i].ticketTask.variables.ticket.values.tickeTaskStatus == 'trusting') { //带委托
						template = '<div class="time">' +
							'<p>' + executeTime1 + '</p>' +
							'<p>' + executeTime2 + '</p>' +
							'</div>' +
							'<span class="mui-icon mui-icon-person first-state" style="background-color:orange"></span>' +
							'<span class="mui-pull-right origin-state"style="color:orange">点检人：' + data[i].ticketTask.handlerName + '</span>' +
							'<span class=" origin-state" style="width:100px;margin-left:20px;color:orange">' + data[i].message + '</span>' +
							'<div class="line-progress">' +
							'<p>委托结果：待委托</p>' +
							'</div>'
					} else if(data[i].ticketTask.variables.ticket.values.tickeTaskStatus == 'maintaining') { //待处理
						template = '<div class="time">' +
							'<p>' + executeTime1 + '</p>' +
							'<p>' + executeTime2 + '</p>' +
							'</div>' +
							'<span class="mui-icon mui-icon-person first-state" style="background-color:orange"></span>' +
							'<span class="mui-pull-right origin-state"style="color:orange">检修人：' + data[i].ticketTask.handlerName + '</span>' +
							'<span class=" origin-state" style="width:100px;margin-left:20px;color:orange">' + data[i].message + '</span>' +
							'<div class="line-progress">' +
							//							'<p>检修结果：待维修</p>' +
							'<button type="button" class="mui-btn mui-btn-primary"id="fangan">维修方案</button>' +
							'</div>'
					} else if(data[i].ticketTask.variables.ticket.values.tickeTaskStatus == 'accepting') { //待验收

						template = '<div class="time">' +
							'<p>' + executeTime1 + '</p>' +
							'<p>' + executeTime2 + '</p>' +
							'</div>' +
							'<span class="mui-icon mui-icon-person first-state" style="background-color:orange"></span>' +
							'<span class="mui-pull-right origin-state"style="color:orange">验收人：' + data[i].ticketTask.handlerName + '</span>' +
							'<span class=" origin-state" style="width:100px;margin-left:20px;color:orange">' + data[i].message + '</span>' +
							'<div class="line-progress">' +
							'<p>验收结果：待验收</p>' +
							'</div>'
					} else if(data[i].ticketTask.variables.ticket.values.tickeTaskStatus == 'assessing') { //待评价

						template = '<div class="time">' +
							'<p>' + executeTime1 + '</p>' +
							'<p>' + executeTime2 + '</p>' +
							'</div>' +
							'<span class="mui-icon mui-icon-person first-state" style="background-color:orange"></span>' +
							'<span class="mui-pull-right origin-state"style="color:orange">评价人：' + data[i].ticketTask.handlerName + '</span>' +
							'<span class=" origin-state" style="width:100px;margin-left:20px;color:orange">' + data[i].message + '</span>' +
							'<div class="line-progress">' +
							'<p>评价结果：待评价</p>' +
							'</div>'
					} else if(data[i].ticketTask.variables.ticket.values.tickeTaskStatus == 'explaining') { //说明

						template = '<div class="time">' +
							'<p>' + executeTime1 + '</p>' +
							'<p>' + executeTime2 + '</p>' +
							'</div>' +
							'<span class="mui-icon mui-icon-person first-state" style="background-color:orange"></span>' +
							'<span class="mui-pull-right origin-state"style="color:orange">说明人：' + data[i].ticketTask.handlerName + '</span>' +
							'<span class=" origin-state" style="width:100px;margin-left:20px;color:orange">' + data[i].message + '</span>' +
							'<div class="line-progress">' +
							'<p>说明结果：待说明</p>' +
							'</div>'

					} else if(data[i].ticketTask.variables.ticket.values.tickeTaskStatus == 'closing') { //审核完毕
						console.log('返回的流程信息 ： ' + JSON.stringify(data[i].ticketTask))
						if(data[i].ticketTask.values == null) {
							template = '<div class="time">' +
								'<p>' + executeTime1 + '</p>' +
								'<p>' + executeTime2 + '</p>' +
								'</div>' +
								'<span class="mui-icon mui-icon-person first-state" style="background-color:orange"></span>' +
								'<span class="mui-pull-right" style="color:orange;font-size:12px;">审核人：' + data[i].ticketTask.handlerName + '</span>' +
								'<span class="" style="color:orange;font-size:12px;width:100px;margin-left:20px">' + data[i].message + '</span>' +
								'<div class="line-progress">' +
								//								'<p>审核结果：待关闭</p>' +
								'</div>'
						} else {
							if(data[i].ticketTask.values.isClose == 0) {
								isClose = '驳回'
							} else {
								isClose = '通过';
								template = '<div class="time">' +
									'<p>' + executeTime1 + '</p>' +
									'<p>' + executeTime2 + '</p>' +
									'</div>' +
									'<span class="mui-icon mui-icon-person"></span>' +
									'<span class="mui-pull-right" style="color:#0099FF;font-size:12px;">审核人：' + data[i].ticketTask.handlerName + '</span>' +
									'<span class="" style="color:#0099FF;font-size:12px;width:100px;margin-left:20px">' + data[i].message + '</span>' +
									'<div class="line-progress">' +
									'<p>审核结果：' + isClose + '</p>' +
									'<p>审核说明：' + data[i].ticketTask.values.auditDeclare + '</p>' +
									'</div>'
							}
						}
					}
				} else {
					var finishedTime1 = moment(data[i].ticketTask.finishedTime).format("MM-DD");
					var finishedTime2 = moment(data[i].ticketTask.finishedTime).format("HH:mm");
					if(data[i].ticketTask.variables.ticket.values.tickeTaskStatus == 'checking') { //诊断分析
						var statusGrade = '';
						if(data[i].ticketTask.values.statusGrade == -1) {
							statusGrade = '正常'
						} else if(data[i].ticketTask.values.statusGrade == 2) {
							statusGrade = '注意'
						} else if(data[i].ticketTask.values.statusGrade == 3) {
							statusGrade = '警告'
						} else if(data[i].ticketTask.values.statusGrade == 4) {
							statusGrade = '危险'
						}
						template = '<div class="time">' +
							'<p>' + finishedTime1 + '</p>' +
							'<p>' + finishedTime2 + '</p>' +
							'</div>' +
							'<span class="mui-icon mui-icon-person first-state"></span>' +
							'<span class="mui-pull-right origin-state">诊断人：' + data[i].ticketTask.handlerName + '</span>' +
							'<span class=" origin-state" style="width:100px;margin-left:20px">' + data[i].message + '</span>' +
							'<div class="line-progress">' +

							'<p>综合判断结论：' + data[i].ticketTask.values.multipleConclusion + '</p>' +
							'<p>综合诊断等级：' + statusGrade + '</p>' +
							'<p>处理方案建议：' + data[i].ticketTask.values.cessingScheme + '</p>' +
							'</div>'
					} else if(data[i].ticketTask.variables.ticket.values.tickeTaskStatus == 'auditing') { //诊断审核
						if(data[i].ticketTask.values.isAudit == 0) {
							isAudit = '驳回';
							template = '<div class="time">' +
								'<p>' + finishedTime1 + '</p>' +
								'<p>' + finishedTime2 + '</p>' +
								'</div>' +
								'<span class="mui-icon mui-icon-person first-state"></span>' +
								'<span class="mui-pull-right origin-state">审核人：' + data[i].ticketTask.handlerName + '</span>' +
								'<span class=" origin-state" style="width:100px;margin-left:20px">' + data[i].message + '</span>' +
								'<div class="line-progress">' +

								'<p>审核结果：' + isAudit + '</p>' +
								'<p>审核意见：' + data[i].ticketTask.values.auditOpinion + '</p>' +
								'</div>'
						} else {
							isAudit = '通过';
							template = '<div class="time">' +
								'<p>' + finishedTime1 + '</p>' +
								'<p>' + finishedTime2 + '</p>' +
								'</div>' +
								'<span class="mui-icon mui-icon-person first-state"></span>' +
								'<span class="mui-pull-right origin-state">审核人：' + data[i].ticketTask.handlerName + '</span>' +
								'<span class=" origin-state" style="width:100px;margin-left:20px">' + data[i].message + '</span>' +
								'<div class="line-progress">' +

								'<p>审核结果：' + isAudit + '</p>' +
								'<p>审核意见：' + data[i].ticketTask.values.auditOpinion + '</p>' +
								'<p>综合诊断等级：' + data[i].ticketTask.variables.statusGrade + '</p>' +
								//						'<p>综合判断结论：' + data[i].ticketTask.variables.multipleConclusion + '</p>' +
								//						'<p>处理方案建议：' + data[i].ticketTask.variables.cessingScheme + '</p>' +
								'<p>综合诊断报告：<a id="pdfReport" href="' + hostName + '/api/rest/download/deviceResumeUIService/getReportBytes/' + data[i].ticketNo + '.pdf/' + data[i].ticketNo + '">' + data[i].ticketNo + '.pdf</a></p>' +
								'</div>'
						}

					} else if(data[i].ticketTask.variables.ticket.values.tickeTaskStatus == 'trusting') { //带委托
						if(data[i].ticketTask.values.dealType == 1) {
							dealType = '暂不处理';
							var tallyCheckboxlist = '';
							for(var m = 0; m < data[i].ticketTask.values.tallyCheckboxlist.length; m++) {
								tallyCheckboxlist += data[i].ticketTask.values.tallyCheckboxlist[m].label + ';';
							}
							template = '<div class="time">' +
								'<p>' + finishedTime1 + '</p>' +
								'<p>' + finishedTime2 + '</p>' +
								'</div>' +
								'<span class="mui-icon mui-icon-person first-state"></span>' +
								'<span class="mui-pull-right origin-state">点检人：' + data[i].ticketTask.handlerName + '</span>' +
								'<span class=" origin-state" style="width:100px;margin-left:20px">' + data[i].message + '</span>' +
								'<div class="line-progress">' +

								'<p>处理方式：' + dealType + '</p>' +
								'<p>处理原因：' + tallyCheckboxlist + '</p>' +
								'<p>处理说明：' + data[i].ticketTask.values.tallyDealExplain + '</p>' +
								'</div>'
						} else if(data[i].ticketTask.values.dealType == 2) {
							dealType = '自行处理';
							template = '<div class="time">' +
								'<p>' + finishedTime1 + '</p>' +
								'<p>' + finishedTime2 + '</p>' +
								'</div>' +
								'<span class="mui-icon mui-icon-person first-state"></span>' +
								'<span class="mui-pull-right origin-state">点检人：' + data[i].ticketTask.handlerName + '</span>' +
								'<span class=" origin-state" style="width:100px;margin-left:20px">' + data[i].message + '</span>' +
								'<div class="line-progress">' +

								'<p>处理方式：' + dealType + '</p>' +
								'<p>处理原因：' + data[i].ticketTask.values.tallyCourseReason + '</p>' +
								'<p>处理说明：' + data[i].ticketTask.values.tallyReason + '</p>' +
								'</div>'
						} else {
							dealType = '发起委托';
							template = '<div class="time">' +
								'<p>' + finishedTime1 + '</p>' +
								'<p>' + finishedTime2 + '</p>' +
								'</div>' +
								'<span class="mui-icon mui-icon-person first-state"></span>' +
								'<span class="mui-pull-right origin-state">点检人：' + data[i].ticketTask.handlerName + '</span>' +
								'<span class=" origin-state" style="width:100px;margin-left:20px">' + data[i].message + '</span>' +
								'<div class="line-progress">' +

								'<p>处理方式：' + dealType + '</p>' +
								'<p>标准项目编号：' + data[i].ticketTask.values.standardProjectId + '</p>' +
								'<p>标准项目名称：' + warningRes[0].standardProjectName + '</p>' +
								'<p>定年修主控重点：' + warningRes[0].isSk + '</p>' +
								'<p>质量层级：' + warningRes[0].qualityLevel + '</p>' +
								'<p>高危等级：' + warningRes[0].highDangerLevel + '</p>' +
								'<button type="button" class="mui-btn mui-btn-primary"id="weituo">详情</button>' +
								'</div>'
						}
					} else if(data[i].ticketTask.variables.ticket.values.tickeTaskStatus == 'maintaining') { //待处理

						template = '<div class="time">' +
							'<p>' + finishedTime1 + '</p>' +
							'<p>' + finishedTime2 + '</p>' +
							'</div>' +
							'<span class="mui-icon mui-icon-person first-state"></span>' +
							'<span class="mui-pull-right origin-state">检修人：' + data[i].ticketTask.handlerName + '</span>' +
							'<span class=" origin-state" style="width:100px;margin-left:20px">' + data[i].message + '</span>' +
							'<div class="line-progress">' +
							'<button type="button" class="mui-btn mui-btn-primary"id="fangan">维修方案</button>' +
							'<button type="button" class="mui-btn mui-btn-primary"id="shiji" style="margin-left:10px">检修实绩</button>' +
							'</div>'
					} else if(data[i].ticketTask.variables.ticket.values.tickeTaskStatus == 'accepting') { //待验收
						var tallyRemark = '';
						if(data[i].ticketTask.values.tallyRemark) {
							tallyRemark = data[i].ticketTask.values.tallyRemark
						} else {
							tallyRemark = '无';
						}
						var tallyCheck = '';
						if(data[i].ticketTask.values.tallyCheck == 0){
							tallyCheck = '通过'
						}else if(data[i].ticketTask.values.tallyCheck == 1){
							tallyCheck = '驳回'
						}
						template = '<div class="time">' +
							'<p>' + finishedTime1 + '</p>' +
							'<p>' + finishedTime2 + '</p>' +
							'</div>' +
							'<span class="mui-icon mui-icon-person first-state"></span>' +
							'<span class="mui-pull-right origin-state">验收人：' + data[i].ticketTask.handlerName + '</span>' +
							'<span class=" origin-state" style="width:100px;margin-left:20px">' + data[i].message + '</span>' +
							'<div class="line-progress">' +
							'<p>验收说明：' + tallyCheck + '</p>' +
							'<p>备注：' + tallyRemark + '</p>' +
							'</div>'
					} else if(data[i].ticketTask.variables.ticket.values.tickeTaskStatus == 'assessing') { //待评价
						var tallyEvaluateCheckboxlist = '';
						var tallyEvaluateDealExplain = '';
						if(data[i].ticketTask.values.tallyEvaluateCheckboxlist == 0) {
							tallyEvaluateCheckboxlist = '正确';
						} else if(data[i].ticketTask.values.tallyEvaluateCheckboxlist == 1) {
							tallyEvaluateCheckboxlist = '基本正确';
						} else if(data[i].ticketTask.values.tallyEvaluateCheckboxlist == 2) {
							tallyEvaluateCheckboxlist = '不正确';
						}
						if(data[i].ticketTask.values.tallyEvaluateDealExplain) {
							tallyEvaluateDealExplain = data[i].ticketTask.values.tallyEvaluateDealExplain;
						} else {
							tallyEvaluateDealExplain = '无'
						}
						template = '<div class="time">' +
							'<p>' + finishedTime1 + '</p>' +
							'<p>' + finishedTime2 + '</p>' +
							'</div>' +
							'<span class="mui-icon mui-icon-person first-state"></span>' +
							'<span class="mui-pull-right origin-state">评价人：' + data[i].ticketTask.handlerName + '</span>' +
							'<span class="origin-state" style="width:100px;margin-left:20px">' + data[i].message + '</span>' +
							'<div class="line-progress">' +
							'<p>评价等级：' + tallyEvaluateCheckboxlist + '</p>' +
							'<p>评价说明：' + tallyEvaluateDealExplain + '</p>' +
							'</div>'
					} else if(data[i].ticketTask.variables.ticket.values.tickeTaskStatus == 'explaining') { //说明

						template = '<div class="time">' +
							'<p>' + finishedTime1 + '</p>' +
							'<p>' + finishedTime2 + '</p>' +
							'</div>' +
							'<span class="mui-icon mui-icon-person first-state"></span>' +
							'<span class="mui-pull-right origin-state">分析人：' + data[i].ticketTask.handlerName + '</span>' +
							'<span class="origin-state" style="width:100px;margin-left:20px">' + data[i].message + '</span>' +
							'<div class="line-progress">' +
							'<p>关闭说明：' + data[i].ticketTask.values.diagnoseDeclare + '</p>' +
							'</div>'
					} else if(data[i].ticketTask.variables.ticket.values.tickeTaskStatus == 'closing') { //审核
						if(data[i].ticketTask.values.isClose == 0) {
							isClose = '驳回'
						} else {
							isClose = '通过'
						}
						template = '<div class="time">' +
							'<p>' + finishedTime1 + '</p>' +
							'<p>' + finishedTime2 + '</p>' +
							'</div>' +
							'<span class="mui-icon mui-icon-person first-state"></span>' +
							'<span class="mui-pull-right origin-state">审核人：' + data[i].ticketTask.handlerName + '</span>' +
							'<span class=" origin-state" style="width:100px;margin-left:20px">' + data[i].message + '</span>' +
							'<div class="line-progress">' +
							'<p>审核结果：' + isClose + '</p>' +
							'<p>审核说明：' + data[i].ticketTask.values.auditDeclare + '</p>' +
							'</div>'
					}
				}
				li.innerHTML = template;
				table.appendChild(li);
			}

		})
	}
}(mui, document))