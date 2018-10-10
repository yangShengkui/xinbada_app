(function($, doc) {
  $.init({
    
  });
  mui('.mui-scroll-wrapper').scroll({
		deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	});
  $.plusReady(function() {
  	 var self = plus.webview.currentWebview();
//  var rptNo = self.noId;
    var hostName = window.getHostName();
    var params = self.params;
    var tle = document.querySelector('#title');
    if(params = '精密检测报告'){
    	tle.innerHTML = '精密检测报告';
    }else{
    	tle.innerHTML = '离线诊断报告';
    }
    var id = self.noId.split("/");
    console.log('id.....:'+JSON.stringify(id))
  	appFutureImpl.getDeviceOfflineReportListByCondition({'rptNo': id[1]}, function (result, success, msg) {
    		console.log('离线诊断报告详情：'+JSON.stringify(result))
    		if (null != msg) {
	        futureListener(null, msg);
	        return;
	      }
	      if (success && result.code == 0) {
	        futureListener(result.data, null);
	      }
	       createDom(result)
		     		 			
    	})
   function createDom(data){
   	var table = document.body.querySelector('.mui-scroll');
    					table.innerHTML = "";
    					var severity = '';
    					var alertFromType = '';
    						for(var i =0;i<data.length;i++){
    							if(data[i].id==id[0]){
    								var li = document.createElement('div');
								      li.className = 'mui-table-view-cell';
								      li.style.backgroundColor = "#fff";
								      if(data[i].conclusion == 4){
									      	conclusion = "警告"
									      }else if(data[i].conclusion == 3){
									      	conclusion = "异常"
									      }else if(data[i].conclusion == 2){
									      	conclusion = "注意"
									      }else if(data[i].conclusion == 1){
									      	conclusion = "正常"
									      }else{
									      	conclusion = "未知"
									      }
									      var relatedData;
									      var relatedAlerts ;
												if(data[i].relatedAlerts == null){
													relatedAlerts = '';
												}else{
													relatedAlerts = data[i].relatedAlerts
												}
												if(data[i].relatedData == null||data[i].relatedData == "null"){
													relatedData = '';
												}else{
													relatedData = data[i].relatedData
												}
												var rptDate;
												if(data[i].rptDate == null||data[i].rptDate == "null"){
													rptDate = '';
												}else{
													rptDate = moment(data[i].rptDate).format('YYYY-MM-DD HH:mm:ss');
												}
											var template = '<p>报告编号：'+data[i].rptNo+'</span></p>'+
										      			'<p>报告日期：'+rptDate+'</p>'+
										      			'<p>负责人：'+data[i].reportor+'</p>'+
										      			'<p>报告结论：'+conclusion+'</p>'+
										      			'<p>诊断描述：'+data[i].diagnoseDesc+'</p>'+
										      			'<p>处理建议：'+data[i].dealOption+'</p>'+
										      			'<p>备注：'+data[i].comment+'</p>'+
										      			'<p>关联预警：'+relatedAlerts+'</p>'+
										      			'<p>关联数据：'+relatedData+'</p>'+
										      			'<p>文档类型：'+data[i].fileType+'</p>'+
										      			'<p>报告文档：<a href="'+hostName+data[i].reportFile.filePath+'">'+data[i].reportFile.fileName+'</a></p>'
										      			
										  li.innerHTML = template;
								      table.appendChild(li); 
    							}
    						 
				      }
      	}
  })
}(mui, document))