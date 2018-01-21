// pages/dictation/dictation.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config.js')
var util = require('../../utils/util.js')
var moment = require('../../vendor/moment.min')
var WxParse = require('../../vendor/wxParse/wxParse.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentStep: 1,
    opened: [false, false],
    paper: {},
    dateStr: util.formatDate()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      paperId: options.paperId
    });
    app.ready((data) => {
      this.setData({
        serverTime: data.userInfo.serverTime
      });
      this.initPageData();
    })
  },

  initPageData: function (cb) {
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    let url = '';
    if (that.data.paperId) {
      url = config.service.paperUrl + '/' + that.data.paperId;
    }
    qcloud.request({
      url: url,
      login: true,
      success(result) {
        if (result.statusCode != 200) {
          if (result.data.code == 4042) {
            wx.showModal({
              title: '提示',
              content: '该课程已删除',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  wx.navigateBack({
                    delta: 1
                  })
                }
              }
            })
          }
          return
        }
        let content = JSON.parse(result.data.content);
        content.audios = content.audios.slice(0, 2);
        let dictationAnswerHtmls = [];
        content.audios.forEach((audio, idx) => {
          audio.key = Math.random() * 100000
          WxParse.wxParse('dictationAnswer_' + idx, 'html', audio.dictationAnswer, that, 5);
          dictationAnswerHtmls.push(that.data['dictationAnswer_' + idx]);
        })
        that.setData({
          paper: result.data,
          content: content,
          dictationAnswerHtmls: dictationAnswerHtmls,
          currentHour: util.getCurrentTime().hour()
        })
        
      },

      fail(error) {
        // util.showModel('请求失败', error)
        console.log('request fail', error)
      },

      complete() {
        wx.hideLoading()

        console.log(that.data);
      }
    })
  },

  onAudioReady: function (e) {
    this.preAudioCtx = this.audioCtx
    this.audioCtx = e.detail.context
  },

  onAudioPlay: function (e) {
    this.preAudioCtx && this.preAudioCtx.pause()
  },

  onAudioEnded: function (e) {
    console.log(e)
    const audios = this.data.content.audios;
    audios[e.currentTarget.dataset.idx].finished = true;
    if (audios.filter(audio => audio.finished).length == audios.length) {
      this.setData({
        allFinished: true
      })
    }
  },

  toggle: function (e) {
    const { readToday } = this.data.paper;
    const publishTime = util.getCurrentTime(readToday).hour(21);
    const now = util.getCurrentTime();
  
    if (now.isBefore(publishTime)) {
      util.showToast('九点以后解锁答案', 2000);
      return;
    }

    var idx = e.target.dataset.target
    this.data.opened[idx] = !this.data.opened[idx];
    this.setData({
      opened: this.data.opened
    })
  },

  handleFinish: function(){
    var that = this
    const { serverTime, openId } = getApp().globalData.userInfo
    const readToday = util.getCurrentDate(this.data.paper.readToday)

    var options = {
      url: config.service.finishUrl.replace('{paperId}', that.data.paper.id),
      method: 'POST',
      data: { openId, readToday, wordsTotal: this.data.paper.wordsTotal },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      login: true,
      success(result) {
        console.log('request success', result)
      },
      fail(error) {
        console.log('request fail', error);
      }
    }
    if (this.data.noLimited) { // 复习模式
      options.url = config.service.reviewUrl.replace('{paperId}', that.data.paper.id);
    }
    wx.getStorage({
      key: 'currentSemester',
      success: (res) => {
        options.data.semesterId = res.data.id;
        qcloud.request(options)
        wx.navigateBack({
          delta: 1
        })
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
    if (this.data.serverTime) {
      this.setData({
        currentHour: util.getCurrentTime().hour()
      })
    }
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
  // onShareAppMessage: function () {
  
  // }
})