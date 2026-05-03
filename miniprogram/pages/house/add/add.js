// pages/house/add/add.js - 添加房源逻辑
const app = getApp();
const db = wx.cloud.database();
const _ = db.command;

Page({
  data: {
    images: [], // 图片临时路径数组
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
      status: 'vacant', // vacant: 待租, rented: 已租, review: 审核中
      description: '',
      images: [] // 上传后的云存储路径
    }
  },

  onLoad() {},

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
      },
      fail: (err) => {
        console.error('选择图片失败', err);
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

  // 上传图片到云存储
  async uploadImages() {
    const { images } = this.data;
    if (images.length === 0) return [];

    wx.showLoading({ title: '上传图片中...' });

    const uploadTasks = images.map((filePath, index) => {
      return new Promise((resolve, reject) => {
        const fileName = `houses/${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`;
        wx.cloud.uploadFile({
          cloudPath: fileName,
          filePath: filePath,
          success: (res) => {
            resolve(res.fileID);
          },
          fail: (err) => {
            console.error('上传图片失败', err);
            reject(err);
          }
        });
      });
    });

    try {
      const fileIDs = await Promise.all(uploadTasks);
      wx.hideLoading();
      return fileIDs;
    } catch (error) {
      wx.hideLoading();
      wx.showToast({ title: '图片上传失败', icon: 'none' });
      throw error;
    }
  },

  // 提交房源
  async submitHouse() {
    const { form, images } = this.data;

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

    wx.showLoading({ title: '提交中...' });

    try {
      // 1. 上传图片
      let imageFileIDs = [];
      if (images.length > 0) {
        imageFileIDs = await this.uploadImages();
      }

      // 2. 构建房源数据
      const houseData = {
        title: form.title.trim(),
        address: form.address.trim(),
        roomType: form.roomType,
        price: parseFloat(form.price),
        deposit: form.deposit ? parseFloat(form.deposit) : 0,
        status: form.status,
        description: form.description.trim(),
        images: imageFileIDs,
        createTime: new Date(),
        updateTime: new Date(),
        landlordId: wx.cloud.callFunction({ name: 'getUserInfo' }).then(res => res.result.openid).catch(() => ''),
        viewCount: 0,
        likeCount: 0
      };

      // 3. 保存到数据库
      const result = await db.collection('houses').add({
        data: houseData
      });

      wx.hideLoading();
      wx.showToast({ title: '添加成功', icon: 'success' });

      // 4. 返回上一页并刷新列表
      setTimeout(() => {
        const pages = getCurrentPages();
        const housePage = pages[pages.length - 2];
        if (housePage) {
          housePage.loadHouses(); // 刷新房源列表
        }
        wx.navigateBack();
      }, 1500);

    } catch (error) {
      wx.hideLoading();
      console.error('提交房源失败', error);
      wx.showToast({ title: '提交失败，请重试', icon: 'none' });
    }
  }
});
