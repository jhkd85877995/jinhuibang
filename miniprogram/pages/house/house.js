// pages/house/house.js - 房源管理逻辑
Page({
  data: {
    currentTab: 'all',
    houses: [],
    searchKeyword: ''
  },

  onLoad() {
    this.loadHouses();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      });
    }
  },

  loadHouses() {
    // TODO: 从 CloudBase 加载房源数据
    const db = wx.cloud.database();
    let query = db.collection('houses');
    
    if (this.data.currentTab !== 'all') {
      query = query.where({ status: this.data.currentTab });
    }
    
    if (this.data.searchKeyword) {
      query = query.where({
        title: db.RegExp({
          regexp: this.data.searchKeyword,
          options: 'i'
        })
      });
    }

    query.get({
      success: (res) => {
        const houses = res.data.map(item => ({
          id: item._id,
          title: item.title,
          address: item.address,
          price: item.price,
          status: this.getStatusText(item.status),
          statusClass: this.getStatusClass(item.status),
          image: item.images ? item.images[0] : '/images/default-house.png'
        }));
        this.setData({ houses });
      },
      fail: (err) => {
        console.error('加载房源失败', err);
        // 模拟数据
        this.setData({
          houses: [
            { id: 1, title: '阳光花园 2室1厅', address: '朝阳区阳光花园小区', price: 4500, status: '待租', statusClass: 'status-vacant', image: '' },
            { id: 2, title: '锦汇公寓 单间', address: '海淀区锦汇大厦', price: 2800, status: '已租', statusClass: 'status-rented', image: '' },
            { id: 3, title: '温馨家园 3室2厅', address: '丰台区温馨家园', price: 6800, status: '审核中', statusClass: 'status-review', image: '' }
          ]
        });
      }
    });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
    this.loadHouses();
  },

  onSearch(e) {
    this.setData({ searchKeyword: e.detail.value });
    this.loadHouses();
  },

  addHouse() {
    wx.navigateTo({
      url: '/pages/house/add/add'
    });
  },

  viewHouse(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/house/detail/detail?id=${id}`
    });
  },

  getStatusText(status) {
    const map = { vacant: '待租', rented: '已租', review: '审核中' };
    return map[status] || status;
  },

  getStatusClass(status) {
    const map = { vacant: 'status-vacant', rented: 'status-rented', review: 'status-review' };
    return map[status] || '';
  }
});
