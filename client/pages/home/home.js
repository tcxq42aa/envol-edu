// pages/home/home.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var moment = require('../../vendor/moment.min')
import service from '../../utils/service'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    semesterPlans: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.firstLoad = true
    getApp().ready((data) => {
      this.setData({
        logged: data.logged,
        userInfo: data.userInfo
      })
      wx.getStorage({
        key: 'currentSemester',
        success: (res) => {
          this.initData(res.data.id, false)
          this.setData({
            semesterId: res.data.id
          })
        },
      })
    })
  },

  onShow: function(){
    if (!this.firstLoad) {
      this.initData(this.data.semesterId, true)
    }
    wx.getStorage({
      key: 'userInfo',
      success: (res) => {
        console.log(this.data.userInfo.avatarUrl);
        console.log(res.data.avatarUrl);
        this.setData({
          userInfo: res.data
        });
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {
  
  // },

  initData: function (semesterId, slient, cb, forceOnline){
    console.log('initData')
    service.getSemesterDetail.bind(this)(semesterId, slient, (res) => {
      cb && cb();
      let fmt = 'YYYY-MM-DD';
      res.semesterPlans.forEach(plan => {
        plan.isActive = (
          util.getCurrentTime(plan.beginDate).format(fmt) <= util.getCurrentTime(this.data.userInfo.serverTime).format(fmt)
          && 
          util.getCurrentTime(plan.endDate).format(fmt) >= util.getCurrentTime(this.data.userInfo.serverTime).format(fmt)
          );
        if (util.getCurrentTime(plan.beginDate).format(fmt) > util.getCurrentTime(this.data.userInfo.serverTime).format(fmt)) {
          plan.coverUrl = '../../assets/default-cover.png';
        }
      });
    }, forceOnline)
  },
  onTapPaper: function(e) {
    const today = util.getCurrentTime().day();
    if (!this.data.paper || this.data.errCode == 4041) {
      if(today == 5) {
        util.showToast("Il n'y pas de cours aujourd'hui. Clique le calendrier au-dessous pour passer au mode de RÉVISION.", 3000);
      }
      return;
    }

    let url;
    if (this.data.paper.type == 3) {
      url = '/pages/dictation/dictation?paperId=' + this.data.paper.id;
    } else if (this.data.paper.type == 2) {
      url = '/pages/test/test?paperId=' + this.data.paper.id;
    } else {
      url = '/pages/audition/select?paperId=' + this.data.paper.id;
    }
    wx.navigateTo({ url });
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
  // getPhoneNumber: function (e) {
  //   console.log(e.detail.errMsg)
  //   console.log(e.detail.iv)
  //   console.log(e.detail.encryptedData)
  //   wx.showLoading({
  //     title: '加载中',
  //   })
  //   var that = this
  //   var options = {
  //     url: config.service.decodePhoneNumberUrl,
  //     header: {
  //       'x-wx-encrypted-data': e.detail.encryptedData || '',
  //       'x-wx-iv': e.detail.iv || ''
  //     },
  //     login: true,
  //     success(result) {
  //       console.log('request success', result)
  //     },
  //     fail(error) {
  //       console.log('request fail', error);
  //     },
  //     complete: function () {
  //       wx.hideLoading()
  //     }
  //   }
  //   qcloud.request(options)
  // } ,

  onPullDownRefresh: function(e){
    this.initData(this.data.semesterId, true, (d) => {
      wx.stopPullDownRefresh()
    }, true)
  },

  openSetting: function () {
    let that = this;
    wx.openSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          getApp().ready(()=>{
            that.initData(that.data.semesterId, true)
          })
        }
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  }
})