// pages/audition/cover.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bgImgSrc: '../../assets/common/bg3-2.png'
  },

  onNav: function(){
    wx.navigateTo({
      url: '/pages/audition/audition'
    })
  },

  onPay: function(){
    qcloud.request({
      method: 'POST',
      data: {
        openId: getApp().globalData.userInfo.openId
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      url: config.service.payUrl.replace('{semesterId}', 4),
      login: true,
      success(result) {
        if(result.statusCode === 200) {
          var config = result.data
          wx.requestPayment({
            'timeStamp': config.timeStamp,
            'nonceStr': config.nonceStr,
            'package': config.pkg,
            'signType': config.signType,
            'paySign': config.paySign,
            'success': function (res) {
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})