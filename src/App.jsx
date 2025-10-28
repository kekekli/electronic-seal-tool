/**
 * 电子公章工具 - 主应用
 */

import { useState } from 'react';
import { ConfigProvider, Tabs } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import SealGenerator from './components/SealGenerator';
import SealLibrary from './components/SealLibrary';
import PDFUploader from './components/PDFUploader';
import StampEditor from './components/StampEditor';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('library');
  const [editingSeal, setEditingSeal] = useState(null);
  const [currentPDF, setCurrentPDF] = useState(null);

  const handleCreateSuccess = () => {
    setActiveTab('library');
    setEditingSeal(null);
  };

  const handleCreateNew = () => {
    setEditingSeal(null);
    setActiveTab('generator');
  };

  const handleEdit = (seal) => {
    setEditingSeal(seal);
    setActiveTab('generator');
  };

  const handlePDFLoaded = (pdfData) => {
    console.log('PDF加载成功:', pdfData);
  };

  const handleStampClick = (pdfData) => {
    setCurrentPDF(pdfData);
    setActiveTab('stamp-editor');
  };

  const handleBackFromEditor = () => {
    setActiveTab('pdf-upload');
    setCurrentPDF(null);
  };

  const tabs = [
    {
      key: 'library',
      label: '📦 公章管理',
      children: (
        <SealLibrary
          onEdit={handleEdit}
          onCreateNew={handleCreateNew}
        />
      )
    },
    {
      key: 'generator',
      label: '✨ 创建公章',
      children: (
        <SealGenerator
          seal={editingSeal}
          onSuccess={handleCreateSuccess}
          onCancel={() => setActiveTab('library')}
        />
      )
    },
    {
      key: 'pdf-upload',
      label: '📄 PDF盖章',
      children: (
        <PDFUploader
          onPDFLoaded={handlePDFLoaded}
          onStampClick={handleStampClick}
        />
      )
    },
    {
      key: 'stamp-editor',
      label: '🖊️ 盖章编辑器',
      disabled: !currentPDF,
      children: currentPDF ? (
        <StampEditor
          pdfData={currentPDF}
          onBack={handleBackFromEditor}
        />
      ) : (
        <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>
          请先上传PDF文件
        </div>
      )
    }
  ];

  return (
    <ConfigProvider locale={zhCN}>
      <div className="app">
        <div className="app-header">
          <h1>📮 电子公章工具</h1>
          <p>纯前端公章生成与PDF盖章工具</p>
        </div>

        <div className="app-content">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabs}
            size="large"
          />
        </div>
      </div>
    </ConfigProvider>
  );
}

export default App;
