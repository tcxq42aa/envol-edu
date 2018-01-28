// pages/review/review.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config.js')
var util = require('../../utils/util.js')
var moment = require('../../vendor/moment.min')
var WxParse = require('../../vendor/wxParse/wxParse.js');
import service from '../../utils/service';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    opened: false,
    reviewOpened: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    this.setData({
      semesterId: options.semesterId,
      date: options.date
    });
    getApp().ready(() => {
      console.log('ready')
      this.initPageData()
    })
  },

  initPageData: function() {
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    let url = '', method = 'GET', data, header;
    if (that.data.semesterId) {
      url = config.service.todayPaperUrl;
      method = 'POST';
      data = {
        openId: getApp().globalData.userInfo.openId,
        semesterId: that.data.semesterId,
        readToday: that.data.date || util.getCurrentDate()
      }
      header = {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
    qcloud.request({
      url: url,
      data: data,
      header: header,
      method: method,
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
        // 跳转到听写
        // if (result.data.type == 3) {
        //   wx.showToast({
        //     title: '听写不能复习',
        //   })
        //   return;
        // }
        // 跳转到测试
        // if (result.data.type == 2) {
        //   wx.showToast({
        //     title: '测试不能复习',
        //   })
        //   return;
        // }
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
        WxParse.wxParse('reviewContent', 'html', content.reviewContent, that, 5);
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
  toggle: function (e) {
    var key = e.target.dataset.target
    this.setData({
      [key]: !this.data[key]
    })
  },
  onAudioReady: function (e) {
    this.preAudioCtx = this.audioCtx
    this.audioCtx = e.detail.context
  },

  onAudioPlay: function (e) {
    this.preAudioCtx && this.preAudioCtx.pause()
  },
  handleFinish: function() {
    var that = this
    const { serverTime, openId } = getApp().globalData.userInfo;

    service.sendFinish.bind(this)(
      this.data.paper.semesterId,
      this.data.paper.id,
      util.getCurrentDate(this.data.paper.readToday),
      this.data.paper.wordsTotal,
      true
    ).then( () => {
      wx.navigateBack({
        delta: -1
      });
    })
  }
})