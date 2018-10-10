/**
 * Created by longzhen on 5/3/2017.
 */
(function ($, doc) {

  $.plusReady(function () {

    init();

    function init() {
      var redRadio = doc.body.querySelector('.skin-red-radio');
      var blueRadio = doc.body.querySelector('.skin-blue-radio');
      var greenRadio = doc.body.querySelector('.skin-green-radio');
      var dullGreyRadio = doc.body.querySelector('.skin-dullgrey-radio');
      var colorValue = storageUtil.getSkinColor();

      if(colorValue == '#D9544F'){
        redRadio.checked = true;
      }else if(colorValue == '#3C8DBC'){
        blueRadio.checked = true;
      }else if(colorValue == '#16A086'){
        greenRadio.checked = true;
      }else if(colorValue == '#3F4E63'){
        dullGreyRadio.checked = true;
      }else{
        blueRadio.checked = true;
      }
    }

    $('.mui-input-group').on('tap', 'div', function () {
      var type = this.getAttribute("color-type")
      selectSkinStyle(type);
    })

    function selectSkinStyle(type) {
      if (type == 'red') {
        sendSkinStyleBroadcast('#D9544F','../css/skin/skin-style-red.css');
      } else if (type == 'blue') {
        sendSkinStyleBroadcast('#3C8DBC','../css/skin/skin-style-blue.css');
      } else if (type == 'green') {
        sendSkinStyleBroadcast('#16A086','../css/skin/skin-style-green.css');
      } else if (type == 'dullgrey') {
        sendSkinStyleBroadcast('#3F4E63','../css/skin/skin-style-dullgrey.css');
      }
    }

    function sendSkinStyleBroadcast(colorValue, cssPath) {
      storageUtil.setSkinColor(colorValue);
      storageUtil.setSkinStyle(cssPath);
      var wvList = plus.webview.all();
      for (var i = 0, len = wvList.length; i < len; i++) {
        $.fire(wvList[i], 'CHANGE_SKIN_STYLE', {
          colorValue: colorValue,
          cssPath: cssPath
        });
      }
    }

  })

}(mui, document))

