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
    semesterPlans: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    getApp().ready((data) => {
      this.setData({
        logged: data.logged,
        userInfo: data.userInfo,
      })
      wx.getStorage({
        key: 'currentSemester',
        success: (res) => {
          this.initData(res.data)
          this.setData({
            semesterId: res.data
          })
        },
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
        readToday: util.getCurrentDate()
      },
      login: true,
      success(result) {
        console.log('request success', result)
        if (result.data.code == 4041) {
          that.setData({errCode: 4041})
          return
        }
        let { semesterPlans, paper, statistical } = result.data.data;
        semesterPlans.forEach( item => {
          let begin = moment(item.beginDate).utc().utcOffset(8)
          let end = moment(item.endDate).utc().utcOffset(8)
          item.dateStr = util.formatDate2(begin) + ' - ' + util.formatDate2(end)
        })
        that.setData({
          statistical, semesterPlans, paper
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
    if(!this.data.paper) {
      return;
    }
    wx.navigateTo({
      url: '/pages/audition/audition?paperId=' + this.data.paper.id,
    })
  },
  onEnroll: function () {
    var that = this
    qcloud.request({
      method: 'POST',
      data: {
        openId: getApp().globalData.userInfo.openId
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      url: config.service.payUrl.replace('{semesterId}', this.data.semesterId),
      login: true,
      success(result) {
        if (result.statusCode === 200) {
          var config = result.data
          wx.requestPayment({
            'timeStamp': config.timeStamp,
            'nonceStr': config.nonceStr,
            'package': config.pkg,
            'signType': config.signType,
            'paySign': config.paySign,
            'success': function (res) {
              if (res.errMsg == 'requestPayment:ok') {
                that.initData(that.data.semesterId)
              }
            },
            'fail': function (res) {
            }
          })
        } else {
          if (result.statusCode === 417) {
            wx.showModal({
              title: '已报名'
            })
          }
        }

      },

      fail(error) {
        // util.showModel('请求失败', error)
        console.log('request fail', error)
      },

      complete() {
      }
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