/**
 * 盖章编辑器主组件（最终修复版 - 完整版）
 */

import { useState, useEffect, useRef } from 'react';
import { Card, Select, Slider, Button, Space, message, InputNumber, Row, Col, Divider } from 'antd';
import { LeftOutlined, RightOutlined, DownloadOutlined } from '@ant-design/icons';
import { loadSeals } from '../../utils/storage';
import { sealCache } from '../../utils/sealCache';
import { 
  stampPDF, 
  savePDF, 
  downloadPDF, 
  getPageSize, 
  renderPDFToCanvas,
  updateRenderBytes 
} from '../../utils/pdfHandler';
import { handleSealDrag, quickPosition, LastPositionManager } from '../../utils/snapHelper';
import './index.css';

export default function StampEditor({ pdfData, onBack }) {
  // 公章列表
  const [seals, setSeals] = useState([]);
  const [selectedSealId, setSelectedSealId] = useState(null);

  // 当前页面
  const [currentPage, setCurrentPage] = useState(0);

  // 公章属性
  const [sealSize, setSealSize] = useState(150);
  const [sealOpacity, setSealOpacity] = useState(1);
  const [sealRotation, setSealRotation] = useState(0);

  // 公章位置
  const [sealPosition, setSealPosition] = useState({ x: 100, y: 100 });

  // 拖拽状态
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // 页面尺寸
  const [pageSize, setPageSize] = useState({ width: 595, height: 842 });

  // Canvas引用
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // 渲染状态
  const [isRendering, setIsRendering] = useState(false);

  // ⚠️ 保存当前用于渲染的字节数组
  const [renderBytes, setRenderBytes] = useState(null);

  // 加载公章列表
  useEffect(() => {
    const loadedSeals = loadSeals();
    setSeals(loadedSeals);
    if (loadedSeals.length > 0) {
      setSelectedSealId(loadedSeals[0].id);
    }
  }, []);

  // ⚠️ 初始化渲染字节数组
  useEffect(() => {
    if (pdfData) {
      console.log('========== StampEditor: 检查 PDF 数据 ==========');
      console.log('📦 pdfData 字段:', Object.keys(pdfData));
      console.log('📦 pdfBytesForRender:', !!pdfData.pdfBytesForRender);
      console.log('📦 pdfBytesForRender 类型:', pdfData.pdfBytesForRender?.constructor.name);
      console.log('📦 pdfBytesForRender 长度:', pdfData.pdfBytesForRender?.byteLength || pdfData.pdfBytesForRender?.length);
      
      if (pdfData.pdfBytesForRender) {
        console.log('✅ 设置渲染字节数组');
        setRenderBytes(pdfData.pdfBytesForRender);
      } else {
        console.error('❌ 没有找到 pdfBytesForRender！');
        message.error('PDF 数据缺失，请重新上传');
      }
      
      console.log('========== 检查完成 ==========');
    }
  }, [pdfData]);

  // 获取页面尺寸
  useEffect(() => {
    if (pdfData && pdfData.pdfDoc) {
      const size = getPageSize(pdfData.pdfDoc, currentPage);
      setPageSize(size);
    }
  }, [pdfData, currentPage]);

  // ⚠️ 渲染 PDF 到 Canvas
  useEffect(() => {
    if (renderBytes && canvasRef.current) {
      renderPDFPage();
    }
  }, [renderBytes, currentPage]);

  // 渲染 PDF 页面
  const renderPDFPage = async () => {
    if (!renderBytes || !canvasRef.current) {
      console.error('❌ renderBytes 或 canvas 不存在');
      console.error('renderBytes:', !!renderBytes);
      console.error('canvas:', !!canvasRef.current);
      return;
    }

    setIsRendering(true);

    try {
      console.log('========== StampEditor: 开始渲染 PDF 页面 ==========');
      console.log('📄 当前页码:', currentPage);
      console.log('📦 renderBytes 类型:', renderBytes.constructor.name);
      console.log('📦 renderBytes 长度:', renderBytes.byteLength || renderBytes.length);

      await renderPDFToCanvas(
        renderBytes,
        currentPage,
        canvasRef.current,
        1
      );

      console.log('✅ StampEditor: PDF 页面渲染成功');
    } catch (error) {
      console.error('❌ StampEditor: PDF 渲染失败:', error);
      message.error(`PDF 渲染失败: ${error.message}`);
    } finally {
      setIsRendering(false);
    }
  };

  // 键盘微调
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();

        setSealPosition(prev => {
          let newX = prev.x;
          let newY = prev.y;

          switch (e.key) {
            case 'ArrowUp':
              newY = Math.max(0, prev.y - 1);
              break;
            case 'ArrowDown':
              newY = Math.min(pageSize.height - sealSize, prev.y + 1);
              break;
            case 'ArrowLeft':
              newX = Math.max(0, prev.x - 1);
              break;
            case 'ArrowRight':
              newX = Math.min(pageSize.width - sealSize, prev.x + 1);
              break;
          }

          return { x: newX, y: newY };
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pageSize, sealSize]);

  // 鼠标按下
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (
      mouseX >= sealPosition.x &&
      mouseX <= sealPosition.x + sealSize &&
      mouseY >= sealPosition.y &&
      mouseY <= sealPosition.y + sealSize
    ) {
      setIsDragging(true);
      setDragStart({
        x: mouseX - sealPosition.x,
        y: mouseY - sealPosition.y
      });
    }
  };

  // 鼠标移动
  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let newX = mouseX - dragStart.x;
    let newY = mouseY - dragStart.y;

    newX = Math.max(0, Math.min(pageSize.width - sealSize, newX));
    newY = Math.max(0, Math.min(pageSize.height - sealSize, newY));

    const snapped = handleSealDrag(newX, newY, pageSize.width, pageSize.height, sealSize, sealSize);

    setSealPosition({ x: snapped.x, y: snapped.y });
  };

  // 鼠标释放
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 快捷定位
  const handleQuickPosition = (position) => {
    const pos = quickPosition(position, pageSize.width, pageSize.height, sealSize, sealSize);
    setSealPosition(pos);
    message.success('定位成功');
  };

  // 使用上次位置
  const handleUseLastPosition = () => {
    const lastPos = LastPositionManager.apply(pageSize.width, pageSize.height, sealSize, sealSize);
    if (lastPos) {
      setSealPosition(lastPos);
      message.success('已应用上次位置');
    } else {
      message.warning('没有保存的位置记录');
    }
  };

  // 应用到当前页
  const handleApplyToPage = async () => {
    if (!selectedSealId) {
      message.error('请先选择公章');
      return;
    }

    try {
      const sealImage = sealCache.get(selectedSealId);
      if (!sealImage) {
        message.error('公章图片加载失败');
        return;
      }

      console.log('========== 开始盖章 ==========');

      // 1. 盖章
      await stampPDF(pdfData.pdfDoc, currentPage, sealImage, {
        x: sealPosition.x,
        y: sealPosition.y,
        width: sealSize,
        height: sealSize,
        opacity: sealOpacity,
        rotation: sealRotation
      });

      // 2. 保存位置
      LastPositionManager.save(sealPosition.x, sealPosition.y);

      // 3. ⚠️ 更新渲染字节数组
      console.log('🔄 盖章成功，更新预览...');
      const newRenderBytes = await updateRenderBytes(pdfData.pdfDoc);
      console.log('✅ 新的渲染字节数组长度:', newRenderBytes.byteLength || newRenderBytes.length);
      setRenderBytes(newRenderBytes);

      message.success('盖章成功！');
      console.log('========== 盖章完成 ==========');
    } catch (error) {
      console.error('❌ 盖章失败:', error);
      message.error(error.message);
    }
  };

  // 导出PDF
  const handleExport = async () => {
    try {
      const result = await savePDF(pdfData.pdfDoc, pdfData.fileName);
      downloadPDF(result.pdfBytes, result.fileName);
      message.success('导出成功！');
    } catch (error) {
      message.error(error.message);
    }
  };

  // 获取选中的公章图片
  const getSelectedSealImage = () => {
    if (!selectedSealId) return null;
    return sealCache.get(selectedSealId);
  };

  return (
    <div className="stamp-editor">
      {/* 工具栏 */}
      <Card className="toolbar">
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Button icon={<LeftOutlined />} onClick={onBack}>
            返回
          </Button>

          <Divider />

          <div>
            <div className="toolbar-label">选择公章</div>
            <Select
              style={{ width: '100%' }}
              value={selectedSealId}
              onChange={setSelectedSealId}
              placeholder="请选择公章"
            >
              {seals.map(seal => (
                <Select.Option key={seal.id} value={seal.id}>
                  {seal.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div>
            <div className="toolbar-label">快捷定位</div>
            <Space wrap>
              <Button size="small" onClick={() => handleQuickPosition('topLeft')}>↖左上</Button>
              <Button size="small" onClick={() => handleQuickPosition('topRight')}>↗右上</Button>
              <Button size="small" onClick={() => handleQuickPosition('bottomLeft')}>↙左下</Button>
              <Button size="small" onClick={() => handleQuickPosition('bottomRight')}>↘右下</Button>
              <Button size="small" onClick={() => handleQuickPosition('center')}>◉居中</Button>
            </Space>
          </div>

          <div>
            <div className="toolbar-label">大小: {sealSize}px</div>
            <Slider
              min={50}
              max={300}
              value={sealSize}
              onChange={setSealSize}
            />
          </div>

          <div>
            <div className="toolbar-label">透明度: {sealOpacity.toFixed(1)}</div>
            <Slider
              min={0}
              max={1}
              step={0.1}
              value={sealOpacity}
              onChange={setSealOpacity}
            />
          </div>

          <div>
            <div className="toolbar-label">旋转: {sealRotation}°</div>
            <Slider
              min={-180}
              max={180}
              value={sealRotation}
              onChange={setSealRotation}
            />
          </div>

          <div>
            <div className="toolbar-label">坐标位置</div>
            <Row gutter={8}>
              <Col span={12}>
                <InputNumber
                  size="small"
                  prefix="X:"
                  value={Math.round(sealPosition.x)}
                  onChange={(val) => setSealPosition(prev => ({ ...prev, x: val }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <InputNumber
                  size="small"
                  prefix="Y:"
                  value={Math.round(sealPosition.y)}
                  onChange={(val) => setSealPosition(prev => ({ ...prev, y: val }))}
                  style={{ width: '100%' }}
                />
              </Col>
            </Row>
          </div>

          <Button block onClick={handleUseLastPosition}>
            使用上次位置
          </Button>

          <Divider />

          <Space direction="vertical" style={{ width: '100%' }}>
            <Button type="primary" block onClick={handleApplyToPage}>
              应用到当前页
            </Button>
            <Button block icon={<DownloadOutlined />} onClick={handleExport}>
              导出PDF
            </Button>
          </Space>
        </Space>
      </Card>

      {/* 预览区域 */}
      <div className="preview-area" ref={containerRef}>
        <Card
          className="preview-card"
          title={`${pdfData?.fileName} - 第 ${currentPage + 1} / ${pdfData?.pageCount} 页`}
          extra={
            <Space>
              <Button
                icon={<LeftOutlined />}
                disabled={currentPage === 0 || isRendering}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                上一页
              </Button>
              <Button
                disabled={currentPage === pdfData?.pageCount - 1 || isRendering}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                下一页
                <RightOutlined />
              </Button>
            </Space>
          }
        >
          <div className="canvas-container" style={{ position: 'relative' }}>
            {/* PDF Canvas */}
            <canvas
              ref={canvasRef}
              width={pageSize.width}
              height={pageSize.height}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                border: '1px solid #d9d9d9',
                cursor: isDragging ? 'grabbing' : 'default',
                background: 'white',
                display: 'block'
              }}
            />

            {/* 加载提示 */}
            {isRendering && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(255, 255, 255, 0.9)',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                zIndex: 10
              }}>
                加载中...
              </div>
            )}

            {/* 公章图层 */}
            {selectedSealId && !isRendering && (
              <img
                src={getSelectedSealImage()}
                alt="seal"
                className="seal-layer"
                style={{
                  position: 'absolute',
                  left: sealPosition.x,
                  top: sealPosition.y,
                  width: sealSize,
                  height: sealSize,
                  opacity: sealOpacity,
                  transform: `rotate(${sealRotation}deg)`,
                  cursor: isDragging ? 'grabbing' : 'grab',
                  pointerEvents: 'auto',
                  userSelect: 'none'
                }}
                onMouseDown={handleMouseDown}
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
