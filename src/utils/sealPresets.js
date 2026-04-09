/**
 * 公章预设模板配置
 */

export const SEAL_PRESETS = {
  standard: {
    name: '标准公章',
    diameter: 200,
    lineWidth: 5,          // diameter / 40 (更厚实的边框)
    fontSize: 24,          // 提升初始字号
    starSize: 70,          // diameter * 0.35 (更大的五角星)
    starOffsetY: 10,       // diameter * 0.05 (更接近几何中心)
    color: '#FF0000'
  },
  contract: {
    name: '合同专用章',
    diameter: 180,
    lineWidth: 4.5,
    fontSize: 22,
    starSize: 63,
    starOffsetY: 9,
    color: '#FF0000',
    showSealType: true,
    sealType: '合同专用章'
  },
  finance: {
    name: '财务专用章',
    diameter: 160,
    lineWidth: 4,
    fontSize: 20,
    starSize: 56,
    starOffsetY: 8,
    color: '#FF0000',
    showSealType: true,
    sealType: '财务专用章'
  }
};

/**
 * 根据公司名称字数和直径，智能计算字体大小
 */
export function calculateFontSize(companyName, diameter) {
  const charCount = companyName.length;
  const baseSize = diameter * 0.12;  // 提升比例：直径的 12%
  
  if (charCount <= 8) {
    return baseSize;
  } else if (charCount <= 14) {
    return baseSize * 0.9;
  } else {
    return baseSize * 0.85; // 针对长字符名进行微调
  }
}

/**
 * 根据直径计算其他参数
 */
export function calculateSealParams(diameter, companyName) {
  return {
    lineWidth: diameter / 40,
    fontSize: calculateFontSize(companyName, diameter),
    starSize: diameter * 0.35,
    starOffsetY: diameter * 0.05,
    serialNumberFontSize: diameter * 0.06
  };
}

/**
 * 应用预设模板
 */
export function applyPreset(presetKey, companyName) {
  const preset = SEAL_PRESETS[presetKey];
  const calculatedParams = calculateSealParams(preset.diameter, companyName);

  return {
    ...preset,
    ...calculatedParams,
    companyName: companyName
  };
}
