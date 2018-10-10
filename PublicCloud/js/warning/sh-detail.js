(function($, doc) {
	$.init({
		pullRefresh: {
			container: "#pullrefresh",
			down: {
				//				style: 'circle',
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
	})

	function pulldownRefresh() {
		var pullObject = $('#pullrefresh').pullRefresh();
		var self = plus.webview.currentWebview();
		var taskId = self.taskId;
		var hostName = window.getHostName();
		console.log('taskId' + JSON.stringify(taskId))
		appFutureImpl.getTicketTaskById(taskId, function(result, success, msg) {
			console.log('审核详情' + JSON.stringify(result.variables.auditOpinion))
			if(pullObject) {
				pullObject.endPulldownToRefresh();
				pullObject.refresh(true);
			}
			if(null != msg) {
				futureListener(null, msg);
				return;
			}
			createDom(result, hostName);
		})
	}

	function createDom(data, hostName) {
		var statusGrade = '';
		if(data.variables.statusGrade == '-1') {
			statusGrade = "正常";
		} else if(data.variables.statusGrade == '2') {
			statusGrade = "注意";
		} else if(data.variables.statusGrade == '3') {
			statusGrade = "警告";
		} else if(data.variables.statusGrade == '4') {
			statusGrade = "危险";
		}
		var table = document.body.querySelector('.tle-content');
		table.innerHTML = "";
		var basisImageValue = '';
		var attUploadValue = '';
		var attUploadLabel = '';
		if(data.variables.basisImage) {
			for(var i = 0; i < data.variables.basisImage.length; i++) {
				basisImageValue += '<img style="width:100%" src="' + hostName + data.variables.basisImage[i].value+ '"/>'
			}
		}
		if(data.variables.attUpload) {
			attUploadValue = data.variables.attUpload[0].value;
			attUploadLabel = data.variables.attUpload[0].label;
		}
		if(data.variables.attention == undefined) {
			data.variables.attention = ''
		}
		var remark;
		if( data.variables.remark){
			remark = data.variables.remark;
		}else{
			remark = ''
		}
		var abnPosition;
		if( data.variables.abnPosition){
			abnPosition = data.variables.abnPosition;
		}else{
			abnPosition = ''
		}
		var sendTime = moment(data.sendTime).format('YYYY-MM-DD HH:mm:ss');
		var template = '<p class="p-icon">'+
      		'<span>审核意见</span>'+
      		'<span class="txt1">审核人：'+data.senderName+'</span>'+
      		'<span class="txt2">'+sendTime+'</span></p>'+
      		'<div class="info"><p style="margin:0">'+data.variables.auditOpinion+'</p></div>'+
			'<p>设备名称：' + data.variables.devName + '</p>' +
			'<p>设备编号：' + data.variables.deviceCode + '</p>' +
			'<p>异常现象：' + data.variables.abnPhenomenon + '</p>' +
			'<p>工艺状况：' + data.variables.technicsStatus + '</p>' +
			'<p>检测部位：' + data.variables.position + '</p>' +
			'<p>注意事项：' + data.variables.attention + '</p>' +
			'<p>判断标准：' + data.variables.standard + '</p>' +
			'<p>判断依据：' + data.variables.basis + '</p>' +
			'<p>依据图片：'+basisImageValue +'</p>'+
			'<p>综合状态等级：' + statusGrade + '</p>' +
			'<p>异常部位：' + abnPosition + '</p>' +
			'<p>异常类型：' + data.variables.abnType + '</p>' +
			'<p>综合判断结论：' + data.variables.multipleConclusion + '</p>' +
			'<p>处理方案建议：' + data.variables.cessingScheme + '</p>' +
			'<p>备注：' + remark + '</p>' +
			'<p>附件：<a href="' + hostName + attUploadValue + '">' + attUploadLabel + '</a></p>'
		table.innerHTML = template;
	}
}(mui, document))