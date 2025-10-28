/**
 * 配置导入/导出管理
 */

import { drawSeal } from './sealCanvas';

/**
 * 导出公章配置到 JSON 文件
 */
export function exportSealsConfig(seals) {
  // 移除 imageData 和 createdAt（减小文件体积）
  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    seals: seals.map(seal => {
      const { imageData, createdAt, ...config } = seal;
      return config;
    })
  };

  // 生成 JSON 文件
  const jsonStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `公章配置_${Date.now()}.json`;
  link.click();

  URL.revokeObjectURL(url);
}

/**
 * 导入公章配置
 */
export async function importSealsConfig(file, currentSeals = []) {
  return new Promise((resolve, reject) => {
    // 1. 验证文件格式
    if (!file.name.endsWith('.json')) {
      reject(new Error('只支持 .json 格式的配置文件'));
      return;
    }

    // 2. 读取文件
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const importData = JSON.parse(text);

        // 3. 验证数据结构
        if (!importData.seals || !Array.isArray(importData.seals)) {
          reject(new Error('配置文件格式错误'));
          return;
        }

        // 4. 检查数量限制
        if (currentSeals.length + importData.seals.length > 4) {
          reject(new Error('导入失败：公章总数不能超过 4 个'));
          return;
        }

        // 5. 重新生成公章图片
        const canvas = document.createElement('canvas');
        const newSeals = importData.seals.map(config => {
          // 根据配置重新绘制公章
          const imageData = drawSeal(canvas, config);

          return {
            ...config,
            id: config.id || `seal_${Date.now()}_${Math.random()}`,
            imageData: imageData,
            createdAt: Date.now()
          };
        });

        resolve(newSeals);
      } catch (error) {
        reject(new Error(`解析配置文件失败: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('读取文件失败'));
    };

    reader.readAsText(file);
  });
}
