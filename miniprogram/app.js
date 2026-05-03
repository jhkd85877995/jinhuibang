// app.js
App({
  onLaunch() {
    // 初始化 CloudBase
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        // env 参数说明：
        // 请先配置 CloudBase 环境 ID
        // 可在 CloudBase 控制台获取：https://tcb.cloud.tencent.com/dev
        env: 'cloud1-d9gnze2b0f0f31520', // 锦汇邦 CloudBase 环境 ID
        traceUser: true,
      });
      console.log('CloudBase 初始化成功');
    }

    // 获取用户信息
    this.getUserInfo();
  },

  getUserInfo() {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: (userRes) => {
              this.globalData.userInfo = userRes.userInfo;
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(userRes.userInfo);
              }
            }
          });
        }
      }
    });
  },

  globalData: {
    userInfo: null
  }
});
