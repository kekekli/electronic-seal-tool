/**
 * 公章绘制核心算法
 * ⚠️ 仿真版：实现单圈厚重边框与文字纵向拉伸
 */

/**
 * 绘制五角星
 */
function drawFivePointedStar(ctx, cx, cy, size, color) {
  const outerRadius = size / 2;
  const innerRadius = outerRadius * 0.382;

  ctx.fillStyle = color;
  ctx.beginPath();

  for (let i = 0; i < 5; i++) {
    const outerAngle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const outerX = cx + outerRadius * Math.cos(outerAngle);
    const outerY = cy + outerRadius * Math.sin(outerAngle);

    if (i === 0) ctx.moveTo(outerX, outerY);
    else ctx.lineTo(outerX, outerY);

    const innerAngle = outerAngle + Math.PI / 5;
    const innerX = cx + innerRadius * Math.cos(innerAngle);
    const innerY = cy + innerRadius * Math.sin(innerAngle);
    ctx.lineTo(innerX, innerY);
  }

  ctx.closePath();
  ctx.fill();
}

/**
 * 在圆弧上绘制文字
 */
function drawTextOnArc(ctx, text, config) {
  const {
    centerX,
    centerY,
    outerRadius,
    fontSize,
    textSpacing = 1.0,
    color,
    position = 'top',
    fontFamily = '"SimSun", "STZhongsong", "Songti SC", serif'
  } = config;

  // 1. 文字圆弧半径（紧贴边框）
  const textRadius = outerRadius - 20;

  // 2. 仿真弧度计算：扩大弧度，使文字分布更广
  const charCount = text.length;
  let baseArcSpan;

  if (position === 'top') {
    if (charCount <= 8) baseArcSpan = Math.PI * 0.8;
    else if (charCount <= 14) baseArcSpan = Math.PI * 1.0;
    else baseArcSpan = Math.PI * 1.2;
  } else {
    baseArcSpan = Math.PI * 0.6;
  }

  const arcSpan = baseArcSpan * textSpacing;

  // 3. 计算起始角度
  let startAngle;
  if (position === 'top') {
    startAngle = Math.PI * 1.5 - arcSpan / 2;
  } else {
    startAngle = Math.PI * 0.5 + arcSpan / 2;
  }

  const angleStep = charCount > 1 ? arcSpan / (charCount - 1) : 0;

  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 6. 绘制（带纵向拉伸仿真）
  text.split('').forEach((char, index) => {
    let angle;
    if (position === 'top') {
      angle = startAngle + (angleStep * index);
    } else {
      angle = startAngle - (angleStep * index);
    }

    const x = centerX + textRadius * Math.cos(angle);
    const y = centerY + textRadius * Math.sin(angle);

    ctx.save();
    ctx.translate(x, y);

    if (position === 'top') {
      ctx.rotate(angle + Math.PI / 2);
    } else {
      ctx.rotate(angle - Math.PI / 2);
    }

    // ⚠️ 物理仿真核心：公章特有的纵向拉伸（窄高字）
    ctx.scale(0.82, 1.4); 
    
    ctx.fillText(char, 0, 0);
    ctx.restore();
  });
}

/**
 * 绘制公章
 */
export function drawSeal(canvas, config) {
  const ctx = canvas.getContext('2d');
  const {
    companyName,
    diameter = 200,
    lineWidth = 5,
    fontSize = 24,
    textSpacing = 1.0,
    starSize = 70,
    starOffsetY = 10,
    color = '#FF0000',
    showSerialNumber = false,
    serialNumber = '',
    serialNumberFontSize = 12,
    showSealType = false,
    sealType = '',
    fontFamily = '"SimSun", "STZhongsong", "Songti SC", serif'
  } = config;

  // 增大画布以包含加粗边框
  canvas.width = diameter + 30;
  canvas.height = diameter + 30;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const outerRadius = diameter / 2 - lineWidth / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. 绘制加厚单圈边框（实物公章标准）
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
  ctx.stroke();

  // 2. 绘制公司名
  drawTextOnArc(ctx, companyName, {
    centerX,
    centerY,
    outerRadius,
    fontSize,
    textSpacing,
    color,
    position: 'top',
    fontFamily
  });

  // 3. 绘制五角星
  const starY = centerY + starOffsetY;
  drawFivePointedStar(ctx, centerX, starY, starSize, color);

  // 4. 绘制编号
  if (showSerialNumber && serialNumber) {
    drawTextOnArc(ctx, serialNumber, {
      centerX,
      centerY,
      outerRadius,
      fontSize: serialNumberFontSize,
      textSpacing: 1.0,
      color,
      position: 'bottom',
      fontFamily: '"Arial", "Courier New", monospace'
    });
  }

  // 5. 绘制章类型
  if (showSealType && sealType) {
    ctx.font = `bold ${diameter * 0.08}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sealType, centerX, starY + starSize / 2 + 18);
  }

  return canvas.toDataURL('image/png');
}
