// pages/test/test.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config.js')
var util = require('../../utils/util.js')
var WxParse = require('../../vendor/wxParse/wxParse.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    current: 0,
    correctPercent: 0,
    showResult: false,
    dateStr: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      paperId: options.paperId
    })
    app.ready(() => {
      this.initPageData();
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },
  initPageData: function (cb) {
    var that = this, url = '';
    wx.showLoading({
      title: '加载中',
    })
    
    qcloud.request({
      url: config.service.paperUrl + '/' + that.data.paperId,
      method: 'GET',
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
        let paperContent = {}, exerciseList = [];
        try {
          exerciseList = JSON.parse(result.data.content).exerciseList;
          exerciseList.forEach((exercise, idx) => {
            WxParse.wxParse('exercise_' + idx, 'html', exercise.title, that, 5);
            exercise.html = that.data['exercise_' + idx];
          })
          console.log(exerciseList);
        } catch (e) {
          console.log(e);
        }
        that.setData({
          paper: result.data,
          dateStr: util.formatDate3(util.getCurrentTime(result.data.readToday)),
          exerciseList
        })
        cb && cb()
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
  select(e) {
    let exercise = e.currentTarget.dataset.exercise;
    let optionIndex = e.currentTarget.dataset.subindex;
    let index = e.currentTarget.dataset.index;
    this.data.exerciseList[index].testIdx = optionIndex;
    this.setData({
      exerciseList: this.data.exerciseList
    })
    // console.log(exercise, optionIndex)
    // item.testIdx = idx
    // this.$set(this.data.e, index, item)
  },
  next() {
    if (this.data.current < this.data.exerciseList.length - 1) {
      this.setData({
        current: this.data.current + 1
      })
    } else {
      this.setData({ showResult: true })
      this.calculate();
      console.log('完成');
    }
  },
  prev() {
    if (this.data.current > 0) {
      this.setData({
        current: this.data.current - 1
      })
    } else {
      console.log('完成');
    }
  },
  //计算结果 
  calculate() {
    const correct = this.data.exerciseList.filter((exercise) => {
      return exercise.answer == exercise.testIdx;
    });
    this.setData({
      correctPercent: Math.round(correct.length / this.data.exerciseList.length * 100)
    })
  },

  handleFinish() {
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
        wx.navigateToMiniProgram({
          appId: res.data.appId,
          path: res.data.appPath,
          envVersion: 'release',
          success(res) {
            // 打开成功
            console.log(res)
          },
          fail(res) {
            // 打开成功
            console.log(res)
          }
        })
      }
    })
  }
})