function createBigEventDetailCell(data) {
	console.log('渲染页面得数据' + JSON.stringify(data))
	if(data.type == 'alert') {
		var appSource = '';
		var severityValue = '';
		var severityBgColor = "";
		if(data.values.appName == '1') {
			appSource = '在线预警'
		} else if(data.values.appName == '2') {
			appSource = '智能诊断'
		} else if(data.values.appName == '3') {
			appSource = '大数据分析'
		} else if(data.values.appName == '4') {
			appSource = '离线诊断'
		}
		if(data.values.severity == 4) {
			severityValue = "危险";
			severityBgColor = "#e74e53";
		} else if(data.values.severity == 3) {
			severityValue = "警告";
			severityBgColor = "#ee6b1c";
		} else if(data.values.severity == 2) {
			severityValue = "注意";
			severityBgColor = "#efd709";
		} else if(data.values.severity == -1) {
			severityValue = "正常";
			severityBgColor = "#00bc79";
		} else {
			severityValue = "未知";
		}
		if(data.resumeDate == null) {
			var htmlValue = '<div class="time">' +
				'<p></p>' +
				'<p></p>' +
				'</div>' +
				'<span class="iconfont icon-icon-life-alarm" style="background-color:' + severityBgColor + '"></span>' +
				'<div class="line-progress">' +
				'<p>报警信息：' + data.values.alertTitle + '</p>' +
				'<p>报警来源：' + appSource + '</p>' +
				'<p>综合判断结论：' + data.values.multipleConclusion + '</p>' +
				'<p>处理方案建议：' + data.values.cessingScheme + '</p>' +
				'</div>'

		} else {
			var resumeDate1 = moment(data.resumeDate).format("MM-DD")
			var resumeDate2 = moment(data.resumeDate).format("HH:mm")
			var htmlValue = '<div class="time">' +
				'<p>' + resumeDate1 + '</p>' +
				'<p>' + resumeDate2 + '</p>' +
				'</div>' +
				'<span class="iconfont icon-icon-life-alarm" style="background-color:' + severityBgColor + '"></span>' +
				'<div class="line-progress">' +
				'<p>报警信息：' + data.values.alertTitle + '</p>' +
				'<p>报警来源：' + appSource + '</p>' +
				'<p>综合判断结论：' + data.values.multipleConclusion + '</p>' +
				'<p>处理方案建议：' + data.values.cessingScheme + '</p>' +
				'</div>'

		}

		return htmlValue;
	} else if(data.type == 'mainten') {
		if(data.resumeDate == null) {
			var htmlValue =
				//										'<div class="time">'+
				//				      						'<p></p>'+
				//				      						'<p></p>'+
				//					      				'</div>'+
				//					      				'<span class="iconfont icon-xinxinicon first-state"></span>'+   	
				'<div class="line-progress">' +
				'<p>工程项目名称：' + data.values.standardProjectName + '</p>' +
				'<p>工时数：' + data.values.repairWorkPeriod + '</p>' +
				'</div>'
		} else {
			var resumeDate1 = moment(data.resumeDate).format("MM-DD")
			var resumeDate2 = moment(data.resumeDate).format("HH:mm")
			var htmlValue = '<div class="time">' +
				'<p>' + resumeDate1 + '</p>' +
				'<p>' + resumeDate2 + '</p>' +
				'</div>' +
				'<span class="iconfont icon-xinxinicon first-state"></span>' +
				'<div class="line-progress">' +
				'<p>工程项目名称：' + data.values.standardProjectName + '</p>' +
				'<p>工时数：' + data.values.repairWorkPeriod + '</p>' +
				'</div>'
		}
		return htmlValue;
	} else if(data.type == 'remark') {
		if(data.resumeDate == null) {
			var htmlValue =
				//										'<div class="time">'+
				//				      						'<p></p>'+
				//				      						'<p></p>'+
				//					      				'</div>'+
				//					      				'<span class="iconfont icon-xinxinicon first-state"></span>'+   	
				'<div class="line-progress">' +
				'<p>备忘名称：' + data.values.name + '</p>' +
				'<p>备注：' + data.values.remark + '</p>' +
				'</div>'
		} else {
			var resumeDate1 = moment(data.resumeDate).format("MM-DD")
			var resumeDate2 = moment(data.resumeDate).format("HH:mm")
			var htmlValue = '<div class="time">' +
				'<p>' + resumeDate1 + '</p>' +
				'<p>' + resumeDate2 + '</p>' +
				'</div>' +
				'<span class="mui-icon mui-icon-compose first-state"></span>' +
				'<div class="line-progress">' +
				'<p>备忘名称：' + data.values.name + '</p>' +
				'<p>备注：' + data.values.remark + '</p>' +
				'</div>'
		}
		return htmlValue;
	}
}

var createBigEventDetailList = function(data) {
	if(null == data) {
		return;
	}
	var newData = data.reverse();
	var fragment = document.createDocumentFragment();
	var li;
	var len = newData.length;
	for(var i = 0; i < len; i++) {
		li = document.createElement('li');
		li.className = 'mui-table-view-cell';
		li.id = data[i].alertId;
		li.innerHTML = createBigEventDetailCell(data[i]);
		fragment.appendChild(li);
	}
	return fragment;
};