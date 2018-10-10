/**
 * Created by zlzsam on 5/4/2017.
 */
(function ($, doc) {

  var serverPhone = doc.getElementById('server-phone');
  var officialPhone = doc.getElementById('official-phone');

  $.plusReady(function () {

    init();

    function init() {
      var adminFlag = false;
      var userInfo = storageUtil.getUserInfo();
      //区分管理员和普通用户登录的区别
      if (null == userInfo.subDomain) {
        //若是管理员的话
        adminFlag = true;
      } else {
        //若是普通用户的话
        adminFlag = false;
      }

      var fbTable = doc.getElementById('fb-help');
      if (adminFlag) {
        var htmlCode = '<li id="official-phone1" class="mui-table-view-cell">' +
            '<a class="mui-navigate-right" data-title-type="native" href="#">官方客户电话(北京)</a></li>' +
          '<li id="official-phone2" class="mui-table-view-cell">' +
            '<a class="mui-navigate-right" data-title-type="native" href="#">官方客户电话(上海)</a></li>';

        fbTable.innerHTML = htmlCode;
        doc.getElementById('official-phone1').addEventListener('tap', function () {
          call(01084148079);
        });
        doc.getElementById('official-phone2').addEventListener('tap', function () {
          call(02168828631);
        });
      } else {
        var htmlCode2 = '<li id="server-phone" class="mui-table-view-cell">' +
          '<a class="mui-navigate-right" data-title-type="native" href="#">' +
          '服务人员电话</a></li>';

        fbTable.innerHTML = htmlCode2;
        doc.getElementById('server-phone').addEventListener('tap', function () {
          //TODO 电话号码待写入
          call(0000);
        });
      }

//    doc.getElementById('common-help-doc').addEventListener('tap', function () {
//
//    });

      doc.getElementById('feedback').addEventListener('tap', function () {
        dispatherManager.toFeedback();
      });
    }

    function call(number) {
      if (plus.os.name == "Android") {
        var Intent = plus.android.importClass("android.content.Intent");
        var Uri = plus.android.importClass("android.net.Uri");
        var main = plus.android.runtimeMainActivity();
        var uri = Uri.parse("tel:" + number);
        var call = new Intent("android.intent.action.CALL", uri);
        main.startActivity(call);
      } else {
        //plus.device.dial(number, false);
        var UIAPP = plus.ios.importClass("UIApplication");
        var NSURL = plus.ios.importClass("NSURL");

        var app = UIAPP.sharedApplication();

        app.openURL(NSURL.URLWithString("tel://" + number));
      }
    }

  })
}(mui, document))
