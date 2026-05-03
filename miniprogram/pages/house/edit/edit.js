// pages/house/edit/edit.js - 编辑房源逻辑（基于添加页面修改）
const app = getApp();
const db = wx.cloud.database();
const _ = db.command;

Page({
  data: {
    houseId: '',
    images: [],
    roomTypes: ['1室1厅', '1室2厅', '2室1厅', '2室2厅', '3室1厅', '3室2厅', '单间', '其他'],
    roomTypeIndex: 0,
    statusOptions: ['待租', '已租', '审核中'],
    statusIndex: 0,
    form: {
      title: '',
      address: '',
      roomType: '1室1厅',
      price: '',
      deposit: '',
      status: 'vacant',
      description: '',
      images: []
    }
  },

  onLoad(options) {
    const { id } = options;
    if (!id) {
      wx.showToast({ title: '参数错误', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }
    this.setData({ houseId: id });
    this.loadHouseData(id);
  },

  async loadHouseData(id) {
    wx.showLoading({ title: '加载中...' });
    try {
      const res = await db.collection('houses').doc(id).get();
      const house = res.data;
      
      // 设置表单数据
      const roomTypeIndex = this.data.roomTypes.indexOf(house.roomType);
      const statusIndex = ['vacant', 'rented', 'review'].indexOf(house.status);
      
      this.setData({
        images: house.images || [],
        roomTypeIndex: roomTypeIndex >= 0 ? roomTypeIndex : 0,
        statusIndex: statusIndex >= 0 ? statusIndex : 0,
        form: {
          title: house.title || '',
          address: house.address || '',
          roomType: house.roomType || '1室1厅',
          price: house.price ? String(house.price) : '',
          deposit: house.deposit ? String(house.deposit) : '',
          status: house.status || 'vacant',
          description: house.description || '',
          images: house.images || []
        }
      });
      
      wx.hideLoading();
      wx.setNavigationBarTitle({ title: '编辑房源' });
    } catch (error) {
      wx.hideLoading();
      console.error('加载房源数据失败', error);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  // 输入处理
  onInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`form.${field}`]: value
    });
  },

  // 房型选择
  onRoomTypeChange(e) {
    const index = e.detail.value;
    this.setData({
      roomTypeIndex: index,
      'form.roomType': this.data.roomTypes[index]
    });
  },

  // 状态选择
  onStatusChange(e) {
    const index = e.detail.value;
    const statusMap = ['vacant', 'rented', 'review'];
    this.setData({
      statusIndex: index,
      'form.status': statusMap[index]
    });
  },

  // 选择图片
  chooseImage() {
    const remaining = 9 - this.data.images.length;
    if (remaining <= 0) {
      wx.showToast({ title: '最多上传9张图片', icon: 'none' });
      return;
    }

    wx.chooseImage({
      count: remaining,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = this.data.images.concat(res.tempFilePaths);
        this.setData({ images: newImages });
      }
    });
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.images;
    images.splice(index, 1);
    this.setData({ images });
  },

  // 上传新图片
  async uploadNewImages() {
    const { images, form } = this.data;
    const oldImages = form.images || [];
    const newImages = images.filter(img => img.indexOf('cloud://') === -1);
    
    if (newImages.length === 0) return images; // 没有新图片

    wx.showLoading({ title: '上传图片中...' });

    const uploadTasks = newImages.map((filePath, index) => {
      return new Promise((resolve, reject) => {
        const fileName = `houses/${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`;
        wx.cloud.uploadFile({
          cloudPath: fileName,
          filePath: filePath,
          success: (res) => resolve(res.fileID),
          fail: (err) => reject(err)
        });
      });
    });

    try {
      const newFileIDs = await Promise.all(uploadTasks);
      const allImages = oldImages.concat(newFileIDs);
      wx.hideLoading();
      return allImages;
    } catch (error) {
      wx.hideLoading();
      wx.showToast({ title: '图片上传失败', icon: 'none' });
      throw error;
    }
  },

  // 更新房源
  async submitHouse() {
    const { form, images, houseId } = this.data;

    // 表单验证
    if (!form.title.trim()) {
      wx.showToast({ title: '请输入房源标题', icon: 'none' });
      return;
    }
    if (!form.address.trim()) {
      wx.showToast({ title: '请输入房源地址', icon: 'none' });
      return;
    }
    if (!form.price || form.price <= 0) {
      wx.showToast({ title: '请输入有效的租金', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '更新中...' });

    try {
      // 1. 上传新图片
      let allImages = images;
      if (images.some(img => img.indexOf('cloud://') === -1)) {
        allImages = await this.uploadNewImages();
      }

      // 2. 构建更新数据
      const updateData = {
        title: form.title.trim(),
        address: form.address.trim(),
        roomType: form.roomType,
        price: parseFloat(form.price),
        deposit: form.deposit ? parseFloat(form.deposit) : 0,
        status: form.status,
        description: form.description.trim(),
        images: allImages,
        updateTime: new Date()
      };

      // 3. 更新数据库
      await db.collection('houses').doc(houseId).update({
        data: updateData
      });

      wx.hideLoading();
      wx.showToast({ title: '更新成功', icon: 'success' });

      // 4. 返回详情页并刷新
      setTimeout(() => {
        const pages = getCurrentPages();
        const detailPage = pages[pages.length - 2];
        if (detailPage) {
          detailPage.loadHouseDetail(houseId);
        }
        wx.navigateBack();
      }, 1500);

    } catch (error) {
      wx.hideLoading();
      console.error('更新房源失败', error);
      wx.showToast({ title: '更新失败，请重试', icon: 'none' });
    }
  }
});
