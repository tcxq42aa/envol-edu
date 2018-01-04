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
    wx.showLoading({
      title: '加载中',
    })
    qcloud.request({
      url: config.service.paperUrl + '/' + (options.paperId || 4),
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
        WxParse.wxParse('handout', 'html', content.handout, that, 5);
        WxParse.wxParse('optHandout', 'html', content.optHandout, that, 5);
        if(content.preAudio) {
          wx.showModal({
            title: '',
            content: "Tout écouter pour passer à l'étape suivante",
            showCancel: false,
            confirmText: '我知道了'
          })
        }
      },

      fail(error) {
        // util.showModel('请求失败', error)
        console.log('request fail', error)
      },

      complete() {
        wx.hideToast()
        wx.hideLoading()
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // console.log(123123)
    // wx.canvasToTempFilePath({
    //   x: 100,
    //   y: 200,
    //   width: 50,
    //   height: 50,
    //   destWidth: 100,
    //   destHeight: 100,
    //   canvasId: 'myCanvas',
    //   success: function (res) {
    //     console.log(res.tempFilePath)
    //   },
    //   fail: function (err) {
    //     console.log(err)
    //   }
    // })
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
  },

  toggle: function(e) {
    this.setData({
      opened: !this.data.opened
    })
  },

  /**
   * 音频播放结束
   */
  onPreAudioEnded: function() {
    this.setData({
      preAudioFinshed: true,
      firstFinished: this.data.content.audios[0].finished
    })
  },
  onAudioEnded: function(e) {
    switch (this.data.currentStep) {
      case 1:
        var hasPreAudio = this.data.content.preAudio
        this.data.content.audios[0].finished = true;
        var preAudioFinshed = this.data.preAudioFinshed
        if ((!hasPreAudio || preAudioFinshed)) {
          this.setData({
            firstFinished: true
          })
        }
        break
      case 2:
        this.setData({
          secondFinished: true
        })
        break
      case 4:
        this.setData({
          optFinished: true
        })
        break
    }
    if(this.data.currentStep == 3) {
      return
    }
    // var idx = e.target.dataset.idx
    // var disabled = true;
    // this.data.content.audios[idx].finished = true
    // if (this.data.content.audios.filter((audio) => audio.finished).length == this.data.content.audios.length) {
    //   disabled = false
    // }
    // this.setData({
    //   disabled: disabled,
    //   currentStep: disabled ? 1 : 2,
    //   content: { ...this.data.content }
    // })
    // if (!disabled && !this.data.isOptional) {
    //   wx.pageScrollTo({
    //     scrollTop: 99999
    //   })
    // }
  },

  onAudioCycleEnded: function(e) {
    this.setData({
      audioCycleEnded: true
    })
  },

  toOpt: function(){
    // this.data.content.audios = this.data.content.optAudios
    this.setData({
      currentStep: 4,
      // isOptional: true,
      // content: { ...this.data.content }
    })
    wx.pageScrollTo({
      scrollTop: 0
    })
  }
})