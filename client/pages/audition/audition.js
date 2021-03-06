// pages/audition/audition.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config.js')
var util = require('../../utils/util.js')
var moment = require('../../vendor/moment.min')
var WxParse = require('../../vendor/wxParse/wxParse.js');
import service from '../../utils/service';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentStep: 1,
    disabled: true, // 按钮禁用
    fixed: true, // 按钮悬浮
    classNames: '',
    disabledClassName: 'disabled',
    opened: false,
    paper: {},
    mainEnded: false,
    optEnded: false,
    isAdmin: false,
    preFinished: false, //预习过
    isPreview: false, // 试听版
    finished: false, // 正课是否完成
    optFinished: false, //选修课是否完成
    optRecordFinished: false, //选修课录音是否听过
    localAudioState: {
      audios: {},
      optAudios: {},
    }
  },

  onShow: function(options){
    this.doRequest(this.data.options);
    wx.getStorage({
      key: 'admin',
      success: (res) => {
        if(res.data) {
          this.setData({ isAdmin: true, disabledClassName: '' });
        }
      },
    });
    wx.getStorage({
      key: 'record_' + this.data.paper.id,
      success: (res) => {
        if(res.data) {
          this.setData({ localAudioState: res.data });
          for(var idx in res.data.audios) {
            switch(idx) {
              case 1:
                this.setData({
                  firstFinished: true
                });
                break;
              case 2:
                this.setData({
                  secondFinished: true
                });
                break;
              case 3:
                this.setData({
                  audioCycleEnded: true
                });
                break;
            }
          }
          for(var idx in res.data.optAudios) {
            this.setData({
              optRecordFinished: true,
              optFinished: true
            });
          }
          for(var idx in res.data.preAudios) {
            this.setData({
              preAudioFinshed: true
            });
          }
        }
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    this.setData({
      options,
      isPreview: !!options.isPreview, //试听
    })
    if (options.mode == 'opt') { //选修
      this.setData({ currentStep: 4 });
    }
  },

  doRequest: function(options) {
    var that = this

    getApp().ready(() => {
      console.log('ready')
      this.initPageData(_ => {
        let { mainEnded, optEnded } = this.data
        if (options.main == 'done' && mainEnded) {
          let step = 3, optFinished = false
          // if (optEnded) {
          //   step = 4
          //   optFinished = true
          // }
          this.setData({
            currentStep: step,
            audioCycleEnded: true,
            optFinished: optFinished
          })
        }
        wx.getStorage({
          key: 'semester_detail_' + this.data.paper.semesterId,
          success: (res) => {
            let current;
            if (current = res.data.statistical.find((item) => item.paperId == this.data.paper.id)) {
              this.setData({ disabledClassName: '', finished: true });
            }
          },
        })
        wx.getStorage({
          key: 'paper_' + this.data.paper.id,
          success: (res) => {
            if (res.data == 'finished') {
              this.setData({ preFinished: true })
            }
          },
        })
        wx.getStorage({
          key: 'optRecord_' + this.data.paper.id,
          success: (res) => {
            if (res.data) {
              this.setData({ optRecordFinished: true })
            }
          },
        })
      })
    })

    wx.getSetting({
      success: function (res) {
        if (!res.authSetting['scope.userInfo']) {
          wx.openSetting({
            success: function (res) {
              if (res.authSetting['scope.userInfo']) {
                that.initPageData()
              }
            }
          })
        }
      }
    })
  },

  initPageData: function (cb){
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    let url = '', method = 'GET', data, header;
    if(that.data.options.paperId) {
      url = config.service.paperUrl + '/' + (that.data.options.paperId || 4);
    } else if (that.data.options.semesterId) {
      url = config.service.todayPaperUrl;
      method = 'POST';
      data = {
        openId: getApp().globalData.userInfo.openId,
        semesterId: that.data.options.semesterId,
        readToday: that.data.options.date || util.getCurrentDate()
      }
      header = {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
    qcloud.request({
      url: url,
      data: data,
      header: header,
      method: method,
      login: true,
      success(result) {
        if (result.statusCode != 200) {
          let msg = '系统异常，请联系管理员';
          if (result.data.code == 4042) {
            msg = '该课程已删除';
          } else if (result.data.code == 4043) {
            msg = '本学期已结束';
          }
          wx.showModal({
            title: '提示',
            content: msg,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                wx.navigateBack({
                  delta: 1
                })
              }
            }
          })
          return
        }
        // 跳转到听写
        if (result.data.type == 3) {
          wx.redirectTo({
            url: '/pages/dictation/dictation?paperId=' + result.data.id
          })
          return;
        }
        // 跳转到测试
        if (result.data.type == 2) {
          wx.redirectTo({
            url: '/pages/test/test?paperId=' + result.data.id
          })
          return;
        }
        let content = JSON.parse(result.data.content);
        content.audios.forEach(audio => {
          audio.key = Math.random() * 100000
        })
        content.optAudios.forEach(audio => {
          audio.key = Math.random() * 100000
        })
        let mainEnded = wx.getStorageSync('paper_' + result.data.id)
        let optEnded = wx.getStorageSync('optPaper_' + result.data.id)
        that.setData({
          paper: result.data,
          content: content,
          mainEnded: mainEnded,
          optEnded: optEnded
        })
        WxParse.wxParse('original', 'html', content.original, that, 5);
        WxParse.wxParse('handout', 'html', content.handout, that, 5);
        WxParse.wxParse('thirdHandout', 'html', content.thirdHandout, that, 5);
        WxParse.wxParse('optHandout', 'html', content.optHandout, that, 5);
        if (that.data.currentStep == 1 && content.preAudio) {
          util.showToast("Tout écouter pour passer à l’étape suivante. ", 3000)
        }
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 下一步
   */
  next: function() {
    const step = this.data.currentStep + 1;
    this.setData({
      currentStep: step,
      fixed: true
    })
    if (this.data.currentStep == 3) {
      setTimeout(() => {
        util.showToast("Lire au moins cinq fois pour passer l’étape suivante.", 2500)
      } ,1000)
    }
    this.stopAudio()
  },

  toggle: function(e) {
    var key = e.target.dataset.target
    this.setData({
      [key]: !this.data[key]
    })
  },

  // 本地保存音频状态
  saveLocalState: function(idx, audioKey) {
    audioKey = audioKey || 'audios';
    var key = 'record_' + this.data.paper.id;
    wx.getStorage({
      key: key,
      success: function(res) {
        res.data[audioKey] = res.data[audioKey] || {};
        res.data[audioKey][idx] = true;
        wx.setStorage({
          key: key,
          data: res.data
        })
      },
      fail: function() {
        wx.setStorage({
          key: key,
          data: {
            [audioKey]: {
              [idx]: true
            }
          }
        });
      }
    });
  },

  /**
   * 音频播放结束
   */
  onPreAudioEnded: function() {
    var firstFinished = !!this.data.content.audios[0].finished
    this.saveLocalState(0, 'preAudios');
    this.setData({
      preAudioFinshed: true,
      firstFinished: firstFinished
    })

    if (!firstFinished) {
      util.showToast("Tout écouter pour passer à l’étape suivante.", 3000)
    }
  },

  onAudioEnded: function(e) {
    switch (this.data.currentStep) {
      case 1:
        this.saveLocalState(0);
        var hasPreAudio = this.data.content.preAudio
        this.data.content.audios[0].finished = true;
        var preAudioFinshed = this.data.preAudioFinshed
        if ((!hasPreAudio || preAudioFinshed)) {
          this.setData({
            firstFinished: true
          })
        }
        if(hasPreAudio && !preAudioFinshed) {
          util.showToast("Tout écouter pour passer à l’étape suivante.", 3000)
        }
        break
      case 2:
        this.saveLocalState(1);
        this.setData({
          secondFinished: true
        })
        break
      case 4:
        this.saveLocalState(0, 'optAudios');
        wx.setStorage({
          key: 'optRecord_' + this.data.paper.id,
          data: true,
        })
        this.setData({
          optRecordFinished: true,
          optFinished: true
        })
        break
    }
    if(this.data.currentStep == 3) {
      this.saveLocalState(2);
      return
    }
  },

  onAudioCycleEnded: function(e) {
    this.setData({
      audioCycleEnded: true
    });
    this.doFinish();
  },

  onPreAudioReady: function (e) {
    this.preAudioCtx = e.detail.context
  },
  onAudioReady: function(e){
    this.audioCtx = e.detail.context
  },
  onPreAudioPlay: function (e) {
    this.audioCtx && this.audioCtx.pause()
  },
  onAudioPlay: function (e) {
    this.preAudioCtx && this.preAudioCtx.pause()
  },

  toOpt: function(){
    // this.data.content.audios = this.data.content.optAudios
    this.setData({
      currentStep: 4,
      // isOptional: true,
      // content: { ...this.data.content }
    })
    wx.pageScrollTo({
      scrollTop: 0
    })
    this.stopAudio()
  },

  toMiniPro: function() {
    // wx.navigateToMiniProgram({
    //   appId: 'wxde736ea090d9d526',
    //   path: 'pages/user/home/home?courseId=1970&start_at=2017-12-12&end_time=2017-12-14',
    //   extraData: {
    //     foo: 'bar'
    //   },
    //   envVersion: 'release',
    //   success(res) {
    //     // 打开成功
    //   }
    // })
    this.stopAudio()
  },

  handleFinish: function(e){
    this.doFinish();

    var t = e.target.dataset.type
    if (this.data.content.preAudio) {
      this.goResultPage(t)
      return
    }

    var key = ''
    if(t == 1) {
      key = 'paper_' + this.data.paper.id
      if (!wx.getStorageSync(key) && !this.data.isPreview) {
        this.goJdk()
      } else {
        this.goResultPage(t)
      }
    }
    if (t == 2) {
      key = 'optPaper_' + this.data.paper.id
      this.goResultPage(t)
    }

    wx.setStorage({
      key: key,
      data: 'finished',
    })
  },

  goResultPage: function(t){
    wx.navigateTo({
      url: '/pages/audition/result?type=' + (t || 1)
    })
    this.stopAudio()
  },

  doFinish: function() {
    var that = this
    const { serverTime, openId } = getApp().globalData.userInfo
    const readToday = util.getCurrentDate(this.data.paper.readToday)

    service.sendFinish.bind(this)(
      this.data.paper.semesterId,
      this.data.paper.id,
      util.getCurrentDate(this.data.paper.readToday),
      that.data.paper.wordsTotal,
      this.data.noLimited
    )
  },
  stopAudio: function() {
    if (wx.getBackgroundAudioManager) {
      wx.getBackgroundAudioManager().stop()
    }
  },
  // 去鲸打卡
  goJdk() {
    wx.getStorage({
      key: 'currentSemester',
      success: (res) => {
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
      },
    })

  }
})
