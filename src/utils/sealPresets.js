/**
 * 公章预设模板配置
 */

export const SEAL_PRESETS = {
  standard: {
    name: '标准公章',
    diameter: 200,
    lineWidth: 4,          // diameter / 50
    fontSize: 20,          // 根据字数动态调整
    starSize: 50,          // diameter * 0.25
    starOffsetY: 15,       // diameter * 0.075
    color: '#FF0000'
  },
  contract: {
    name: '合同专用章',
    diameter: 180,
    lineWidth: 3.6,        // 180 / 50
    fontSize: 18,
    starSize: 45,          // 180 * 0.25
    starOffsetY: 13.5,     // 180 * 0.075
    color: '#FF0000',
    showSealType: true,
    sealType: '合同专用章'
  },
  finance: {
    name: '财务专用章',
    diameter: 160,
    lineWidth: 3.2,        // 160 / 50
    fontSize: 16,
    starSize: 40,          // 160 * 0.25
    starOffsetY: 12,       // 160 * 0.075
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
  const baseSize = diameter * 0.1;  // 基础比例：直径的 10%

  // 字数越多，字号相应缩小
  if (charCount <= 8) {
    return baseSize;
  } else if (charCount <= 14) {
    return baseSize * 0.9;
  } else {
    return baseSize * 0.8;  // 15-20字
  }
}

/**
 * 根据直径计算其他参数
 */
export function calculateSealParams(diameter, companyName) {
  return {
    lineWidth: diameter / 50,
    fontSize: calculateFontSize(companyName, diameter),
    starSize: diameter * 0.25,
    starOffsetY: diameter * 0.075,
    serialNumberFontSize: diameter * 0.06  // 编号字号
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
