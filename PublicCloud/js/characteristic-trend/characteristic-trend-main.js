(function($, doc) {
  $.init(
  );
  $.plusReady(function() {
     var currentId = plus.webview.currentWebview().id;
     var nodeId = plus.webview.currentWebview().nodeId;
    var group = new webviewGroup(currentId, {
      items: [{
        id: "main-subpage-trendency.html",
        url: "characteristic-trend-main-list.html",
        extras: {
          queryStates:{'num':1,'nodeId':nodeId},
        }
      }, {
        id: "main-subpage-bigevent.html",
        url: "characteristic-trend-main-list.html",
        extras: {
          queryStates:{'num':2,'nodeId':nodeId},
        }
      }],
      nativeConfig: {
        top: (44 + 83) + 'px',
        height: (window.screen.height - 44 - 83 - 70) + "px",
        backgroundColor: '#f5f5f5'
      },
      onChange: function(obj) {
        var c = document.querySelector(".mui-scroll #warning-category-head-active");
        if(c) {
          c.removeAttribute("id");
          c.classList.remove("mui-active");
        }
        document.querySelector(".mui-scroll .mui-control-item:nth-child(" + (parseInt(obj.index) + 1) + ")").setAttribute('id', "warning-category-head-active");

        var progressBar = document.querySelector("#sliderProgressBar");
        if(progressBar) {
          progressBar.style.webkitTransform = 'translate3d(' + (parseInt(obj.index) * (window.screen.width /2)) + 'px, 0px, 0px)  translateZ(0)';
        }
      }
    });
    
    
    mui(".mui-scroll").on("tap", ".mui-control-item", function(e) {
      var wid = this.getAttribute("data-wid");
      group.switchTab(wid);
    });

    window.addEventListener('reloadViewInfo', function(event) {
      //console.log('domain 获取'+JSON.stringify(event.detail))
      var queryDomain = "";
      if(event.detail && event.detail.domains !== undefined) {
        queryDomain = event.detail;
      }

      var cnxts = group.getAllWebviewContexts();
      for(var i = 0, len = cnxts.length; i < len; i++) {
        cnxts[i].options.extras.queryDomain = queryDomain;
      }

      //$.fire(group.getCurrentWebview(), 'reloadViewInfo', event);
      var wbvs = group.getAllWebviews();
      for(var j = 0, len = wbvs.length; j < len; j++) {
        $.fire(wbvs[j], 'getParamas', queryDomain);
      }
    });
    window.addEventListener('WARNING_INFO_UPDATE', function(event) {
      var wbvs = group.getAllWebviews();
      for(var j = 0, len = wbvs.length; j < len; j++) {
        $.fire(wbvs[j], 'WARNING_INFO_UPDATE', event);
      }
    });
  });
}(mui, document))