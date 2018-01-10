// pages/home/home.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var moment = require('../../vendor/moment.min')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    logged: false,
    userInfo: {},
    paperList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.getStorage({
      key: 'currentSemester',
      success: (res) => {
        this.initData(res.data)
      },
    })
    getApp().ready((data) => {
      this.setData({
        logged: data.logged,
        userInfo: data.userInfo,
      })
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },

  initData: function (semesterId){
    wx.showLoading({
      title: '加载中',
    })
    const { serverTime, openId } = getApp().globalData.userInfo
    var that = this
    var options = {
      method: 'POST',
      url: config.service.todayUrl,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: {
        openId,
        semesterId,
        readToday: moment(serverTime).format('YYYY-MM-DD')
      },
      login: true,
      success(result) {
        console.log('request success', result)
        
        result.data.data.papers.forEach( item => {
          item.content = JSON.parse(item.content)
          item.dateStr = moment(item.readToday).format('MM-DD-YYYY')
        })
        that.setData({
          paperList: result.data.data.papers
        })
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
  onTapPaper: function(e) {
    wx.navigateTo({
      url: '/pages/audition/audition?paperId=' + e.currentTarget.dataset.id,
    })
  },
  getPhoneNumber: function (e) {
    console.log(e.detail.errMsg)
    console.log(e.detail.iv)
    console.log(e.detail.encryptedData)
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    var options = {
      url: config.service.decodePhoneNumberUrl,
      header: {
        'x-wx-encrypted-data': e.detail.encryptedData || '',
        'x-wx-iv': e.detail.iv || ''
      },
      login: true,
      success(result) {
        console.log('request success', result)
      },
      fail(error) {
        console.log('request fail', error);
      },
      complete: function () {
        wx.hideLoading()
      }
    }
    qcloud.request(options)
  } 
})