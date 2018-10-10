/**
 * Created by zlzsam on 2017/4/10.
 */
(function($, doc) {

	$.init();

	$.plusReady(function() {
		var self = plus.webview.currentWebview();
		//锁定竖屏
		plus.screen.lockOrientation("portrait-primary");
		//预加载main页面
		var mainPage = $.preload({
			"id": 'main',
			"url": 'main.html'
		});
		//获取唯一标识CID
		var cid = plus.push.getClientInfo().clientid;

		console.log('cid------->' + cid);
		if(cid == JSON.stringify(null)) {
			plus.nativeUI.showWaiting();
			var t1 = window.setInterval(function() {
				var info = plus.push.getClientInfo();
				cid = info.clientid;
				var token = info.token;
				console.log(cid + token);
				if(cid != JSON.stringify(null) && token && cid) {
					plus.nativeUI.closeWaiting();
					console.log('cccccccccccccccccccid------->' + cid);
					window.clearInterval(t1);
				}
			}, 1000);
		}

		var main_loaded_flag = false;
		var storage = window.localStorage;
		var getuser = storage["login-id-username"];
		var getPwd = storage["login-id-password"];
		var autoLogin = function() {
			console.log("用户名" + getuser)
			if(getuser && getPwd) {
				//lacoste  已经保存 登陆信息 直接登陆
				doc.getElementById('login-id-username').value = getuser;
				doc.getElementById('login-id-password').value = getPwd;
				var username = doc.getElementById('login-id-username').value
				username = getuser;
				var password = doc.getElementById('login-id-password').value
				password = getPwd;
//				appFutureImpl.login(username, password, cid, function(userInfo, msg) {
//					plus.nativeUI.closeWaiting();
//					if(null !== msg) {
//						plus.nativeUI.toast(msg);
//						return;
//					}
//					dispatherManager.toMain();
//				})
			}
		}
		var checkVersion = function() {
			plus.runtime.getProperty(plus.runtime.appid, function(inf) {
				//检查更新APP版本
				// 获取本地应用资源版本号
				var wgtVer = inf.version;
				console.log("当前应用版本：" + wgtVer);
				appFutureImpl.getAppInfo(function(result, success, msg) {
					console.log('服务器版本号: ' + JSON.stringify(result.version.substring(1)))
					if(wgtVer != result.version.substring(1)) {
						var btnArray = ['否', '是'];
						$.confirm('检测到新版本，是否立即下载？', '温馨提示', btnArray, function(e) {
							if(e.index == 1) {
								var url = "https://demo.proudsmart.com" + result.url; // 下载文件地址
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
							} else {
								autoLogin();
							}
						})
					} else {
						autoLogin();
					}
				})
			});
		}
		mainPage.addEventListener("loaded", function() {
			main_loaded_flag = true;
			checkVersion()
		});
		doc.getElementById('login-id-commit').addEventListener('tap', function() {
			login();
		});

		function login() {
			var uNameValue = doc.getElementById('login-id-username').value;
			var uPwdValue = doc.getElementById('login-id-password').value;
			 var storage = window.localStorage;
      		storage["login-id-username"] = uNameValue;
      		storage["login-id-password"] = uPwdValue;
			console.log(JSON.stringify(cid))
			if(uNameValue.length === 0 || uPwdValue.length === 0) {
				plus.nativeUI.toast('用户名或密码不能为空！');
				return;
			}
			plus.nativeUI.showWaiting();
			appFutureImpl.login(uNameValue, uPwdValue, cid, function(userInfo, msg) {
				//appFutureImpl.login(uNameValue, uPwdValue, function(userInfo, msg) {
				plus.nativeUI.closeWaiting();
				if(null !== msg) {
					plus.nativeUI.toast(msg);
					return;
				}
				dispatherManager.toMain();
			})
		}

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
		doc.querySelector('#toggleShowPassword').addEventListener('tap', function() {
			var passwordInput = doc.querySelector('#login-id-password');
			if(passwordInput.type == 'password') {
				passwordInput.type = 'text';
				this.src = "../images/login/login_password_ic.png";
			} else {
				passwordInput.type = 'password';
				this.src = "../images/login/login_password_no.png";
			}
		});
		mui('#forgot-password').on('tap', 'a', function() {
			var urlStr = appFutureImpl.getHost() + '/app-uc/forgetPassword.html';
			toolUtil.toUrl(urlStr);
		});
		mui('#register-user').on('tap', 'a', function() {
			console.log('host---->' + JSON.stringify(appFutureImpl.getHost()))
			var urlStr = 'http://register.proudsmart.com/coms/app/index.html#/register';
			toolUtil.toUrl(urlStr);
		});

		//获得所有的页面，发送清除事件
		self.addEventListener('show', function(event) {
			var wvs = plus.webview.all();
			for(var i = 0; i < wvs.length; i++) {
				$.fire(wvs[i], "clearData");
				$.fire(wvs[i], "clearDevice");
			}
		});
	});
}(mui, document))