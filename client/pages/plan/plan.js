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
    reviewWeekDay: 5, // 复习日
    weekDays: util.simpleWeekDays,
    emptyDays: 0,
    daysInMonth: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('plan onLoad')
    const reviewWeekDay = wx.getStorageSync('reviewWeekDay');
    if (reviewWeekDay) {
      this.setData({ reviewWeekDay: reviewWeekDay });
    }
    
    this.firstLoad = true
    getApp().ready((data) => {
      const today = util.getCurrentTime();
      const monthStr = util.monthArr[util.getCurrentTime().month()].upperFirst();
      const emptyDays = util.getCurrentTime().date(1).day();
      let daysInMonth = util.getCurrentTime().daysInMonth();

      daysInMonth = new Array(daysInMonth).fill(0).map((day, i) => {
        const t = today.date(i + 1);
        return {
          finished: false,
          finished2: false,
          unfinished: false,
          dateStr: t.format('YYYY-MM-DD'),
          dayofWeek: t.day()
        }
      })

      const now = util.getCurrentTime();
      
      this.setData({
        logged: data.logged,
        userInfo: data.userInfo,
        monthStr: monthStr,
        emptyDays: emptyDays,
        daysInMonth: daysInMonth
      })

      this.performAnimation();

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
  onShow: function (options) {
    if (!this.firstLoad) {
      this.initData(this.data.semesterId, true)
    }
    wx.getStorage({
      key: 'admin',
      success: (res) => {
        this.setData({ admin: res.data })
      },
    })
    if(this.mode == 2) {
      this.initReviewData(this.data.semesterId);
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
    if (!active && !this.data.admin) {
      return;
    }
    
    // 周五是复习日，不能进入课程主页
    const d = util.getCurrentTime(date).day();

    if (d == this.data.reviewWeekDay) {
      util.showToast('C’est le jour de révision. Vas-y!', 4000);
      return;
    }
    if (this.data.mode == 2 && (d == 6 || d == 0)) {
      return;
    }
    // 没完成的学习不能复习
    if (this.data.mode == 2 && !this.data.statisticalMap[date]) {
      util.showToast('Tu n’as pas fini la tâche de ce jour.', 4000);
      return;
    }

    let url = '/pages/audition/audition?date=' + date + '&semesterId=' + this.data.semesterId;
    if (this.data.mode == 2) {
      url = '/pages/review/review?date=' + date + '&semesterId=' + this.data.semesterId;
    }

    wx.navigateTo({
      url: url
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

  // 周五显示模式切换逻辑 
  performAnimation: function () {
    const today = util.getCurrentTime();
    const key = 'review_animation_' + today.format('YYYY-MM-DD');
    const that = this;
    this.setData({
      enableReview: today.day() == this.data.reviewWeekDay
    })
    wx.getStorage({
      key: key,
      success: function(res) {
        that.setData({ height: '72rpx' });
      },
      fail: function() {
        var animation = wx.createAnimation({
          transformOrigin: "50% 0%",
          duration: 300,
          timingFunction: "ease-out",
          delay: 300
        });
        animation.height('72rpx').step();
        that.setData({
          animationData: animation.export()
        });
        wx.setStorage({
          key: key,
          data: true,
        })
      }
    })
  }
})