/**
 * PDF处理工具（终极修复版 - 真正的深拷贝）
 */

import { PDFDocument, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// ⚠️ 配置 PDF.js Worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

/**
 * 加载PDF文件（终极修复版）
 * ⚠️ 关键修复：为每个库准备完全独立的 ArrayBuffer
 */
export async function loadPDF(file) {
  // 1. 验证文件格式
  if (file.type !== 'application/pdf') {
    throw new Error('只支持PDF格式文件');
  }

  // 2. 验证文件大小（限制10MB）
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('文件大小不能超过10MB');
  }

  try {
    console.log('========== 开始加载 PDF ==========');
    console.log('📄 文件名:', file.name);
    console.log('📊 文件大小:', (file.size / 1024 / 1024).toFixed(2), 'MB');

    // 3. ⚠️ 读取文件两次，为两个库分别准备独立的 ArrayBuffer
    
    // 第一次读取：给 pdf-lib 用（编辑）
    const arrayBuffer1 = await file.arrayBuffer();
    console.log('✅ 第一次读取完成（用于 pdf-lib）');
    console.log('📦 ArrayBuffer 长度:', arrayBuffer1.byteLength);

    // 第二次读取：给 pdfjs-dist 用（渲染）
    // ⚠️ 关键：重新从 File 对象读取，而不是复制 ArrayBuffer
    const arrayBuffer2 = await file.arrayBuffer();
    console.log('✅ 第二次读取完成（用于 pdfjs-dist）');
    console.log('📦 ArrayBuffer 长度:', arrayBuffer2.byteLength);

    // 4. 创建完全独立的 Uint8Array（确保深拷贝）
    const pdfBytesForRender = new Uint8Array(arrayBuffer2);
    console.log('✅ 创建 pdfjs-dist 专用 Uint8Array');
    console.log('📦 Uint8Array 长度:', pdfBytesForRender.length);

    // 5. 为 pdf-lib 加载 PDF 文档（用于编辑）
    const pdfDoc = await PDFDocument.load(arrayBuffer1);
    console.log('✅ pdf-lib 加载成功');

    const result = {
      file: file,
      fileName: file.name,
      fileSize: file.size,
      pageCount: pdfDoc.getPageCount(),
      pdfDoc: pdfDoc,                      // pdf-lib 的文档对象（用于编辑）
      pdfBytesForRender: pdfBytesForRender // pdfjs-dist 专用的字节数组（用于渲染）
    };

    console.log('✅ PDF 加载完成');
    console.log('📋 页数:', result.pageCount);
    console.log('📦 pdfBytesForRender 最终长度:', result.pdfBytesForRender.length);
    console.log('========== PDF 加载结束 ==========');

    return result;
  } catch (error) {
    console.error('❌ PDF 加载失败:', error);
    throw new Error(`PDF加载失败: ${error.message}`);
  }
}

/**
 * 获取页面尺寸
 */
export function getPageSize(pdfDoc, pageIndex) {
  const pages = pdfDoc.getPages();
  const page = pages[pageIndex];
  const { width, height } = page.getSize();
  return { width, height };
}

/**
 * 在PDF上盖章
 */
export async function stampPDF(pdfDoc, pageIndex, sealImageBase64, options) {
  const {
    x,
    y,
    width,
    height,
    opacity = 1,
    rotation = 0
  } = options;

  try {
    console.log('========== 开始盖章 ==========');
    console.log('📄 页码:', pageIndex);
    console.log('📍 位置:', { x, y });
    console.log('📏 尺寸:', { width, height });

    // 1. 嵌入公章图片
    const sealImage = await pdfDoc.embedPng(sealImageBase64);
    console.log('✅ 公章图片嵌入成功');

    // 2. 获取页面
    const pages = pdfDoc.getPages();
    const page = pages[pageIndex];
    const pageSize = page.getSize();

    // 3. 坐标转换（Canvas坐标 → PDF坐标）
    const pdfY = pageSize.height - y - height;

    // 4. 在页面上绘制公章
    page.drawImage(sealImage, {
      x: x,
      y: pdfY,
      width: width,
      height: height,
      opacity: opacity,
      rotate: degrees(rotation)
    });

    console.log('✅ 盖章成功');
    console.log('========== 盖章结束 ==========');

    return true;
  } catch (error) {
    console.error('❌ 盖章失败:', error);
    throw new Error(`盖章失败: ${error.message}`);
  }
}

/**
 * 批量盖章
 */
export async function batchStampPDF(pdfDoc, pageIndices, sealImageBase64, options) {
  try {
    for (const pageIndex of pageIndices) {
      await stampPDF(pdfDoc, pageIndex, sealImageBase64, options);
    }
    return true;
  } catch (error) {
    throw new Error(`批量盖章失败: ${error.message}`);
  }
}

