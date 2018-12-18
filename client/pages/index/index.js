//index.js
var moment = require('../../vendor/moment.min.js')
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({
  data: {
    userInfo: {},
    bgImgSrc: '../../assets/common/index-bg.png',
    semesterList: [],
    todayStr: util.formatDate(),
    formatTime: util.formatTime
  },
  onLoad: function(){
    // this.doRequest();
  },
  onShow: function(){
    this.doRequest();
    wx.getStorage({
      key: 'userInfo',
      success: (res) => {
        this.setData({
          userInfo: res.data
        });
      }
    })
  },
  doRequest: function (cb) {
    getApp().ready((data) => {
      this.setData({
        logged: data.logged,
        userInfo: data.userInfo
      })
      wx.showLoading({
        title: '加载中',
      })
      var that = this
      var options = {
        url: config.service.semesterListUrl,
        data: {
          openId: data.userInfo.openId
        },
        login: true,
        success(result) {
          console.log('request success', result)
          result.data.forEach(item => {
            item.beginDateStr = util.formatTime(item.beginDate)
            item.durationDay = moment(item.endDate).diff(moment(item.beginDate), 'days') + 1
            item.currentDay = moment(that.data.userInfo.serverTime).diff(moment(item.beginDate), 'days') + 1
            item.currentDay = Math.min(item.currentDay, item.durationDay)
          })
          that.setData({
            semesterList: result.data
          })
          setTimeout(() => {
            cb && cb();
          }, 100);
        },
        fail(error) {
          console.log('request fail', error);
        },
        complete: function () {
          wx.hideLoading()
        }
      }
      qcloud.request(options)
    })
  },

  goSemesterHome: function(e){
    wx.setStorageSync('currentSemester', e.currentTarget.dataset.target)
    wx.switchTab({
      url: '/pages/home/home'
    })
  },

  openSetting: function(){
    let that = this;
    wx.openSetting({
      success: function(res) {
        if (res.authSetting['scope.userInfo']) {
          that.doRequest()
        }
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },

  onPullDownRefresh: function (e) {
    this.doRequest((d) => {
      wx.stopPullDownRefresh()
    }, true)
  },
})
