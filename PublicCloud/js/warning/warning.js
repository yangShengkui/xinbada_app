(function($, doc) {
	$.init();

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
		});
		var currentId = plus.webview.currentWebview().id;
		var group = new webviewGroup(currentId, {
			items: [{
				id: "main-subpage-warning-list-new.html",
				url: "main-subpage-warning-list.html",
				extras: {
					queryStates: "0",
				}
			}, {
				id: "main-subpage-warning-list-processing.html",
				url: "main-subpage-warning-list.html",
				extras: {
					queryStates: "5,10",
				}
			}, {
				id: "main-subpage-warning-list-processed.html",
				url: "main-subpage-warning-list.html",
				extras: {
					queryStates: "20",
				}
			}, {
				id: "main-subpage-warning-list-all.html",
				url: "main-subpage-warning-list.html",
				extras: {
					queryStates: "0,5,10,20",
				}
			}],
			nativeConfig: {
				top: (44 + 83) + 'px',
				height: (window.screen.height - 44 - 83 - 70) + "px",
				backgroundColor: '#f5f5f5'
			},
			onChange: function(obj) {
				var c = document.querySelector(".mui-scroll #warning-category-head-active");
				if(c) {
					c.removeAttribute("id");
					c.classList.remove("mui-active");
				}
				document.querySelector(".mui-scroll .mui-control-item:nth-child(" + (parseInt(obj.index) + 1) + ")").setAttribute('id', "warning-category-head-active");

				var progressBar = document.querySelector("#sliderProgressBar");
				if(progressBar) {
					progressBar.style.webkitTransform = 'translate3d(' + (parseInt(obj.index) * (window.screen.width / 4)) + 'px, 0px, 0px)  translateZ(0)';
				}
			}
		});

		mui(".mui-scroll").on("tap", ".mui-control-item", function(e) {
			var wid = this.getAttribute("data-wid");
			if(wid == "main-subpage-warning-list-new.html") {
				$.fire(plus.webview.getWebviewById("main-subpage-warning-list-new.html"), 'WARNING_INFO_UPDATE_AGIN', {});
			}
			group.switchTab(wid);
		});
		window.addEventListener('reloadViewInfo', function(event) {
			//console.log('domain 获取'+JSON.stringify(event.detail))
			var queryDomain = "";
			if(event.detail && event.detail.domains !== undefined) {
				queryDomain = event.detail;
			}

			var cnxts = group.getAllWebviewContexts();
			for(var i = 0, len = cnxts.length; i < len; i++) {
				cnxts[i].options.extras.queryDomain = queryDomain;
			}

			//$.fire(group.getCurrentWebview(), 'reloadViewInfo', event);
			var wbvs = group.getAllWebviews();
			for(var j = 0, len = wbvs.length; j < len; j++) {
				$.fire(wbvs[j], 'getDomain', queryDomain);
			}
		});
		window.addEventListener('WARNING_INFO_UPDATE', function(event) {
			var wbvs = group.getAllWebviews();
			for(var j = 0, len = wbvs.length; j < len; j++) {
				$.fire(wbvs[j], 'WARNING_INFO_UPDATE', event);
			}
		});
	});

	//$.back = function() {
	//  var _self = plus.webview.currentWebview();
	//  _self.close("auto");
	//}

}(mui, document))