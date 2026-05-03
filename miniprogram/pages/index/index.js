// pages/index/index.js - 工作台首页逻辑
const app = getApp();

Page({
  data: {
    stats: {
      houseCount: 0,
      orderCount: 0,
      userCount: 0,
      revenue: 0
    },
    recentOrders: [],
    announcement: '欢迎使用锦汇邦本地生活服务平台！如有问题请联系技术支持。'
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    // 每次显示页面时刷新数据
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      });
    }
  },

  loadData() {
    // 从 CloudBase 加载数据
    this.loadStats();
    this.loadRecentOrders();
  },

  loadStats() {
    // TODO: 从 CloudBase 数据库获取统计数据
    // 示例代码，实际应调用云函数或数据库
    const db = wx.cloud.database();
    db.collection('stats').doc('dashboard').get({
      success: (res) => {
        this.setData({
          stats: res.data
        });
      },
      fail: (err) => {
        console.error('加载统计数据失败', err);
        // 使用模拟数据（开发阶段）
        this.setData({
          stats: {
            houseCount: 156,
            orderCount: 23,
            userCount: 1280,
            revenue: 15860
          }
        });
      }
    });
  },

  loadRecentOrders() {
    // TODO: 从 CloudBase 数据库获取最近订单
    // 模拟数据（开发阶段）
    this.setData({
      recentOrders: [
        { id: 1, title: '阳光花园 2室1厅 月租', time: '2026-05-03 08:15', status: '进行中', statusClass: 'status-active' },
        { id: 2, title: '锦汇公寓 单间 周租', time: '2026-05-03 07:30', status: '已完成', statusClass: 'status-completed' },
        { id: 3, title: '本地同城 家政服务', time: '2026-05-02 19:45', status: '待支付', statusClass: 'status-pending' },
        { id: 4, title: '共享扫码 充电宝租赁', time: '2026-05-02 15:20', status: '已完成', statusClass: 'status-completed' }
      ]
    });
  },

  // 导航函数
  goToHouse() {
    wx.switchTab({
      url: '/pages/house/house'
    });
  },

  goToFinance() {
    wx.switchTab({
      url: '/pages/finance/finance'
    });
  },

  goToOrder() {
    wx.switchTab({
      url: '/pages/order/order'
    });
  },

  goToLocal() {
    wx.switchTab({
      url: '/pages/local/local'
    });
  },

  onPullDownRefresh() {
    this.loadData();
    wx.stopPullDownRefresh();
  }
});
