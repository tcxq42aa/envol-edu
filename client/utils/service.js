var qcloud = require('../vendor/wafer2-client-sdk/index')
var config = require('../config')
var util = require('./util.js')
var moment = require('../vendor/moment.min')

export default {
  getSemesterDetail(semesterId, slient, cb = ()=>{}, forceOnline) {
    !slient && wx.showLoading({
      title: '加载中',
    })
    const that = this
    const { serverTime, openId } = getApp().globalData.userInfo
    const handlerResponse = (data) => {
      cb && cb(data);
      let { semester, semesterPlans, paper, statistical } = data;
      semesterPlans.forEach(item => {
        let begin = moment(item.beginDate).utc().utcOffset(8)
        let end = moment(item.endDate).utc().utcOffset(8)
        item.dateStr = util.formatDate2(begin) + ' - ' + util.formatDate2(end)
      })
      that.setData({
        statistical, semester, semesterPlans, paper, errCode: 0
      })
    }

    const cache = wx.getStorageSync('semester_detail_' + semesterId)
    if (cache && !forceOnline) {
      handlerResponse(cache)
    }
    
    const options = {
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
          that.setData({ errCode: 4041 })
          wx.redirectTo({
            url: '/pages/error/permision',
          })
          return
        }
        handlerResponse(result.data.data)
        wx.setStorage({
          key: 'semester_detail_' + semesterId,
          data: result.data.data,
        })
      },
      fail(error) {
        console.log('request fail', error);
      },
      complete: function () {
        !slient && wx.hideLoading()
        that.firstLoad = false
      }
    }
    qcloud.request(options)
  },

  getReviewData(semesterId, slient, cb = () => { }) {
    !slient && wx.showLoading({
      title: '加载中',
    })
    const that = this
    const { serverTime, openId } = getApp().globalData.userInfo
    const handlerResponse = (data) => {
      cb && cb(data);
    }

    const options = {
      method: 'GET',
      url: config.service.reviewStatisticalUrl,
      data: {
        openId,
        semesterId
      },
      login: true,
      success(result) {
        console.log('request success', result)
        handlerResponse(result.data)
      },
      fail(error) {
        console.log('request fail', error);
      },
      complete: function () {
        !slient && wx.hideLoading()
      }
    }
    qcloud.request(options)
  },

  /**
   * 完成当日学习
   * @semesterId 学期id
   * @paperId    试卷id
   * @readToday  试卷日期
   * @wordsTotal 试卷字数
   * @isReview   复习模式
   */
  sendFinish (semesterId, paperId, readToday, wordsTotal, isReview) {
    const that = this
    const promise = new Promise((resolve)=>{
      const { serverTime, openId } = getApp().globalData.userInfo

      var options = {
        url: (!isReview ? config.service.finishUrl : config.service.reviewUrl).replace('{paperId}', paperId),
        method: 'POST',
        data: {
          openId, readToday, wordsTotal, semesterId
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        login: true,
        success(result) {
          console.log('request success', result)
          resolve(result);
        },
        fail(error) {
          console.log('request fail', error);
          resolve(error);
        }
      }
      qcloud.request(options)
    });
    return promise;
  }
}