(function($, doc) {
  $.init({
//  pullRefresh: {
//    container: "#pullrefresh",
//    down: toolUtil.getDownRefreshConfig(pulldownRefresh)
//  }
});		
 $.plusReady(function() {
	var myChart=echarts.init(document.getElementById('barChart'));
var option = {
    color: ['#3398DB'],
    tooltip : {
        trigger: 'axis',
        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        }
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    xAxis : [
        {
            type : 'category',
            data : ['热轧厂', '冷轧厂', '炼钢厂', '炼铁厂'],
            axisTick: {
                alignWithLabel: true
            }
        }
    ],
    yAxis : [
        {
            type : 'value'
        }
    ],
    series : [
        {
            name:'指标值',
            type:'bar',
            barWidth: '60%',
            data:[10, 52, 200, 334]
        }
    ]
};

        
  myChart.setOption(option);
	})
}(mui, document));