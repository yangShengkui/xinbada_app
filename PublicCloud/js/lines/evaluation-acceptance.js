(function($, doc) {
	$.init({});
	mui('.mui-scroll-wrapper').scroll({
		deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	});
	var disFlag;
	$.plusReady(function() {
		var self = plus.webview.currentWebview();
		console.log("参数啊" + JSON.stringify(self.allInfo))
		var params = self.allInfo;
		var params2 = {}
		var evaHtml = "";
		var userInfo = storageUtil.getUserInfo();

		if(!userInfo.roleFunctionCodeMaps) {
			console.log("首次加载" + JSON.stringify(userInfo.roleFunctionCodeMaps))
			var roleID = userInfo.roleID.split(',');
			userInfo.functionCodeSet = userInfo.roleFunctionCodeMap[roleID[0]]
		} else {
			console.log("切换时候" + JSON.stringify(userInfo.roleFunctionCodeMaps))
			var roleIDs = userInfo.roleIDs.split(',');
			userInfo.functionCodeSet = userInfo.roleFunctionCodeMaps[roleIDs[0]]
		}
		console.log('userInfoDetail--->' + JSON.stringify(userInfo.functionCodeSet))
		//报警合并
		var alertItems = [];
		if(params.values ? params.values : "") {
			alertItems = params.values.alertItemList
		} else if(params.variables ? params.variables : "") {
			alertItems = params.variables.alertItemList
		}

		//产线工程师
		if(userInfo.functionCodeSet.indexOf('F07_08') != -1) {
			if(params.values.dealType == 3) {
				// 检修验收
				evaHtml = evaHtml + '<div>' +
					'<p class="mark">检修验收</p>' +
					'<p><label for="">验收结果：</label><input type="radio" name="checkPass"  value="1"  checked />通过<input type="radio" name="checkPass"  value="0" />不通过<br />' +
					'<input type="checkbox" id="time" checked/>是否按时完工<input type="checkbox" id="accord" checked/>是否符合质量标准</p>' +
					'<p><label for="">验收说明：</label>' +
					'<textarea name="" rows="" cols="" id="serviceText"></textarea></p>' +
					'</div>';

			}
			if(params.category == "90" || params.category == "260") {
				//状态判断评价
				evaHtml = evaHtml + '<div>' +
					'<p class="mark">状态判断评价</p>' +
					'<p><label for="">评价等级：</label><input type="radio" name="correct1" value="0" checked />正确<input type="radio" name="correct1" value="1" />基本正确<input type="radio" name="correct1" value="2" />不正确</p>' +
					'<p><label for="">评价说明：</label>' +
					'<textarea name="" rows="" cols="" id="synthesizeText"></textarea></p>' +
					'</div>'

			}
			if(params.values.appName == 3 && params.category == "90") {
				//大数据分析评价
				evaHtml = evaHtml + '<div>' +
					'<p class="mark">大数据分析评价</p>' +
					'<p><label for="">评价等级：</label><input type="radio" name="correct2" value="0" checked/>正确<input type="radio" name="correct2" value="1" />基本正确<input type="radio" name="correct2" value="2" />不正确</p>' +
					'<p><label for="">评价说明：</label>' +
					'<textarea name="" rows="" cols="" id="bigText"></textarea></p>' +
					'</div>'
			}
			if(params.values.appName == 2 && params.category == "90") {
				evaHtml = evaHtml + '<div>' +
					'<p class="mark">智能诊断评价</p>' +
					'<p><label for="">评价等级：</label><input type="radio" name="correct3" value="0" checked/>正确<input type="radio" name="correct3" value="1" />基本正确<input type="radio" name="correct3" value="2" />不正确</p>' +
					'<p><label for="">评价说明：</label>' +
					'<textarea name="" rows="" cols="" id="capacityText"></textarea></p>' +
					'</div>'
			}
			//异常处理评价必填
			evaHtml = evaHtml + '<div>' +
				'<p class="mark">异常处理评价</p>' +
				'<p><label for="">异常处理等级：</label><input type="radio" name="isUseful" value="0" checked />有效<input type="radio" name="isUseful" value="1" />无效</p>' +
				'<p><label for="">评价说明：</label>' +
				'<textarea name="" rows="" cols="" id="abnormalText"></textarea></p>' +
				'</div>' +
				'<button class="mui-btn mui-btn-primary" style="width:80%;margin-left:10%" id="submitData">提交</button>'
		} else if(userInfo.functionCodeSet.indexOf('F07_10') != -1) {
			//总包诊断工程师
			document.querySelector(".mui-title").innerText = "评价"
			var warmingHtml = ""

			for(var i = 0; i < alertItems.length; i++) {
				var severityBgColor;
				if(alertItems[i].severity == 4) {
					severityBgColor = "#e74e53";
				} else if(alertItems[i].severity == 3) {
					severityBgColor = "#ee6b1c";
				} else if(alertItems[i].severity == 2) {
					severityBgColor = "#efd709";
				} else if(alertItems[i].severity == -1) {
					severityBgColor = "#00bc79";
				} else {
					severityBgColor = "blue";
				}
				warmingHtml = '<div style="margin:0 20px">' +
					'<div class="mui-icon systemicon warning-exclam-mark" style="background-color:' + severityBgColor + '"></div>' +
					'<div class="warning-msg">' + alertItems[i].alertTitle + '</div>' +
					'<p style="overflow:hidden;"><span  class="mui-pull-right">' + moment(alertItems[i].arisingTime).format('MM-DD HH:mm:ss') + '</span></p>' +
					'</div>'
				if(alertItems[i].appName == 1) {
					evaHtml = evaHtml + '<div class="online">' +
						'<p class="mark">在线预警评价</p>' + warmingHtml +
						//						'<p><label for="">评价等级：</label><input type="radio" name="correct4" value="0" checked/>正确<input type="radio" name="correct4" value="1" />基本正确<input type="radio" name="correct4" value="2" />不正确</p>' +
						'<p><label for="">评价等级：</label><input type="radio" name="online' + i + '" value="0" checked/>正确<input type="radio" name="online' + i + '" value="1" />基本正确<input type="radio" name="online' + i + '" value="2" />不正确</p>' +
						'<p><label for="">评价说明：</label>' +
						'<textarea name="" rows="" cols="" id="onlie' + i + '"></textarea></p>' +
						'</div>'
				}
				if(alertItems[i].appName == 3) {
					//大数据
					evaHtml = evaHtml + '<div class="big">' +
						'<p class="mark">大数据分析评价</p>' + warmingHtml +
						//						'<p><label for="">评价等级：</label><input type="radio" name="correct2" value="0" checked/>正确<input type="radio" name="correct2" value="1" />基本正确<input type="radio" name="correct2" value="2" />不正确</p>' +
						'<p><label for="">评价等级：</label><input type="radio" name="big' + i + '" value="0" checked/>正确<input type="radio" name="big' + i + '" value="1" />基本正确<input type="radio" name="big' + i + '" value="2" />不正确</p>' +
						'<p><label for="">评价说明：</label>' +
						'<textarea name="" rows="" cols="" id="big' + i + '"></textarea></p>' +
						'</div>'
				}
				if(alertItems[i].appName == 2) {
					evaHtml = evaHtml + '<div class="capacity">' + warmingHtml +
						'<p class="mark">智能诊断评价</p>' +
						//						'<p><label for="">评价等级：</label><input type="radio" name="correct3" value="0" checked/>正确<input type="radio" name="correct3" value="1" />基本正确<input type="radio" name="correct3" value="2" />不正确</p>' +
						'<p><label for="">评价等级：</label><input type="radio" name="capacity' + i + '" value="0" checked/>正确<input type="radio" name="capacity' + i + '" value="1" />基本正确<input type="radio" name="capacity' + i + '" value="2" />不正确</p>' +
						'<p><label for="">评价说明：</label>' +
						'<textarea name="" rows="" cols="" id="capacity' + i + '"></textarea></p>' +
						'</div>'
				}
			}

			evaHtml = evaHtml + '<button class="mui-btn mui-btn-primary" style="width:80%;margin-left:10%" id="submitData">提交</button>'

		} else if(userInfo.functionCodeSet.indexOf('F07_11') != -1) {
			if(params.values.dealType == 3) {
				// 检修验收
				evaHtml = evaHtml + '<div>' +
					'<p class="mark">检修验收</p>' +
					'<p><label for="">验收结果：</label><input type="radio" name="checkPass"  value="1"  checked />通过<input type="radio" name="checkPass"  value="0" />不通过<br />' +
					'<input type="checkbox" id="time" checked/>是否按时完工<input type="checkbox" id="accord" checked/>是否符合质量标准</p>' +
					'<p><label for="">验收说明：</label>' +
					'<textarea name="" rows="" cols="" id="serviceText"></textarea></p>' +
					'</div>';

			}
			if(params.category == "90" || params.category == "260") {
				//状态判断评价
				evaHtml = evaHtml + '<div>' +
					'<p class="mark">状态判断评价</p>' +
					'<p><label for="">评价等级：</label><input type="radio" name="correct1" value="0" checked />正确<input type="radio" name="correct1" value="1" />基本正确<input type="radio" name="correct1" value="2" />不正确</p>' +
					'<p><label for="">评价说明：</label>' +
					'<textarea name="" rows="" cols="" id="synthesizeText"></textarea></p>' +
					'</div>'

			}
			//异常处理评价必填
			evaHtml = evaHtml + '<div>' +
				'<p class="mark">异常处理评价</p>' +
				'<p><label for="">异常处理等级：</label><input type="radio" name="isUseful" value="0" checked />有效<input type="radio" name="isUseful" value="1" />无效</p>' +
				'<p><label for="">评价说明：</label>' +
				'<textarea name="" rows="" cols="" id="abnormalText"></textarea></p>' +
				'</div>' +
				'<button class="mui-btn mui-btn-primary" style="width:80%;margin-left:10%" id="submitData">提交</button>'
		}

		createDom();

		function createDom() {
			var table = document.body.querySelector('.mui-table-view');
			table.innerHTML = evaHtml;
		}

		doc.querySelector('#submitData').addEventListener('tap', function() {
			if(userInfo.functionCodeSet.indexOf('F07_08') != -1) {
				//进行评价信息提交
				if(params.values.dealType == 3) {
					var checkData = doc.getElementsByName('checkPass');
					for(var i = 0; i < checkData.length; i++) {
						if(checkData[i].checked == true) {
							params2.tallyCheck = checkData[i].value;
						}

					}
					params2.isAccord = doc.getElementById("time").checked ? '1' : '0';
					params2.isQuality = doc.getElementById("accord").checked ? '1' : '0';
					params2.tallyRemark = doc.getElementById("serviceText").value;
					if((params2.tallyRemark == "" || params2.tallyRemark == undefined) && params2.tallyCheck == 0) {
						plus.nativeUI.toast("请填写检修验收说明");
						return false;
					}

				}
				if(params.category == "90" || params.category == "260") {
					//状态判断报告
					var correct1 = doc.getElementsByName('correct1');
					for(var i = 0; i < correct1.length; i++) {
						if(correct1[i].checked == true) {
							params2.tallyEvaluateCheckboxlist = correct1[i].value;
						}

					}
					params2.tallyEvaluateDealExplain = doc.getElementById("synthesizeText").value;
					if((params2.tallyEvaluateDealExplain == "" || params2.tallyEvaluateDealExplain == undefined) && params2.tallyEvaluateCheckboxlist == 2) {
						plus.nativeUI.toast("请填写状态判断评价说明");
						return false;
					}
				}
				if(params.values.appName == 3 && params.category == "90") {
					//大数据
					var correct2 = doc.getElementsByName('correct2');
					for(var i = 0; i < correct2.length; i++) {
						if(correct2[i].checked == true) {
							params2.dataTallyEvaluateCheckboxlist = correct2[i].value;
						}

					}
					params2.dataTallyEvaluateDealExplain = doc.getElementById("bigText").value;

					if((params2.dataTallyEvaluateDealExplain == "" || params2.dataTallyEvaluateDealExplain == undefined) && params2.dataTallyEvaluateCheckboxlist == 2) {
						plus.nativeUI.toast("请填写大数据分析评价说明");
						return false;
					}
				}

				if(params.values.appName == 2 && params.category == "90") {
					//智能诊断  capacityText
					var correct3 = doc.getElementsByName('correct3');
					for(var i = 0; i < correct3.length; i++) {
						if(correct3[i].checked == true) {
							params2.intelligentTallyEvaluateCheckboxlist = correct3[i].value;
						}

					}
					params2.intelligentEvaluateDealExplain = doc.getElementById("capacityText").value;
					if((params2.intelligentEvaluateDealExplain == "" || params2.intelligentEvaluateDealExplain == undefined) && params2.intelligentTallyEvaluateCheckboxlist == 2) {
						plus.nativeUI.toast("请填写智能诊断评价说明");
						return false;
					}
				}

				//异常评价 
				var isUseful = doc.getElementsByName('isUseful');
				for(var i = 0; i < isUseful.length; i++) {
					if(isUseful[i].checked == true) {
						params2.abnormalEvaluateCheckboxlist = isUseful[i].value;
					}

				}
				params2.abnormalEvaluateDealExplain = doc.getElementById("abnormalText").value;
				if((params2.abnormalEvaluateDealExplain == "" || params2.abnormalEvaluateDealExplain == undefined) && params2.abnormalEvaluateCheckboxlist == 1) {
					plus.nativeUI.toast("请填写异常处理评价说明");
					return false;
				}
			} else if(userInfo.functionCodeSet.indexOf('F07_10') != -1) {
				//进行循环
				for(var i = 0; i < alertItems.length; i++) {
					//if(alertItems[i].appName == 1 && params.category == "260") {
					if(alertItems[i].appName == 1) {
						var onlines = document.getElementsByClassName("online")
						for(var i = 0; i < onlines.length; i++) {
							var childArr = onlines[i].children;
							for(var j = 0; j < childArr.length; j++) {
								if(childArr[j].tagName == "P") {
									if(childArr[j].children.length > 3) {
										for(var a = 1; a < childArr[j].children.length; a++) {
											if(childArr[j].children[a].checked == true) {
												//input的值
												console.log("消息" + JSON.stringify(childArr[j].children[a].value))
												alertItems[i].evaluateCheckboxlist = childArr[j].children[a].value
											}
										}
									} else if(childArr[j].children.length == 2) {
										//评价的值
										console.log("xiaoxi" + childArr[j].children[1].value)
										alertItems[i].evaluateDealExplain = childArr[j].children[1].value
										if(alertItems[i].evaluateDealExplain == "" || alertItems[i].evaluateDealExplain == undefined || alertItems[i].evaluateDealExplain == null) {
											plus.nativeUI.toast("请填写" + alertItems[i].alertTitle + "在线预警评价评价说明");
											return false;
										}

									}
								}
							}

						}
					}
					if(alertItems[i].appName == 3) {
						var bigs = document.getElementsByClassName("big")
						for(var i = 0; i < bigs.length; i++) {
							var bigsArr = bigs[i].children;
							for(var j = 0; j < bigsArr.length; j++) {
								if(bigsArr[j].tagName == "P") {
									if(bigsArr[j].children.length > 3) {
										for(var a = 1; a < bigsArr[j].children.length; a++) {
											if(bigsArr[j].children[a].checked == true) {
												//input的值
												console.log("消息" + JSON.stringify(bigsArr[j].children[a].value))
												alertItems[i].evaluateCheckboxlist = bigsArr[j].children[a].value
											}
										}
									} else if(bigsArr[j].children.length == 2) {
										//评价的值
										console.log("xiaoxi" + bigsArr[j].children[1].value)
										alertItems[i].evaluateDealExplain = bigsArr[j].children[1].value
										if(alertItems[i].evaluateDealExplain == "" || alertItems[i].evaluateDealExplain == undefined || alertItems[i].evaluateDealExplain == null) {
											plus.nativeUI.toast("请填写" + alertItems[i].alertTitle + "大数据分析评价说明");
											return false;
										}
									}
								}
							}

						}

					}
					if(alertItems[i].appName == 2) {
						var capacitys = document.getElementsByClassName("capacity")
						for(var i = 0; i < capacitys.length; i++) {
							var capacitysArr = capacitys[i].children;
							for(var j = 0; j < capacitysArr.length; j++) {
								if(capacitysArr[j].tagName == "P") {
									if(capacitysArr[j].children.length > 3) {
										for(var a = 1; a < capacitysArr[j].children.length; a++) {
											if(capacitysArr[j].children[a].checked == true) {
												//input的值
												console.log("消息" + JSON.stringify(capacitysArr[j].children[a].value))
												alertItems[i].evaluateCheckboxlist = capacitysArr[j].children[a].value
											}
										}
									} else if(capacitysArr[j].children.length == 2) {
										//评价的值
										console.log("xiaoxi" + capacitysArr[j].children[1].value)
										alertItems[i].evaluateDealExplain = capacitysArr[j].children[1].value
										if(alertItems[i].evaluateDealExplain == "" || alertItems[i].evaluateDealExplain == undefined || alertItems[i].evaluateDealExplain == null) {
											plus.nativeUI.toast("请填写" + alertItems[i].alertTitle + "智能诊断评价说明");
											return false;
										}
									}
								}
							}

						}

					}

				}

				//				if(params.values.appName == 1 && params.category == "260") {
				//					//在线预警评价评价
				//					var correct4 = doc.getElementsByName('correct4');
				//					for(var i = 0; i < correct4.length; i++) {
				//						if(correct4[i].checked == true) {
				//							params2.onlineTallyEvaluateCheckboxlist = correct4[i].value;
				//						}
				//
				//					}
				//					params2.onlineTallyEvaluateDealExplain = doc.getElementById("onlineText").value;
				//
				//					if((params2.onlineTallyEvaluateDealExplain == "" || params2.onlineTallyEvaluateDealExplain == undefined) && params2.onlineTallyEvaluateCheckboxlist == 2) {
				//						plus.nativeUI.toast("请填写在线预警评价评价说明");
				//						return false;
				//					}
				//				}
				//				if(params.values.appName == 3 && params.category == "260") {
				//					//大数据
				//					var correct2 = doc.getElementsByName('correct2');
				//					for(var i = 0; i < correct2.length; i++) {
				//						if(correct2[i].checked == true) {
				//							params2.dataTallyEvaluateCheckboxlist = correct2[i].value;
				//						}
				//
				//					}
				//					params2.dataTallyEvaluateDealExplain = doc.getElementById("bigText").value;
				//
				//					if((params2.dataTallyEvaluateDealExplain == "" || params2.dataTallyEvaluateDealExplain == undefined) && params2.dataTallyEvaluateCheckboxlist == 2) {
				//						plus.nativeUI.toast("请填写大数据分析评价说明");
				//						return false;
				//					}
				//				}

				//				if(params.values.appName == 2 && params.category == "260") {
				//					//智能诊断  capacityText
				//					var correct3 = doc.getElementsByName('correct3');
				//					for(var i = 0; i < correct3.length; i++) {
				//						if(correct3[i].checked == true) {
				//							params2.intelligentTallyEvaluateCheckboxlist = correct3[i].value;
				//						}
				//
				//					}
				//					params2.intelligentEvaluateDealExplain = doc.getElementById("capacityText").value;
				//					if((params2.intelligentEvaluateDealExplain == "" || params2.intelligentEvaluateDealExplain == undefined) && params2.intelligentTallyEvaluateCheckboxlist == 2) {
				//						plus.nativeUI.toast("请填写智能诊断评价说明");
				//						return false;
				//					}
				//				}
			} else if(userInfo.functionCodeSet.indexOf('F07_11') != -1) {
				//进行评价信息提交
				if(params.values.dealType == 3) {
					var checkData = doc.getElementsByName('checkPass');
					for(var i = 0; i < checkData.length; i++) {
						if(checkData[i].checked == true) {
							params2.tallyCheck = checkData[i].value;
						}

					}
					params2.isAccord = doc.getElementById("time").checked ? '1' : '0';
					params2.isQuality = doc.getElementById("accord").checked ? '1' : '0';
					params2.tallyRemark = doc.getElementById("serviceText").value;
					if((params2.tallyRemark == "" || params2.tallyRemark == undefined) && params2.tallyCheck == 0) {
						plus.nativeUI.toast("请填写检修验收说明");
						return false;
					}

				}
				if(params.category == "90" || params.category == "260") {
					//状态判断报告
					var correct1 = doc.getElementsByName('correct1');
					for(var i = 0; i < correct1.length; i++) {
						if(correct1[i].checked == true) {
							params2.tallyEvaluateCheckboxlist = correct1[i].value;
						}

					}
					params2.tallyEvaluateDealExplain = doc.getElementById("synthesizeText").value;
					if((params2.tallyEvaluateDealExplain == "" || params2.tallyEvaluateDealExplain == undefined) && params2.tallyEvaluateCheckboxlist == 2) {
						plus.nativeUI.toast("请填写状态判断评价说明");
						return false;
					}
				}
				//异常评价 
				var isUseful = doc.getElementsByName('isUseful');
				for(var i = 0; i < isUseful.length; i++) {
					if(isUseful[i].checked == true) {
						params2.abnormalEvaluateCheckboxlist = isUseful[i].value;
					}

				}
				params2.abnormalEvaluateDealExplain = doc.getElementById("abnormalText").value;
				if((params2.abnormalEvaluateDealExplain == "" || params2.abnormalEvaluateDealExplain == undefined) && params2.abnormalEvaluateCheckboxlist == 1) {
					plus.nativeUI.toast("请填写异常处理评价说明");
					return false;
				}
			}

			var params1 = params.ticketNo.toString();

			plus.nativeUI.showWaiting("正在提交...");
			if(userInfo.functionCodeSet.indexOf('F07_10') != -1) {
				params2 = {
					"alertEvaluateInfoList": alertItems
				}
			}
			console.log("参数啊" + params1 + JSON.stringify(params2))
			appFutureImpl.postEvaluction(params1, params2, function(result, success, msg) {
				console.log('评价是否成功？' + JSON.stringify(result))
				if(null != msg) {
					plus.nativeUI.toast(msg);
					return;
				}
				if(result.code == 0) {
					plus.nativeUI.closeWaiting();
					disFlag = true;
					plus.nativeUI.toast("评价成功");
					doc.querySelector('#submitData').disabled = true;
					//plus.webview.currentWebview().close();

					setTimeout(function() {
						plus.webview.currentWebview().close();
						// 获取目标口窗口对象
						var target = plus.webview.getWebviewById('main-subpage-warning-detail.html');
						//console.log("获取页面啊" + JSON.stringify(parentview))
						var targetview = plus.webview.getWebviewById("main-subpage-lines.html");
						//console.log("获取页面啊" + JSON.stringify(targetview))
						mui.fire(targetview, "newLoading", {})

						// 执行相应的事件
						mui.fire(target, 'disFlag', disFlag);
					}, 2000)
				}
			});
		})
	})
	var old_back = mui.back;
	mui.back = function() {
		// 获取目标口窗口对象
		var target = plus.webview.getWebviewById('main-subpage-warning-detail.html');
		// 执行相应的事件
		mui.fire(target, 'disFlag', disFlag);
		// 执行关闭
		old_back();
	};
}(mui, document))