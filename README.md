# 📮 电子公章工具

> 纯前端公章生成与PDF盖章工具

## ✨ 功能特性

### 🎨 公章生成
- ✅ 支持 5-20 字公司名称
- ✅ 圆弧文字算法（三角函数实现）
- ✅ 3个预设模板（标准/合同/财务公章）
- ✅ 智能参数联动计算
- ✅ 字间距调整（0.6-1.4）
- ✅ 可选编号和章类型
- ✅ 实时预览（防抖优化）

### 📦 公章管理
- ✅ 公章库管理（最多4个）
- ✅ 编辑/删除功能
- ✅ 配置导入/导出（JSON格式）
- ✅ 内存缓存优化

### 📄 PDF盖章
- ✅ PDF文件上传（拖拽或点击）
- ✅ PDF预览渲染（pdfjs-dist）
- ✅ 完整盖章编辑器
- ✅ 公章拖拽与吸附
- ✅ 快捷定位（5个位置）
- ✅ 键盘微调（方向键1px）
- ✅ 属性调整（大小/透明度/旋转）
- ✅ 坐标显示和输入
- ✅ 上次位置记忆
- ✅ 盖章后预览实时更新
- ✅ PDF导出功能

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

## 📦 技术栈

- **前端框架：** React 18.3.1
- **构建工具：** Vite 6.x
- **UI组件库：** Ant Design 5.x
- **PDF处理：** pdf-lib（编辑）+ pdfjs-dist（渲染）
- **文件压缩：** JSZip
- **数据存储：** localStorage

## 🎯 使用流程

### 1. 创建公章
1. 进入"✨ 创建公章"标签页
2. 输入公司名称（5-20字）
3. 选择预设模板
4. 调整参数
5. 点击"创建公章"

### 2. 上传PDF
1. 进入"📄 PDF盖章"标签页
2. 拖拽或点击上传PDF文件
3. 查看文件信息
4. 点击"开始盖章"

### 3. 盖章编辑
1. 进入"🖊️ 盖章编辑器"标签页
2. 选择公章
3. 拖拽或使用快捷定位
4. 调整大小/透明度/旋转
5. 点击"应用到当前页"
6. 翻页继续盖章
7. 点击"导出PDF"

## 🔧 核心技术

### 圆弧文字算法
使用三角函数（`Math.cos`、`Math.sin`）计算文字在圆弧上的位置：

```javascript
const angle = startAngle - (angleStep * index);
const x = centerX + textRadius * Math.cos(angle);
const y = centerY + textRadius * Math.sin(angle);
ctx.rotate(angle - Math.PI / 2);
```

### PDF坐标系转换
Canvas坐标系（原点左上）→ PDF坐标系（原点左下）：

```javascript
const pdfY = pageHeight - canvasY - height;
```

### 双ArrayBuffer机制
为 pdf-lib 和 pdfjs-dist 分别准备独立的 ArrayBuffer，避免冲突：

```javascript
const arrayBuffer1 = await file.arrayBuffer(); // pdf-lib
const arrayBuffer2 = await file.arrayBuffer(); // pdfjs-dist
```

## 📝 版本历史

### v2.0 (2025-10-28)
- ✅ 完整PDF盖章与预览功能
- ✅ 盖章编辑器（拖拽、吸附、精准定位）
- ✅ PDF预览渲染
- ✅ 盖章后实时更新预览
- ✅ PDF导出功能

### v1.0 (2025-10-28)
- ✅ 公章生成核心功能
- ✅ 圆弧文字算法
- ✅ 3个预设模板
- ✅ 公章管理
- ✅ 配置导入/导出

## 📄 许可证

MIT License

## 🙏 致谢

Generated with [Claude Code](https://claude.com/claude-code)
