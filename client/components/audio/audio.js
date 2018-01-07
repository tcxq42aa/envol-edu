// components/audio/audio.js
Component({
  detached: function(){
    if (this.audioCtx) {
      this.audioCtx.onPlay(null)
      this.audioCtx.onPause(null)
      this.audioCtx.onStop(null)
      this.audioCtx.onEnded(null)
      this.audioCtx.onTimeUpdate(null)
      this.audioCtx.stop()
      delete this.audioCtx
    }
    // this.audioCtx && this.audioCtx.stop()
  },
  ready: function() {
    let that = this;
    this.queryMultipleNodes();
  },
  /**
   * 组件的属性列表
   */
  properties: {
    lSrc: {
      type: String,
      observer: function (newVal, oldVal) { 
        this.currentSrc = newVal
        // if(this.audioCtx) {
          // this.audioCtx.src = newVal
          // this.data.cycleTimes = parseInt(wx.getStorageSync(newVal) || 0)
        // }
      } 
    },
    rSrc: String,
    finished: Boolean,
    switchable: Boolean,
    autocycle: Number,
    max: Number,
    minPlay: Number,
    toastText: String
  },

  /**
   * 组件的初始数据
   */
  data: {
    isN: true,
    isPlaying: false,
    showToast: false,
    currentTimeStr: '00:00',
    durationStr: '00:00',
    cycleTimes: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    resetAudio: function(){
      this.audioCtx.startTime = 0
      this.setData({
        currentTime: 0,
        currentTimeStr: '00:00',
        isPlaying: false
      })
    },
    initAudio: function() {
      var that = this
      if (wx.getBackgroundAudioManager) {
        // if (!this.audioCtx) {
        //   this.audioCtx = wx.createInnerAudioContext()
        // }
        // const audioCtx = this.audioCtx
        
        const audioCtx = this.audioCtx = wx.getBackgroundAudioManager()
        // this.data.currentTime, this.data.duration
        audioCtx.title = 'ENVOL听力朗读课'
        audioCtx.epname = 'ENVOL听力朗读课'
        audioCtx.singer = 'Seb&Weina'
        audioCtx.coverImgUrl = 'https://oss.edu.envol.vip/miniprogram/envol.jpeg'
        if (this.currentSrc) {
          audioCtx.src = this.currentSrc
          audioCtx.startTime = this.data.currentTime
        }
        audioCtx.onPlay(function (e) {
          that.triggerEvent('play', {}, {})
          that.setData({
            isPlaying: true
          })
          // audioCtx.seek(440)
        })
        audioCtx.onStop(function () {
          that.pause()
        })
        audioCtx.onEnded(function () {
          that.triggerEvent('ended', myEventDetail, myEventOption)
          that.resetAudio()
          that.data.cycleTimes = that.data.cycleTimes + 1
                    
          var myEventDetail = {} // detail对象，提供给事件监听函数
          var myEventOption = {} // 触发事件的选项
          if (that.data.autocycle > 0) {
            if (that.data.cycleTimes < that.data.autocycle) {
              setTimeout(() => {
                that.audioPlay()
              }, 100)
            } else {
              that.triggerEvent('cycleended', {}, {})
            }
          }
        })
        audioCtx.onTimeUpdate(function (e) {
          if (audioCtx.duration <= 0) {
            return
          }
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
        that.triggerEvent('ready', { context: that }, {})
      } else {
        // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
        wx.showModal({
          title: '提示',
          content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
        })
      }
    },
    toggle: function() {
      if(this.data.isPlaying) {
        this.audioPause()
      } else {
        this.audioPlay()
      }
    },
    audioPlay: function (e) {
      if (this.data.max > 0 && this.data.cycleTimes >= this.data.max) {
        this.showToast('本环节本音频只可听一次')
        return
      }
      this.initAudio()
      this.audioCtx.play()
      this.setData({
        isPlaying: true
      })
    },
    audioPause: function (e) {
      this.audioCtx.pause()
      this.setData({
        isPlaying: false
      })
    },
    pause: function (e) {
      this.setData({
        isPlaying: false
      })
    },
    switchSpeed: function(){
      this.setData({
        isN: !this.data.isN,
        currentTime: 0,
        currentTimeStr: '00:00',
        durationStr: '00:00'
      })
      if (this.data.isN) {
        this.currentSrc = this.data.lSrc
      } else {
        this.currentSrc = this.data.rSrc
      }
      if (this.data.isPlaying) {
        this.audioPlay()
      }
    },
    onTouchMove: function(e) {
      if (!this.data.finished || (this.data.minPlay > 0 && this.data.minPlay > this.data.cycleTimes)) {
        this.showToast(this.data.toastText)
        return
      }
      
      var offset = e.touches[0].clientX - this.barRef.left
      if (offset < 0 || offset > this.barRef.width) {
        return
      }
      this.audioCtx.seek(this.audioCtx.duration * offset / this.barRef.width)
    },
    queryMultipleNodes: function () {
      var that = this
      var query = wx.createSelectorQuery().in(this)
      query.select('#bar').boundingClientRect(function (res) {
        that.barRef = res
      }).exec()
    },
    showToast: function(content){
      this.setData({
        showToast: true,
        msg: content || '播放中不可拖动'
      })
      setTimeout(() => {
        this.setData({
          showToast: false
        })
      }, 2500)
    }
  }
})
