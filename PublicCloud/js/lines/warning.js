(function($, doc) {
	$.init();
	var queryDomain = "";

	//今日任务查询条件
	var queryParams1 = {
		severities: "1,2,3,4",
		states: "0",
		nodeIds: ""
	}
	var queryParams2 = {
		nodeIds: "",
		taskStatus: 10
	}
	//平台上[{"taskStatus":10,"categorys":"260,120,100,130,110"},{"start":0,"length":1,"statCount":true}]
	var queryParams1ByTemp = {
		"taskStatus": 10,
		"categorys":"260,120,100,130,110"
	}

	//分页条件
	var queryParams4Page = {
		"start": 0,
		"length": 10
		//  "statCount": true
	};

	//未结束查询条件
	var queryTicketParams = {
		"categorys": "90,130,120,210",
		"ticketStatus": 100,
		"dealingFlag": true,
		"validUserFlag": true
	};

//平台[{"categorys":"260,130,120,210","ticketStatus":100,"dealingFlag":true,"validUserFlag":true},{"start":0,"length":1,"statCount":true}]
	var queryTicketParamsByTemp = {
		"categorys": "260,130,120,210",
		"ticketStatus": 100,
		"dealingFlag": true,
		"validUserFlag": true
	}

	//获取诊断工程师的今日任务平台上{severities: "2,3,4", states: "-100，0"}
	var params1 = {
		"severities": "2,3,4",
		"states": "-100,0"
		//"states": "-100"
	}

	//	var params2 = {
	//		"start": 0,
	//		"length": 10,
	//		//"statCount": true
	//	}

	//获取诊断工程师的未结束任务平台上   {categorys: "260", ticketStatus: 100, validUserFlag: true, validNotFinish: false}
	var todayParams1 = {
		"categorys": "260",
		"ticketStatus": 100,
		"validUserFlag": true,
		"validNotFinish": false
	}
	var lineflag = ""
	//	var todayParams2 = {
	//		start: 0,
	//		length: 10,
	//		//statCount: true
	//	}

	$.plusReady(function() {
		var timerIns; //计时器对象

		//清除上次的数据
		window.addEventListener("clearData", function(event) {
			console.log("清理告警页面");
			//清除计时器对象
			if(timerIns) {
				window.clearInterval(timerIns);
				timerIns = null;
			}
			doc.getElementsByClassName('wait_solve')[0].innerHTML = 0;
			doc.getElementsByClassName('has_solve')[0].innerHTML = 0;
		});

		var currentId = plus.webview.currentWebview().id;
		

		/** 
		 * plusReady后，不直接进行数据的获得，因为这个时候还没有登录
		 * 这里获得的是当前条件下数量信息
		 */

		var userInfo = storageUtil.getUserInfo();

		if(!userInfo.roleFunctionCodeMaps) {
			console.log("首次加载" + JSON.stringify(userInfo.roleFunctionCodeMaps))
			var roleID = userInfo.roleID.split(',');
			params1.roleId = roleID[0].toString();
			userInfo.functionCodeSet = userInfo.roleFunctionCodeMap[roleID[0]]
		} else {
			console.log("切换时候" + JSON.stringify(userInfo.roleFunctionCodeMaps))
			var roleIDs = userInfo.roleIDs.split(',');
			var roleId = roleIDs[0];
			params1.roleId = roleId.toString();
			userInfo.functionCodeSet = userInfo.roleFunctionCodeMaps[roleIDs[0]]
		}
		//通过用户的不同角色权限，加载不同的页面
		for(var i = 0; i < userInfo.functionCodeSet.length; i++) {
			if(userInfo.functionCodeSet[i] == 'F07_08') { //产线
				lineflag = 1;
				break;
			} else if(userInfo.functionCodeSet[i] == 'F07_10') { //总包诊断工程师
				lineflag = 3;
				break;
			} else if(userInfo.functionCodeSet[i] == 'F07_11') { //总包模式产线工程师 
				lineflag = 5;
				break;
			}
		}
		window.addEventListener("dataUpdate", function(event) {
			console.log("flag标识" + JSON.stringify(event.detail.flag));
			lineflag = event.detail.flag;
			getAlertAndDealTicket();
			var lineListView = plus.webview.getWebviewById("main-subpage-lines-list-processing.html");
			$.fire(lineListView, 'getDomain', {
				queryDomain: queryDomain,
				queryParams1: queryParams1,
				queryParams2: queryParams2,
				queryTicketParams: queryTicketParams,
				params1: params1,
				todayParams1: todayParams1,
				queryParams1ByTemp: queryParams1ByTemp,
				queryTicketParamsByTemp: queryTicketParamsByTemp,
				queryStates: lineflag + 6
			});
			$.fire(lineListView, 'updateDataAgain', {
				queryStates: (lineflag + 6)
			});

		});
		console.log("笑嘻嘻" + lineflag)
		window.addEventListener('reloadNum', function(event) {
			params1.roleId = event.detail.toString();
			getAlertAndDealTicket()
		});
		var getAlertAndDealTicket = function() {
			if(lineflag == 1) {
				//获取今日任务条数
				appFutureImpl.getComplexHandleListWithCategorys(queryParams1, queryParams2, queryParams4Page, function(result, total, msg) {
					console.log('今日任务总数 ：' + JSON.stringify(total))
					if(null != msg && !result) {
						plus.nativeUI.toast(msg);
						return;
					}
					//这个地方用total，表示这次查询的所有长度
					doc.getElementsByClassName('wait_solve')[0].innerHTML = total;
				});

				//获取未结束任务条数
				appFutureImpl.getDealTicketListByPage(queryTicketParams, queryParams4Page, function(result, total, msg) {
					if(null != msg && !result) {
						plus.nativeUI.toast(msg);
						return;
					}
					console.log('未结束任务总数 ：' + JSON.stringify(total))
					doc.getElementsByClassName('has_solve')[0].innerHTML = total;
				})
			} else if(lineflag == 3) {
				//获取诊断工程师的今日任务
				appFutureImpl.getAlertByPage(params1, queryParams4Page, function(result, total, msg) {
//					console.log("诊断工程师1：" + JSON.stringify(params1))
					if(null != msg && !result) {
						plus.nativeUI.toast(msg);
						return;
					}
					doc.getElementsByClassName('wait_solve')[0].innerHTML = total;
				})
				//获取诊断工程师的未结束任务
				appFutureImpl.getDealTicketListByPage(todayParams1, queryParams4Page, function(result, total, msg) {
					if(null != msg && !result) {
						console.log("诊断工程师2" + JSON.stringify(result))
						plus.nativeUI.toast(msg);
						return;
					}
					doc.getElementsByClassName('has_solve')[0].innerHTML = total;
				})
			} else if(lineflag == 5) {
				//获取今日任务条数
				console.log("获取条数的参数" + JSON.stringify(queryParams1ByTemp))
				appFutureImpl.getComplexHandleList2WithPage(queryParams1ByTemp, queryParams4Page, function(result, total, msg) {
					console.log('今日任务总数 2：' + JSON.stringify(total))
					if(null != msg && !result) {
						plus.nativeUI.toast(msg);
						return;
					}
					//这个地方用total，表示这次查询的所有长度
					doc.getElementsByClassName('wait_solve')[0].innerHTML = total;
				});

				//获取未结束任务条数
				appFutureImpl.getDealTicketListByPage(queryTicketParamsByTemp, queryParams4Page, function(result, total, msg) {
					if(null != msg && !result) {
						plus.nativeUI.toast(msg);
						return;
					}
					console.log('未结束任务总数2 ：' + JSON.stringify(total))
					doc.getElementsByClassName('has_solve')[0].innerHTML = total;
				})
			}

		}

		var fireAlertAndTicket = function() {
			//给列表传递参数，传递queryParams和queryTicketParams，warning-list.js 可以通过queryStates来区分用哪一个条件
			var wbvs = group.getAllWebviews();
			for(var j = 0, len = wbvs.length; j < len; j++) {
				$.fire(wbvs[j], 'getDomain', {
					queryDomain: queryDomain,
					queryParams1: queryParams1,
					queryParams2: queryParams2,
					queryTicketParams: queryTicketParams,
					params1: params1,
					todayParams1: todayParams1,
					queryParams1ByTemp: queryParams1ByTemp,
					queryTicketParamsByTemp: queryTicketParamsByTemp
				});
			}
		}

		doc.getElementById("deviceSearch").addEventListener("keydown", function(e) {
			if(13 === e.keyCode) { //点击了“搜索”  
				doc.activeElement.blur(); //隐藏软键盘 
				var queryDevicesParams = {};
				var name = doc.getElementById('deviceSearch').value;
				if(!name) { //没有设备名称的时候，不需要查询设备
					queryParams1.nodeIds = "";
					queryParams2.nodeIds = "";
					queryTicketParams.nodeIds = "";
					queryTicketParams.nodeIds = "";
					params1.nodeIds = "";
					todayParams1.nodeIds = "";
					queryParams1ByTemp.nodeIds = "";
					queryTicketParamsByTemp.nodeIds = "";
					getAlertAndDealTicket();
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
						queryParams1.nodeIds = nodeIds.toString();
						queryParams2.nodeIds = nodeIds.toString();
						queryTicketParams.nodeIds = nodeIds.toString();
						params1.nodeIds = nodeIds.toString();
						todayParams1.nodeIds = nodeIds.toString();
						queryParams1ByTemp.nodeIds = nodeIds.toString();
						queryTicketParamsByTemp.nodeIds = nodeIds.toString();
						getAlertAndDealTicket();
						fireAlertAndTicket();
					})
				}
			}
		}, false);

		var group = new webviewGroup(currentId, {
			//设置这个style就可以控制子视图的位置了
			styles: {
				top: "145px",
				bottom: "0px",
				render: "always"
			},
			items: [{
				id: "main-subpage-lines-list-processing.html",
				url: "main-subpage-lines-list.html",
				extras: {
					//queryStates: 7 //查询的是今日任务
					queryStates: lineflag ? (lineflag + 6) : 7
				},
				initCallback: function() {
					//按需加载时，需要手动调用一下
					fireAlertAndTicket();
				}
			}, {
				id: "main-subpage-lines-list-processed.html",
				url: "main-subpage-lines-list.html",
				extras: {
					queryStates: lineflag ? (lineflag + 7) : 8 //查询的是未结束任务
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
							queryParams1: queryParams1,
							queryParams2: queryParams2,
							queryTicketParams: queryTicketParams,
							params1: params1,
							todayParams1: todayParams1,
							queryParams1ByTemp: queryParams1ByTemp,
							queryTicketParamsByTemp: queryTicketParamsByTemp
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
			getAlertAndDealTicket();
			if(!timerIns) {
				timerIns = setInterval(function() {
					getAlertAndDealTicket();
				}, 60000);
			}

			//查看是否有domains参数从reloadViewInfo中传递进来
			if(event.detail && event.detail.domains !== undefined) {
				queryDomain = event.detail;
			}

			fireAlertAndTicket()
		}

		window.addEventListener('reloadViewInfo', function(event) {
			reloadViewInfohandler(event)
		});

		window.addEventListener('newLoading', function(event) {
			//重新获取条数
			console.log('刷没刷啊!!!!!!!!!!!')
			getAlertAndDealTicket();
		});

		/**
		 * WARNING_INFO_UPDATE这个用在什么地方？2017-12-11
		 * 
		 */
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