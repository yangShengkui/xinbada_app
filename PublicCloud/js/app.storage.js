/**
 * @author longzhen
 * @description 业务中使用本地存储
 */
(function ($, com, storageUtil) {

  //皮肤CSS的保存
  var KEY_SKIN_STYLE_CSS = "_key_skin_style_css";

  //皮肤颜色的保存
  var KEY_SKIN_STYLE_COLOR = "_key_skin_style_color";

  //用户信息
  var KEY_USER_INFO = "_key_user_info";

  //关于管理域的所有的设备信息
  var KEY_DOMAIN_ALL_DEVICE_INFO = "_key_domain_all_device_info";

  //所有客户信息的保存
  var KEY_ALL_CUSTOMER_INFO = "_key_all_customer_info";

  //所有告警信息的保存
  var KEY_ALL_WARNING_INFO = "_key_all_warning_info";

  //首页所有信息的保存
  var KEY_ALL_HOME_INFO = "_key_all_home_info";

  //全局变量
  var KEY_ALL_INFO = "_key_all_info";

  /**
   * 设置皮肤Color
   * @param skinColor
   */
  storageUtil.setSkinColor = function (skinColor) {
    appStorage.setItem(KEY_SKIN_STYLE_COLOR, skinColor);
  }

  /**
   * 获取皮肤颜色
   */
  storageUtil.getSkinColor = function () {
    return appStorage.getItem(KEY_SKIN_STYLE_COLOR);
  }

  /**
   * 设置皮肤CssPatch
   * @param skinStyle
   */
  storageUtil.setSkinStyle = function (skinStyle) {
    appStorage.setItem(KEY_SKIN_STYLE_CSS, skinStyle);
  }

  /**
   * 获取皮肤CssPatch
   * @param skinStyle
   */
  storageUtil.getSkinStyle = function () {
    return appStorage.getItem(KEY_SKIN_STYLE_CSS);
  }

  /**
   * 设置用户信息
   * @param userInfo
   */
  storageUtil.setUserInfo = function (userInfo) {
    appStorage.setItem(KEY_USER_INFO, userInfo);
  }

  /**
   * 获取用户信息
   */
  storageUtil.getUserInfo = function () {
    return appStorage.getItem(KEY_USER_INFO);
  }

  /**
   * 设置所有的设备信息
   * @param devicesInfo
   */
  storageUtil.setAllDevicesInfoList = function (devicesInfos) {
    appStorage.setItem(KEY_DOMAIN_ALL_DEVICE_INFO, devicesInfos);
  }

  /**
   * 获取所有的设备信息
   */
  storageUtil.getAllDevicesInfoList = function () {
    return appStorage.getItem(KEY_DOMAIN_ALL_DEVICE_INFO);
  }

  /**
   * 设置所有的客户信息
   * @param customerInfos
   */
  storageUtil.setAllCustomersInfoList = function (customerInfos) {
    appStorage.setItem(KEY_ALL_CUSTOMER_INFO, customerInfos);
  }

  /**
   * 获取所有的所有的客户信息
   */
  storageUtil.getAllCustomersInfoList = function () {
    return appStorage.getItem(KEY_ALL_CUSTOMER_INFO);
  }

  /**
   * 设置所有的告警信息
   * @param alertInfo
   */
  storageUtil.setAllAlertInfoList = function (alertInfo) {
    appStorage.setItem(KEY_ALL_WARNING_INFO, alertInfo);
  }

  /**
   * 获取所有的告警信息
   */
  storageUtil.getAllAlertInfoList = function () {
    return appStorage.getItem(KEY_ALL_WARNING_INFO);
  }

  /**
   * 设置所有的首页信息
   * @param homeInfo
   */
  storageUtil.setAllHomeInfo = function (homeInfo) {
    appStorage.setItem(KEY_ALL_HOME_INFO, homeInfo);
  }

  /**
   * 获取所有的首页信息
   */
  storageUtil.getAllHomeInfo = function () {
    return appStorage.getItem(KEY_ALL_HOME_INFO);
  }

  /**
   * 设置全局变量信息
   * @param info
   */
  storageUtil.setAllInfo = function (info) {
    appStorage.setItem(KEY_ALL_INFO, info);
  }

  /**
   * 获取全局变量信息
   */
  storageUtil.getAllInfo = function () {
    return appStorage.getItem(KEY_ALL_INFO);
  }

})(mui, common, window.storageUtil = {})