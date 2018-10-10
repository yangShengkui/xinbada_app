/**
 * Created by zlzsam on 5/4/2017.
 */

(function($, doc) {
	var self;
	var messageList;
	var newData = [];
	$.init({
		swipeBack: false,
		pullRefresh: {
			container: '#pullrefresh',
			up: {
				contentrefresh: '正在加载...',
				contentnomore: '没有更多数据了',
				callback: pullUpRefresh
			}
		}
	});

	function pullUpRefresh() {
		$('#pullrefresh').pullRefresh().endPullupToRefresh(true); //参数为true代表没有更多数据了。
	}
	$.plusReady(function() {

		self = plus.webview.currentWebview();
		self.setPullToRefresh({
			support: true,
			height: '50px',
			range: '100px',
			style: 'circle',
			offset: '1px'
		}, pullDownRefresh);

		startPresenter();

		function pullDownRefresh() {
			startPresenter();
		}

		function startPresenter() {
			plus.nativeUI.showWaiting();
			appFutureImpl.getLeastMessage(function(result, msg) {
				self.endPullToRefresh();
				plus.nativeUI.closeWaiting();
				if(null != msg) {
					plus.nativeUI.toast(msg);
					return;
				}

				if(null != result) {
					for(var index = 0, len = result.length; index < len; index++) {
						//if(result[index].sender != "command_message") {
						newData.push(result[index]);
						//}
					}
					console.log("数据" + JSON.stringify(newData.length))
					messageList = newData;
					createDom(newData);
				}
			})
		}

		function createDom(data) {
			var table = document.body.querySelector('#list');
			table.innerHTML = "";
			console.log(JSON.stringify(data))
			var newData = [];
			for(var index = 0, len = data.length; index < len; index++) {
				//if(data[index].sender != "command_message") {
				newData.push(data[index]);
				//}
			}
			for(var index = 0, len = newData.length; index < len; index++) {
				var obj = newData[index];
				var msg = obj.message;
				var time = "";
				if(null != msg.insertTime) {
					//time = toolUtil.json2Time(msg.insertTime, "yyyy-MM-dd hh:mm");
					time = moment(msg.insertTime).format('YYYY-MM-DD HH:mm')
				}
				var li = document.createElement('li');
				li.className = 'mui-table-view-cell mui-media';
				li.id = obj.id;
				var htmlCode = '<a class="mui-navigate-right">' +
					'<div class="order-info">' +
					'<div class="mui-pull-left left-msg">' +
					'<span class="label-title message-font">' + msg.title + '</span>' +
					'</div>' +
					'<div class="mui-pull-right  message-font-small">' + time + '</div>' +
					'<div class="mui-clearfix"></div>' +
					'</div>' +
					'<div class="order-detail">' +
					'<div class="mui-pull-left  message-font-small">消息类型：工单任务</div>' +
					'</div></a>';
				li.innerHTML = htmlCode;
				table.appendChild(li);
			}
		}
		var messageCountView = doc.getElementById('least-message-count');
		$('#list').on('tap', 'li', function() {
			if(null == messageList) {
				return;
			}
			var obj;
			var lis = document.getElementsByClassName('mui-table-view-cell');
			var li;
			for(var i = 0; i < lis.length; i++) {
				if(lis[i].id == this.id) {
					li = lis[i]
				}
			}

			for(var index = 0, len = messageList.length; index < len; index++) {
				if(messageList[index].id == this.id) {
					obj = messageList[index];
					break;
				}
			}

			mui.confirm(obj.message.content, obj.message.title, function(e) {
				if(e.index == 1) {
					li.style.color = "#999999";
					appFutureImpl.getReadMessage([obj.message.messageId], function(result, msg) {
						console.log('查看后消息' + JSON.stringify(result));
						self.endPullToRefresh();
						plus.nativeUI.closeWaiting();
						if(null != msg) {
							plus.nativeUI.toast(msg);
							return;
						}
						if(null != result) {
							//							messageList = result;
							//							createDom(result);
							//pullDownRefresh();
							//告诉侧边栏，重新刷新
							var mainPage = plus.webview.getWebviewById("main-menu");
							$.fire(mainPage, 'SHOW_MESSAGE', {
							});

						}
					})

				} else {

				}

			});
		});

	})

}(mui, document))