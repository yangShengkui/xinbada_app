function createWarningDetailCell(data) {
	console.log('渲染页面得数据'+JSON.stringify(data))
	if(data.type == 'alert'){
		var appSource = '';
		var severityValue = '';
		if(data.values.appName == '1'){
		  	appSource = '在线预警'
		  }else if(data.values.appName  == '2'){
		  	appSource = '智能诊断'
		  }else if(data.values.appName  == '3'){
		  	appSource = '大数据分析'
		  }else if(data.values.appName  == '4'){
		  	appSource = '离线诊断'
		  }
		  if (data.values.severity == 4) {
		    severityValue = "危险";
		  } else if(data.values.severity == 3) {
		    severityValue = "警告";
		  } else if(data.values.severity == 2) {
		    severityValue = "注意";
		  } else if(data.values.severity == -1){
		    severityValue = "正常";
		  }else{
		  	severityValue = "未知";
		  }
		  if(data.resumeDate == null){
		  	 var htmlValue = '<div class="time">'+
				      						'<p></p>'+
				      						'<p></p>'+
					      				'</div>'+
					      				'<span class="iconfont icon-icon-life-alarm first-state"></span>'+   	
					      				'<div class="line-progress">'+
					      							'<p>报警信息：'+data.values.alertTitle+'</p>'+
					      							'<p>报警来源：'+appSource+'</p>'+
					      							'<p>综合判断结论：'+data.values.multipleConclusion+'</p>'+
					      							'<p>处理方案建议：'+data.values.cessingScheme+'</p>'+
					      				'</div>'	
		
		  }else{
		  	 var htmlValue = '<div class="time">'+
				      						'<p>'+data.resumeDate.substring(5,10)+'</p>'+
				      						'<p>'+data.resumeDate.substring(11,16)+'</p>'+
					      				'</div>'+
					      				'<span class="iconfont icon-icon-life-alarm first-state"></span>'+   	
					      				'<div class="line-progress">'+
					      							'<p>报警信息：'+data.values.alertTitle+'</p>'+
					      							'<p>报警来源：'+appSource+'</p>'+
					      							'<p>综合判断结论：'+data.values.multipleConclusion+'</p>'+
					      							'<p>处理方案建议：'+data.values.cessingScheme+'</p>'+
					      				'</div>'	
		
		  }
			
		  return htmlValue;
	}else{
		if(data.resumeDate == null){
			var htmlValue = 
//										'<div class="time">'+
//				      						'<p></p>'+
//				      						'<p></p>'+
//					      				'</div>'+
//					      				'<span class="iconfont icon-xinxinicon first-state"></span>'+   	
					      				'<div class="line-progress">'+
					      							'<p>工程项目名称：'+data.values.standardProjectName+'</p>'+
					      							'<p>工时数：'+data.values.repairWorkPeriod+'</p>'+
					      				'</div>'
		}else{
			var htmlValue = '<div class="time">'+
				      						'<p>'+data.resumeDate.substring(5,10)+'</p>'+
				      						'<p>'+data.resumeDate.substring(11,16)+'</p>'+
					      				'</div>'+
					      				'<span class="iconfont icon-xinxinicon first-state"></span>'+   	
					      				'<div class="line-progress">'+
					      							'<p>工程项目名称：'+data.values.standardProjectName+'</p>'+
					      							'<p>工时数：'+data.values.repairWorkPeriod+'</p>'+
					      				'</div>'
		}
		 return htmlValue; 
	}

}

var createWarningDetailList = function(data) {
  if(null == data) {
    return;
  }
  var newData = data.reverse();
  var fragment = document.createDocumentFragment();
  var li;
  var len = newData.length;
  for(var i = 0; i < len; i++) {
    li = document.createElement('li');
    li.className = 'mui-table-view-cell';
    li.id = data[i].alertId;
    li.innerHTML = createWarningDetailCell(data[i]);
    fragment.appendChild(li);
  }
  return fragment;
};