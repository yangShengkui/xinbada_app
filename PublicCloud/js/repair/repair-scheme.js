(function($, doc) {
	$.init({

	});
	mui('.mui-scroll-wrapper').scroll({
		deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	});
	$.plusReady(function() {
		var self = plus.webview.currentWebview();
		var ticketNo = self.ticketNo;
		var hostName = window.getHostName();
		var params;
		console.log('tivcketNo--->' + JSON.stringify(ticketNo))
		appFutureImpl.getTicketLog(ticketNo, function(result, success, msg) {
			console.log('维修方案·1' + JSON.stringify(result))
			if(null != msg) {
				futureListener(null, msg);
				return;
			}
			if(success && result.code == 0) {
				futureListener(result.data);
			}
			result.splice(0, 1);
			for(var len = result.length, i = len - 1; i >= 0; i--) {
				if(result[i].ticketTask.variables.ticket.values.tickeTaskStatus == 'maintaining') {
					params = [{
						"deviceCode": result[i].ticketTask.variables.deviceCode,
						"standardProjectNo": result[i].ticketTask.variables.standardProjectId
					}]
					console.log('params--->' + JSON.stringify(params))
				}
			}
			appFutureImpl.getMaintainStandardListByCondition({
				ticketNo: ticketNo
			}, function(result, success, msg) {
				console.log('当前的两个方案 : ' + JSON.stringify(result))
				var recentRes = result;
				if(null != msg) {
					futureListener(null, msg);
					return;
				}
				if(success && result.code == 0) {
					futureListener(result.data);
				}
				if(JSON.stringify(result) == "[]") {
					$.alert('该工单暂未制定维修方案！', '温馨提示：', function(e) {
						if(e.index == 0) {
							console.log('返回');
							mui.back();
						}
					});
				} else {
					appFutureImpl.getMaintainStandardListByCondition(params, function(result, success, msg) {
						console.log('维修方案' + JSON.stringify(result))
						if(null != msg) {
							futureListener(null, msg);
							return;
						}
						if(success && result.code == 0) {
							futureListener(result.data);
						}
						createDom(result, recentRes);
					})
				}
			})
		})

		function createDom(data, recentRes) {
			console.log('dataaaaaaaaa:' + JSON.stringify(data))
			console.log('recentRes:' + JSON.stringify(recentRes))
			var table = document.body.querySelector('.mui-table-view');
			table.innerHTML = "";
			var isSk = '';
			var innerList = '';
			for(var len = data.length, i = len - 1; i >= 0; i--) {
				//				console.log('createDate : ' + JSON.stringify(data[i].createDate))
				var li = document.createElement('li');
				li.className = 'mui-table-view-cell';
				//				      li.id = data[i].id;
				var template = '';
				var list = '';
				if(JSON.stringify(recentRes) != '[]') {
					if(recentRes[0].isSk == 0) {
						isSk = '否'
					} else {
						isSk = '是'
					}
					var highDangerLevel = '';
					if(recentRes[0].highDangerLevel == 0) {
						highDangerLevel = '无'
					} else if(recentRes[0].highDangerLevel == 1) {
						highDangerLevel = '1级'
					} else if(recentRes[0].highDangerLevel == 2) {
						highDangerLevel = '2级'
					} else if(recentRes[0].highDangerLevel == 3) {
						highDangerLevel = '3级'
					}

					template = '<p>标准项目编号：' + recentRes[0].standardProjectNo + '</p>' +
						'<p>工程项目名称：' + recentRes[0].standardName + '</p>' +  
						'<p>定年修主控/重点：' + isSk + '</p>' +
						'<p>高危等级：' + highDangerLevel + '</p>';
					list = '';
					for(var j = 0; j < recentRes[0].fileList.length; j++) {
						var list1 = '<p>' + recentRes[0].fileList[j].label + '：<a href="' + hostName + recentRes[0].fileList[j].filePath + '" style="color:#007aff">' + recentRes[0].fileList[j].fileName + '</a></p>'

						list += list1;
					}
				} else {

				}
				var hsitoryList = '';
				if(i >= 0) {
					var createDate;
					if(data[i].createDate) {
						var createDate = moment(data[i].createDate).format('YYYY-MM-DD HH:mm');
					} else {
						createDate = ''
					}

					var tle = '<p class="history-S">历史维修方案</p>';
					if(data[i].fileList != null) {
						for(var j = 0; j < data[i].fileList.length; j++) {
							if(data[i].fileList[j].fileName != '') {
								var list2 = '<div class="footer">' +
									'<div class="scheme"><span>维修</span><span>方案</span></div><div class="detail-scheme"><p><a href="' + hostName + data[i].fileList[j].filePath + '" style="color:#007aff">' + data[i].fileList[j].fileName + '</a></p><p class="mui-pull-right">' + createDate + '</p></div>' +
									'</div>'
								innerList += list2;
							}
						}
						//										console.log('hsitoryList---'+JSON.stringify(innerList))
						hsitoryList += innerList;
					}
				}

			}
			li.innerHTML = template + list + tle + hsitoryList;
			table.appendChild(li);
		}
	})
}(mui, document))