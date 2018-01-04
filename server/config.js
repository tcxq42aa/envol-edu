const CONF = {
    port: '5757',
    rootPathname: '',

    // 微信小程序 App ID
    appId: 'wx46875b919da524bb',

    // 微信小程序 App Secret
    appSecret: '70602293eb5483fec5470e2f47419741',

    // 公众号 App ID
    gzAppId: 'wx2e16f47e06ea5273',

    // 公众号 App Secret
    gzAppSecret: 'b8257dfd15b07d6a8481ba7ca3ae8c81',

    // 是否使用腾讯云代理登录小程序
    useQcloudLogin: false,

    apiHost: process.env.NODE_ENV == 'development' ? 'http://support.edu.envol.vip' : 'http://127.0.0.1:8080',

    /**
     * MySQL 配置，用来存储 session 和用户信息
     * 若使用了腾讯云微信小程序解决方案
     * 开发环境下，MySQL 的初始密码为您的微信小程序 appid
     */
    mysql: {
      host: 'rm-2zex0nenp88ilw31qpo.mysql.rds.aliyuncs.com',
      port: 3306,
      user: 'root',
      db: 'cAuth',
      pass: 'Welcome1',
      char: 'utf8mb4'
    },

    cos: {
        /**
         * 区域
         * 华北：cn-north
         * 华东：cn-east
         * 华南：cn-south
         * 西南：cn-southwest
         * 新加坡：sg
         * @see https://www.qcloud.com/document/product/436/6224
         */
        region: 'cn-south',
        // Bucket 名称
        fileBucket: 'qcloudtest',
        // 文件夹
        uploadFolder: ''
    },

    // 微信登录态有效期
    wxLoginExpires: 7200,
    wxMessageToken: 'abcdefgh',
    serverHost: 'edu.envol.vip',
    tunnelServerUrl: '',
    tunnelSignatureKey: '',
    qcloudAppId: '',
    qcloudSecretId: '',
    qcloudSecretKey: ''
}

module.exports = CONF
