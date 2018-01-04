const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
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

module.exports = { formatTime, showBusy, showSuccess, showModel, showToast }
