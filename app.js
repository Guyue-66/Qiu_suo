App({
  onLaunch: function () {
    // 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'ai-chat-0gzbi8kwc9127525', // 替换为您的实际云环境ID
        traceUser: true,
      });
      console.log('云环境初始化成功');
      this.globalData.cloudEnvId = 'ai-chat-0gzbi8kwc9127525';
    }
  },
  globalData: {
    userInfo: null,
    cloudEnvId: ''
  },
  onError: function(err) {
    console.error('全局错误:', err);
    // 可以添加错误上报逻辑
  }
}); 