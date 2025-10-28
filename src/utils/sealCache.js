/**
 * 公章缓存管理器
 * 用于内存缓存公章图片，避免重复绘制
 */

class SealCache {
  constructor() {
    this.cache = new Map(); // 内存缓存
  }

  /**
   * 初始化缓存：应用启动时调用
   */
  init(seals) {
    this.cache.clear();

    // 将所有公章的 Base64 图片缓存到内存
    seals.forEach(seal => {
      if (seal.imageData) {
        this.cache.set(seal.id, seal.imageData);
      }
    });

    console.log(`公章缓存已初始化，共 ${this.cache.size} 个`);
  }

  /**
   * 获取公章图片
   */
  get(sealId) {
    return this.cache.get(sealId);
  }

  /**
   * 更新缓存
   */
  set(sealId, imageData) {
    this.cache.set(sealId, imageData);
  }

  /**
   * 删除缓存
   */
  delete(sealId) {
    this.cache.delete(sealId);
  }

  /**
   * 清空缓存
   */
  clear() {
    this.cache.clear();
  }

  /**
   * 获取缓存大小
   */
  size() {
    return this.cache.size;
  }
}

// 全局单例
export const sealCache = new SealCache();
