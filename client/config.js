/**
 * 小程序配置文件
 */

// 此处主机域名修改成腾讯云解决方案分配的域名
var host = 'https://edu.envol.vip';
// var host = 'http://127.0.0.1:5757';

var config = {

    // 下面的地址配合云端 Demo 工作
    service: {
        host,

        // 登录地址，用于建立会话
        loginUrl: `${host}/weapp/login`,

        // 测试的请求地址，用于测试会话
        requestUrl: `${host}/weapp/user`,
        
        // paper detail
        paperUrl: `${host}/api/paper`,

        // 测试的信道服务地址
        tunnelUrl: `${host}/weapp/tunnel`,

        // 上传图片接口
        uploadUrl: `${host}/weapp/upload`,

        payUrl: `${host}/api/userSemester/{semesterId}/enroll`,

        semesterListUrl: `${host}/api/semester/paidList`,

        todayUrl: `${host}/api/user/today`,

        todayPaperUrl: `${host}/api/user/todayPaper`,

        finishUrl: `${host}/api/user/course/{paperId}/save`,

        reviewUrl: `${host}/api/user/review/{paperId}/save`,

        reviewStatisticalUrl: `${host}/api/user/review/statistical`,

        reminderUrl: `${host}/api/user/setting`,

        articleUrl: `${host}/api/article`,

        decodePhoneNumberUrl: `${host}/weapp/phoneNumber`,

        userInfoUrl: `${host}/api/user/info`
    },
    expireTime: 30 * 60 * 1000
};

module.exports = config;
