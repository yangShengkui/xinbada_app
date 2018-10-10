(function($, doc) {
  $.init({
    
  });
  mui('.mui-scroll-wrapper').scroll({
		deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	});
  $.plusReady(function() {
  	 var self = plus.webview.currentWebview();
		var nodeId = self.nodeId;
		console.log('nodeId : '+JSON.stringify(nodeId))
  	appFutureImpl.getTicketTaskById(nodeId,function(result, success, msg){
  		console.log('协同详情'+JSON.stringify(result))
  		if(null != msg) {
        futureListener(null, msg);
        return;
    }
      createDom(result);
  	})
  })    
   function createDom(data){
   	  var table = document.body.querySelector('.mui-table-view');
    		table.innerHTML = "";
    		var teamworkReason;
    		var teamworkVerdict
    		if(data.values.teamworkReason){
    			teamworkReason = data.values.teamworkReason
    		}else{
    			teamworkReason = '';
    		}
    		if(data.values.teamworkVerdict){
    			teamworkVerdict = data.values.teamworkVerdict
    		}else{
    			teamworkVerdict = '';
    		}
    		var conclusion;
    		if(data.variables.conclusion){
    			conclusion = data.variables.conclusion
    		}else{
    			conclusion = '';
    		}
    		var sendTime = moment(data.sendTime).format("YYYY-MM-DD HH:mm:ss");
    		var teamworkTime = moment(data.values.teamworkTime).format("YYYY-MM-DD HH:mm:ss")
			var template = '<p class="tle">申请方意见       <span class="mui-pill-right">'+sendTime+'</span></p>'+
      			'<p>会诊发起人：'+data.senderName+'</p>'+
      			'<p>时限:24h</p>'+
      			'<p>原因分析：'+data.variables.causes+'</p>'+
      			'<p>结论：'+conclusion+'</p>'+
      			'<p class="tle">协同方意见   <span class="mui-pill-right">'+teamworkTime+'</span></p>'+
      			'<p>会诊参与人：'+data.handlerName+'</p>'+
      			'<p>原因分析：'+teamworkReason+'</p>'+
      			'<p>结论：'+teamworkVerdict+'</p>';
				      table.innerHTML = template;
   }
}(mui, document))