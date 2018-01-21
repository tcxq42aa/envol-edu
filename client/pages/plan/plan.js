// pages/plan/plan.js
import service from '../../utils/service'
import util from '../../utils/util'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mode: 1,
    userInfo: {},
    semesterPlans: [],
    statisticalMap: {},
    reviewStatisticalMap: {},
    weekIdxs: [0, 1, 2, 3, 4, 5, 6],
    weekDays: util.simpleWeekDays,
    emptyDays: 0,
    daysInMonth: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.firstLoad = true
    getApp().ready((data) => {
      const today = util.getCurrentTime();
      const monthStr = util.monthArr[util.getCurrentTime().month()].upperFirst();
      const emptyDays = util.getCurrentTime().date(1).day();
      let daysInMonth = util.getCurrentTime().daysInMonth();

      daysInMonth = new Array(daysInMonth).fill(0).map((day, i) => {
        return {
          finished: false,
          finished2: false,
          unfinished: false,
          dateStr: today.date(i + 1).format('YYYY-MM-DD')
        }
      })

      this.setData({
        logged: data.logged,
        userInfo: data.userInfo,
        monthStr: monthStr,
        emptyDays: emptyDays,
        daysInMonth: daysInMonth
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

  initData: function (semesterId, slient, cb) {
    service.getSemesterDetail.bind(this)(semesterId, slient, (data) => {
      let tmpMap = {};
      data.statistical.forEach( item => {
        tmpMap[util.getCurrentDate(item.readToday)] = util.getCurrentDate(item.createTime)
      })
      this.setData({
        beginDate: util.getCurrentDate(data.semester.beginDate),
        endDate: util.getCurrentDate(Math.min(data.semester.endDate, util.getCurrentTime())),
        statisticalMap: tmpMap
      })
      cb && cb();
    })
  },

  initReviewData: function (semesterId) {
    service.getReviewData.bind(this)(semesterId, true, (data) => {
      let tmpMap = {};
      data.forEach(item => {
        tmpMap[util.getCurrentDate(item.readToday)] = true
      })
      this.setData({
        reviewStatisticalMap: tmpMap
      })
    })
  },

  goCourseDetail: function(e) {
    const { active, date } = e.currentTarget.dataset;
    if (!active) {
      return;
    }
    wx.navigateTo({
      url: '/pages/audition/audition?date=' + date + '&semesterId=' + this.data.semesterId + '&mode=' + this.data.mode
    })
  },

  switchMode(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({ mode });
    if (mode == 2 && this.data.semesterId) {
      this.initReviewData(this.data.semesterId);
    }
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
    this.initData(this.data.semesterId, true, (d) => {
      wx.stopPullDownRefresh()
    }, true)
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
  
  // }
})