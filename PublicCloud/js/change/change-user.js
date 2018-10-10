/**
 * Created by zhang on 6/11/2018.
 */
(function($, doc) {

	$.plusReady(function() {
		//清除上次的数据
		window.addEventListener("reInit", function(event) {
			console.log('重新加载changeuser')
			init();
		});
		//点击重新加载
		window.addEventListener("userReload", function(event) {
			console.log('重新加载changeuser222')
			init()
		});
		init();

		function init() {
			var userInfo = storageUtil.getUserInfo();
			var innerMsg = doc.body.querySelector('.mui-input-group')
			var toMain = plus.webview.getWebviewById("main")
			var orgMsg = '';
			var dealCount;
			var roleID = userInfo.roleID.split(',');
			if(roleID.indexOf('127260997560018') != -1) { //点检员
				roleID.splice(roleID.indexOf('127260997560018'), 1);
			} else if(roleID.indexOf('543707294186286') != -1) { //备修管理员
				roleID.splice(roleID.indexOf('543707294186286'), 1);
			} else if(roleID.indexOf('103014882960039') != -1) { //辊道备修工程师-业务管理
				roleID.splice(roleID.indexOf('103014882960039'), 1);
			} else if(roleID.indexOf('168734772620195') != -1) { //辊道备修工程师-质控管理
				roleID.splice(roleID.indexOf('168734772620195'), 1);
			} else if(roleID.indexOf('168734772620196') != -1) { //卷筒工程师
				roleID.splice(roleID.indexOf('168734772620196'), 1);
			} else if(roleID.indexOf('80793465520022') != -1) { //精密检测工程师
				roleID.splice(roleID.indexOf('80793465520022'), 1);
			} else if(roleID.indexOf('290600561130356') != -1) { //统计分析员
				roleID.splice(roleID.indexOf('290600561130356'), 1);
			}
			appFutureImpl.getInfo(function(result, success, msg) {
				//				console.log('获取所有角色--->' + JSON.stringify(userInfo.roleID))
				//				console.log('获取所有角色2222--->' + JSON.stringify(roleID))
				for(var i = 0; i < roleID.length; i++) {
					//					console.log('------0000-------' + i)
					for(var j = 0; j < result.length; j++) {
						if(roleID[i] == result[j].roleID) {
							orgMsg += '<div class="mui-input-row mui-radio" user-type=' + result[j].roleID + '>' +
								'<label style="display:inline-block">' + result[j].roleName + '<span id="' + result[j].roleID + "_span" + '" class="mui-badge waiting-solve" style="margin-left:10px;background:red;color:#fff;">0</span>' + '</label>' +
								'<input id="' + result[j].roleID + '" class="skin-radio" name="radio1" type="radio">' +
								//								'<span class="mui-badge waiting-solve" style="background:red;color:#fff;position:absolute;top:10px;right:50px;">0</span>'+
								'</div>'
						}
					}
				}
				innerMsg.innerHTML = orgMsg;
				//				console.log('获取所有roleID--->' + JSON.stringify(userInfo.roleIDs))
				if(userInfo.roleIDs != undefined) {
					doc.getElementById(userInfo.roleIDs).checked = true;
				} else {
					innerMsg.children[0].children[1].checked = true;
				}
				//报警数量
				var m = 0;
				function getWaitSolveCount() {
					if(m >= roleID.length) return;
					var newId = roleID[m]
					//判断为哪个角色
					if(newId == "536448914236098" || newId == "191053004710019") { //报警|总包诊断
						//						console.log('------报警[m]-------' + m)
						if(newId == "536448914236098") {
							var queryParams = {
								"severities": "1,2,3,4",
								"states": "-100,0",
								"roleId": newId
							};
						} else if(newId == "191053004710019") {
							var queryParams = {
								"severities": "2,3,4",
								"states": "-100,0",
								"roleId": newId
							};
						}

						//告警的分页条件
						var queryParams4Page = {
							"start": 0,
							"length": 1,
							"statCount": true
						};
						appFutureImpl.getAlertByPage(queryParams, queryParams4Page, function(result, total, msg) {
							console.log('-------------' + JSON.stringify(queryParams))
							if(null != msg && !result) {
								plus.nativeUI.toast(msg);
								//								return;
							}
							//这个地方用total，表示这次查询的所有长度
							innerMsg.children[m].children[0].children[0].innerHTML = total;
							if(total != 0 && roleID.length > 1) {
								dealCount = total;
							}
							console.log('eeeeeee111----' + dealCount)
							mui.fire(toMain, 'DEAL_FLAG', {
								dealCount: dealCount,
							});
							m++;
							getWaitSolveCount()
						});
					} else if(newId == "76793136070002") { //产线工程师
						var queryParams1ByTemp = {
							"taskStatus": 10,
							"categorys": "260,120,100,130,110"
						}

						//分页条件
						var queryParams4Page = {
							"start": 0,
							"length": 1
							//  "statCount": true
						};
						appFutureImpl.getComplexHandleList2WithPage(queryParams1ByTemp, queryParams4Page, function(result, total, msg) {
							//							console.log('今日任务总数 2：' + JSON.stringify(total))
							if(null != msg && !result) {
								plus.nativeUI.toast(msg);
								return;
							}
							//这个地方用total，表示这次查询的所有长度
							innerMsg.children[m].children[0].children[0].innerHTML = total;
							if(total != 0 && roleID.length > 1) {
								dealCount = total;
							}
							console.log('eeeeeee222----' + dealCount)
							mui.fire(toMain, 'DEAL_FLAG', {
								dealCount: dealCount,
							});
							m++;
							getWaitSolveCount()
						});
					} else if(newId == "515445641576348" || newId == "515445641576374" || newId == "536448914236099" || newId == "536448914236101") { //诊断分析员|诊断审核员
						if(newId == "515445641576374") { //诊断审核
							var queryParams = {
								taskStatus: 10,
								categorys: "50",
								tickeTaskStatus: "auditing,closing"
							};
						} else if(newId == "515445641576348") { //诊断分析
							var queryParams = {
								taskStatus: 10,
								categorys: "50",
								tickeTaskStatus: "checking,explaining"
							};
						} else if(newId == "536448914236099") { //协同
							var queryParams = {
								"taskStatus": 10,
								"variables": {
									"theTicketType": "join"
								}
							}
						} else if(newId == "536448914236101") { //检修工程师
							var queryParams = {
								"taskStatus": 10,
								"categorys": "50,90,260,120,130,210",
								"tickeTaskStatus": "maintaining"
							}
						}

						//分页条件
						var queryParams4Page = {
							"start": 0,
							"length": 1
							//  "statCount": true
						};
						//获取待诊断
						appFutureImpl.getTicketTasksByConditionAndPage(queryParams, queryParams4Page, function(result, total, msg) {
							if(null != msg && !result) {
								plus.nativeUI.toast(msg);
								return;
							}
							//这个地方用total，表示这次查询的所有长度
							innerMsg.children[m].children[0].children[0].innerHTML = total;
							if(total != 0 && roleID.length > 1) {
								dealCount = total;
							}
							console.log('eeeeeee333----' + dealCount)
							mui.fire(toMain, 'DEAL_FLAG', {
								dealCount: dealCount,
							});
							m++;
							getWaitSolveCount()
						});
					} else {
						//						console.log('zzzzzzzz----')
						innerMsg.children[m].children[0].children[0].style.display = 'none';
						//						console.log('eeeeeee----' + dealCount)
						mui.fire(toMain, 'DEAL_FLAG', {
							dealCount: dealCount,
						});
						m++;
						getWaitSolveCount()
					}
				}
				getWaitSolveCount()
			})
		}

		$('.mui-input-group').on('tap', 'div', function() {
			var userInfo = storageUtil.getUserInfo();
			var type = this.getAttribute("user-type");
			var newMap = {};
			newMap[type] = userInfo.roleFunctionCodeMap[type];
			userInfo.roleFunctionCodeMaps = newMap;
			userInfo.roleIDs = type.toString();
			storageUtil.setUserInfo(userInfo);
			sendUserBroadcast(type, newMap);
		})

		function sendUserBroadcast(type, newMap) {
			var self = plus.webview.currentWebview();
			//获得所有的页面，发送清除事件
			self.addEventListener('show', function(event) {
				var wvs = plus.webview.all();
				for(var i = 0; i < wvs.length; i++) {
					$.fire(wvs[i], "clearData");
					$.fire(wvs[i], "clearDevice");
				}
			});
			//			self.close();
			var mainView = plus.webview.getWebviewById("main")
			mui.fire(mainView, 'codeUpdate', {
				type: type,
				newMap: newMap
			});
		}

	})
	$.back = function() {
		var formerPage = plus.webview.getWebviewById("main.html")
		$.fire(formerPage, 'formerEvent', {});
		var _self = plus.webview.currentWebview();
		_self.close("auto");
	}
}(mui, document))