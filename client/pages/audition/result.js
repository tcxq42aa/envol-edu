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
      isPreview: options.isPreview
    })
    if (options.isPreview) {
      this.initCanvas()
    } else {
      this.initData(() => {
        this.initCanvas()
      })
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
      path:	'pages/index/index'
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
          ctx.setFontSize(36)
          ctx.setFillStyle('#999999')
          ctx.setTextAlign('center')
          let line1 = '我在ENVOL听力朗读课'
          let line2 = '坚持完成了挑战课程'
          if (that.data.isPreview) {
            line1 = username + '邀请你参加'
            line2 = 'ENVOL听力朗读课的试听'
          }
          const centerX = imgWidth / 2 + 16 / scale;
          const offsetY = imgHeight / 2 + 45 / scale;
          ctx.fillText(line1, centerX, offsetY)
          ctx.fillText(line2, centerX, offsetY + 18 / scale)
          
          const offsetX2 = imgWidth / 3 + 8 / scale;
          const offsetX3 = imgWidth / 3 * 2 + 16 / scale;
          const offsetY2 = imgHeight / 2 + 70 / scale;
          ctx.setFillStyle('#333333')
          ctx.fillText("J'ai écouté", offsetX2, offsetY2 + 24 / scale)
          ctx.fillText("J'ai fini", offsetX3, offsetY2 + 24 / scale)

          ctx.setFontSize(48)
          ctx.fillText(that.data.mots, offsetX2, offsetY2 + 48 / scale)
          ctx.fillText(that.data.fois, offsetX3, offsetY2 + 48 / scale)

          ctx.setFontSize(28)
          ctx.fillText('mots', offsetX2 + 38 /scale, offsetY2 + 48 / scale)
          ctx.fillText('fois', offsetX3 + 38 / scale, offsetY2 + 48 / scale)

          ctx.moveTo(centerX, offsetY2 + 12 / scale)
          ctx.lineTo(centerX, offsetY2 + 52 / scale)
          ctx.setStrokeStyle('#4a4a4a')
          ctx.stroke()

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
    console.log(this.data.mots, this.data.fois);
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