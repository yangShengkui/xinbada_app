
(function($, doc) {
  $.init({
    pullRefresh: {
      container: "#pullrefresh",
      down: toolUtil.getDownRefreshConfig(pulldownRefresh, 50, "false")
    }
  });

  var self;
  var detail = {}; //初始化条件

  $.plusReady(function() {
    self = plus.webview.currentWebview();

    pulldownRefresh();


  });

  function pulldownRefresh() {

    var pullObject = $('#pullrefresh').pullRefresh();

    $('#list').on('tap', 'li .base', function() {

      dispatherManager.toJdDetail(0);
    });

  }

  function createDom() {
  	
  }
}(mui, document));

