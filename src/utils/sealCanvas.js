/**
 * 公章绘制核心算法（修改版）
 * ⚠️ 关键修改：编号在上半圆，公司名在下半圆
 */

/**
 * 绘制五角星
 */
function drawFivePointedStar(ctx, cx, cy, size, color) {
  const outerRadius = size / 2;
  const innerRadius = outerRadius * 0.382; // 黄金比例

  ctx.fillStyle = color;
  ctx.beginPath();

  for (let i = 0; i < 5; i++) {
    // 外顶点
    const outerAngle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const outerX = cx + outerRadius * Math.cos(outerAngle);
    const outerY = cy + outerRadius * Math.sin(outerAngle);

    if (i === 0) {
      ctx.moveTo(outerX, outerY);
    } else {
      ctx.lineTo(outerX, outerY);
    }

    // 内顶点
    const innerAngle = outerAngle + Math.PI / 5;
    const innerX = cx + innerRadius * Math.cos(innerAngle);
    const innerY = cy + innerRadius * Math.sin(innerAngle);
    ctx.lineTo(innerX, innerY);
  }

  ctx.closePath();
  ctx.fill();
}

/**
 * 在圆弧上绘制文字（支持上半圆和下半圆）
 * ⚠️ 核心函数：已修改为支持上下半圆
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas上下文
 * @param {string} text - 要绘制的文字
 * @param {Object} config - 配置参数
 */
function drawTextOnArc(ctx, text, config) {
  const {
    centerX,
    centerY,
    outerRadius,
    fontSize,
    textSpacing = 1.0,
    color,
    position = 'top',  // 'top' 或 'bottom'
    fontFamily = '"SimHei", "Microsoft YaHei", "PingFang SC", sans-serif'
  } = config;

  // 1. 计算文字圆弧半径（在外圆内侧）
  const textRadius = outerRadius - 18;

  // 2. 根据字数动态计算弧长
  const charCount = text.length;
  let baseArcSpan;

  if (charCount <= 8) {
    baseArcSpan = Math.PI * 0.6;      // 8字以下：60%圆弧（约108度）
  } else if (charCount <= 14) {
    baseArcSpan = Math.PI * 0.7;      // 9-14字：70%圆弧（约126度）
  } else {
    baseArcSpan = Math.PI * 0.8;      // 15-20字：80%圆弧（约144度）
  }

  // 应用用户调整的字间距系数
  const arcSpan = baseArcSpan * textSpacing;

  // 3. 根据位置计算起始角度
  let startAngle;
  
  if (position === 'top') {
    // 上半圆：从左上到右上
    startAngle = Math.PI / 2 + arcSpan / 2;
  } else {
    // 下半圆：从左下到右下
    startAngle = Math.PI + (Math.PI - arcSpan) / 2;
  }

  // 4. 计算每个字符的角度间隔
  const angleStep = charCount > 1 ? arcSpan / (charCount - 1) : 0;

  // 5. 设置字体样式
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 6. 逐个绘制字符
  text.split('').forEach((char, index) => {
    // 根据位置决定角度计算方式
    const angle = position === 'top'
      ? startAngle - (angleStep * index)  // 上半圆：角度递减（从左到右）
      : startAngle + (angleStep * index); // 下半圆：角度递增（从左到右）

    // 使用三角函数计算字符在圆弧上的位置
    const x = centerX + textRadius * Math.cos(angle);
    const y = centerY + textRadius * Math.sin(angle);

    // 保存当前状态
    ctx.save();

    // 移动到目标位置
    ctx.translate(x, y);

    // 根据位置决定旋转方向
    const rotation = position === 'top'
      ? angle - Math.PI / 2   // 上半圆：垂直于半径，头朝外
      : angle + Math.PI / 2;  // 下半圆：垂直于半径，头朝外

    ctx.rotate(rotation);

    // 绘制字符（在旋转后的坐标系原点）
    ctx.fillText(char, 0, 0);

    // 恢复状态
    ctx.restore();
  });
}

/**
 * 在上半圆弧上绘制编号（已修改）
 * ⚠️ 现在绘制在上半圆
 */
function drawSerialNumberOnArc(ctx, serialNumber, config) {
  const {
    centerX,
    centerY,
    outerRadius,
    serialNumberFontSize = 12,
    color
  } = config;

  // 调用通用函数，指定位置为 'top'（上半圆）
  drawTextOnArc(ctx, serialNumber, {
    centerX,
    centerY,
    outerRadius,
    fontSize: serialNumberFontSize,
    textSpacing: 1.0,
    color,
    position: 'top',  // ⚠️ 上半圆
    fontFamily: '"Arial", "Courier New", monospace'
  });
}

/**
 * 在下半圆弧上绘制公司名称（已修改）
 * ⚠️ 现在绘制在下半圆
 */
function drawCompanyNameOnArc(ctx, companyName, config) {
  const {
    centerX,
    centerY,
    outerRadius,
    fontSize,
    textSpacing = 1.0,
    color
  } = config;

  // 调用通用函数，指定位置为 'bottom'（下半圆）
  drawTextOnArc(ctx, companyName, {
    centerX,
    centerY,
    outerRadius,
    fontSize,
    textSpacing,
    color,
    position: 'bottom',  // ⚠️ 下半圆
    fontFamily: '"SimHei", "Microsoft YaHei", "PingFang SC", sans-serif'
  });
}

/**
 * 绘制完整公章
 * @param {HTMLCanvasElement} canvas - Canvas元素
 * @param {Object} config - 公章配置
 * @returns {string} Base64 PNG图片
 */
export function drawSeal(canvas, config) {
  const ctx = canvas.getContext('2d');

  const {
    companyName,
    diameter = 200,
    lineWidth = 4,
    fontSize = 20,
    textSpacing = 1.0,
    starSize = 50,
    starOffsetY = 15,
    color = '#FF0000',
    showSerialNumber = false,
    serialNumber = '',
    serialNumberFontSize = 12,
    showSealType = false,
    sealType = ''
  } = config;

  // 设置画布大小（留边距）
  canvas.width = diameter + 20;
  canvas.height = diameter + 20;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const outerRadius = diameter / 2 - 5;
  const innerRadius = outerRadius - lineWidth;

  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. 绘制外圈双圆环
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
  ctx.stroke();

  // 2. 绘制编号（上半圆弧）- 可选 ⚠️ 位置已对调
  if (showSerialNumber && serialNumber) {
    drawSerialNumberOnArc(ctx, serialNumber, {
      centerX,
      centerY,
      outerRadius,
      serialNumberFontSize,
      color
    });
  }

  // 3. 绘制五角星（偏下）
  const starY = centerY + starOffsetY;
  drawFivePointedStar(ctx, centerX, starY, starSize, color);

  // 4. 绘制公司名称（下半圆弧）⚠️ 位置已对调
  drawCompanyNameOnArc(ctx, companyName, {
    centerX,
    centerY,
    outerRadius,
    fontSize,
    textSpacing,
    color
  });

  // 5. 绘制章类型（水平）- 可选
  if (showSealType && sealType) {
    ctx.font = `${diameter * 0.07}px "SimHei", "Microsoft YaHei", sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sealType, centerX, starY + starSize / 2 + 15);
  }

  // 返回base64图片
  return canvas.toDataURL('image/png');
}
