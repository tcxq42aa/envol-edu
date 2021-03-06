// pages/uc/uc.js
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
    time: '08:00'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.firstLoad = true
    wx.getStorage({
      key: 'reminder',
      success: (res) => {
        this.setData({ time: res.data })
      },
    })
    getApp().ready((data) => {
      this.setData({
        logged: data.logged,
        userInfo: data.userInfo
      })
      wx.getStorage({
        key: 'currentSemester',
        success: (res) => {
          this.initData(res.data.id)
          this.setData({
            semesterId: res.data.id
          })
        },
      })
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (!this.firstLoad) {
      this.initData(this.data.semesterId, true)
    }
  },

  initData: function (semesterId, slient) {
    service.getSemesterDetail.bind(this)(semesterId, slient, ({ statistical }) => {
      this.setData({
        mots: statistical.map((o) => o.wordsTotal).reduceRight((a,b) => a + b, 0),
        fois: statistical.length
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
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
  
  // },

  bindTimeChange: function (e) {
    const time = e.detail.value.split(':')
    const reminderHour = parseInt(time[0])
    const reminderMinute = parseInt(time[1])
    const differenceMinute = new Date().getTimezoneOffset()
    
    wx.showLoading({
      title: '加载中',
    })
    const { openId } = getApp().globalData.userInfo
    var that = this
    var options = {
      method: 'PUT',
      url: `${config.service.reminderUrl}?openId=${openId}&reminderHour=${reminderHour}&reminderMinute=${reminderMinute}&differenceMinute=${differenceMinute}`,
      login: true,
      success(result) {
        console.log('request success', result)
        wx.setStorage({
          key: 'reminder',
          data: e.detail.value,
        })
        that.setData({ time: e.detail.value })
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

  toWebPage: function(e) {
    const mId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/web/web?mId=' + mId,
    })
  },

  handleKefu: function() {
    wx.showModal({
      title: '',
      content: '不急请直接微信留言给Vovo，耐心等待回复。急的话可以直接电话Vovo哦。',
      confirmText: '直接联系',
      success: function (res) {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: '15601720679'
          })
        }
      }
    })
  },

  openSetting: function () {
    if (this.interval) {
      this.hint = this.hint || 0;
      this.hint++;
      clearTimeout(this.interval)
    }
    if (this.hint >= 5) {
      this.hint = 0;
      this.getUserInfo((user) => {
        if (user.admin) {
          var admin = wx.getStorageSync('admin');
          wx.showActionSheet({
            itemList: admin ? ['学员模式', '设置复习日'] : ['管理员模式', '设置复习日'],
            success: function (res) {
              if(res.tapIndex == 0) {
                wx.setStorage({
                  key: 'admin',
                  data: !admin
                });
                if (admin) {
                  wx.removeStorage({
                    key: 'reviewWeekDay'
                  })
                }
                wx.reLaunch({
                  url: '/pages/index/index',
                });
              } else {
                wx.showActionSheet({
                  itemList: ['星期一', '星期二', '星期三', '星期四', '星期五'],
                  success: function (res) {
                    wx.setStorage({
                      key: 'reviewWeekDay',
                      data: res.tapIndex + 1
                    });
                    wx.reLaunch({
                      url: '/pages/index/index',
                    });
                  }
                })
              }
            },
            fail: function (res) {
              console.log(res.errMsg)
            }
          })
        }
      });
      return;
    }
    this.interval = setTimeout( () => {
      this.hint = 0;
      let that = this;
      wx.openSetting({
        success: function (res) {
          if (res.authSetting['scope.userInfo']) {
            getApp().ready(() => {
              wx.getStorage({
                key: 'currentSemester',
                success: (res) => {
                  that.initData(res.data.id)
                  that.setData({
                    semesterId: res.data.id
                  })
                },
              })
            })

          }
        },
        fail: function (res) { },
        complete: function (res) { },
      })
    }, 300);
  },

  getUserInfo(cb) {
    const { openId } = getApp().globalData.userInfo
    var that = this
    var options = {
      url: `${config.service.userInfoUrl}?openId=${openId}`,
      success(result) {
        console.log('request success', result)
        cb && cb(result.data);
      },
      fail(error) {
        console.log('request fail', error);
      },
      complete: function () {
      }
    }
    qcloud.request(options)
  }
})