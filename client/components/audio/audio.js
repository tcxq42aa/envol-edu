// components/audio/audio.js
Component({
  detached: function(){
    this.audioCtx && this.audioCtx.destroy()
  },
  ready: function() {
    let that = this;
    this.queryMultipleNodes();

    if (wx.createInnerAudioContext) {
      const audioCtx = this.audioCtx = wx.createInnerAudioContext()
      
      audioCtx.src = this.data.lSrc
      audioCtx.onPlay(function(e){
        that.setData({
          isPlaying: true
        })
        // if (audioCtx.duration !=0 && audioCtx.currentTime.toFixed(0) == audioCtx.duration.toFixed(0)) {
          // audioCtx.seek(0)
        // } else {
          // test
          // audioCtx.seek(305)
        // }
      })
      audioCtx.onPause(function (e) {
        if (audioCtx.duration != 0 && audioCtx.currentTime.toFixed(0) == audioCtx.duration.toFixed(0)) {
          audioCtx.seek(0)
          that.setData({
            currentTime: 0
          })
        }
        
        that.setData({
          isPlaying: false
        })
      })
      audioCtx.onEnded(function() {
        var myEventDetail = {} // detail对象，提供给事件监听函数
        var myEventOption = {} // 触发事件的选项
        that.triggerEvent('ended', myEventDetail, myEventOption)
      })
      audioCtx.onTimeUpdate(function(e){
        let sec = Math.round(audioCtx.currentTime % 60)
        let min = Math.floor(audioCtx.currentTime / 60)
        if (sec < 10) sec = '0' + sec
        if (min < 10) min = '0' + min
          
        let dSec = Math.round(audioCtx.duration % 60)
        let dMin = Math.floor(audioCtx.duration / 60)
        if (dSec < 10) dSec = '0' + dSec
        if (dMin < 10) dMin = '0' + dMin

        that.setData({
          currentTime: audioCtx.currentTime,
          duration: audioCtx.duration,
          currentTimeStr: min + ':' + sec,
          durationStr: dMin + ':' + dSec,
        })
      })
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },
  /**
   * 组件的属性列表
   */
  properties: {
    lSrc: String,
    rSrc: String,
    finished: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    isL: true,
    isPlaying: false,
    showToast: false,
    currentTimeStr: '00:00',
    durationStr: '00:00'
  },

  /**
   * 组件的方法列表
   */
  methods: {
    audioPlay: function (e) {
      if (e.target.dataset.status) {
        this.audioCtx.pause()
      } else {
        this.audioCtx.play()
      }
    },
    switchSpeed: function(){
      this.setData({
        isL: !this.data.isL
      })
      if (this.data.isL) {
        this.audioCtx.src = this.data.lSrc
        this.audioCtx.play()
      } else {
        this.audioCtx.src = this.data.rSrc
        this.audioCtx.play()
      }
    },
    onTouchMove: function(e) {
      if (!this.data.finished) {
        this.setData({
          showToast: true
        })
        setTimeout(() => {
          this.setData({
            showToast: false
          })
        }, 2500)
        return
      }
      
      var offset = e.touches[0].clientX - this.barRef.left
      if (offset < 0 || offset > this.barRef.width) {
        return
      }
      this.audioCtx.seek(this.audioCtx.duration * offset / this.barRef.width)

      // console.log('percent', offset / this.barRef.width);
    },
    queryMultipleNodes: function () {
      var that = this
      var query = wx.createSelectorQuery().in(this)
      query.select('#bar').boundingClientRect(function (res) {
        console.log(res) // 这个组件内 #the-id 节点的上边界坐标
        that.barRef = res
      }).exec()
    }
  }
})
