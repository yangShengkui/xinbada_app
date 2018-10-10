(function($, doc) {
  $.init({
    
  });
  mui('.mui-scroll-wrapper').scroll({
		deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	});
  $.plusReady(function() {
  	 var self = plus.webview.currentWebview();
  	 var ticketNo = self.ticketNo;
  	 var hostName = window.getHostName();
  	 var queryParams = {"taskStatus":10,"sendBeginTime":"","sendEndTime":""};
  	console.log('检修计划--->'+JSON.stringify(ticketNo))
  		appFutureImpl.getTicketLog(ticketNo,function(result, success, msg){
		  		console.log('计划--->'+JSON.stringify(result))
		  		if(null != msg) {
		        futureListener(null, msg);
		        return;
		      }
		      if(success && result.code == 0) {
		        futureListener(result.data);
		      }
		      result.splice(0,1);
		      for(var i = 0;i<result.length;i++){
		      	if(result[i].ticketTask.variables.ticket.values.tickeTaskStatus == 'maintaining'){
			      	console.log('检修修修修：'+JSON.stringify(result[i]))
			      	createDom(result[i],hostName);
			      }
		      } 
		  	})
			      
  	  function createDom(data,hostName){
  	  	console.log('检修实际---'+JSON.stringify(data.ticketTask.values))
   	  var table = document.body.querySelector('.mui-table-view');
    		table.innerHTML = "";
//  		 for(var i = 0;i<data.length;i++){
		     		 var li = document.createElement('li');
				      li.className = 'mui-table-view-cell';
//				      li.id = data[i].id;
			var repairQuality;
			var repairContent;
			var contQ;
			var contA;
			if(data.ticketTask.values.repairQuality){
				repairQuality = data.ticketTask.values.repairQuality;
				contQ = '<p>质量控制要点:<a href='+'"'+hostName+repairQuality[0].path+'"'+'>'+repairQuality[0].name+'</a></p>'
				console.log('contQ++++++++'+contQ)
			}else{
				repairQuality = '无';
				contQ = '<p>质量控制要点:'+repairQuality+'</p>'
			}
			if(data.ticketTask.values.repairAccessory.length == 0||data.ticketTask.values.repairAccessory == undefined){
				repairAccessory = '无';
				contA = '<p>附件:'+repairAccessory+'</p>'
			}else{
				repairAccessory = data.ticketTask.values.repairAccessory;
				contA = '<p>附件:<a href='+'"'+hostName+repairAccessory[0].path+'"'+'>'+repairAccessory[0].name+'</a></p>'	
			}
			if(data.ticketTask.values.repairContent){
				repairContent = data.ticketTask.values.repairContent;
			}else{
				repairContent = '';
			}
			if(data.ticketTask.values.repairWorkType){
				repairWorkType = data.ticketTask.values.repairWorkType;
			}else{
				repairWorkType = '';
			}
			var tm = moment(data.ticketTask.values.repairFinishDate).format('YYYY-MM-DD');
			var template =   '<p>处理方式：'+data.ticketTask.values.repairProcessModel+'</p>'+
      			'<p>实际完工日期：'+tm+'</p>'+
      			'<p>完工数量：'+data.ticketTask.values.repairFinishCount+'</p>'+
      			'<p>工时数：'+data.ticketTask.values.repairWorkPeriod+'</p>'+
      			'<p>工作内容补充：'+repairContent+'</p>'+
      			'<p>施工类别：'+repairWorkType+'</p>'+contQ+contA
				      		
			      	
				      li.innerHTML = template;
				      table.appendChild(li);
//    			}
   }
   })
}(mui, document))