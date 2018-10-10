/**
 * Created by longzhen on 5/3/2017.
 */
(function ($, doc) {
  $.plusReady(function () {
    var skinCss;
    init();

    function init() {
      skinCss = doc.getElementById('skin-id-css');
      if (null == skinCss) {
        return;
      }
      var cssPatch = storageUtil.getSkinStyle();
      var colorValue = storageUtil.getSkinColor();
      if (null == cssPatch) {
        cssPatch = '../css/skin/skin-style-blue.css';
      }
      if (null == colorValue) {
        colorValue = '#3C8DBC';
      }
      skinCss.href = cssPatch;
      plus.navigator.setStatusBarBackground(colorValue);
    }

    function changeSkinStyle(colorValue, cssPath) {
      if (null != skinCss) {
        skinCss.href = cssPath;
        plus.navigator.setStatusBarBackground(colorValue);
      }
    }

    doc.addEventListener('CHANGE_SKIN_STYLE', function (event) {
      var colorValue = event.detail.colorValue;
      var cssPath = event.detail.cssPath;
      changeSkinStyle(colorValue, cssPath);
    })
  })

}(mui, document))

