(function($, doc) {
	$.init({

	});
	mui('.mui-scroll-wrapper').scroll({
		deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	});
	$.plusReady(function() {
		var self = plus.webview.currentWebview();
		var id = self.noId;
		var deviceId = self.deviceId;
		var hostName = window.getHostName();
		console.log('host.....:' + JSON.stringify(hostName))
		appFutureImpl.getDeviceDiagnosticResumeList(deviceId, {}, function(result, success, msg) {
			console.log('诊断履历详情：' + JSON.stringify(result))
			if(null != msg) {
				futureListener(null, msg);
				return;
			}
			if(success && result.code == 0) {
				futureListener(result.data, null);
			}
			createDom(result, hostName)

		})

		function createDom(data, hostName) {
			var table = document.body.querySelector('.mui-table-view');
			table.innerHTML = "";
			var severity = '';
			var specialtyProp = '';
			var alertFromType = '';
			var statusGrade = '';
			for(var i = 0; i < data.length; i++) {
				if(data[i].id == id) {
					var li = document.createElement('li');
					li.className = 'mui-table-view-cell';
					if(data[i].severity == 4) {
						severity = "危险"
					} else if(data[i].severity == 3) {
						severity = "警告"
					} else if(data[i].severity == 2) {
						severity = "注意"
					} else if(data[i].severity == 1) {
						severity = "正常"
					} else {
						severity = "未知"
					}
					if(data[i].statusGrade == 4) {
						statusGrade = "危险"
					} else if(data[i].statusGrade == 3) {
						statusGrade = "警告"
					} else if(data[i].statusGrade == 2) {
						statusGrade = "注意"
					} else if(data[i].statusGrade == -1) {
						statusGrade = "正常"
					} else {
						statusGrade = "未知"
					}
					if((data[i].alertItemList.length ? data[i].alertItemList.length : '1') > 1) {
						alertFromType = '合并报警'
					} else {
						if(data[i].alertFromType == 4) {
							alertFromType = "离线诊断"
						} else if(data[i].alertFromType == 3) {
							alertFromType = "大数据分析"
						} else if(data[i].alertFromType == 2) {
							alertFromType = "智能诊断"
						} else if(data[i].alertFromType == 1) {
							alertFromType = "在线预警"
						} else {
							alertFromType = "未知"
						}
					}
					if(data[i].specialtyProp == 'Z') {
						specialtyProp = '振动';
					} else if(data[i].specialtyProp == 'Y') {
						specialtyProp = '油液';
					} else if(data[i].specialtyProp == 'Q') {
						specialtyProp = '清洁度检测（油质）';
					} else if(data[i].specialtyProp == 'M') {
						specialtyProp = '磨损分析';
					} else if(data[i].specialtyProp == 'J') {
						specialtyProp = '绝缘油分析';
					} else if(data[i].specialtyProp == 'H') {
						specialtyProp = '红外热成像检测';
					} else if(data[i].specialtyProp == 'D') {
						specialtyProp = '电机电流';
					} else if(data[i].specialtyProp == 'K') {
						specialtyProp = '开关温度';
					} else if(data[i].specialtyProp == 'P') {
						specialtyProp = '液压';
					} else if(data[i].specialtyProp == 'N') {
						specialtyProp = '扭矩';
					} else if(data[i].specialtyProp == 'G') {
						specialtyProp = '工艺指标';
					} else if(data[i].specialtyProp == 'W') {
						specialtyProp = '表面温度';
					}
					var actionDoneDate;
					var eventDate;
					var tallyEvaluateDate;
					if(data[i].actionDoneDate) {
						actionDoneDate = moment(data[i].actionDoneDate).format('YYYY-MM-DD HH:mm:ss');
					} else {
						actionDoneDate = ''
					}
					if(data[i].eventDate) {
						eventDate = moment(data[i].eventDate).format('YYYY-MM-DD HH:mm:ss');
					} else {
						eventDate = ''
					}
					if(data[i].tallyEvaluateDate) {
						tallyEvaluateDate = moment(data[i].tallyEvaluateDate).format('YYYY-MM-DD HH:mm:ss');
					} else {
						tallyEvaluateDate = ''
					}
					var checkRemark;
					var trustDate;
					var createTime;
					if(data[i].checkRemark == null) {
						checkRemark = '';
					} else {
						checkRemark = data[i].checkRemark;
					}
					if(data[i].trustDate == null) {
						trustDate = '';
					} else {
						trustDate = moment(data[i].trustDate).format('YYYY-MM-DD HH:mm:ss');
					}
					if(data[i].createTime == null) {
						createTime = '';
					} else {
						createTime = moment(data[i].createTime).format('YYYY-MM-DD HH:mm:ss');
					}
					var actionBeginDate;
					if(data[i].actionBeginDate == null) {
						actionBeginDate = '';
					} else {
						actionBeginDate = moment(data[i].actionBeginDate).format('YYYY-MM-DD HH:mm:ss');
					}
					var trustId;
					if(data[i].trustId == null) {
						trustId = '';
					} else {
						trustId = data[i].trustId;
					}
					var projectName;
					if(data[i].projectName == null) {
						projectName = '';
					} else {
						projectName = data[i].projectName;
					}
					var tallyCheck;
					if(data[i].tallyCheck == null) {
						tallyCheck = '';
					} else {
						tallyCheck = data[i].tallyCheck;
					}
					var attention;
					if(data[i].attention == null) {
						attention = '';
					} else {
						attention = data[i].attention;
					}
					var tallyEvaluateDealExplain;
					if(data[i].tallyEvaluateDealExplain == null) {
						tallyEvaluateDealExplain = '';
					} else {
						tallyEvaluateDealExplain = data[i].tallyEvaluateDealExplain;
					}
					var tallyEvaluateCheckboxlist;
					if(data[i].tallyEvaluateCheckboxlist == null) {
						tallyEvaluateCheckboxlist = '';
					} else {
						if(data[i].tallyEvaluateCheckboxlist == 0) {
							tallyEvaluateCheckboxlist = '正确';
						} else if(data[i].tallyEvaluateCheckboxlist == 1) {
							tallyEvaluateCheckboxlist = '基本正确';
						} else if(data[i].tallyEvaluateCheckboxlist == 2) {
							tallyEvaluateCheckboxlist = '不正确';
						}

					}
					var abnPosition;
					if(data[i].abnPosition) {
						abnPosition = data[i].abnPosition
					} else {
						abnPosition = '';
					}
					var filePaths;
					if(data[i].diagosticeReport == null) {
						filePaths = '<p>报告文件：</p>'
					} else {
						filePaths = '<p>报告文件：<a href="' + hostName + data[i].diagosticeReport.filePath + '">' + data[i].diagosticeReport.fileName + '</a></p>'
					}
					if(data[i].deviceGroup == null) {
						data[i].deviceGroup = ''
					}
					if(data[i].abnPhenomenon == null) {
						data[i].abnPhenomenon = ''
					}
					if(data[i].technicsStatus == null) {
						data[i].technicsStatus = ''
					}
					if(data[i].position == null) {
						data[i].position = ''
					}
					if(data[i].standard == null) {
						data[i].standard = ''
					}
					if(data[i].basis == null) {
						data[i].basis = ''
					}
					if(data[i].abnType == null) {
						data[i].abnType = ''
					}
					if(data[i].multipleConclusion == null) {
						data[i].multipleConclusion = ''
					}
					if(data[i].cessingScheme == null) {
						data[i].cessingScheme = ''
					}
					if(data[i].auditUserName == null) {
						data[i].auditUserName = ''
					}
					var template = '<p style="color:#0066FF;font-size:20px;margin:10px 0">报警</p>' +
						'<p>设备编号：' + data[i].deviceId + '</span></p>' +
						'<p>设备信息：' + data[i].deviceGroup + '</p>' +
						'<p>报警信息：' + data[i].alertTitle + '</p>' +
						'<p>报警级别：' + severity + '</p>' +
						'<p>报警来源：' + alertFromType + '</p>' +
						'<p>设备时间：' + eventDate + '</p>' +
						'<p style="color:#0066FF;font-size:20px;margin:10px 0">诊断</p>' +
						'<p>诊断设备：' + data[i].deviceName + '</p>' +
						'<p>异常现象：' + data[i].abnPhenomenon + '</p>' +
						'<p>工艺状况：' + data[i].technicsStatus + '</p>' +
						'<p>检测技术：' + specialtyProp + '</p>' +
						'<p>检测部位：' + data[i].position + '</p>' +
						'<p>注意事项：' + attention + '</p>' +
						'<p>判断标准：' + data[i].standard + '</p>' +
						'<p>判断依据：' + data[i].basis + '</p>' +
						'<p>综合状态等级：' + statusGrade + '</p>' +
						'<p>异常部位：' + abnPosition + '</p>' +
						'<p>异常类型：' + data[i].abnType + '</p>' +
						'<p>综合诊断结论：' + data[i].multipleConclusion + '</p>' +
						'<p>处理建议：' + data[i].cessingScheme + '</p>' +
						'<p>备注：' + checkRemark + '</p>' +
						'<p>诊断分析责任人：' + data[i].responsiblePersonName + '</p>' +
						'<p>结果方案审核人：' + data[i].auditUserName + '</p>' +
						'<p>创建日期：' + createTime + '</p>' +
						'<p>附件：</p>' +
						filePaths +
						'<p style="color:#0066FF;font-size:20px;margin:10px 0">检修</p>' +
						'<p>委托日期：' + trustDate + '</p>' +
						'<p>委托单号：' + trustId + '</p>' +
						'<p>工程项目名称：' + projectName + '</p>' +
						'<p>开工日期：' + actionBeginDate + '</p>' +
						'<p>完工日期：' + actionDoneDate + '</p>' +
						'<p>验收说明：' + tallyCheck + '</p>' +
						'<p>诊断结论评价日期：' + tallyEvaluateDate + '</p>' +
						'<p>诊断结论评价等级：' + tallyEvaluateCheckboxlist + '</p>' +
						'<p>诊断结论评价说明：' + tallyEvaluateDealExplain + '</p>'
					li.innerHTML = template;
					table.appendChild(li);
				}

			}
		}
	})
}(mui, document))