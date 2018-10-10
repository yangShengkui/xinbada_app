(function($, doc) {
	$.init();
	var queryDomain = "";

	//告警的查询条件
//	var queryParams = {
//		"nodeIds": '',	
//		"severities": "1,2,3,4",
//		"states": "0,5,10,-100",
//		"appName": "",
//		"firstTimeFrom": "",
//		"firstTimeTo": ""
//	}

     //查询未结束工单
    var queryTicketParams = {
    	"categorys":"50,90,260",
    	"ticketStatus":100,
    	"validUserFlag":false
    }
	//分页条件
	var queryParams4Page = {
		"start": 0,
		"length": 10,
		"statCount": true
	};
	$.plusReady(function() {
		var self = plus.webview.currentWebview();
		var userInfo = storageUtil.getUserInfo();
		var domainsArr = userInfo.domains.split("/");
//		console.log("flllllas--->"+self.flas);
//		if(self.flas == 10||self.flas == 9||self.flas == 5||self.flas == 4||self.flas == 3||self.flas == 2){
//			queryDomain = userInfo.userDomainList[0].domainPath;
//		}else if(self.flas == 6||self.flas == 7||self.flas == 8||self.flas == 1){
//			queryDomain = self.parentId;
//		}
		queryDomain = self.parentId;
		
		console.log("ddddddddddddddomain--->"+JSON.stringify(queryDomain));
		var timerIns;
		//清除上次的数据
		window.addEventListener("clearData", function(event) {
			console.log("清理告警页面");
			doc.getElementById('deviceSearch').value = "";
//			var queryParams = {
//				"nodeIds": '',
//				"severities": "1,2,3,4",
//				"states": "0,5,10",
//				"appName": "",
//				"firstTimeFrom": "",
//				"firstTimeTo": ""
//			}
    var queryTicketParams = {
    	"categorys":"50,90,260",
    	"ticketStatus":100,
    	"validUserFlag":false
    }
			//分页条件
			var queryParams4Page = {
				"start": 0,
				"length": 10,
				"statCount": true
			};
			//清除计时器对象
			if(timerIns) {
				console.log("清理告警页面");
				window.clearInterval(timerIns);
				timerIns = null;
			}
		});

		var currentId = plus.webview.currentWebview().id;

		var fireAlertAndTicket = function() {
			//给列表传递参数，传递queryParams和queryParams2，warning-list.js 可以通过queryStates来区分用哪一个条件
			var wbvs = group.getAllWebviews();
			for(var j = 0, len = wbvs.length; j < len; j++) {

				$.fire(wbvs[j], 'getDomain', {
					queryDomain: queryDomain,
					//queryParams: queryParams
					queryTicketParams:queryTicketParams
				});
			}
		}

		doc.getElementById("deviceSearch").addEventListener("keydown", function(e) {
			if(13 === e.keyCode) { //点击了“搜索”  
				doc.activeElement.blur(); //隐藏软键盘 
				var queryDevicesParams = {};
				var name = doc.getElementById('deviceSearch').value;
				if(!name) { //没有设备名称的时候，不需要查询设备
					queryTicketParams .nodeIds = "";
					fireAlertAndTicket();
				} else {
					name = name.replace(/(^\s*)|(\s*$)/g, '');
					queryDevicesParams.orCondition = name;
					queryDevicesParams.conditionField = ["sn", "label"];
					appFutureImpl.getDevicesByCondition(queryDevicesParams, function(result, msg) {
						var nodeIds = [-1];
						for(var i in result) {
							nodeIds.push(result[i].id);
						}
						queryTicketParams .nodeIds = nodeIds.toString();
						fireAlertAndTicket();
					})
				}
			}
		}, false);

		//select选择框,暂时取消了
		$(".mui-table-view-cell").on('change', 'select', function() {
			if(this.id == "severities") {
				if(this.value) {
					queryTicketParams .severities = this.value
				} else {
					queryTicketParams .severities = "1,2,3,4"
				}
			} else if(this.id == "states") {
				if(this.value) {
					queryTicketParams .states = this.value
				} else {
					queryTicketParams .states = "0,5,10"
				}
			}

			//条件设置完后，更新数量
			fireAlertAndTicket()
		});

		var group = new webviewGroup(currentId, {
			styles: {
				top: "60px",
				bottom: "0px",
				render: "always"
			},
			items: [{
				id: "main-subpage-warning-list-jc.html",
				url: "main-subpage-warning-list-jc.html",
				extras: {
					//queryStates: 1 //查询的是待诊断工单
					queryStates: 100
				},
				initCallback: function() {
					//按需加载时，需要手动调用一下
					fireAlertAndTicket()
				}
			}],
			nativeConfig: {
				backgroundColor: '#f5f5f5'
			},
			onChange: function(obj) {
				var c = doc.querySelector(".mui-scroll #warning-category-head-active");
				if(c) {
					c.removeAttribute("id");
					c.classList.remove("mui-active");
				}
				doc.querySelector(".mui-scroll .mui-control-item:nth-child(" + (parseInt(obj.index) + 1) + ")").setAttribute('id', "warning-category-head-active");

				var progressBar = doc.querySelector("#sliderProgressBar");
				if(progressBar) {
					progressBar.style.webkitTransform = 'translate3d(' + (parseInt(obj.index) * (window.screen.width / 2)) + 'px, 0px, 0px)  translateZ(0)';
				}

				//切换页面时，重新加载
				var wbvs = group.getAllWebviews();
				for(var j = 0, len = wbvs.length; j < len; j++) {
					if(wbvs[j].__mui_index == obj.index) {
						$.fire(wbvs[j], 'getDomain', {
							queryDomain: queryDomain,
							queryTicketParams : queryTicketParams 
						});
					}
				}
			}
		});

		$(".mui-scroll").on("tap", ".mui-control-item", function(e) {
			var wid = this.getAttribute("data-wid");
			group.switchTab(wid);
		});
		var reloadViewInfohandler = function(event) {
			//获取告警条数,然后每隔一分钟执行一次检查
			fireAlertAndTicket()
		}
		window.addEventListener('reloadViewInfo', function(event) {
			reloadViewInfohandler(event);
		});

		window.addEventListener('WARNING_INFO_UPDATE', function(event) {
			var wbvs = group.getAllWebviews();
			for(var j = 0, len = wbvs.length; j < len; j++) {
				$.fire(wbvs[j], 'WARNING_INFO_UPDATE', event);
			}
		});

		//按需加载的情况下，需要第一次手动调用
		reloadViewInfohandler({})
	})

	//$.back = function() {
	//  var _self = plus.webview.currentWebview();
	//  _self.close("auto");
	//}

}(mui, document))