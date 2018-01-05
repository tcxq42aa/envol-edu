// pages/audition/audition.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config.js')
var util = require('../../utils/util.js')
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
        WxParse.wxParse('thirdHandout', 'html', content.thirdHandout, that, 5);
        WxParse.wxParse('optHandout', 'html', content.optHandout, that, 5);
        if (that.data.currentStep == 1 && content.preAudio) {
          util.showToast("Tout écouter pour passer à l'étape suivante", 2500)
        }
      },

      fail(error) {
        // util.showModel('请求失败', error)
        console.log('request fail', error)
      },

      complete() {
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
   * 下一步
   */ 
  next: function() {
    this.setData({
      currentStep: this.data.currentStep + 1,
      fixed: true
    })
  },

  toggle: function(e) {
    var key = e.target.dataset.target
    this.setData({
      [key]: !this.data[key]
    })
  },

  /**
   * 音频播放结束
   */
  onPreAudioEnded: function() {
    var firstFinished = !!this.data.content.audios[0].finished
    this.setData({
      preAudioFinshed: true,
      firstFinished: firstFinished
    })
    
    if (!firstFinished) {
      util.showToast("Tout écouter pour passer à l'étape suivante", 3000)
    }
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
        if(hasPreAudio && !preAudioFinshed) {
          util.showToast("Tout écouter pour passer à l'étape suivante", 3000)
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
  },

  onAudioCycleEnded: function(e) {
    this.setData({
      audioCycleEnded: true
    })
  },

  onPreAudioReady: function (e) {
    this.preAudioCtx = e.detail.context
  },
  onAudioReady: function(e){
    this.audioCtx = e.detail.context
  },
  onPreAudioPlay: function (e) {
    this.audioCtx && this.audioCtx.pause()
  },
  onAudioPlay: function (e) {
    this.preAudioCtx && this.preAudioCtx.pause()
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
  },

  toMiniPro: function() {
    // wx.navigateToMiniProgram({
    //   appId: 'wxde736ea090d9d526',
    //   path: 'pages/user/home/home?courseId=1970&start_at=2017-12-12&end_time=2017-12-14',
    //   extraData: {
    //     foo: 'bar'
    //   },
    //   envVersion: 'release',
    //   success(res) {
    //     // 打开成功
    //   }
    // })
  },

  handleFinish: function(e){
    var t = e.target.dataset.type
    wx.navigateTo({
      url: '/pages/audition/result?type=' + (t || 1)
    })
  }
})