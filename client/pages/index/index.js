//index.js
var moment = require('../../vendor/moment.min.js')
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({
  data: {
    bgImgSrc: '../../assets/common/index-bg.png',
    semesterList: [],
    todayStr: util.formatDate(),
    formatTime: util.formatTime
  },
  onLoad: function(){
    getApp().ready((data) => {
      this.setData({
        logged: data.logged,
        userInfo: data.userInfo,
      })
      this.doRequest()
    })
  },
  doRequest: function () {
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    var options = {
      url: config.service.semesterListUrl,
      login: true,
      success (result) {
        console.log('request success', result)
        result.data.forEach(item => {
          item.beginDateStr = util.formatTime(item.beginDate)
          item.durationDay = moment(item.endDate).diff(moment(item.beginDate), 'days') + 1
          item.currentDay = moment(that.data.userInfo.serverTime).diff(moment(item.beginDate), 'days') + 1
        })
        that.setData({
          semesterList: result.data
        })
      },
      fail (error) {
        console.log('request fail', error);
      },
      complete: function(){
        wx.hideLoading()
      }
    }
    qcloud.request(options)
  },

  goSemesterHome: function(e){
    wx.setStorageSync('currentSemester', e.currentTarget.dataset.target)
    wx.switchTab({
      url: '/pages/home/home'
    })
  }
})
