/**
 * 公章库管理组件（无确认版本 - 直接删除）
 */

import { useState, useEffect } from 'react';
import { Card, Button, Space, message, Empty, Upload } from 'antd';
import { PlusOutlined, DownloadOutlined, UploadOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { loadSeals, deleteSeal, saveSeals } from '../../utils/storage';
import { exportSealsConfig, importSealsConfig } from '../../utils/configManager';
import { sealCache } from '../../utils/sealCache';
import './index.css';

export default function SealLibrary({ onEdit, onCreateNew }) {
  const [seals, setSeals] = useState([]);
  const [loading, setLoading] = useState(false);

  // 加载公章列表
  const loadSealList = () => {
    const loadedSeals = loadSeals();
    console.log('📋 加载公章列表:', loadedSeals.length, '个');
    setSeals(loadedSeals);
    sealCache.init(loadedSeals);
  };

  useEffect(() => {
    console.log('🔄 组件挂载，加载公章列表');
    loadSealList();
  }, []);

  // 删除公章（无确认版本）
  const handleDelete = (id) => {
    console.log('========== 🗑️ 开始删除 ==========');
    console.log('🎯 要删除的 ID:', id, '类型:', typeof id);
    console.log('📋 当前公章数量:', seals.length);
    
    // 直接删除，不弹确认框
    console.log('✅ 开始执行删除（无需确认）');
    
    // 第1步：删除 localStorage
    console.log('📝 第1步：调用 deleteSeal()');
    const success = deleteSeal(id);
    console.log('💾 deleteSeal() 返回:', success);
    
    if (!success) {
      console.error('❌ localStorage 删除失败！');
      message.error('删除失败，请重试');
      return;
    }
    
    console.log('✅ localStorage 删除成功');
    
    // 第2步：删除缓存
    console.log('📝 第2步：删除缓存');
    try {
      sealCache.delete(id);
      console.log('✅ 缓存删除成功');
    } catch (error) {
      console.warn('⚠️ 缓存删除失败:', error);
    }
    
    // 第3步：更新 React state（关键！）
    console.log('📝 第3步：更新 React state');
    console.log('  - 更新前的 seals:', seals.length, '个');
    
    setSeals(prevSeals => {
      console.log('  - setSeals 回调函数执行');
      console.log('  - prevSeals:', prevSeals.length, '个');
      
      const newSeals = prevSeals.filter(s => {
        const shouldKeep = s.id !== id;
        console.log(`    ✓ 检查 ${s.id}: ${shouldKeep ? '保留' : '🗑️ 删除'}`);
        return shouldKeep;
      });
      
      console.log('  - 过滤后的 newSeals:', newSeals.length, '个');
      
      return newSeals;
    });
    
    console.log('✅ state 更新完成');
    
    // 第4步：显示成功消息
    message.success('删除成功');
    
    console.log('========== 🎉 删除完成 ==========');
  };

  // 导出配置
  const handleExport = () => {
    if (seals.length === 0) {
      message.warning('没有可导出的公章');
      return;
    }
    exportSealsConfig(seals);
    message.success('配置导出成功');
  };

  // 导入配置
  const handleImport = async (file) => {
    setLoading(true);
    try {
      const newSeals = await importSealsConfig(file, seals);
      const allSeals = [...seals, ...newSeals];
      saveSeals(allSeals);
      message.success(`成功导入 ${newSeals.length} 个公章`);
      loadSealList();
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
    return false;
  };

  console.log('🔄 组件渲染，当前 seals 数量:', seals.length);

  return (
    <div className="seal-library">
      <div className="library-header">
        <div className="header-left">
          <h2>我的公章 ({seals.length}/4)</h2>
        </div>
        <div className="header-right">
          <Space>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>
              导出配置
            </Button>
            <Upload
              accept=".json"
              beforeUpload={handleImport}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />} loading={loading}>
                导入配置
              </Button>
            </Upload>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onCreateNew}
              disabled={seals.length >= 4}
            >
              新建公章
            </Button>
          </Space>
        </div>
      </div>

      <div className="seals-grid">
        {seals.length === 0 ? (
          <Empty
            description="暂无公章，点击新建公章开始创建"
            style={{ marginTop: 60 }}
          />
        ) : (
          seals.map((seal) => {
            console.log('🎨 渲染公章卡片:', seal.id, seal.name);
            return (
              <Card
                key={seal.id}
                className="seal-card"
                cover={
                  <div className="seal-image-wrapper">
                    <img src={seal.imageData} alt={seal.name} />
                  </div>
                }
                actions={[
                  <Button
                    key="edit"
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => {
                      console.log('✏️ 点击编辑按钮:', seal.id);
                      onEdit && onEdit(seal);
                    }}
                  >
                    编辑
                  </Button>,
                  <Button
                    key="delete"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      console.log('🖱️ 点击删除按钮');
                      console.log('  - seal.id:', seal.id);
                      console.log('  - seal.name:', seal.name);
                      handleDelete(seal.id);
                    }}
                  >
                    删除
                  </Button>
                ]}
              >
                <Card.Meta
                  title={seal.name}
                  description={
                    <div>
                      <div>{seal.companyName}</div>
                      <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                        {SEAL_PRESETS_NAMES[seal.preset] || '自定义'}
                      </div>
                    </div>
                  }
                />
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

const SEAL_PRESETS_NAMES = {
  standard: '标准公章',
  contract: '合同专用章',
  finance: '财务专用章'
};
