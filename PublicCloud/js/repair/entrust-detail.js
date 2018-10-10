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
		//		$('#pullrefresh').pullRefresh().pulldownLoading();
	})

	function pulldownRefresh() {

		var self = plus.webview.currentWebview();
		var hostName = window.getHostName();
		var ticketNo = {
			'ticketNo': self.ticketNo
		};
		if(self.variables != undefined) {
			var deviceCode = self.variables.deviceCode;
			console.log('deviceCode' + JSON.stringify(deviceCode))
		}

		var ticketNum = self.ticketNo;
		console.log('ticketNo' + JSON.stringify(ticketNo))
		appFutureImpl.getDeviceCheckTrustByCondition(ticketNo, function(result, success, msg) {
			console.log('委托详情' + JSON.stringify(result))
			if(JSON.stringify(result) == '[]') {
				plus.nativeUI.toast("暂无数据");
			} else {
				var standardProjectId = result[0].standardProjectId;

				if(null != msg) {
					futureListener(null, msg);
					return;
				}
				if(success && result.code == 0) {
					futureListener(result.data);
				}
				createDom(result);
				//检修方案  只有产线工程师需要
				if(self.variables != undefined) {
					var serviceParams = [{
						deviceCode: deviceCode,
						standardProjectNo: standardProjectId
					}]
					appFutureImpl.getMaintainStandardListByCondition(serviceParams, function(result, success, msg) {
						plus.nativeUI.showWaiting();
						plus.nativeUI.closeWaiting();
						//console.log("检修方案的数据" + JSON.stringify(result))
						if(null != msg) {
							futureListener(null, msg);
							return;
						}
						if(success && result.code == 0) {
							futureListener(result.data);
						}
						console.log("获取的数据" + JSON.stringify(result))
						if(result) {
							var createProject = result;
							var standardProject = [];
							var historyProject = [];
							//var standardProject = [];
							for(var i = 0; i < createProject.length; i++) {
								if(createProject[i].type == "0") {
									standardProject.push(createProject[i]);
								} else if(createProject[i].type == "1" && createProject[i].ticketNo == ticketNum) {
									historyProject.push(createProject[i]);
								}
							}
							console.log("数据啊" + JSON.stringify(historyProject))
							console.log("数据啊" + JSON.stringify(standardProject))
							if(historyProject.length != 0) {
								if(historyProject[0].fileList) {
									createDom2(historyProject[0].fileList, hostName);
								}
							} else {
								createDom2(standardProject[0].fileList, hostName);
							}

						}

					})
				}
			}
		})

	}

	function createDom(data) {
		var table = document.body.querySelector('.mui-table-view');
		table.innerHTML = "";
		//  		 for(var i = 0;i<data.length;i++){
		var li = document.createElement('li');
		li.className = 'mui-table-view-cell';
		//				      li.id = data[i].id;
		var bstiRepairEndDate;
		var estiRepairBeginDate;
		var num;
		var propseDate;
		var trustDate;
		if(data[0].propseDate) {
			propseDate = moment(data[0].propseDate).format('YYYY-MM-DD');
		} else {
			propseDate = ''
		}
		if(data[0].trustDate) {
			trustDate = moment(data[0].trustDate).format('YYYY-MM-DD');
		} else {
			trustDate = ''
		}
		if(data[0].bstiRepairEndDate) {
			bstiRepairEndDate = moment(data[0].bstiRepairEndDate).format('YYYY-MM-DD');
		} else {
			bstiRepairEndDate = ''
		}
		if(data[0].estiRepairBeginDate) {
			estiRepairBeginDate = moment(data[0].estiRepairBeginDate).format('YYYY-MM-DD');
		} else {
			estiRepairBeginDate = ''
		}
		if(data[0].trustNum == null) {
			num = ''
		} else {
			num = data[0].trustNum;
		}
		var propseUserJobId;
		if(data[0].propseUserJobId == null) {
			propseUserJobId = ''
		} else {
			propseUserJobId = data[0].propseUserJobId;
		}
		var highDangerFileName;
		if(data[0].highDangerFileName == null) {
			highDangerFileName = ''
		} else {
			highDangerFileName = data[0].highDangerFileName;
		}
		var no;
		if(data[0].no == null) {
			no = ''
		} else {
			no = data[0].no;
		}
		var abnNo;
		if(data[0].abnNo == null) {
			abnNo = ''
		} else {
			abnNo = data[0].abnNo;
		}
		var combFailureLedgerId;
		if(data[0].combFailureLedgerId == null) {
			combFailureLedgerId = ''
		} else {
			combFailureLedgerId = data[0].combFailureLedgerId;
		}
		var suggesTeamName;
		if(data[0].suggesTeamName == null) {
			suggesTeamName = ''
		} else {
			suggesTeamName = data[0].suggesTeamName;
		}
		var sparePartsCode;
		if(data[0].sparePartsCode == null) {
			sparePartsCode = ''
		} else {
			sparePartsCode = data[0].sparePartsCode;
		}
		var sparePartsName;
		if(data[0].sparePartsName == null) {
			sparePartsName = ''
		} else {
			sparePartsName = data[0].sparePartsName;
		}
		var sparePartType;
		if(data[0].sparePartType == null) {
			sparePartType = ''
		} else {
			sparePartType = data[0].sparePartType;
		}
		var planId;
		if(data[0].planId == null) {
			planId = ''
		} else {
			planId = data[0].planId;
		}
		var isSk;
		if(data[0].isSk == null) {
			isSk = ''
		} else {
			isSk = data[0].isSk;
		}
		var template = '<h4>检修委托</h4>' +
			'<p>' + '标准项目编号：' + data[0].standardProjectId + '</p>' +
			'<p>项目分类：' + data[0].projectType + '</p>' +
			'<p>数量：' + num + '</p>' +
			'<p>需求日期：' + propseDate + '</p>' +
			'<p>委托日期：' + trustDate + '</p>' +
			'<p>委托人岗号：' + propseUserJobId + '</p>' +
			'<p>请修原因：' + data[0].propseReason + '</p>' +
			'<p>定年修主控/重点：' + isSk + '</p>' +
			'<p>委托单号：' + data[0].trustId + '</p>' +
			'<p>工程项目名称：' + data[0].standardProjectName + '</p>' +
			'<p>施工类别：' + data[0].constructionType + '</p>' +
			'<p>项目类别：' + data[0].projectCategory + '</p>' +
			'<p>质量层级：' + data[0].qualityLevel + '</p>' +
			'<p>高危等级：' + data[0].highDangerLevel + ' ' + highDangerFileName + '</p>' +
			'<p>工作内容：' + data[0].workContent + '</p>' +
			'<p>总人数：' + data[0].totalPerpsonNum + '</p>' +
			'<p>计划编号：' + planId + '</p>' +
			'<p>序号：' + no + '</p>' +
			'<p>异常联络单编号：' + abnNo + '</p>' +
			'<p>故障台编码：' + combFailureLedgerId + '</p>' +
			'<p>计划完工日期：' + bstiRepairEndDate + '</p>' +
			'<p>建议班组名称：' + data[0].suggesTeamCode + '</p>' +
			'<p>负责人：' + suggesTeamName + '</p>' +
			'<p>备件代码：' + sparePartsCode + '</p>' +
			'<p>备件名称：' + sparePartsName + '</p>' +
			'<p>预计施工日期：' + estiRepairBeginDate + '</p>' +
			'<p>备件型号：' + sparePartType + '</p>' +
			'<p>总工时：' + data[0].totalUseTime + '</p>'

		li.innerHTML = template;
		table.appendChild(li);
		//    			}
	}

	function createDom2(data, hostName) {
		console.log('检修实际---' + JSON.stringify(data))
		var table = document.body.querySelector('#service');
		var template = '<h4>检修方案</h4>';
		for(var i = 0; i < data.length; i++) {
			template += '<li>' +
				'<p>' + data[i].label + '：' + '<a href="' + hostName + data[i].filePath + '">' + data[i].fileName + '</a></p>' +
				'</li>'
		}
		console.log(template)
		table.innerHTML = template;
	}

}(mui, document))