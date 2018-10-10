/**
 * @author longzhen
 * @description 页面跳转调度
 */
(function($, com, dispatherManager) {

  dispatherManager.toLogin = function() {

    $.openWindow({
      "id": 'login',
      "url": 'login.html',
      show: {
        auto: true,
        aniShow: 'pop-in',
        duration: 200
      },
      waiting: {
        auto: true,
      }
    });
  }

  /**
   * 跳转到主界面
   */
  dispatherManager.toMain = function() {
    //预加载首页
    var mainPage = plus.webview.getWebviewById("main");
    var customPage = plus.webview.getWebviewById("main-subpage-custom.html");
    var devicePage = plus.webview.getWebviewById("main-subpage-device.html");
    //console.log("页面" + JSON.stringify(devicePage))
    var menuPage = plus.webview.getWebviewById("main-menu");
    $.fire(mainPage, 'SHOW_MAIN', {});
    $.fire(customPage,'reLoading',{});
    $.fire(devicePage,'reloadDevice',{})
    $.fire(menuPage, 'SHOW_MESSAGE', {});
    mainPage.show();
    //隐藏登陆页
    plus.webview.getLaunchWebview().hide();
  }

  /**
   * 跳转到告警的详情页
   */
  dispatherManager.toWarningDetail = function(alertInfo) {
    $.openWindow({
      "id": 'main-subpage-warning-detail.html',
      "url": 'main-subpage-warning-detail.html',

      extras: {
        alertInfo: alertInfo
      },
      show: {
        auto: true,
        aniShow: 'slide-in-right',
        duration: 200
      },
      waiting: {
        auto: true,
        title: '正在加载...'
      }
    });
  }
  

  /**
   * 跳转到设备详情页
   * @param deviceId
   */
  //dispatherManager.toDeviceDetail = function(deviceInfo) {
  	dispatherManager.toDeviceDetail = function(deviceId) {
    $.openWindow({
      "id": 'main-subpage-device-detail.html',
      "url": 'main-subpage-device-detail.html',

      extras: {
        //deviceInfo: deviceInfo
        deviceId:deviceId
      },
      show: {
        auto: true,
        aniShow: 'slide-in-right',
        duration: 200
      },
      waiting: {
        auto: true,
        title: '正在加载...'
      }
    });
  }

  /**
   * 调到客户详情页
   */
  dispatherManager.customer_detail; //客户详情页
  dispatherManager.initCustomerDetail = function(callback,param) {
    if (!dispatherManager.customer_detail) {
      dispatherManager.customer_detail  = $.preload({
        url: 'main-subpage-custom-detail.html',
        id: 'main-subpage-custom-detail.html',
        styles: {
          "render": "always",
          "popGesture": "hide"
        }
      });
      if (callback) {
        callback(param);
      }
    }
  };
  
  dispatherManager.toCustomerDetail = function(customerInfo) {
    if (!dispatherManager.customer_detail) {
      dispatherManager.initCustomerDetail(dispatherManager.toCustomerDetail,customerInfo);
      return;
    }
    //触发子窗口变更客户详情
    mui.fire(dispatherManager.customer_detail, 'get_customer_detail', {
      customerInfo: customerInfo
    });

    //更改详情页原生导航条信息
//  titleNView.titleText = item.title;
//  dispatherManager.customer_detail.setStyle({
//    "titleNView": titleNView
//  });

    setTimeout(function () {
      dispatherManager.customer_detail.show("slide-in-right", 300);
    },150);
    
    /* 老版本处理 zhangafa 10/27 注释
    $.openWindow({
      "id": 'main-subpage-custom-detail.html',
      "url": 'main-subpage-custom-detail.html',
      extras: {
        customerInfo: customerInfo,
      },
      show: {
        auto: true,
        aniShow: 'slide-in-right',
        duration: 200
      },
      waiting: {
        auto: true,
        title: '正在加载...'
      }
    });
    */
  }

  /**
   * 调到系统详情页
   */
  dispatherManager.toSystemDetail = function(systemId, titleValue, systemIconCss, domians) {
    $.openWindow({
      "id": 'main-subpage-system-detail.html',
      "url": 'main-subpage-system-detail.html',

      extras: {
        systemId: systemId,
        titleValue: titleValue,
        systemIconCss: systemIconCss,
        domians: domians
      },
      show: {
        auto: true,
        aniShow: 'slide-in-right',
        duration: 200
      },
      waiting: {
        auto: true,
        title: '正在加载...'
      }
    });
  }

  /**
   * 跳转到意见反馈页
   */
  dispatherManager.toFeedback = function() {

    $.openWindow({
      "id": 'feedback-detail',
      "url": 'feedback-detail.html',
      show: {
        auto: true,
        aniShow: 'pop-in',
        duration: 200
      },
      waiting: {
        auto: true,
      }
    });
  }

  /**
   * 跳转到历史测试数据
   */
  dispatherManager.toDeviceHistoryData = function(kpiCode, nodeId, testName) {
    $.openWindow({
      "id": 'device-history-data',
      "url": 'device-history-data.html',
      extras: {
        kpiCode: kpiCode,
        nodeId: nodeId,
        testName: testName
      },
      show: {
        auto: true,
        aniShow: 'pop-in',
        duration: 200
      },
      waiting: {
        auto: true,
      }
    });
  }

  /**
   * 跳转到工单执行历史
   */
  dispatherManager.toOrderHistory = function(ticketInfo) {
    $.openWindow({
      "id": 'main-subpage-order-history.html',
      "url": 'main-subpage-order-history.html',
      extras: {
        ticketInfo: ticketInfo
      },
      show: {
        auto: true,
        aniShow: 'slide-in-right',
        duration: 200
      },
      waiting: {
        auto: true,
        title: '正在加载...'
      }
    });
  }
  /**
   * 跳转到工单执行
   */
  dispatherManager.toAction = function(infos) {
    $.openWindow({
      "id": 'main-subpage-order-action.html',
      "url": 'main-subpage-order-action.html',
      extras: {
        infos: infos
      },
      show: {
        auto: true,
        aniShow: 'slide-in-right',
        duration: 200
      },
      waiting: {
        auto: true,
        title: '正在加载...'
      }
    });
  }
   /**
   * 跳转到发起工单
   */
  dispatherManager.toSendOrder = function() {
    $.openWindow({
      "id": 'main-subpage-sendOrder.html',
      "url": 'main-subpage-sendOrder.html',
      show: {
        auto: true,
        aniShow: 'slide-in-right',
        duration: 200
      },
      waiting: {
        auto: true,
        title: '正在加载...'
      }
    });
  }
  /**
   * 跳转到指令发送
   */
  dispatherManager.toOrder = function(modelId,deviceId) {
    $.openWindow({
      "id": 'main-subpage-directives.html',
      "url": 'main-subpage-directives.html',
       extras: {
        modelId:modelId,
        deviceId:deviceId
      },
      show: {
        auto: true,
        aniShow: 'slide-in-right',
        duration: 200
      },
      waiting: {
        auto: true,
        title: '正在加载...'
      }
    });
  }

})(mui, common, window.dispatherManager = {})