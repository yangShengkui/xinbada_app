(function($) {
	$.init({
		pullRefresh: {
			container: "#pullrefresh",
			down: toolUtil.getDownRefreshConfig(pulldownRefresh, 50, "false"),
			up: toolUtil.getUpRefreshConfig(pullupRefresh)
		}
	});

	var alertInfoList = new ArrayList();

	//查询用的参数
	var queryParams = {
		"nodeIds": "",
		"severities": "1,2,3,4",
		"states": "0,5,10",
		"appName": "",
		"firstTimeFrom": "",
		"firstTimeTo": ""
	};

	//分页用的参数
	var queryParams4Page = {
		"start": 0,
		"length": 10,
		"sort": "createTime",
		"sortType": "desc",
		"statCount": true,
		"total": 0
	};

	var queryTicketParams = {
		validUserFlag: true
	};

	var detail = {};
	var newResult = [];
	var self;
	var plusFlag = false;
	var queryStates; //查询的方式
	$.plusReady(function() {
		self = plus.webview.currentWebview();
		//清除上次的数据
		window.addEventListener("clearData", function(event) {
			document.body.querySelector('.mui-table-view').innerHTML = "";
			alertInfoList.clear();
		});

		if(self.queryDomain !== undefined) {
			queryParams.domain = self.queryDomain;
		}

		/**
		 * 监听从warning上传递过来的参数
		 */
		window.addEventListener('getDomain', function(event) {
			if(detail == event.detail) return; //条件一样的时候不处理
			detail = event.detail;
			if(detail) {
				queryParams.nodeIds = detail.queryParams.nodeIds;
				if(detail.queryDomain) {
					if(queryParams.domain != detail.queryDomain) {
						queryParams.domain = detail.queryDomain;
					}
				} else {
					queryParams.domain = "";
				}
			}

			// 刷新
			//			    $("#pullrefresh").pullRefresh().pulldownLoading();
			plus.nativeUI.showWaiting(); //出现提示框
			pulldownRefresh();
		});

		/**
		 * WARNING_INFO_UPDATE这个用在什么地方？2017-12-11
		 * 
		 */
		window.addEventListener('WARNING_INFO_UPDATE', function(event) {
			$("#pullrefresh").pullRefresh().pulldownLoading();
		});

		//设置点击事件的监听
		$('.mui-table-view').on('tap', 'li', function() {
			console.log('...点击进去对应事件所有参数--->' + JSON.stringify(this.id));
			dispatherManager.toWarningDetail(getAlertInfo(this.id));
		});
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

		//表示告警查询，使用getAlertByPage
		//		if(queryParams.domain.domains) {
		//			queryParams.domain = queryParams.domain.domains
		//		}
		appFutureImpl.getAlertByPage(queryParams, queryParams4Page, function(result, total, msg) {
			if(pullObject) {
				pullObject.endPulldownToRefresh();
				pullObject.refresh(true);
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
		appFutureImpl.getAlertByPage(queryParams, queryParams4Page, function(result, total, msg) {
			pullObject.endPullupToRefresh(false);
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