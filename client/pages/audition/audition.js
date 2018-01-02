// pages/audition/audition.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config.js')
var WxParse = require('../../vendor/wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentStep: 1,
    disabled: true, // 按钮禁用
    fixed: true, // 按钮悬浮
    classNames: '',
    opened: false,
    isOptional: false,
    paper: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    qcloud.request({
      url: config.service.paperUrl + '/' + options.paperId,
      login: true,
      success(result) {
        let content = JSON.parse(result.data.content);
        content.audios.forEach(audio => {
          audio.key = Math.random() * 100000
        })
        content.optAudios.forEach(audio => {
          audio.key = Math.random() * 100000
        })
        that.setData({
          paper: result.data,
          content: content
        })
        console.log(content)
        WxParse.wxParse('article', 'html', result.data.handout, that, 5);
      },

      fail(error) {
        // util.showModel('请求失败', error)
        console.log('request fail', error)
      },

      complete() {
        wx.hideToast()
      }
    })
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
  onShareAppMessage: function () {
  
  },

  /**
   * 下一步
   */ 
  next: function() {
    this.setData({
      currentStep: this.data.currentStep + 1,
      fixed: true
    })
    wx.pageScrollTo({
      scrollTop: 99999
    })
  },

  toggle: function(e) {
    this.setData({
      opened: !this.data.opened
    })
  },

  /**
   * 音频播放结束
   */
  onAudioEnded: function(e) {
    var idx = e.target.dataset.idx
    var disabled = true;
    this.data.content.audios[idx].finished = true
    if (this.data.content.audios.filter((audio) => audio.finished).length == this.data.content.audios.length) {
      disabled = false
    }
    this.setData({
      disabled: disabled,
      content: { ...this.data.content }
    })
  },

  toOpt: function(){
    this.data.content.cover = this.data.content.optCover
    this.data.content.audios = this.data.content.optAudios
    this.setData({
      currentStep: 1,
      isOptional: true,
      content: { ...this.data.content }
    })
  }
})