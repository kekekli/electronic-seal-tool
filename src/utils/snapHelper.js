/**
 * 吸附辅助工具
 */

const SNAP_THRESHOLD = 10; // 吸附阈值（像素）
const MARGIN = 50;         // 标准边距

/**
 * 公章拖拽吸附逻辑
 */
export function handleSealDrag(x, y, pageWidth, pageHeight, sealWidth, sealHeight) {
  let snappedX = x;
  let snappedY = y;
  const snapLines = [];

  // 计算公章中心点
  const centerX = x + sealWidth / 2;
  const centerY = y + sealHeight / 2;

  // 水平中心线吸附
  if (Math.abs(centerX - pageWidth / 2) < SNAP_THRESHOLD) {
    snappedX = pageWidth / 2 - sealWidth / 2;
    snapLines.push({
      type: 'vertical',
      position: pageWidth / 2
    });
  }

  // 垂直中心线吸附
  if (Math.abs(centerY - pageHeight / 2) < SNAP_THRESHOLD) {
    snappedY = pageHeight / 2 - sealHeight / 2;
    snapLines.push({
      type: 'horizontal',
      position: pageHeight / 2
    });
  }

  // 左边距吸附
  if (Math.abs(x - MARGIN) < SNAP_THRESHOLD) {
    snappedX = MARGIN;
    snapLines.push({
      type: 'vertical',
      position: MARGIN
    });
  }

  // 右边距吸附
  if (Math.abs(x + sealWidth - (pageWidth - MARGIN)) < SNAP_THRESHOLD) {
    snappedX = pageWidth - MARGIN - sealWidth;
    snapLines.push({
      type: 'vertical',
      position: pageWidth - MARGIN
    });
  }

  // 上边距吸附
  if (Math.abs(y - MARGIN) < SNAP_THRESHOLD) {
    snappedY = MARGIN;
    snapLines.push({
      type: 'horizontal',
      position: MARGIN
    });
  }

  // 下边距吸附
  if (Math.abs(y + sealHeight - (pageHeight - MARGIN)) < SNAP_THRESHOLD) {
    snappedY = pageHeight - MARGIN - sealHeight;
    snapLines.push({
      type: 'horizontal',
      position: pageHeight - MARGIN
    });
  }

  return {
    x: snappedX,
    y: snappedY,
    snapLines: snapLines
  };
}

/**
 * 快捷定位功能
 */
export function quickPosition(position, pageWidth, pageHeight, sealWidth, sealHeight) {
  const positions = {
    topLeft: {
      x: MARGIN,
      y: MARGIN
    },
    topRight: {
      x: pageWidth - MARGIN - sealWidth,
      y: MARGIN
    },
    bottomLeft: {
      x: MARGIN,
      y: pageHeight - MARGIN - sealHeight
    },
    bottomRight: {
      x: pageWidth - MARGIN - sealWidth,
      y: pageHeight - MARGIN - sealHeight
    },
    center: {
      x: (pageWidth - sealWidth) / 2,
      y: (pageHeight - sealHeight) / 2
    }
  };

  return positions[position];
}

/**
 * 记录和使用上次盖章位置
 */
export const LastPositionManager = {
  // 保存最后使用的位置
  save(x, y) {
    localStorage.setItem('lastSealPosition', JSON.stringify({ x, y }));
  },

  // 获取最后使用的位置
  get() {
    const data = localStorage.getItem('lastSealPosition');
    return data ? JSON.parse(data) : null;
  },

  // 应用到当前
  apply(pageWidth, pageHeight, sealWidth, sealHeight) {
    const lastPos = this.get();
    if (!lastPos) return null;

    // 验证位置是否在当前页面范围内
    if (lastPos.x + sealWidth <= pageWidth &&
        lastPos.y + sealHeight <= pageHeight &&
        lastPos.x >= 0 &&
        lastPos.y >= 0) {
      return lastPos;
    }

    return null;
  }
};
