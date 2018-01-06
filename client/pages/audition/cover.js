// pages/audition/cover.js
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})