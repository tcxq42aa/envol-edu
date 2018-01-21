var moment = require('../vendor/moment.min')
const formatTime = (date, containHMS) => {
  if (typeof date == 'number') {
    date = new Date(date)
  }
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  let result = [day, month, year ].map(formatNumber).join('/')
  if (containHMS) {
    result = result + ' ' + [hour, minute, second].map(formatNumber).join(':')
  }
  return result
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}


// 显示繁忙提示
var showBusy = text => wx.showToast({
    title: text,
    icon: 'loading',
    duration: 10000
})

// 显示成功提示
var showSuccess = text => wx.showToast({
    title: text,
    icon: 'success'
})

// 显示失败提示
var showModel = (title, content) => {
    wx.hideToast();

    wx.showModal({
        title,
        content: JSON.stringify(content),
        showCancel: false
    })
}

var showToast = (title, sec) => {
  let pages = getCurrentPages();
  let curPage = pages[pages.length - 1];
  let animation = wx.createAnimation();
  animation.opacity(1).step();
  curPage.setData({
    toastData: {
      reveal: true,
      animationData: animation,
      title: title
    }
  });
  setTimeout(() => {
    curPage.setData({
      toastData: null
    })
  }, sec)
}

var weekDays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
var simpleWeekDays = ['dim', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.']
var monthArr = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
var simlpleMonthArr = ['jan.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juillet', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
var formatDate = (date = new Date()) => {
  return `${weekDays[date.getDay()]} ${date.getDate()} ${monthArr[date.getMonth()]} ${date.getFullYear()}`;
}

var formatDate2 = (date) => {
  return weekDays[date.day()] + ' ' + date.date() + ' ' + simlpleMonthArr[date.month()];
}

// Jour 30
var formatDate3 = (date) => {
  return simlpleMonthArr[date.month()].replace(/^./, function (a) {
    return a.toUpperCase()
  }) + ' ' + date.date();
}

var getCurrentTime = function (date) {
  var serverTime = date || getApp().globalData.userInfo.serverTime;
  return moment(serverTime).utc().utcOffset(8)
 };
var getCurrentDate = function (date) {
  var serverTime = date || getApp().globalData.userInfo.serverTime;
  return moment(serverTime).utc().utcOffset(8).format('YYYY-MM-DD')
};

String.prototype.upperFirst = function() {
  return this[0].toUpperCase() + this.substr(1);
}

module.exports = { 
  weekDays, simpleWeekDays, monthArr, simlpleMonthArr,
  formatTime, showBusy, showSuccess, showModel, 
  showToast, formatDate, formatDate2, formatDate3, 
  getCurrentTime, getCurrentDate
}