/**
 * 保存PDF
 */
export async function savePDF(pdfDoc, originalFileName) {
  try {
    console.log('========== 开始保存 PDF ==========');

    // 保存 PDF（获取最新的字节数组）
    const pdfBytes = await pdfDoc.save();
    console.log('✅ PDF 保存成功');
    console.log('📦 PDF 字节长度:', pdfBytes.byteLength);

    // 生成文件名
    const fileName = originalFileName.replace('.pdf', '_已盖章.pdf');

    console.log('📄 新文件名:', fileName);
    console.log('========== 保存结束 ==========');

    return {
      pdfBytes: pdfBytes,
      fileName: fileName
    };
  } catch (error) {
    console.error('❌ 保存失败:', error);
    throw new Error(`保存PDF失败: ${error.message}`);
  }
}

/**
 * 下载PDF文件
 */
export function downloadPDF(pdfBytes, fileName) {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);

  console.log('✅ PDF 下载完成:', fileName);
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 渲染PDF页面为Canvas（终极修复版）
 * ⚠️ 使用完全独立的字节数组，避免所有 Buffer 问题
 */
export async function renderPDFToCanvas(pdfBytesForRender, pageIndex, canvas, scale = 1) {
  try {
    console.log('========== 开始渲染 PDF ==========');
    console.log('📄 页码:', pageIndex);
    console.log('📊 缩放:', scale);
    console.log('🎨 Canvas:', canvas);
    console.log('📦 字节数组类型:', pdfBytesForRender?.constructor.name);
    console.log('📦 字节数组长度:', pdfBytesForRender?.byteLength || pdfBytesForRender?.length || 0);

    // ⚠️ 检查字节数组是否有效
    if (!pdfBytesForRender || pdfBytesForRender.length === 0) {
      throw new Error('PDF 字节数组为空或无效');
    }

    // 1. 加载 PDF 文档（使用 pdfjs-dist）
    // ⚠️ 关键：创建新的 Uint8Array 副本，确保数据独立
    const bytesCopy = new Uint8Array(pdfBytesForRender);
    console.log('✅ 创建字节数组副本，长度:', bytesCopy.length);

    const loadingTask = pdfjsLib.getDocument({ 
      data: bytesCopy,
      // ⚠️ 禁用自动获取，避免 worker 通信问题
      disableAutoFetch: true,
      disableStream: true
    });
    
    const pdf = await loadingTask.promise;
    console.log('✅ PDF 加载成功（pdfjs-dist）');
    console.log('📋 总页数:', pdf.numPages);

    // 2. 获取指定页面（pdf.js 页码从 1 开始）
    const page = await pdf.getPage(pageIndex + 1);
    console.log('✅ 获取页面成功，页码:', pageIndex + 1);

    // 3. 设置视口（缩放）
    const viewport = page.getViewport({ scale: scale });
    console.log('📐 视口尺寸:', viewport.width, 'x', viewport.height);

    // 4. 设置 Canvas 尺寸
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    console.log('🎨 Canvas 尺寸已设置');

    // 5. 获取渲染上下文
    const context = canvas.getContext('2d');

    // 6. 清空 Canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // 7. 渲染 PDF 页面到 Canvas
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };

    console.log('🔄 开始渲染到 Canvas...');
    await page.render(renderContext).promise;
    console.log('✅ 渲染完成！');
    console.log('========== 渲染结束 ==========');

    return {
      width: viewport.width,
      height: viewport.height
    };
  } catch (error) {
    console.error('❌ 渲染失败:', error);
    console.error('错误堆栈:', error.stack);
    throw new Error(`渲染PDF失败: ${error.message}`);
  }
}

/**
 * 盖章后更新渲染用的字节数组（终极修复版）
 * ⚠️ 生成全新的字节数组，确保数据独立
 */
export async function updateRenderBytes(pdfDoc) {
  try {
    console.log('🔄 更新渲染字节数组...');
    
    // 获取最新的 PDF 字节
    const newPdfBytes = await pdfDoc.save();
    console.log('✅ 获取最新 PDF 字节，长度:', newPdfBytes.byteLength);
    
    // ⚠️ 创建完全独立的 Uint8Array
    const newRenderBytes = new Uint8Array(newPdfBytes);
    console.log('✅ 创建新的 Uint8Array，长度:', newRenderBytes.length);
    
    return newRenderBytes;
  } catch (error) {
    console.error('❌ 更新渲染字节数组失败:', error);
    throw new Error(`更新失败: ${error.message}`);
  }
}
