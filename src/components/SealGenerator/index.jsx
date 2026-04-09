/**
 * 公章生成器主组件
 */

import { useState, useRef, useEffect } from 'react';
import { Form, Input, Radio, Slider, Switch, ColorPicker, Button, message, Space } from 'antd';
import { drawSeal } from '../../utils/sealCanvas';
import { SEAL_PRESETS, applyPreset } from '../../utils/sealPresets';
import { useDebounce } from '../../hooks/useDebounce';
import { addSeal } from '../../utils/storage';
import './index.css';

export default function SealGenerator({ onSuccess, onCancel }) {
  const [form] = Form.useForm();
  const canvasRef = useRef(null);

  // 表单值
  const [companyName, setCompanyName] = useState('丽水左耳网络文化传播有限公司');
  const [preset, setPreset] = useState('standard');
  const [textSpacing, setTextSpacing] = useState(1.0);
  const [color, setColor] = useState('#FF0000');
  const [showSerialNumber, setShowSerialNumber] = useState(false);
  const [serialNumber, setSerialNumber] = useState('91331021000090904');
  const [showSealType, setShowSealType] = useState(false);
  const [sealType, setSealType] = useState('');
  const [sealName, setSealName] = useState('');
  const [fontFamily, setFontFamily] = useState('"SimSun", "STZhongsong", "Songti SC", serif');

  // 防抖处理
  const debouncedCompanyName = useDebounce(companyName, 200);
  const debouncedTextSpacing = useDebounce(textSpacing, 200);
  const debouncedSerialNumber = useDebounce(serialNumber, 200);
  const debouncedSealType = useDebounce(sealType, 200);

  // 实时预览
  useEffect(() => {
    if (!canvasRef.current || !debouncedCompanyName) return;

    const config = applyPreset(preset, debouncedCompanyName);

    drawSeal(canvasRef.current, {
      ...config,
      textSpacing: debouncedTextSpacing,
      color,
      showSerialNumber,
      serialNumber: debouncedSerialNumber,
      showSealType,
      sealType: debouncedSealType,
      fontFamily
    });
  }, [debouncedCompanyName, preset, debouncedTextSpacing, color, showSerialNumber, debouncedSerialNumber, showSealType, debouncedSealType, fontFamily]);

  // 处理预设切换
  const handlePresetChange = (e) => {
    const presetKey = e.target.value;
    setPreset(presetKey);

    const presetConfig = SEAL_PRESETS[presetKey];
    if (presetConfig.showSealType) {
      setShowSealType(true);
      setSealType(presetConfig.sealType);
    }
  };

  // 保存公章
  const handleSave = () => {
    if (!companyName || companyName.length < 5 || companyName.length > 20) {
      message.error('公司名称必须为5-20个字');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      message.error('公章生成失败');
      return;
    }

    const config = applyPreset(preset, companyName);
    const imageData = canvas.toDataURL('image/png');

    const sealData = {
      id: `seal_${Date.now()}`,
      name: sealName || `${companyName.substring(0, 6)}...公章`,
      companyName,
      preset,
      textSpacing,
      color,
      ...config,
      showSerialNumber,
      serialNumber: showSerialNumber ? serialNumber : '',
      showSealType,
      sealType: showSealType ? sealType : '',
      fontFamily,
      imageData,
      createdAt: Date.now()
    };

    const success = addSeal(sealData);
    if (success) {
      message.success('公章创建成功！');
      if (onSuccess) onSuccess(sealData);
    } else {
      message.error('保存失败');
    }
  };

  return (
    <div className="seal-generator">
      <div className="generator-content">
        {/* 左侧表单 */}
        <div className="form-section">
          <h3>创建新公章</h3>
          <Form form={form} layout="vertical">
            <Form.Item
              label="公司名称（5-20字）"
              required
              help={companyName.length > 14 ? '提示：超过14字建议调整字间距' : ''}
            >
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="请输入公司名称"
                maxLength={20}
                showCount
              />
            </Form.Item>

            <Form.Item label="公章预设">
              <Radio.Group value={preset} onChange={handlePresetChange}>
                <Space direction="vertical">
                  <Radio value="standard">标准公章 (200px)</Radio>
                  <Radio value="contract">合同专用章 (180px)</Radio>
                  <Radio value="finance">财务专用章 (160px)</Radio>
                </Space>
              </Radio.Group>
            </Form.Item>

            <Form.Item label={`字间距调整: ${textSpacing.toFixed(1)}`}>
              <Slider
                min={0.6}
                max={1.4}
                step={0.1}
                value={textSpacing}
                onChange={setTextSpacing}
                marks={{
                  0.6: '紧凑',
                  1.0: '标准',
                  1.4: '宽松'
                }}
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Switch
                  checked={showSerialNumber}
                  onChange={setShowSerialNumber}
                />
                <span>显示编号（底部圆弧）</span>
              </Space>
            </Form.Item>

            {showSerialNumber && (
              <Form.Item>
                <Input
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="请输入编号"
                  maxLength={30}
                />
              </Form.Item>
            )}

            <Form.Item>
              <Space>
                <Switch
                  checked={showSealType}
                  onChange={setShowSealType}
                />
                <span>显示章类型（五角星下方）</span>
              </Space>
            </Form.Item>

            {showSealType && (
              <Form.Item>
                <Input
                  value={sealType}
                  onChange={(e) => setSealType(e.target.value)}
                  placeholder="如：合同专用章"
                  maxLength={10}
                />
              </Form.Item>
            )}

            <Form.Item label="颜色">
              <ColorPicker
                value={color}
                onChange={(_, hex) => setColor(hex)}
                showText
              />
            </Form.Item>

            <Form.Item label="字体选择">
              <Radio.Group value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
                <Radio value={'"SimSun", "STZhongsong", "Songti SC", serif'}>宋体 (推荐)</Radio>
                <Radio value={'"SimHei", "Microsoft YaHei", "PingFang SC", sans-serif'}>黑体</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item label="公章名称（可选）">
              <Input
                value={sealName}
                onChange={(e) => setSealName(e.target.value)}
                placeholder="如：公司公章"
                maxLength={20}
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" onClick={handleSave} size="large">
                  创建公章
                </Button>
                {onCancel && (
                  <Button onClick={onCancel} size="large">
                    取消
                  </Button>
                )}
              </Space>
            </Form.Item>
          </Form>
        </div>

        {/* 右侧预览 */}
        <div className="preview-section">
          <h3>实时预览</h3>
          <div className="canvas-wrapper">
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
