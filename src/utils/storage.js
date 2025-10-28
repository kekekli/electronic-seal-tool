/**
 * localStorage 封装
 */

const STORAGE_KEY = 'electronic-seals';

/**
 * 保存公章列表
 */
export function saveSeals(seals) {
  try {
    const data = {
      seals: seals,
      updatedAt: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('保存公章失败:', error);
    return false;
  }
}

/**
 * 加载公章列表
 */
export function loadSeals() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
    }
    const parsed = JSON.parse(data);
    return parsed.seals || [];
  } catch (error) {
    console.error('加载公章失败:', error);
    return [];
  }
}

/**
 * 添加公章
 */
export function addSeal(seal) {
  const seals = loadSeals();
  seals.push(seal);
  return saveSeals(seals);
}

/**
 * 更新公章
 */
export function updateSeal(id, updatedSeal) {
  const seals = loadSeals();
  const index = seals.findIndex(s => s.id === id);
  if (index !== -1) {
    seals[index] = { ...seals[index], ...updatedSeal };
    return saveSeals(seals);
  }
  return false;
}

/**
 * 删除公章
 */
export function deleteSeal(id) {
  const seals = loadSeals();
  const filtered = seals.filter(s => s.id !== id);
  return saveSeals(filtered);
}

/**
 * 获取单个公章
 */
export function getSeal(id) {
  const seals = loadSeals();
  return seals.find(s => s.id === id);
}

/**
 * 清空所有公章
 */
export function clearAllSeals() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('清空公章失败:', error);
    return false;
  }
}
