(function($, doc) {
  $.init({
    
  });
  mui('.mui-scroll-wrapper').scroll({
		deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	});
  $.plusReady(function() {
  	 var self = plus.webview.currentWebview();
    var ticketNo = self.alertId;
    console.log('ticketNo'+JSON.stringify(ticketNo))
  	appFutureImpl.getTicketLog(ticketNo,function(result, success, msg){
  		console.log('流程跟踪'+JSON.stringify(result))
  		if(null != msg) {
        futureListener(null, msg);
        return;
      }
      if(success && result.code == 0) {
        futureListener(result.data);
      }
      createDom(result);
  	})
  })    
   function createDom(data){
   	data.splice(0,1);
   	  var table = document.body.querySelector('.mui-table-view');
    		table.innerHTML = "";
    		 for(var i = 0;i<data.length;i++){
		     		 var li = document.createElement('li');
				      li.className = 'mui-table-view-cell';
				      li.id = data[i].id;
			var template = '<span class="mui-icon mui-icon-contact"></span>'+
			      		'<div class="line-progress">'+
			      			'<p style="font-size:20px;color:#2A9FD6">'+data[i].message+'</p>'+
				      		'<p>处理人：'+data[i].ticketTask.handlerName+'</p>'+
				      		'<p>处理时间：'+data[i].executeTime.substring(0,10)+'</p>'+
			      		'</div>';
				      li.innerHTML = template;
				      table.appendChild(li);
      			}
   }
}(mui, document))