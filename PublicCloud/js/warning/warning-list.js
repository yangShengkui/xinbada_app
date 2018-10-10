(function($) {
	$.init({
		pullRefresh: {
			container: "#pullrefresh",
			down: toolUtil.getDownRefreshConfig(pulldownRefresh, 50, "false"),
			up: toolUtil.getUpRefreshConfig(pullupRefresh),
		}
	});
	var alertInfoList = new ArrayList();
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
	var detail = {};

	$.plusReady(function() {
		//清除上次的数据
		window.addEventListener("clearData", function(event) {
			document.body.querySelector('.mui-table-view').innerHTML = "";
			alertInfoList.clear();
		})
		var self = plus.webview.currentWebview();
		queryParams.states = self.queryStates;
		if(self.queryDomain !== undefined) {
			queryParams.domain = self.queryDomain;
		}
		window.addEventListener('getDomain', function(event) {
			console.log('告警列表的获取' + JSON.stringify(event.detail))

			if(detail == event.detail) return;
			detail = event.detail;
			if(event.detail) {
				if(event.detail.domains) {
					if(queryParams.domain != event.detail.domains) {
						queryParams.domain = event.detail.domains;

					}
				} else {
					queryParams.domain = "";

				}
			} else {
				queryParams.domain = "";

			}
			plus.nativeUI.showWaiting(); //出现提示框
			pulldownRefresh();
		});

		window.addEventListener('WARNING_INFO_UPDATE', function(event) {
			$("#pullrefresh").pullRefresh().pulldownLoading();
		});
		
		window.addEventListener('WARNING_INFO_UPDATE_AGIN', function(event) {
			pulldownRefresh()
		});
		//设置点击事件的监听
		$('.mui-table-view').on('tap', 'li', function() {
			dispatherManager.toWarningDetail(getAlertInfo(this.id));
		});
		pulldownRefresh();
	});

	//根据alertId来获取alert对象
	var getAlertInfo = function(alertId) {
		var alertInfo;
		for(var position = 0, len = alertInfoList.size(); position < len; position++) {
			if(alertInfoList.get(position).alertId == alertId) {
				alertInfo = alertInfoList.get(position);
				break;
			}
		}
		return alertInfo;
	}

	function pulldownRefresh() {
		//下拉加载更多业务实现
		var pullObject = $('#pullrefresh').pullRefresh();

		queryParams4Page.start = 0;
		queryParams4Page.statCount = true;
		queryParams4Page.total = 0;
		console.log("--------->queryParams down: " + JSON.stringify(queryParams));
		if(queryParams.domain.domains) {
			queryParams.domain = queryParams.domain.domains
		}
		appFutureImpl.getAlertByPage(queryParams, queryParams4Page, function(result, total, msg) {
//			if(pullObject) {
//				pullObject.endPulldownToRefresh();
//				pullObject.refresh(true);
//			}
//			plus.nativeUI.closeWaiting(); //关闭提示框
//			//if(null != msg && result != null) {
//			console.log("")
//			if(null != msg ||  null == result) {
//				console.log("1234455")
//				plus.nativeUI.toast(msg);
//				return;
//			}
			if(pullObject) {
				pullObject.endPullupToRefresh();
			}
			
			plus.nativeUI.closeWaiting(); //关闭提示框
			if(null != msg) {
				plus.nativeUI.toast(msg);
				return;
			}

			queryParams4Page.start = queryParams4Page.start + queryParams4Page.length;
			queryParams4Page.statCount = false;
			if(total > 0) {
				queryParams4Page.total = total;
			}

			var ul = document.body.querySelector('.mui-table-view');
			ul.innerHTML = "";
			alertInfoList.clear();
			alertInfoList.addArray(result);
			console.log(JSON.stringify(result))
			ul.appendChild(createWarningDetailList(result, ul));
		});
	}

	function pullupRefresh() {
		var pullObject = $('#pullrefresh').pullRefresh();

		if(queryParams4Page.start > queryParams4Page.total) {
			pullObject.endPullupToRefresh(true); //参数为true代表没有更多数据了。
			pullObject.refresh(true);
			plus.nativeUI.toast("所有数据已经加载");
			return;
		}
		console.log("--------->queryParams up: " + JSON.stringify(queryParams));
		appFutureImpl.getAlertByPage(queryParams, queryParams4Page, function(result, total, msg) {
			pullObject.endPullupToRefresh();
			plus.nativeUI.closeWaiting(); //关闭提示框
			if(null != msg) {
				plus.nativeUI.toast(msg);
				return;
			}
			queryParams4Page.start = queryParams4Page.start + queryParams4Page.length;
			queryParams4Page.statCount = false;
			if(total > 0) {
				queryParams4Page.total = total;
			}

			var ul = document.body.querySelector('.mui-table-view');
			alertInfoList.addArray(result);
			ul.appendChild(createWarningDetailList(result, ul));
		});
	}

})(mui);