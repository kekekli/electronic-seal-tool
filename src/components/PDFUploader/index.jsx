/**
 * PDF上传组件
 */

import { useState } from 'react';
import { Upload, Button, List, Card, Space, message, Tag } from 'antd';
import { InboxOutlined, FileOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import { loadPDF, formatFileSize } from '../../utils/pdfHandler';
import './index.css';

const { Dragger } = Upload;

export default function PDFUploader({ onPDFLoaded, onStampClick }) {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // 处理文件上传
  const handleUpload = async (file) => {
    setUploading(true);

    try {
      // 加载PDF
      const pdfData = await loadPDF(file);

      // 添加到列表
      setPdfFiles(prev => [...prev, {
        id: Date.now(),
        ...pdfData
      }]);

      message.success(`${file.name} 上传成功`);

      // 通知父组件
      if (onPDFLoaded) {
        onPDFLoaded(pdfData);
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setUploading(false);
    }

    // 阻止默认上传行为
    return false;
  };

  // 删除文件
  const handleDelete = (id) => {
    setPdfFiles(prev => prev.filter(file => file.id !== id));
    message.success('删除成功');
  };

  // 点击盖章按钮
  const handleStamp = (pdfData) => {
    if (onStampClick) {
      onStampClick(pdfData);
    }
  };

  return (
    <div className="pdf-uploader">
      {/* 上传区域 */}
      <Card className="upload-card">
        <Dragger
          accept=".pdf"
          beforeUpload={handleUpload}
          showUploadList={false}
          disabled={uploading}
          multiple={false}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽PDF文件到此区域上传</p>
          <p className="ant-upload-hint">
            支持单个PDF文件上传，文件大小不超过10MB
          </p>
        </Dragger>
      </Card>

      {/* 文件列表 */}
      {pdfFiles.length > 0 && (
        <Card className="files-card" title={`已上传文件 (${pdfFiles.length})`}>
          <List
            dataSource={pdfFiles}
            renderItem={(item) => (
              <List.Item
                key={item.id}
                actions={[
                  <Button
                    key="stamp"
                    type="primary"
                    onClick={() => handleStamp(item)}
                  >
                    开始盖章
                  </Button>,
                  <Button
                    key="delete"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(item.id)}
                  >
                    删除
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={<FileOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />}
                  title={item.fileName}
                  description={
                    <Space>
                      <Tag color="blue">{item.pageCount} 页</Tag>
                      <Tag>{formatFileSize(item.fileSize)}</Tag>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}
    </div>
  );
}
