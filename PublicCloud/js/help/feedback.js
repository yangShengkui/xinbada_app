/**
 * Created by zlzsam on 5/5/2017.
 */
(function ($, doc) {

  $.plusReady(function () {

    doc.getElementById('id-commit-btn').addEventListener('tap', function () {
      var fbContent = doc.getElementById('id-feedback-tt').value;
      var phone = doc.getElementById('id-feeback-phone').value;

      if (fbContent == "") {
        plus.nativeUI.toast('反馈内容不能为空，请填写！');
        return;
      }
      if (phone == "") {
        plus.nativeUI.toast('请填写你的联系方式！');
        return;
      }

      //TODO 把内容提交到云端

    });
  })

}(mui, document))