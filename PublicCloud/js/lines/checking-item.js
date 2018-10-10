(function($, doc) {
	$.init({});
	mui('.mui-scroll-wrapper').scroll({
		deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	});
	var params;
	var imgSrc = [];
	var hostName;
	var ticketNo;
	var imgArr = [];
	$.plusReady(function() {
		var self = plus.webview.currentWebview();
		var allInfo = self.allInfo;
		hostName = window.getHostName();
		ticketNo = self.alertId;
		var queryParams = {
			"severities": "1,2,3,4",
			"states": "0"
		}
		var queryParams2 = {
			taskStatus: 10
		}
		var queryParams4Page = {
			"start": 0,
//			"length": 10,
			"length":9999,
			"statCount": true
		}
		console.log('allInfo--->' + JSON.stringify(allInfo))
		createDom(allInfo)
		appFutureImpl.getComplexHandleListWithCategorys(queryParams,queryParams2, queryParams4Page, function(result, total, msg) {
			console.log('当前任务--->' + JSON.stringify(result))
			if(null != msg) {
				plus.nativeUI.toast(msg);
				return;
			}
			for(var i = 0; i < result.length; i++) {
				if(result[i].ticketNo == ticketNo) {
					params = result[i];
				}
			}
			document.querySelector('#subChecking').addEventListener('tap', function() {
				var txtContent = document.querySelector('#txtContent').value;
				var radio = document.getElementsByName("status");
				var txtDate = document.querySelector('#txtDate').value;
				var selectvalue = null; //  selectvalue为radio中选中的值
				for(var i = 0; i < radio.length; i++) {
					if(radio[i].checked == true) {
						selectvalue = radio[i].value;
						break;
					}

				}
				var innerCont = params.variables.standardInfo.pointCheckItemList;
				for(var j = 0; j < innerCont.length; j++) {
					if(allInfo.itemNumber == innerCont[j].itemNumber) {
						innerCont[j].checkResult = txtContent;
						innerCont[j].finishTime = txtDate + 'T16:00:00Z';
						innerCont[j].checkState = Number(selectvalue);
						innerCont[j].resultFiles = [];
						for(var m = 0; m < imgArr.length; m++) {
							var obj = {
								name: m,
								path: imgArr[m]
							}
							console.log('oooooobj ： ' + JSON.stringify(obj))
							innerCont[j].resultFiles.push(obj);
						}
					}
				}

				console.log('imgArr ： ' + JSON.stringify(imgArr))
				console.log('文本输入内容 ： ' + txtContent)
				console.log('完工日期 ： ' + txtDate)
				console.log('selectvalue ： ' + selectvalue)
				console.log('params ： ' + JSON.stringify(params.variables.standardInfo.pointCheckItemList))
				if(txtContent == '') {
					mui.alert('请填写点检结果', ' ', '确认', function(e) {
						e.index
					}, 'div')
				} else {
					appFutureImpl.updateTicketTaskVariables(params, function(result, success, msg) {
						console.log('暂存结果------>' + JSON.stringify(result))
						if(result != null) {
							plus.nativeUI.toast("提交成功");
							document.querySelector('#subChecking').disabled = true;
							setTimeout(function() {
								mui.currentWebview.close();
								var target = plus.webview.getWebviewById('tally-abnormal.html');
								// 执行相应的事件
								mui.fire(target, 'customEvent', {});
							}, 1000);
						}
						if(null != msg) {
							futureListener(null, msg);
							return;
						}
						if(success && result.code == 0) {
							futureListener(result.data, null);
						}
					})
				}
			})
		})
		document.querySelector('#takePho').addEventListener('tap', function() {
			if(allInfo.checkState == null) {
				if(mui.os.plus) {
					var a = [{
						title: "拍照"
					}, {
						title: "从手机相册选择"
					}];
					plus.nativeUI.actionSheet({
						title: "上传图片",
						cancel: "取消",
						buttons: a
					}, function(b) { /*actionSheet 按钮点击事件*/
						switch(b.index) {
							case 0:
								break;
							case 1:
								getImage(); /*拍照*/
								break;
							case 2:
								galleryImg(); /*打开相册*/
								break;
							default:
								break;
						}
					})
				}
			} else {

			}

		}, false);
	})
	//拍照 
	function getImage() {
		var c = plus.camera.getCamera();
		c.captureImage(function(e) {
			plus.io.resolveLocalFileSystemURL(e, function(entry) {
				var s = entry.toLocalURL() + "?version=" + new Date().getTime();
				console.log('sssssssssssssss----->' + JSON.stringify(s))
				uploadHead(s); /*上传图片*/
			}, function(e) {
				console.log("读取拍照文件错误：" + e.message);
			});
		}, function(s) {
			console.log("error" + s);
		}, {
			filename: "_doc/"
		})
	}
	//本地相册选择 
	function galleryImg() {
		plus.gallery.pick(
			function(path) {
				uploadHead(path); //设置img的路径
				//				getBase64Image(path)
				//把图片base64编码  注意：这里必须在onload事件里执行！这给我坑的不轻
				//					img_my.onload = function() {
				//						var data = getBase64Image(img_my); //base64编码
				//						var newImgbase = data.split(",")[1]; //通过逗号分割到新的编码
				//						imgArray.push(newImgbase); //放到imgArray数组里面
				//						img_my.off('load'); //关闭加载
				//					}
			},
			function(e) {
				mui.toast('取消选择');
			}
		)
	};
	//base64编码  
	function getBase64Image(img) {
		var canvas = document.createElement("canvas"); //创建canvas DOM元素，并设置其宽高和图片一样
		canvas.width = img.width;
		canvas.height = img.height;
		var ctx = canvas.getContext("2d");
		ctx.drawImage(img, 0, 0, img.width, img.height); //使用画布画图
		var ext = img.src.substring(img.src.lastIndexOf(".") + 1).toLowerCase(); //动态截取图片的格式
		var dataURL = canvas.toDataURL("image/" + ext); //返回的是一串Base64编码的URL并指定格式
		return dataURL;
		console.log('dataURL--->' + JSON.stringify(dataURL))
	}
	//上传图片 
	function uploadHead(imgPath) {
		console.log("imgPath = " + imgPath);
		imgSrc.push(imgPath);
		var template = '';
		for(var i = 0; i < imgSrc.length; i++) {
			template += '<img id="imgDj" src="' + imgSrc[i] + '" alt="" style="width:100px;height:100px;margin-right:10px"/>';
			document.querySelector("#loggingImg").innerHTML = template;
		}
		/*在这里调用上传接口*/
		createUpload(imgSrc)
		console.log('imgsrc --->' + JSON.stringify(imgSrc))
	}

	// 创建上传任务
	function createUpload(imgSrc) {
		console.log('上传文件 --->' + JSON.stringify(imgSrc))
		plus.nativeUI.showWaiting("正在上传图片..."); //这里是开始显示原生等待框
		console.log('"' + hostName + '/api/rest/upload/resourceFileUIService/uploadResourceFile' + '"')
		var task = plus.uploader.createUpload(hostName + '/api/rest/upload/resourceFileUIService/uploadResourceFile', {
				method: "POST",
				blocksize: 204800,
				priority: 100,
			},
			function(t, status) {
				// 上传完成
				if(status == 200) {
					plus.nativeUI.closeWaiting(); //这里监听页面是否加载完毕，完成后关闭等待框
					var responseText = eval('(' + t.responseText + ')');
					console.log("Upload success: " + JSON.stringify(responseText.data.qualifiedName));

					imgArr.push(responseText.data.qualifiedName);
				} else {
					alert("图片上传失败！");
				}
			}
		);
		for(i in imgSrc) {
			task.addFile(imgSrc[i], {
				key: 'file'
			});
		}
		task.addData("resourceId", "0");
		task.start();
	}
	//		  //将图片压缩转成base64 
	//      function getBase64Image(img) { 
	//          var canvas = document.createElement("canvas"); 
	//          var width = img.width; 
	//          var height = img.height; 
	//          // calculate the width and height, constraining the proportions 
	//          if (width > height) { 
	//              if (width > 100) { 
	//                  height = Math.round(height *= 100 / width); 
	//                  width = 100; 
	//              } 
	//          } else { 
	//              if (height > 100) { 
	//                  width = Math.round(width *= 100 / height); 
	//                  height = 100; 
	//              } 
	//          } 
	//          canvas.width = width;   /*设置新的图片的宽度*/ 
	//          canvas.height = height; /*设置新的图片的长度*/ 
	//          var ctx = canvas.getContext("2d"); 
	//          ctx.drawImage(img, 0, 0, width, height); /*绘图*/ 
	//          var dataURL = canvas.toDataURL("image/png", 0.8); 
	//          return dataURL.replace("data:image/png;base64,", ""); 
	//      }    

	function createDom(data) {
		console.log('data---->' + JSON.stringify(data))
		var table = document.body.querySelector('.mui-scroll');
		table.innerHTML = "";
		var unit;
		var upLimit;
		var lowLimit;
		var finishTime;
		if(data.unit) {
			unit = data.unit;
		} else {
			unit = ''
		}
		if(data.upLimit) {
			upLimit = data.upLimit;
		} else {
			upLimit = ''
		}
		if(data.lowLimit) {
			lowLimit = data.lowLimit;
		} else {
			lowLimit = ''
		}
		if(data.finishTime) {
			finishTime = data.finishTime;
		} else {
			finishTime = ''
		}
		if(data.smoothType) {
			smoothType = data.smoothType;
		} else {
			smoothType = ''
		}
		if(data.smoothPoint) {
			smoothPoint = data.smoothPoint;
		} else {
			smoothPoint = ''
		}
		var checkState;
		var imgs = '';
		var orgDate = new Date();
		var nowYear = orgDate.getFullYear(); //获取完整的年份(4位,1970-????)
		var nowMonth = orgDate.getMonth() + 1 < 10 ? "0" + (orgDate.getMonth() + 1): orgDate.getMonth() + 1; //获取当前月份(0-11,0代表1月)
		var nowDay = orgDate.getDate() < 10 ? "0" + orgDate.getDate() : orgDate.getDate(); //获取当前日(1-31)
		var nowDate = nowYear + '-'+ nowMonth + '-' + nowDay;
		if(data.checkState == 0) {
			console.log('时间--->'+data.finishTime)
//			var tm = moment(data.finishTime).format('YYYY-MM-DD');
			var tm = data.finishTime.slice(0,10)
			if(data.resultFiles != null) {
				for(var i = 0; i < data.resultFiles.length; i++) {
					imgs += '<img id="imgDj" src="' + hostName + data.resultFiles[i].path + '" alt="" style="width:100px;height:100px;margin-right:5px"/>';
				}
			}
			checkState = '<p> 项次判定：<input type = "radio" name="status" value="0" checked/> 正常 ' +
				'<input type = "radio" name="status" value="1" disabled/> 异常' + '</p>' +
				'<p> 点检结果：<textarea id="txtContent" name = ""rows = ""cols = "" disabled placeholder = ' + data.checkResult + '></textarea></p>' +
				'<p> 完工日期：<input id="txtDate" type = "date" value=' + tm + ' disabled/></p>' +
				'<p style="padding-bottom:10px"> 点检图片: </p>' +
				'<div style="margin:0 20px">' +
				'<p id = "loggingImg" >' + imgs + '</p>' +
				'<img id="takePho" src="../images/lines/addImgNo.png"style="width:100px;height:100px;border:1px solid #DBDBDB"/>' +
				'</div>';

		} else if(data.checkState == 1) {
			var tm = moment(data.finishTime).format('YYYY-MM-DD');
			if(data.resultFiles != null) {
				for(var i = 0; i < data.resultFiles.length; i++) {
					imgs += '<img id="imgDj" src="' + hostName + data.resultFiles[i].path + '" alt="" style="width:100px;height:100px;margin-right:5px"/>';
				}
			}
			checkState = '<p> 项次判定：<input type = "radio" name="status" value="0" disabled/> 正常 ' +
				'<input type = "radio" name="status" value="1" checked/> 异常' + '</p>' +
				'<p> 点检结果：<textarea id="txtContent" name = ""rows = ""cols = ""disabled placeholder=' + data.checkResult + '></textarea></p>' +
				'<p> 完工日期：<input id="txtDate"  type = "date" value=' + tm + ' disabled/></p>' +
				'<p style="padding-bottom:10px"> 点检图片: </p>' +
				'<div style="margin:0 20px">' +
				'<p id = "loggingImg" >' + imgs + '</p>' +
				'<img id="takePho" src="../images/lines/addImgNo.png"style="width:100px;height:100px;border:1px solid #DBDBDB"/>' +
				'</div>';
		} else {
			checkState = '<p> 项次判定：<input type = "radio" name="status" value="0" checked/> 正常 ' +
				'<input type = "radio" name="status" value="1"/> 异常' + '</p>' +
				'<p> 点检结果：<textarea id="txtContent" name = ""rows = ""cols = ""> </textarea></p>' +
				'<p> 完工日期：<input id="txtDate" type = "date" value=' + nowDate + '></p>' +
				'<p style="padding-bottom:10px"> 点检图片: </p>' +
				'<div style="margin:0 20px">' +
				'<p style="display:inline-block" id = "loggingImg" > </p>' +
				'<img id="takePho" src="../images/lines/addImg.png"style="width:100px;height:100px;border:1px solid #1296DB"/>' +
				'</div>';
		}
		var template = '<p>点检项次：' + data.itemNumber + '</p>' +
			'<p> 点检内容：' + data.itemContent + '</p>' +
			'<p> 点检方法：' + data.pointCheckMethod + '</p>' +
			//			'<p> 管理控别：' + data.manageCategory + '</p>' +
			//			'<p> 管理类别：' + data.manageType + ' </p>' +
			'<p> 数据类别：' + data.dataType + ' </p>' +
			'<p> 润滑方式：' + smoothType + '</p>' +
			'<p> 润滑点数：' + smoothPoint + '</p>' +
			'<p> 标准：' + data.standard + '</p>' +
			'<p> 计量单位：' + unit + ' </p>' +
			'<p> 上限：' + upLimit + '</p>' +
			'<p> 下限：' + lowLimit + '</p>' +
			checkState
		//			'<button id="hisChecking" style = "width:40%;margin:20px 5%"> 历史点检 </button>'
		table.innerHTML = template;
	}
	//	var old_back = mui.back;
	//	mui.back = function() {
	//		// 获取目标口窗口对象
	//		var target = plus.webview.getWebviewById('tally-abnormal.html');
	//		// 执行相应的事件
	//		mui.fire(target, 'customEvent',{});
	//		// 执行关闭
	//		old_back();
	//	};
}(mui, document))