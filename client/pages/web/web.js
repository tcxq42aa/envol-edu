// pages/web/web.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var WxParse = require('../../vendor/wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const mId = options.mId;
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    var options = {
      url: `${config.service.articleUrl}/${mId}`,
      login: true,
      success(result) {
        console.log('request success', result)
        WxParse.wxParse('content', 'html', result.data.content, that, 0);
      },
      fail(error) {
        console.log('request fail', error);
      },
      complete: function () {
        wx.hideLoading()
      }
    }
    qcloud.request(options)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  //onShareAppMessage: function () {
  
  // }
})