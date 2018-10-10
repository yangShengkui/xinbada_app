(function($, doc) {
	$.init({
		pullRefresh: {
			container: "#pullrefresh",
			down: toolUtil.getDownRefreshConfig(pulldownRefresh, 50, "false")
		}
	});
	var openerWebview;
	var queryParams = {
		"domain": "",
		"nodeType": "",
		"alertCodes": "",
		"createTimeFrom": "",
		"pageSize": 10,
		"createTimeTo": "",
		"messageFilter": "",
		"severities": "1,2,3,4",
		"states": "0,5,10,20"
	};
	var queryParams4Page = {
		"start": 0,
		"length": 10,
		"sort": "createTime",
		"sortType": "desc",
		"statCount": true,
		"total": 0
	};
	$('.mui-scroll-wrapper').scroll({
		scrollY: true, //是否竖向滚动
		scrollX: false, //是否横向滚动
		startX: 0, //初始化时滚动至x
		startY: 0, //初始化时滚动至y
		indicators: true, //是否显示滚动条
		deceleration: 0.0006, //阻尼系数,系数越小滑动越灵敏
		bounce: true //是否启用回弹
	});
	$.plusReady(function() {
		pulldownRefresh();
		window.addEventListener('disFlag', function(event) {
			// mui.fire()传过来的额外的参数，在event.detail中；
			var detail = event.detail;
			console.log('detail' + detail)
			if(detail == true) {
				doc.querySelector('#evaluation').disabled = true;
			}
			//location.reload();
		});
	})

	function pulldownRefresh() {
		//下拉加载更多业务实现
		var pullObject = $('#pullrefresh').pullRefresh();

		var self = plus.webview.currentWebview();
		var warningObj = self.alertInfo;
		var queryParams = self.queryParams;
		console.log('mergeObj------>' + JSON.stringify(warningObj))
		console.log('queryParams------>' + queryParams)
		createDom(warningObj);
	}

	function createDom(data) {
		var self = plus.webview.currentWebview();
		var hostName = window.getHostName();
		console.log('详情' + JSON.stringify(data))
		if(null == data) {
			return;
		}
		var table = document.body.querySelector('.mui-scroll');
		table.innerHTML = "";
		var newItemList;
		if(data.values){
			newItemList = data.values.alertItemList
		}else if(data.variables){
			newItemList = data.variables.alertItemList
		}
		for(var i = 0; i < newItemList.length; i++) {
		//告警的查询条件
		if(data.origId) {
			var params1 = {
				"alertId": data.origId[0],
				"severities": "1,2,3,4",
				"states": "0,5,10,20,30",
			};
		} else {
			var params1 = {
				"alertId": newItemList[i].alertId,
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
		console.log('参数' + JSON.stringify(params1) + JSON.stringify(params2))
//		appFutureImpl.getAlertByPage(params1, params2, function(result, success, msg) {
////			if(pullObject) {
////				pullObject.endPulldownToRefresh();
////				pullObject.refresh(true);
////			}
//			console.log('数据和依据：' + JSON.stringify(result))
//			if(null != msg) {
//				futureListener(null, msg);
//				return;
//			}
//			if(success && result.code == 0) {
//				futureListener(result.data, null);
//			}
//			if(JSON.stringify(result) == '[]') {
//				newItemList[i].diagnoseDesc = '';
//				newItemList[i].dealOption = '';
//			} else {
//				data.arisingTime = result[0].arisingTime;
//				if(result[0].diagnoseDesc == null || result[0].diagnoseDesc == 'null') {
//					newItemList[i].diagnoseDesc = '';
//				} else {
//					newItemList[i].diagnoseDesc = result[0].diagnoseDesc;
//				}
//				if(result[0].dealOption == null || result[0].dealOption == 'null') {
//					newItemList[i].dealOption = '';
//				} else {
//					newItemList[i].dealOption = result[0].dealOption;
//				}
//
//			}
//			
//		})
			var stateClass = "";
			var appName = newItemList[i].appName;
			var appSource = '';
			var customerName = data.customerName;
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
			//判断级别
			var severityValue = "";
			var severityClass = "";
			var severityBgColor;
			if(newItemList[i].severity == 4) {
				severityValue = "危险";
				severityClass = "warning-sec-serious";
				severityBgColor = "#e74e53";
			} else if(newItemList[i].severity == 3) {
				severityValue = "警告";
				severityClass = "mui-btn-purple";
				severityBgColor = "#ee6b1c";
			} else if(newItemList[i].severity == 2) {
				severityValue = "注意";
				severityClass = "warning-sec-secondary";
				severityBgColor = "#efd709";
			} else if(newItemList[i].severity == -1) {
				severityValue = "正常";
				severityClass = "mui-btn-warning";
				severityBgColor = "#00bc79";
			} else {
				severityValue = "未知";
			}
			//获取category
			var category;
			if(data.variables) {
				category = data.variables.ticket ? data.variables.ticket.category : data.category
			}
			//根据category来判断展示内容

			var checkHtml;

			if(category == 130) {
				//点检异常

				doc.getElementById('titleData').innerText = '点检异常'
				var checkData = data.variables.pointCheckItem
				checkData.checkResult = checkData.checkResult ? checkData.checkResult : '无';
				checkData.lowLimit = checkData.lowLimit ? checkData.lowLimit : '无';
				checkData.unit = checkData.unit ? checkData.unit : '无';
				checkData.upLimitlowLimit = checkData.upLimitlowLimit ? checkData.upLimitlowLimit : '无'
				checkData.resultFiles = checkData.resultFiles ? checkData.resultFiles : '无';
				checkData.checkState = checkData.checkState ? '异常' : '正常';
				checkData.dataType = checkData.dataType ? checkData.dataType : '无';
				checkData.smoothType = checkData.smoothType ? checkData.smoothType : '无';
				checkData.smoothPoint = checkData.smoothPoint ? checkData.smoothPoint : '无';
				checkData.standard = checkData.standard ? checkData.standard : '无';
				console.log('图片数据' + JSON.stringify(checkData.resultFiles))
				var imgHtml = "<p>点检图片：</p>";
				if(checkData.resultFiles.length == 0) {
					imgHtml = imgHtml + '无'
				} else {
					for(var i = 0; i < checkData.resultFiles.length; i++) {
						imgHtml += '<div style="width:30%;height:100px;margin-bottom:8px;"><img style="width:100%;height:100%;" src=" ' + hostName + checkData.resultFiles[i].path + ' "></div>'
					}
				}

				//console.log(imgHtml)
				checkHtml = '<p style="margin-top:10px">点检项次：<span>' + checkData.itemNumber + '</span></p>' +
					'<p>点检内容：<span>' + checkData.itemContent + '</span></p>' +
					'<p>点检方法：<span>' + checkData.pointCheckMethod + '</span></p>' +
					//				'<p> 管理控别：<span>' + checkData.manageCategory + '</span></p>' +
					//				'<p> 管理类别：<span>' + checkData.manageType + '</span></p>' +
					'<p> 数据类别：<span>' + checkData.dataType + '</span></p>' +
					'<p> 润滑方式：<span>' + checkData.smoothType + '</span></p>' +
					'<p> 润滑点数：<span>' + checkData.smoothPoint + '</span></p>' +
					'<p> 标准：<span>' + checkData.standard + '</span></p>' +
					'<p> 计量单位：<span>' + checkData.unit + '</span></p>' +
					'<p> 上限：<span>' + checkData.upLimitlowLimit + '</span></p>' +
					'<p> 下限：<span>' + checkData.lowLimit + '</span></p>' +
					'<p> 项次判定：<span><input type="radio" checked>' + checkData.checkState + '</span></p>' +
					'<p> 点检结果：<span>' + checkData.checkResult + '</span></p>' + imgHtml
				//'<p> 点检图片：<span>' + checkData.resultFiles + '</span></p>' ;
			} else if(category == 110) {
				//精密监测
				console.log('数据' + JSON.stringify(data))
				doc.getElementById('titleData').innerText = '精密检测';
				data.variables.analyzeItem = data.variables.analyzeItem ? data.variables.analyzeItem : '无'
				checkHtml = '<p style="margin-top:10px">负责人：<span>' + data.variables.targetUser + '</span></p>' +
					'<p>项目类别：<span>' + data.variables.analyzeItem + '</span></p>';
			} else if(category == 120) {
				//检修计划
				doc.getElementById('titleData').innerText = '检修计划'
				checkHtml = ''
			} else {
				doc.getElementById('titleData').innerText = '报警明细'
				if(newItemList[i].diagnoseDesc == null){
					newItemList[i].diagnoseDesc = '';
				}
				if(newItemList[i].dealOption == null){
					newItemList[i].dealOption = '';
				}
				checkHtml = '<p style="margin-top:10px">判断依据：<span>' + newItemList[i].diagnoseDesc + '</span></p>' +
					'<p>诊断建议：<span>' + newItemList[i].dealOption + '</span></p>';
			}
			//判断任务来源还是报警来源
			var source;
			if(data.variables) {
				var tickets = data.variables.ticket ? data.variables.ticket.category : data.category
				if(tickets) {
					if(tickets != 50 && tickets != 60 && tickets != 70 && tickets != 90) {
						source = '任务来源：'
					} else {
						source = '报警来源：'
					}

				} else {
					source = '报警来源：'
				}
			} else {
				source = '报警来源：'
			}
			var arisingTime = moment(newItemList[i].arisingTime).format('YYYY-MM-DD HH:mm:ss');
			var template = '<div class="inner-content" style="border-bottom:1px solid #EEE;padding-top:10px">'+
				'<div class="mui-icon systemicon warning-exclam-mark" style="background-color:' + severityBgColor + '"></div>' +
//				'<div class="mui-pull-right">' + stateStr + '</div>' +
				'<div class="text-wrap-dot warning-message">' + customerName + '</div>' +
				'<div class="text-wrap-dot" style="font-size: 0.64rem;color: #828282;">' + data.devName + '</div>' +
				'<div class="warning-msg-detail">' + newItemList[i].alertTitle + '</div>' +
				'<div style="clear:both"></div>' +
				'<p class="admin"><span>' + '编码：' + newItemList[i].alertId + '</span>' + '<span class="mui-pull-right">' + arisingTime + '</span></p>' +
				'<span class="p-mark">' + source + appSource + '</span>' + checkHtml;
				'</div>'
			table.innerHTML += template;
		}
	}

}(mui, document));