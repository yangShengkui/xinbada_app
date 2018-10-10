/**
 * main.js是app的入口js文件
 * @param {Object} $
 * @param {Object} doc
 * @param {Object} window
 */
(function($, doc, window) {
	$.init();
	var mainMenu = null; //菜单对象
	var mainWebview = null; //当前页面
	var showMenu = false; //菜单状态
	var adminFlag = false; //管理员flag
	var orderCode;

	var subPageStyle = {
		top: '44px',
		bottom: '51px'
	};
	var subWebviews = new Array();
	var tabs = new Array();
	var tabTitles = new Array();

	var aniShow = {};

	var subPages = [
		'main-subpage-home.html',
		'main-subpage-home-normal.html',
		'main-subpage-custom.html',
		'main-subpage-device.html',
		'main-subpage-warning.html',
		'main-subpage-order.html'
	];
	var activeTab = ""; //默认不选择任何的面板
	// <a id="tab0" class="mui-tab-item mui-active" href="main-subpage-home.html">
	//控制href
	tabs[0] = doc.getElementById("tab0");
	tabs[1] = doc.getElementById("tab1");
	tabs[2] = doc.getElementById("tab2");
	tabs[3] = doc.getElementById("tab3");
	tabs[4] = doc.getElementById("tab4");

	tabTitles[0] = doc.getElementById("tab0-label"); //首页
	tabTitles[1] = doc.getElementById("tab1-label"); //客户
	tabTitles[2] = doc.getElementById("tab2-label"); //设备
	tabTitles[3] = doc.getElementById("tab3-label"); //告警
	tabTitles[4] = doc.getElementById("tab4-label"); //工单

	/**
	 * plus加载完毕后进行页面的预加载  预加载了所有子页面
	 */
	$.plusReady(function() {
		plus.navigator.setStatusBarBackground("#24BCE7");
		mainWebview = plus.webview.currentWebview(); //获取当前窗口
		/* 默认加载设备和消息，因为都会用*/
		for(var i = 1; i < 5; i++) {
			var temp = {};
			var subPage = plus.webview.create(subPages[subPages.length - i], subPages[subPages.length - i], subPageStyle); //创建新的窗口
			subWebviews[subPages[subPages.length - i]] = subPage;
			subPage.hide(); //所有页面隐藏不显示，因为不知道登陆的用户角色
			mainWebview.append(subPage);
		}

		//监听遮罩层点击，关闭菜单
		mainWebview.addEventListener('maskClick', closeMenu);
		/**
		 * 处理侧滑导航，为了避免和子页面初始化等竞争资源，延迟加载侧滑页面；
		 */
		setTimeout(function() {
			//第2行  var mainMenu = null  侧滑页面
			mainMenu = $.preload({
				id: 'main-menu',
				url: 'main-menu.html',
				styles: {
					left: 0,
					width: '70%',
					zindex: -1,
					popGesture: "none"
				},
				show: {
					aniShow: 'none'
				}
			});
		}, 300);

		var isInTransition = false;

		/**
		 * 显示侧滑菜单
		 */
		function openMenu() {
			if(isInTransition) {
				return;
			}
			if(!showMenu) {
				//侧滑菜单处于隐藏状态，则立即显示出来；
				isInTransition = true;
				mainMenu.setStyle({
					mask: 'rgba(0,0,0,0)'
				}); //menu设置透明遮罩防止点击
				mainMenu.show('none', 0, function() {
					//主窗体开始侧滑并显示遮罩
					mainWebview.setStyle({
						mask: 'rgba(0,0,0,0.4)',
						left: '70%',
						transition: {
							duration: 150
						}
					});
					$.later(function() {
						isInTransition = false;
						mainMenu.setStyle({
							mask: "none"
						}); //移除menu的mask
					}, 160);
					showMenu = true;
				});
			}
		};

		/**
		 * 关闭菜单
		 */
		function closeMenu() {
			if(isInTransition) {
				return;
			}
			if(showMenu) {
				//关闭遮罩；
				//主窗体开始侧滑；
				isInTransition = true;
				mainWebview.setStyle({
					mask: 'none',
					left: '0',
					transition: {
						duration: 200
					}
				});
				showMenu = false;
				//等动画结束后，隐藏菜单webview，节省资源；
				$.later(function() {
					isInTransition = false;
					mainMenu.hide();
				}, 300);
			}
		};

		//点击左上角侧滑图标，打开侧滑菜单；
		doc.querySelector('.mui-icon-bars').addEventListener('tap', function(e) {
			if(showMenu) {
				closeMenu();
			} else {
				openMenu();
			}
		});

		//敲击顶部导航，内容区回到顶部（没有效果） 
		doc.querySelector('header').addEventListener('doubletap', function() {
			console.log('doubletap触发了')
			mainWebview.children()[0].evalJS('mui.scrollTo(0, 100)');
		});

		//主界面向右滑动，若菜单未显示，则显示菜单；否则不做任何操作
		window.addEventListener("swiperight", openMenu);

		//主界面向左滑动，若菜单已显示，则关闭菜单；否则，不做任何操作；
		window.addEventListener("swipeleft", closeMenu);

		//侧滑菜单触发关闭菜单命令
		window.addEventListener("menu:close", closeMenu);

		window.addEventListener("menu:open", openMenu);

		/**
		 * 重写mui.menu方法，Android版本menu按键按下可自动打开、关闭侧滑菜单；
		 */
		$.menu = function() {
			if(showMenu) {
				closeMenu();
			} else {
				openMenu();
			}
		};

		//当前激活选项
		var pageTitle = doc.getElementById("page-id-title");
		var clearBtn = doc.getElementById("clearBtn");
		if(pageTitle.innerHTML == '首页') {
			clearBtn.style.display = 'none';
		}
		
		//点击发起工单
		var clearFlag = false;
		$('.mui-bar-nav').on('tap', '#clearBtn', function() {
			clearFlag = true;
			dispatherManager.toSendOrder();
		})
		//切换账号后，进去TAB-active显示首页
		window.addEventListener("clearData", function(event) {
			console.log('...........清空 ： ')
			var that = document.querySelector(".mui-active");
			that.classList.remove('mui-active');
			tabs[0].classList.add('mui-active');
			pageTitle.innerHTML = tabTitles[0].innerHTML;
			if(pageTitle.innerHTML == '首页') {
				clearBtn.style.display = 'none';
			}
			//切换登录后全部置为最初状态
			tabs[0].style.display = "table-cell";
			tabs[1].style.display = "table-cell";
			tabs[2].style.display = "table-cell";
			tabs[3].style.display = "table-cell";
			tabs[4].style.display = "table-cell";
			
		});

		/**
		 * 选项卡点击事件
		 */
		$('.mui-bar-tab').on('tap', 'a', function(e) {
			//console.log("获取" + JSON.stringify(orderCode))
			var targetTab = this.getAttribute('href');
			if(targetTab == activeTab) {
				return;
			}
			//更换标题
			pageTitle.innerHTML = this.querySelector('.mui-tab-label').innerHTML;
			if(pageTitle.innerHTML == '工单') {
				if(orderCode.indexOf('A07_S09') == -1) {
					clearBtn.style.display = 'none';
				}else {
					clearBtn.style.display = 'inline-block';
				}
			} else {
				clearBtn.style.display = 'none';
			}
			changeActiveTab(targetTab);
			var devideView = plus.webview.getWebviewById("main-subpage-device-list.html");
			var deviceSearch = plus.webview.getWebviewById("main-subpage-device.html");
			var deviceFlag = true;
			$.fire(devideView, 'clearDevice', deviceFlag);
			$.fire(deviceSearch, 'clearSearch', {});
		});

		/**
		 * event.detail.type == "openWindow"的相关处理
		 * 通过css样式的变化达到效果
		 *
		 */
		var openWindowParam; //openWindow类型传递的参数
		doc.querySelector('.mui-icon-left-nav').addEventListener('tap', function() {
			if(!openWindowParam) return;
			$.fire(mainWebview, 'TAB_SELECT', {
				selectPosition: adminFlag ? 2 : 1,
				type: "closeWindow"
			});
			var warmingView = plus.webview.getWebviewById("main-subpage-warning-list-new.html");
			$.fire(warmingView, 'clearData', {});
			var devideView = plus.webview.getWebviewById("main-subpage-device-list.html");
			$.fire(devideView, 'clearDevice', {});
			var clearOrder = plus.webview.getWebviewById("main-subpage-order-list-processed.html");
			$.fire(clearOrder, 'clearList', {});
		});

		doc.addEventListener('TAB_SELECT', function(event) {
			//显示目标选项卡
			//若为iOS平台或非首次显示，则直接显示
			var selectPosition = event.detail.selectPosition;
			var targetTab = subPages[selectPosition];
			var statehandler = function() {
				changeActiveTab(targetTab, event.detail.params);
				for(var index = 0; index < tabs.length; index++) {
					if(index == selectPosition - 1) {
						tabs[index].classList.add('mui-active')
					} else {
						tabs[index].classList.remove('mui-active');
					}
				}
				//更换标题
				pageTitle.innerHTML = tabTitles[selectPosition - 1].innerHTML;
			}
			if(event.detail.type == "openWindow") {
				openWindowParam = event.detail;
				plus.webview.getWebviewById(targetTab).setStyle({
					bottom: "0px"
				});
				$(".mui-icon-left-nav")[0].classList.remove('mui-hidden');
				$(".mui-icon-bars")[0].classList.add('mui-hidden');
				statehandler();
			} else if(event.detail.type == "closeWindow") {
				//事件发送3s后进行恢复处理
				setTimeout(function() {
					plus.webview.getWebviewById(activeTab).setStyle({
						bottom: "51px"
					});
					$(".mui-icon-left-nav")[0].classList.add('mui-hidden');
					$(".mui-icon-bars")[0].classList.remove('mui-hidden');
					statehandler();
				}, 300);
				plus.webview.show(openWindowParam.params.parentId, "slide-in-left", 300);
				openWindowParam = null;
			}
		});

		doc.addEventListener('SHOW_MAIN', function(event) {
			plus.navigator.setFullscreen(false);
			//设置状态栏颜色
			var colorValue = storageUtil.getSkinColor();
			if(null == colorValue) {
				colorValue = '#3C8DBC';
			}
			//设置状态栏颜色
			plus.navigator.setStatusBarBackground(colorValue);
			//获取当前账号的角色信息
			var userInfo = storageUtil.getUserInfo();
			var roleID = userInfo.roleID;
			var roleIDArr = roleID.split(",");
			//roleID = 100 为企业管理员    roleID = 2001 为维保人员 这是固定的  其余角色的roleID随机生成
			//    for(var i = 0; i < roleIDArr.length; i++) {
			//      if(roleIDArr[i] == "100") {
			//        adminFlag = true;
			//        doc.getElementById("tab1").style.display = "table-cell";
			//        doc.getElementById("tab0").href = subPages[0];
			//        changeActiveTab(subPages[0]);
			//        break
			//      } else {
			//        adminFlag = false;
			//        doc.getElementById("tab1").style.display = "none";
			//        doc.getElementById("tab0").href = subPages[0];
			//        changeActiveTab(subPages[0])
			//      }
			//    }

			//区分这个APP展示哪些tab栏
			//console.log('当前角色 ： ' + JSON.stringify(userInfo.functionCodeSet))
			Array.prototype.remove = function(val) {
				var index = this.indexOf(val);
				if(index > -1) {
					this.splice(index, 1);
				}
			};
			var userCode = userInfo.functionCodeSet;
			console.log("code" + JSON.stringify(userCode))
			var appCode = ["A01_F07", "A02_F07", "A03_F07", "A04_F07", "A05_F07", "A06_F07"];
			adminFlag = true;
			orderCode = userCode;
			if(userCode.indexOf('A01_F07') == -1) {
				appCode.remove("A01_F07")
				doc.getElementById("tab0").style.display = "none";
			}
			if(userCode.indexOf('A02_F07') == -1) {
				appCode.remove("A02_F07")
				doc.getElementById("tab1").style.display = "none";
			}
			if(userCode.indexOf('A03_F07') == -1) {
				appCode.remove("A03_F07")
				//doc.getElementById("tab2").style.display = "none";
			}
			if(userCode.indexOf('A04_F07') == -1) {
				appCode.remove("A04_F07")
				doc.getElementById("tab2").style.display = "none";
			}
			if(userCode.indexOf('A05_F07') == -1) {
				appCode.remove("A05_F07")
				doc.getElementById("tab3").style.display = "none";
			}
			if(userCode.indexOf('A06_F07') == -1) {
				appCode.remove("A06_F07")
				doc.getElementById("tab4").style.display = "none";
			}
			//为了保证没配置的正常显示
			if(userCode.indexOf('A01_F07') == -1 && userCode.indexOf('A02_F07') == -1 && userCode.indexOf('A03_F07') == -1 &&
			userCode.indexOf('A04_F07') == -1 && userCode.indexOf('A05_F07') == -1 && userCode.indexOf('A06_F07') == -1) {
				doc.getElementById("tab0").style.display = "table-cell";
				doc.getElementById("tab1").style.display = "table-cell";
				doc.getElementById("tab2").style.display = "table-cell";
				doc.getElementById("tab3").style.display = "table-cell";
				doc.getElementById("tab4").style.display = "table-cell";
				changeActiveTab(subPages[0]);
			}
			for(var i = 0; i < appCode.length; i++) {
				if(appCode[i] == "A01_F07") {
					pageTitle.innerHTML = "首页";
					doc.getElementById("tab0").style.display = "table-cell";
					document.getElementById("tab0").classList.remove("mui-active");
					document.getElementById("tab0").classList.add("class", "mui-active");
					changeActiveTab(subPages[0]);
					break
				}
				if(appCode[i] == "A02_F07") {
					pageTitle.innerHTML = "客户";
					document.getElementById("tab0").classList.remove("mui-active");
					document.getElementById("tab1").classList.add("class", "mui-active");
					changeActiveTab(subPages[2]);
					break
				}
				if(appCode[i] == "A03_F07") {
					pageTitle.innerHTML = "项目";
					//document.getElementById("tab1").classList.add("class","mui-active");
				}
				if(appCode[i] == "A04_F07") {
					pageTitle.innerHTML = "设备";
					document.getElementById("tab0").classList.remove("mui-active");
					document.getElementById("tab2").classList.add("class", "mui-active");
					changeActiveTab(subPages[3]);
					break
				}
				if(appCode[i] == "A05_F07") {
					pageTitle.innerHTML = "告警";
					document.getElementById("tab0").classList.remove("mui-active");
					document.getElementById("tab3").classList.add("class", "mui-active");
					changeActiveTab(subPages[4]);
					break
				}
				if(appCode[i] == "A06_F07") {
					pageTitle.innerHTML = "工单";
					document.getElementById("tab0").classList.remove("mui-active");
					document.getElementById("tab4").classList.add("class", "mui-active");
					changeActiveTab(subPages[5]);
					break
				}
			}

			//			if(userCode.indexOf('A01_F07') != -1) {
			//				//console.log("隐藏首页")
			//				//doc.getElementById("tab0").style.display = "none";
			//				doc.getElementById("tab0").href = subPages[0];
			//			    changeActiveTab(subPages[0]);
			//			}else {
			//				doc.getElementById("tab0").href = subPages[1];
			//			    changeActiveTab(subPages[1]);
			//			}
			//    区分管理员和普通用户登录的区别
			//  if (null == userInfo.subDomain) {
			//    adminFlag = true;
			//    //若是管理员的话，客户要显示的
			//    doc.getElementById("tab1").style.display = "table-cell";
			//    doc.getElementById("tab0").href = subPages[0];
			//    changeActiveTab(subPages[0]);
			//  } else {
			//    adminFlag = false;
			//    若是普通用户的话，客户一栏是不需要显示的
			//    doc.getElementById("tab1").style.display = "none";
			//    doc.getElementById("tab0").href = subPages[1];
			//    changeActiveTab(subPages[1])
			//  }
			
				
			
			
			
		
		});

		/**
		 * 切换TAB显示
		 * @param {Object} targetTab
		 * @param {Object} detail
		 */
		function changeActiveTab(targetTab, params) {
			console.log("页面啊" + JSON.stringify(targetTab))
			console.log("页面啊" + JSON.stringify(params))
			var _subWv = plus.webview.getWebviewById(targetTab);
			// 若webview不存在，则创建；
			if(!_subWv) {
				_subWv = plus.webview.create(targetTab, targetTab, subPageStyle); //创建新的窗口
				subWebviews[targetTab] = _subWv;
				mainWebview.append(_subWv);
			}
			//显示目标选项卡
			//若为iOS平台或非首次显示，直接显示
			if($.os.ios || aniShow[targetTab]) {
				plus.webview.show(targetTab);
				sendBroadCast(targetTab, 'reloadViewInfo', params);
			} else {
				var temp = {};
				temp[targetTab] = "true";
				$.extend(aniShow, temp);
				//底部点击时，使用fade-in动画，且保存变量
				if(!params)
					plus.webview.show(targetTab, "fade-in", 300);
				else
					plus.webview.show(targetTab);
				sendBroadCast(targetTab, 'reloadViewInfo', params);
			}

			if(activeTab != targetTab) {
				//隐藏当前;
				plus.webview.hide(activeTab);
				//更改当前活跃的选项卡
				activeTab = targetTab;
			}
		}

		/**
		 * 发送广播事件
		 */
		function sendBroadCast(targetView, eventType, params) {
			$.fire(subWebviews[targetView], eventType, params);
		}

		/**
		 * 初始化单位
		 */
		appFutureImpl.getAllUnits(function() {});

		/**
		 * 首页返回键处理
		 * 1、若侧滑菜单显示，则关闭侧滑菜单
		 * 2、否则，通知子窗口(list.html)显示toast提醒
		 */
		$.back = function() {
			//通知子窗口弹toast提醒
			/*var sub = plus.webview.getWebviewById(activeTab);
			 $.fire(sub, "back");*/
			var backButtonPress = 0;
			$.back = function(event) {
				backButtonPress++;
				if(backButtonPress > 1) {
					plus.runtime.quit();
				} else {
					plus.nativeUI.toast('再按一次退出应用');
				}
				setTimeout(function() {
					backButtonPress = 0;
				}, 1000);
				return false;
			};
		};
	});
}(mui, document, window));