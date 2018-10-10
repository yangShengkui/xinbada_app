/**
 * @author longzhen zhangafa
 * 通用对象，为业务提供基础支持
 * serviceProxy：后台服务请求方法
 * appStorage：本地存储
 */
var common =
	(function(win, $) {
		var com = {};

		/**
		 * XMLHttpRequest的基础请求
		 */
		var serviceProxy = function(api, params, futureListener) {
			if(plus.networkinfo.getCurrentType() == plus.networkinfo.CONNECTION_NONE) {
				futureListener(null, false, "当前网络不可用，请检查网络状态！");
				return;
			}

			var xhr = new plus.net.XMLHttpRequest();
			xhr.responseType = "json";
			var timeout = false; //是否超时
			var timer = setTimeout(function() {
				plus.nativeUI.closeWaiting();
				plus.nativeUI.toast("数据请求超时，请重试");
				timeout = true;
				xhr.abort(); //请求中止
			}, 8000);
			xhr.onreadystatechange = function() {
				switch(xhr.readyState) {
					case 0:
						console.log("---------->请求" + api + "已初始化");
						break;
					case 1:
						console.log("---------->请求" + api + "已打开");
						break;
					case 2:
						console.log("---------->请求" + api + "已发送");
						break;
					case 3:
						console.log("---------->请求" + api + "已响应");
						break;
					case 4:
						if(timeout) return; //忽略中止请求
						clearTimeout(timer); //取消等待的超时
						if(xhr.status == 200) {
							if(xhr.response.code == 0) {
								futureListener(xhr.response, true, null);
							} else if(xhr.response.code == 10020) {
								futureListener(null, true, "");
								plus.webview.currentWebview().opener().hide();
								plus.webview.getLaunchWebview().show();
							} else if(xhr.response.code > 9999) {
								futureListener(null, true, xhr.response.message);
							} else {
								futureListener(null, true, "服务错误编码" + xhr.response.code + ":" + xhr.response.message);
							}
						} else {
							plus.nativeUI.closeWaiting(); //清空等待
							futureListener(null, false, "服务器连接已中断");
						}
						break;
					default:
						break;
				}
			}

			xhr.open("POST", api);
			xhr.withCredentials = true;
			xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

			if(typeof(params) === "string") {
				xhr.send(params);
			} else {
				xhr.send(JSON.stringify(params));
			}
		};
		com.buildNetworkPostFuture = serviceProxy;
		win.buildNetworkPostFuture = serviceProxy;

		/**
		 * webscoket
		 */
		var webscoket = function() {
			var websocket = new WebSocket("wss://demo.proudsmart.com/websocket/message");
			//连接发生错误的回调方法  
			websocket.onerror = function() {
				console.log("错误")
				setMessageInnerHTML("WebSocket连接发生错误");
			};

			//连接成功建立的回调方法  
			websocket.onopen = function() {
				console.log("成功")
				setMessageInnerHTML("WebSocket连接成功");
			}

			//接收到消息的回调方法  
			websocket.onmessage = function(event) {
				console.log("接收")
				setMessageInnerHTML(event.data);
			}

			//连接关闭的回调方法  
			websocket.onclose = function() {
				setMessageInnerHTML("WebSocket连接关闭");
			}

			//监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。  
			window.onbeforeunload = function() {
				closeWebSocket();
			}

			//关闭WebSocket连接  
			function closeWebSocket() {
				websocket.close();
			}
		}
		com.useWebscoket = webscoket
		win.useWebscoket = webscoket
		/**
		 * @description 本地存储
		 */
		var appStorage = {};

		function getItem(k) {
			var jsonStr = window.localStorage.getItem(k.toString());
			return jsonStr ? JSON.parse(jsonStr).data : null;
		};

		function getItemPlus(k) {
			var jsonStr = plus.storage.getItem(k.toString());
			return jsonStr ? JSON.parse(jsonStr).data : null;
		};
		appStorage.getItem = function(k) {
			return getItem(k) || getItemPlus(k);
		};
		appStorage.setItem = function(k, value) {
			value = JSON.stringify({
				data: value
			});
			k = k.toString();
			try {
				window.localStorage.setItem(k, value);
			} catch(e) {
				console.log(e);
				//TODO 超出localstorage容量限制则存到plus.storage中
				//且删除localStorage重复的数据
				removeItem(k);
				plus.storage.setItem(k, value);
			}
		};

		function getLength() {
			return window.localStorage.length;
		};
		appStorage.getLength = getLength;

		function getLengthPlus() {
			return plus.storage.getLength();
		};
		appStorage.getLengthPlus = getLengthPlus;

		function removeItem(k) {
			return window.localStorage.removeItem(k);
		};

		function removeItemPlus(k) {
			return plus.storage.removeItem(k);
		};
		appStorage.removeItem = function(k) {
			window.localStorage.removeItem(k);
			return plus.storage.removeItem(k);
		}
		appStorage.clear = function() {
			window.localStorage.clear();
			return plus.storage.clear();
		};

		function key(index) {
			return window.localStorage.key(index);
		};
		appStorage.key = key;

		function keyPlus(index) {
			return plus.storage.key(index);
		};
		appStorage.keyPlus = keyPlus;

		function getItemByIndex(index) {
			var item = {
				keyname: '',
				keyvalue: ''
			};
			item.keyname = key(index);
			item.keyvalue = getItem(item.keyname);
			return item;
		};
		appStorage.getItemByIndex = getItemByIndex;

		function getItemByIndexPlus(index) {
			var item = {
				keyname: '',
				keyvalue: ''
			};
			item.keyname = keyPlus(index);
			item.keyvalue = getItemPlus(item.keyname);
			return item;
		};
		appStorage.getItemByIndexPlus = getItemByIndexPlus;
		/**
		 * @author longzhen
		 * @description 获取所有存储对象
		 * @param {Object} key 可选，不传参则返回所有对象，否则返回含有该key的对象
		 */
		appStorage.getItems = function(k) {
			var items = [];
			var numKeys = getLength();
			var numKeysPlus = getLengthPlus();
			var i = 0;
			if(k) {
				for(; i < numKeys; i++) {
					if(key(i).toString().indexOf(k) != -1) {
						items.push(getItemByIndex(i));
					}
				}
				for(i = 0; i < numKeysPlus; i++) {
					if(keyPlus(i).toString().indexOf(k) != -1) {
						items.push(getItemByIndexPlus(i));
					}
				}
			} else {
				for(i = 0; i < numKeys; i++) {
					items.push(getItemByIndex(i));
				}
				for(i = 0; i < numKeysPlus; i++) {
					items.push(getItemByIndexPlus(i));
				}
			}
			return items;
		};
		/**
		 * @description 清除指定前缀的存储对象
		 * @param {Object} keys
		 * @default ["filePathCache_","ajax_cache_"]
		 * @author longzhen
		 */
		appStorage.removeItemByKeys = function(keys, cb) {
			if(typeof(keys) === "string") {
				keys = [keys];
			}
			var numKeys = getLength();
			var numKeysPlus = getLengthPlus();
			//TODO plus.storage是线性存储的，从后向前删除是可以的
			//稳妥的方案是将查询到的items，存到临时数组中，再删除
			var tmpks = [];
			var tk,
				i = numKeys - 1;
			for(; i >= 0; i--) {
				tk = key(i);
				Array.prototype.forEach.call(keys, function(k, index, arr) {
					if(tk.toString().indexOf(k) != -1) {
						tmpks.push(tk);
					}
				});
			}
			tmpks.forEach(function(k) {
				removeItem(k);
			});
			for(i = numKeysPlus - 1; i >= 0; i--) {
				tk = keyPlus(i);
				Array.prototype.forEach.call(keys, function(k, index, arr) {
					if(tk.toString().indexOf(k) != -1) {
						tmpks.push(tk);
					}
				});
			}
			tmpks.forEach(function(k) {
				removeItemPlus(k);
			})
			cb && cb();
		};
		com.appStorage = appStorage;
		win.appStorage = appStorage;

		/**
		 // 对Date的扩展，将 Date 转化为指定格式的String
		 // 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
		 // 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
		 // 例子：
		 // (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
		 // (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
		 */
		Date.prototype.Format = function(fmt) { //author: meizz
			var o = {
				"M+": this.getMonth() + 1, //月份
				"d+": this.getDate(), //日
				"h+": this.getHours(), //小时
				"m+": this.getMinutes(), //分
				"s+": this.getSeconds(), //秒
				"q+": Math.floor((this.getMonth() + 3) / 3), //季度
				"S": this.getMilliseconds() //毫秒
			};

			if(/(y+)/.test(fmt))
				fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
			for(var k in o)
				if(new RegExp("(" + k + ")").test(fmt))
					fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
			return fmt;
		};
		/**
		 * 时间格式化
		 * 2017-04-12T08:50:02.748+0000
		 * @param jsondate
		 * @param fmt
		 * @returns {*}
		 */
		var toolUtil = {}
		toolUtil.json2Time = function(jsondate, fmt) {
			if(!jsondate) {
				return "";
			}
			var year = parseInt(jsondate.substring(0, 4));
			var month = parseInt(jsondate.substring(5, 7)) - 1;
			var date = parseInt(jsondate.substring(8, 10));
			var hrs = parseInt(jsondate.substring(11, 13));
			var min = parseInt(jsondate.substring(14, 16));
			var sec = parseInt(jsondate.substring(17, 19));
			var utc = Date.UTC(year, month, date, hrs, min, sec);

			var result = (new Date(utc)).Format(fmt);
			return result;
		};
		toolUtil.toUrl = function(urlStr) {
			if(plus.os.name == "Android") {
				var Intent = plus.android.importClass("android.content.Intent");
				var Uri = plus.android.importClass("android.net.Uri");
				var main = plus.android.runtimeMainActivity();
				var uri = Uri.parse(urlStr);
				var skipBrowser = new Intent("android.intent.action.VIEW", uri);
				main.startActivity(skipBrowser);
			} else {
				var UIAPP = plus.ios.importClass("UIApplication");
				var NSURL = plus.ios.importClass("NSURL");
				var app = UIAPP.sharedApplication();
				app.openURL(NSURL.URLWithString(urlStr));
			}
		}
		toolUtil.getDownRefreshConfig = function(refreshFunc, height, auto) {
			return {
				height: height ? height : 50, //可选,默认50.触发下拉刷新拖动距离,
				auto: auto == "false" ? false : true, //可选,默认false.自动下拉刷新一次
				//contentdown: "下拉可以刷新", 
				//contentover: "释放立即刷新", 
				//contentrefresh: "正在刷新...", 
				callback: refreshFunc //刷新函数
			};
		}
		toolUtil.getUpRefreshConfig = function(refreshFunc, height, auto) {
			return {
				height: height ? height : 50, //可选.默认50.触发上拉加载拖动距离
				auto: auto == "true" ? true : false, //可选,默认false.自动上拉加载一次
				//contentrefresh : "正在加载...",//可选，正在加载状态时，上拉加载控件上显示的标题内容
				//contentnomore:'没有更多数据了',//可选，请求完毕若没有更多数据时显示的提醒内容；
				callback: refreshFunc //必选，刷新函数
			};
		}
		com.toolUtil = toolUtil;
		win.toolUtil = toolUtil;

		var ArrayList = function() {
			this.datas = [];
		};

		var proto = ArrayList.prototype;

		proto.size = function() {
			return this.datas.length;
		};

		proto.isEmpty = function() {
			return this.size() === 0;
		};

		proto.contains = function(value) {
			return this.datas.indexOf(value) !== -1;
		};

		proto.indexOf = function(value) {
			for(var index in this.datas) {
				if(this.datas[index] === value) {
					return index;
				}
			}

			return -1;
		};

		proto.lastIndexOf = function(value) {
			for(var index = this.size(); index >= 0; index--) {
				if(this.datas[index] === value) {
					return index;
				}
			}
		};

		proto.toArray = function() {
			return this.datas;
		};

		proto.outOfBound = function(index) {
			return index < 0 || index > (this.size() - 1);
		};

		proto.get = function(index) {
			if(this.outOfBound(index)) {
				return null;
			}

			return this.datas[index];
		};

		proto.set = function(index, value) {
			this.datas[index] = value;
		};

		proto.add = function(value) {
			this.datas.push(value);
		};

		proto.insert = function(index, value) {
			if(this.outOfBound(index)) {
				return;
			}

			this.datas.splice(index, 0, value);
		};

		proto.remove = function(index) {
			if(this.outOfBound(index)) {
				return false;
			}

			this.datas.splice(index, 1);
			return true;
		};

		proto.removeValue = function(value) {
			if(this.contains(value)) {
				this.remove(this.indexOf(value));
				return true;
			}
			return false;
		};

		proto.clear = function() {
			this.datas.splice(0, this.size());
		};

		proto.addAll = function(list) {
			if(!list instanceof ArrayList) {
				return false;
			}

			for(var index in list.datas) {
				this.add(list.get(index));
			}

			return true;
		};

		proto.insertAll = function(index, list) {
			if(this.outOfBound(index)) {
				return false;
			}

			if(!list instanceof ArrayList) {
				return false;
			}

			var pos = index;
			for(var index in list.datas) {
				this.insert(pos++, list.get(index));
			}
			return true;
		};

		function numberorder(a, b) {
			return a - b;
		}

		proto.sort = function(isNumber) {
			if(isNumber) {
				this.datas.sort(numberorder);
				return;
			}

			this.datas.sort();
		};

		proto.toString = function() {
			return "[" + this.datas.join() + "]";
		};

		proto.valueOf = function() {
			return this.toString();
		};

		proto.addArray = function(array) {
			if(!array) {
				return false;
			}
			for(var position = 0, len = array.length; position < len; position++) {
				this.add(array[position]);
			}
			return true;
		}
		win.ArrayList = ArrayList;

		function Map() {
			this.elements = new Array();

			//获取Map元素个数
			this.size = function() {
				return this.elements.length;
			};

			//判断Map是否为空
			this.isEmpty = function() {
				return(this.elements.length < 1);
			};

			//删除Map所有元素
			this.clear = function() {
				this.elements = new Array();
			};

			//向Map中增加元素（key, value)
			this.put = function(_key, _value) {
				if(this.containsKey(_key) == true) {
					if(this.containsValue(_value)) {
						if(this.remove(_key) == true) {
							this.elements.push({
								key: _key,
								value: _value
							});
						}
					} else {
						this.elements.push({
							key: _key,
							value: _value
						});
					}
				} else {
					this.elements.push({
						key: _key,
						value: _value
					});
				}
			};

			//删除指定key的元素，成功返回true，失败返回false
			this.remove = function(_key) {
				var bln = false;
				try {
					for(i = 0; i < this.elements.length; i++) {
						if(this.elements[i].key == _key) {
							this.elements.splice(i, 1);
							return true;
						}
					}
				} catch(e) {
					bln = false;
				}
				return bln;
			};

			//获取指定key的元素值value，失败返回null
			this.get = function(_key) {
				try {
					for(i = 0; i < this.elements.length; i++) {
						if(this.elements[i].key == _key) {
							return this.elements[i].value;
						}
					}
				} catch(e) {
					return null;
				}
			};

			//获取指定索引的元素（使用element.key，element.value获取key和value），失败返回null
			this.element = function(_index) {
				if(_index < 0 || _index >= this.elements.length) {
					return null;
				}
				return this.elements[_index];
			};

			//判断Map中是否含有指定key的元素
			this.containsKey = function(_key) {
				var bln = false;
				try {
					for(i = 0; i < this.elements.length; i++) {
						if(this.elements[i].key == _key) {
							bln = true;
						}
					}
				} catch(e) {
					bln = false;
				}
				return bln;
			};

			//判断Map中是否含有指定value的元素
			this.containsValue = function(_value) {
				var bln = false;
				try {
					for(i = 0; i < this.elements.length; i++) {
						if(this.elements[i].value == _value) {
							bln = true;
						}
					}
				} catch(e) {
					bln = false;
				}
				return bln;
			};

			//获取Map中所有key的数组（array）
			this.keys = function() {
				var arr = new Array();
				for(i = 0; i < this.elements.length; i++) {
					arr.push(this.elements[i].key);
				}
				return arr;
			};

			//获取Map中所有value的数组（array）
			this.values = function() {
				var arr = new Array();
				for(i = 0; i < this.elements.length; i++) {
					arr.push(this.elements[i].value);
				}
				return arr;
			};
		}

		win.Map = Map;
		return com;
	}(window, mui));