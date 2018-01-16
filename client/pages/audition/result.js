// pages/audition/result.js
import service from '../../utils/service'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bgImgSrc: {
      '1': '../../assets/common/bg.png',
      '2': '../../assets/common/bg2-2.png'
    },
    bookImgSrc: {
      '1': '../../assets/common/bixiu.png',
      '2': '../../assets/common/xuanxiu.png'
    },
    shareImgSrc: {
      '1':'https://oss.edu.envol.vip/miniprogram/share-bg1.png',
      '2': 'https://oss.edu.envol.vip/miniprogram/share-bg2.png'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // options.type 1:必修；2:选修
    this.setData({
      type: options.type || '1',
      isNormal: options.isNormal
    })
    if(options.isNormal) {
      this.initData(() => {
        this.initCanvas()
      })
    } else {
      this.initCanvas()
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
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
  onShareAppMessage: function () {
    return {
      title: '邀请你参加ENVOL听力朗读课的试听',
      path:	'pages/audition/cover'
    }
  },

  initCanvas: function (cb, trace){
    var that = this
    var width = wx.getSystemInfoSync().windowWidth;
    var imgWidth = 966, imgHeight = 1350;
    var scale = width / imgWidth
    getApp().ready((data) => {
      var username = data.userInfo.nickName
      this.setData({ scale })
      wx.getImageInfo({
        src: this.data.shareImgSrc[this.data.type],
        success: function (res) {
          that.setData({canvasReady: true})
          var ctx = wx.createCanvasContext('firstCanvas')
          ctx.drawImage(res.path, 0, 0, imgWidth, imgHeight)
          ctx.setFontSize(40)
          ctx.setFillStyle('#999999')
          ctx.setTextAlign('center')
          let line1 = username + '邀请你参加'
          let line2 = 'ENVOL听力朗读课的试听'
          if(that.data.isNormal) {
            line1 = '我在ENVOL听力朗读课'
            line2 = '坚持完成了挑战课程'
          }
          ctx.fillText(line1, imgWidth / 2 + 16 / scale, imgHeight / 2 + 70 / scale)
          ctx.fillText(line2, imgWidth / 2 + 16 / scale, imgHeight / 2 + 70 / scale + 24 / scale)
          ctx.draw()
        },
        fail: function (err) {
          console.log(err)
        },
        complete: function(){
          console.log('complete')
          if(cb) {
            cb.call(that, {}, trace)
          }
        }
      })
    })
  },
  generateShareImg: function(e, trace = 1){
    if (!this.data.canvasReady && trace < 5) {
      trace++
      wx.showLoading()
      setTimeout(()=>{
        this.initCanvas(this.generateShareImg, trace)
      }, 1000)
      return
    }
    wx.hideLoading()
    var width = wx.getSystemInfoSync().windowWidth;
    var imgWidth = 966, imgHeight = 1350;
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      destWidth: imgWidth,
      destHeight: imgHeight,
      canvasId: 'firstCanvas',
      success: function (res) {
        wx.previewImage({
          current: '', // 当前显示图片的http链接
          urls: [res.tempFilePath] // 需要预览的图片http链接列表
        })
      },
      fail: function (e) {
        console.log(e)
      },
      complete: function () {
      }
    })
  },
  initData: function (cb) {
    getApp().ready(()=>{
      wx.getStorage({
        key: 'currentSemester',
        success: (res) => {
          console.log(res.data.id)
          service.getSemesterDetail.bind(this)(res.data.id, false, ({ statistical }) => {
            this.setData({
              mots: statistical.map((o) => o.wordsTotal).reduceRight((a, b) => a + b, 0),
              fois: statistical.length
            })
            cb()
          })
        },
      })
    })
  }
})