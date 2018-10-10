(function($, doc) {
	var aniShow = "slide-in-right";
	//关于backbutton和menubutton两个按键的说明，在iOS平台不存在，故需隐藏
	if(!$.os.android) {
		var span = document.getElementById("android-only")
		if(span) {
			span.style.display = "none";
		}
		aniShow = "pop-in";
	}
	var subWebview = null,
		template = null,
		index = null;
	var messageCountView = doc.getElementById('least-message-count');
	//获得最新消息只有登录后才有用
	var getLeastMessage4Menu = function() {
		appFutureImpl.getLeastMessage(function(result, msg) {
			if(null != msg) {
				plus.nativeUI.toast(msg);
				return;
			}
			console.log("---------->result:" + JSON.stringify(result));
			if(null != result && result.length > 0) {
				messageCountView.style.visibility = "visible";

				var newData = [];
				for(var index = 0, len = result.length; index < len; index++) {
					if(result[index].sender != "command_message") {
						newData.push(result[index]);
					}
				}
				messageCountView.innerHTML = newData.length;
			} else {
				messageCountView.style.visibility = "hidden";
			}
		})
	}

	$.plusReady(function() {
		//获得主页面webview引用；
		index = plus.webview.currentWebview().opener();
		plus.runtime.getProperty(plus.runtime.appid, function(inf) {
			var ver = doc.getElementsByClassName('update');
			doc.getElementsByClassName('update')[0].innerHTML = 'V'+inf.version;
			console.log('版本号显示---' + JSON.stringify(ver))
		});
		plus.webview.currentWebview().addEventListener("show", function(e) {
			var userInfo = storageUtil.getUserInfo();
			//获得状态
			var staff = document.getElementById("head-staff");
			var account = document.getElementById("head-account");
			account.innerText = userInfo.loginName;
			staff.innerText = userInfo.userName;
		}, false);

//		appFutureImpl.getLeastMessage(function(result, msg) {
//			if(null != msg) {
//				plus.nativeUI.toast(msg);
//				return;
//			}
//			if(null != result && result.length > 0) {
//				messageCountView.style.visibility = "visible";
//
//				var newData = [];
//				for(var index = 0, len = result.length; index < len; index++) {
//					//if(result[index].sender != "command_message"){
//					newData.push(result[index]);
//					//}
//				}
//				//messageCountView.innerHTML = result.length;
//				messageCountView.innerHTML = newData.length;
//			} else {
//				messageCountView.style.visibility = "hidden";
//			}
//		})

		$('.mui-table-view').on('tap', 'a', function() {
			var id = this.getAttribute("href");
			var type = this.getAttribute("open-type");
			var href = this.href;
			if(type == "common") {
				var webview_style = {
					popGesture: "close"
				};
				$.openWindow({
					id: id,
					url: href,
					styles: webview_style,
					show: {
						aniShow: aniShow
					},
					waiting: {
						autoShow: false
					}
				});
			} else if(type == "about") {
				toolUtil.toUrl(id);
			} else if(type == "checknew") {
				close();
				if($.os.ios) {
					plus.webview.currentWebview().opener().hide();
					plus.webview.getLaunchWebview().show();
					return;
				}
				var btnArray = [{
					title: "更新到最新版本"
				}];
				plus.nativeUI.actionSheet({
					cancel: "取消",
					buttons: btnArray
				}, function(event) {
					var index = event.index;
					switch(index) {
						case 1:
							var wgtVer = null;
							// 获取本地应用资源版本号
							plus.runtime.getProperty(plus.runtime.appid, function(inf) {
								wgtVer = inf.version;
								console.log("当前应用版本：" + wgtVer);
							});

							appFutureImpl.getAppInfo(function(result) {
								if(!result) {
									plus.nativeUI.toast("获取失败");
									return;
								}
								var url = "https://demo.proudsmart.com" + result.url;
								var version = result.version;
								if(result.version.substr(1) == wgtVer) {
									plus.nativeUI.toast("当前为最新版本");
								} else {

									mui.confirm('最新version是：' + version + ',是否更新', '发现最新版本', function(z) {

										if(z.index == 1) {
											plus.nativeUI.showWaiting("正在加载最新版本，此次更新可能会需要几分钟...");
											var dtask = plus.downloader.createDownload(url, {}, function(d, status) {
												if(status == 200) { // 下载成功
													var path = d.filename;
													if(path) {
														plus.nativeUI.closeWaiting();
														plus.runtime.install(path); // 安装下载的apk文件
													}
												} else { //下载失败
													alert("下载失败！");
												}
											});
											dtask.start();

										}

									})
								}
							})
							break;
					}
				});

			}else {
				if(type == "loginout") {
					close();
					if($.os.ios) {
						plus.webview.currentWebview().opener().hide();
						plus.webview.getLaunchWebview().show();
						return;
					}
					var btnArray = [{
						title: "注销当前账号"
					}, {
						title: "直接关闭应用"
					}];
					plus.nativeUI.actionSheet({
						cancel: "取消",
						buttons: btnArray
					}, function(event) {
						var index = event.index;
						switch(index) {
							case 1:
								//注销时候清除cid
								appFutureImpl.loginout(function(result) {
									if(!result) {
										plus.nativeUI.toast(msg);
										return;
									}
									//console.log("可以吗" + result)
								})
								//若启动页不是登录页，则需通过如下方式打开登录页
								plus.webview.currentWebview().opener().hide();
								plus.webview.getLaunchWebview().show();
								break;
							case 2:
								plus.runtime.quit();
								break;
						}
					});
				} else {
					close();
				}
			}
		});

		/**
		 * 关闭侧滑菜单
		 */
		function close() {
			$.fire($.currentWebview.opener(), "menu:close");
		}
		//消息数量
		window.addEventListener("SHOW_MESSAGE", function(event) {
			appFutureImpl.getLeastMessage(function(result, msg) {
				console.log("获取到数据啦" + JSON.stringify(result.length))
				if(null != msg) {
					plus.nativeUI.toast(msg);
					return;
				}
				if(null != result && result.length > 0) {
					messageCountView.style.visibility = "visible";

					var newData = [];
					for(var index = 0, len = result.length; index < len; index++) {
						//if(result[index].sender != "command_message"){
						newData.push(result[index]);
						//}
					}
					//messageCountView.innerHTML = result.length;
					messageCountView.innerHTML = newData.length;
				} else {
					messageCountView.style.visibility = "hidden";
				}
			})

		});

		//在android4.4.2中的swipe事件，需要preventDefault一下，否则触发不正常
		window.addEventListener('dragstart', function(e) {
			$.gestures.touch.lockDirection = true; //锁定方向
			$.gestures.touch.startDirection = e.detail.direction;
		});
		window.addEventListener('dragleft', function(e) {
			if(!$.isScrolling) {
				e.detail.gesture.preventDefault();
			}
		});
		//监听左滑事件，若菜单已展开，左滑要关闭菜单；
		window.addEventListener("swipeleft", function(e) {
			if(Math.abs(e.detail.angle) > 170) {
				close();
			}
		});
	})
}(mui, document));