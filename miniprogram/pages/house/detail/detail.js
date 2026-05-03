// pages/house/detail/detail.js - 房源详情逻辑
const db = wx.cloud.database();
const _ = db.command;

Page({
  data: {
    houseId: '',
    house: {},
    images: []
  },

  onLoad(options) {
    const { id } = options;
    if (!id) {
      wx.showToast({ title: '参数错误', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }
    this.setData({ houseId: id });
    this.loadHouseDetail(id);
    
    // 增加浏览量
    this.incrementViewCount(id);
  },

  async loadHouseDetail(id) {
    wx.showLoading({ title: '加载中...' });
    
    try {
      const res = await db.collection('houses').doc(id).get();
      const house = res.data;
      
      // 处理状态显示
      const statusMap = {
        'vacant': { text: '待租', class: 'status-vacant' },
        'rented': { text: '已租', class: 'status-rented' },
        'review': { text: '审核中', class: 'status-review' }
      };
      const statusInfo = statusMap[house.status] || { text: '未知', class: '' };
      
      // 格式化时间
      const createTime = new Date(house.createTime);
      const updateTime = new Date(house.updateTime);
      house.createTimeStr = this.formatDate(createTime);
      house.updateTimeStr = this.formatDate(updateTime);
      house.statusText = statusInfo.text;
      house.statusClass = statusInfo.class;
      
      this.setData({
        house,
        images: house.images || []
      });
      
      wx.hideLoading();
      
      // 设置页面标题
      wx.setNavigationBarTitle({ title: house.title || '房源详情' });
      
    } catch (error) {
      wx.hideLoading();
      console.error('加载房源详情失败', error);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  // 增加浏览量
  async incrementViewCount(id) {
    try {
      await db.collection('houses').doc(id).update({
        data: {
          viewCount: _.inc(1)
        }
      });
    } catch (error) {
      console.error('更新浏览量失败', error);
    }
  },

  // 预览图片
  previewImage(e) {
    const current = e.currentTarget.dataset.src;
    wx.previewImage({
      current,
      urls: this.data.images
    });
  },

  // 编辑房源
  editHouse() {
    wx.navigateTo({
      url: `/pages/house/edit/edit?id=${this.data.houseId}`
    });
  },

  // 删除房源
  deleteHouse() {
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除这个房源吗？',
      confirmColor: '#DC2626',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' });
          
          try {
            // 1. 删除云存储中的图片
            const { images } = this.data.house;
            if (images && images.length > 0) {
              const deleteTasks = images.map(fileID => {
                return wx.cloud.deleteFile({
                  fileList: [fileID]
                });
              });
              await Promise.all(deleteTasks);
            }
            
            // 2. 删除数据库记录
            await db.collection('houses').doc(this.data.houseId).remove();
            
            wx.hideLoading();
            wx.showToast({ title: '删除成功', icon: 'success' });
            
            setTimeout(() => {
              // 返回房源列表并刷新
              const pages = getCurrentPages();
              const housePage = pages[pages.length - 2];
              if (housePage) {
                housePage.loadHouses();
              }
              wx.navigateBack({ delta: 2 });
            }, 1500);
            
          } catch (error) {
            wx.hideLoading();
            console.error('删除房源失败', error);
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  },

  // 格式化日期
  formatDate(date) {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${d} ${h}:${min}`;
  },

  onShareAppMessage() {
    const { house } = this.data;
    return {
      title: house.title || '锦汇邦优质房源',
      path: `/pages/house/detail/detail?id=${this.data.houseId}`,
      imageUrl: this.data.images[0] || ''
    };
  }
});
