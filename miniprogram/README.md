# 锦汇邦本地生活服务平台 - 微信小程序

## 项目概述
- **项目名称**：锦汇邦本地生活服务平台
- **品牌标志**：锦汇邦
- **微信小程序 AppID**：wx1fcc50274a1234f3
- **技术栈**：微信小程序原生开发 + CloudBase（腾讯云开发）
- **开发目标**：1:1 复刻米宿管家房东管理系统

## 项目结构
```
jinhuibang-miniprogram/
├── pages/                 # 小程序页面
│   ├── index/            # 工作台（首页）
│   ├── house/            # 房源管理
│   ├── finance/          # 财务中心
│   ├── order/            # 订单管理
│   ├── local/            # 本地同城
│   ├── share/            # 共享扫码
│   └── settings/         # 我的（设置）
├── components/            # 组件库
├── utils/                # 工具函数
├── cloud/                # 云函数
├── images/               # 图片资源
├── app.js                # 小程序入口（CloudBase 初始化）
├── app.json              # 全局配置（页面、tabBar）
├── app.wxss              # 全局样式
├── project.config.json   # 项目配置（AppID）
└── sitemap.json          # 站点地图
```

## 设计规格
详见：[DESIGN_SPEC.md](../DESIGN_SPEC.md)

**核心设计要点**：
- **风格**：Industrial/utilitarian（工业/实用主义）
- **主色**：#1E3A8A（深蓝）
- **辅助色**：#3B82F6（亮蓝）、#F59E0B（琥珀色）
- **字体**：PingFang SC、SF Pro Display/Text

## CloudBase 配置

### 1. 环境配置
在使用前，需要：
1. 登录 [CloudBase 控制台](https://tcb.cloud.tencent.com/dev)
2. 创建环境（或使用现有环境）
3. 获取环境 ID（EnvId）
4. 替换 `app.js` 中的 `your-env-id`

```javascript
// app.js 第 10 行
env: 'your-env-id'  // 替换为您的 CloudBase 环境 ID
```

### 2. 数据库集合
需要创建以下集合（Collection）：
- `houses` - 房源数据
- `orders` - 订单数据
- `users` - 用户数据
- `stats` - 统计数据

### 3. 云函数列表
计划创建的云函数：
- `getHouseList` - 获取房源列表
- `getOrderList` - 获取订单列表
- `getStats` - 获取统计数据
- `addHouse` - 添加房源
- `updateHouse` - 更新房源信息

## 开发指南

### 1. 使用微信开发者工具打开
1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 打开工具，选择"导入项目"
3. 选择项目目录：`/root/.openclaw/workspace/jinhuibang/miniprogram`
4. 输入 AppID：`wx1fcc50274a1234f3`
5. 点击"导入"

### 2. 配置 CloudBase
在微信开发者工具中：
1. 点击"云开发"按钮
2. 开通云开发环境
3. 获取环境 ID
4. 替换 `app.js` 中的环境 ID

### 3. 运行和预览
- 点击"编译"按钮预览效果
- 使用真机调试功能在手机上测试
- 所有页面和功能都可实时预览

## 功能模块

### 一级界面（主模块）
1. **工作台**（首页）- 数据统计、快捷功能、最近订单
2. **房源管理** - 房源列表、添加房源、房源详情
3. **财务中心** - 收支明细、财务报表
4. **订单管理** - 订单列表、订单详情、订单处理
5. **本地同城** - 同城服务管理
6. **共享扫码** - 扫码设备管理
7. **我的** - 账号信息、系统设置

### 界面架构（1-4 级）
- **一级**：主模块页面（工作台、房源、财务等）
- **二级**：子模块页面（房源列表、订单列表等）
- **三级**：详情/操作页面（房源详情、订单详情等）
- **四级**：深层操作页面（编辑房源、处理订单等）

## 下一步计划

### 已完成 ✅
- [x] 项目结构设计
- [x] 设计规格说明（DESIGN_SPEC.md）
- [x] 小程序基础框架搭建
- [x] 首页（工作台）界面实现
- [x] 房源管理页面基础框架
- [x] 全局样式配置

### 待完成 ⏳
- [ ] 配置 CloudBase 环境 ID
- [ ] 创建数据库集合
- [ ] 实现云函数
- [ ] 完善房源管理功能（添加、编辑、详情）
- [ ] 实现财务中心功能
- [ ] 实现订单管理功能
- [ ] 开发本地同城模块
- [ ] 开发共享扫码模块
- [ ] PC 超级管理后台开发
- [ ] 真机测试与调优
- [ ] 提交审核与发布

## 技术要点

### CloudBase 集成
- 使用 `wx.cloud` 进行云开发
- 数据库：CloudBase NoSQL 文档数据库
- 存储：CloudBase 云存储（图片、文件）
- 云函数：处理复杂业务逻辑

### 认证方式
- 微信小程序：自动获取 OPENID（无需额外登录）
- 在云函数中通过 `wxContext.OPENID` 获取用户身份

### 数据加载策略
- 首页数据：从 `stats` 集合获取统计数据
- 列表数据：分页查询，避免一次性加载过多
- 图片资源：上传至云存储，使用临时链接

## 常见问题

### 1. 微信开发者工具运行不起来？
**可能原因**：
- AppID 配置错误 → 检查 `project.config.json`
- 项目路径错误 → 确保选择的是 `miniprogram` 目录
- 基础库版本过低 → 在开发者工具中升级基础库

**解决方案**：
- 确认 AppID：`wx1fcc50274a1234f3`
- 检查 `project.config.json` 中的配置
- 更新微信开发者工具到最新版本

### 2. CloudBase 初始化失败？
- 检查环境 ID 是否正确
- 确认已在微信开发者工具中开通云开发
- 查看控制台错误信息

## 相关链接
- [CloudBase 控制台](https://tcb.cloud.tencent.com/dev)
- [微信小程序文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [CloudBase 文档](https://cloud.tencent.com/document/product/876)

---

**创建时间**：2026-05-03  
**维护者**：tencent-cloud-dev-agent 🏠  
**品牌**：锦汇邦本地生活服务平台
