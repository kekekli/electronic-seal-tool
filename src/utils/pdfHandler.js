/**
 * PDF处理工具
 */

import { PDFDocument, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// 配置 PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

/**
 * 加载PDF文件
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
    // 3. 读取文件
    const arrayBuffer = await file.arrayBuffer();

    // 4. 用 pdf-lib 加载（用于编辑和盖章）
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    // 5. 用 pdfjs-dist 加载（用于渲染预览）
    const pdfjsDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    return {
      file: file,
      fileName: file.name,
      fileSize: file.size,
      pageCount: pdfDoc.getPageCount(),
      pdfDoc: pdfDoc,      // pdf-lib 文档（用于编辑）
      pdfjsDoc: pdfjsDoc,  // pdfjs 文档（用于渲染）
      pdfBytes: arrayBuffer
    };
  } catch (error) {
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
 * @param {PDFDocument} pdfDoc - PDF文档
 * @param {number} pageIndex - 页码（从0开始）
 * @param {string} sealImageBase64 - 公章图片（Base64）
 * @param {Object} options - 盖章选项
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
    // 1. 嵌入公章图片
    const sealImage = await pdfDoc.embedPng(sealImageBase64);

    // 2. 获取页面
    const pages = pdfDoc.getPages();
    const page = pages[pageIndex];
    const pageSize = page.getSize();

    // 3. 坐标转换（Canvas坐标 → PDF坐标）
    // Canvas原点在左上角，PDF原点在左下角
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

    return true;
  } catch (error) {
    throw new Error(`盖章失败: ${error.message}`);
  }
}

/**
 * 批量盖章
 * @param {PDFDocument} pdfDoc - PDF文档
 * @param {Array} pageIndices - 页码数组
 * @param {string} sealImageBase64 - 公章图片
 * @param {Object} options - 盖章选项
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
    const pdfBytes = await pdfDoc.save();

    // 生成文件名
    const fileName = originalFileName.replace('.pdf', '_已盖章.pdf');

    return {
      pdfBytes: pdfBytes,
      fileName: fileName
    };
  } catch (error) {
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
 * 渲染PDF页面为Canvas（用于预览）
 * @param {Object} pdfjsDoc - pdfjs-dist 文档对象
 * @param {number} pageIndex - 页码（从1开始）
 * @param {HTMLCanvasElement} canvas - Canvas元素
 * @param {number} scale - 缩放比例
 */
export async function renderPDFToCanvas(pdfjsDoc, pageIndex, canvas, scale = 1) {
  try {
    // 1. 获取页面（pdfjs 页码从1开始）
    const page = await pdfjsDoc.getPage(pageIndex + 1);

    // 2. 获取视口
    const viewport = page.getViewport({ scale });

    // 3. 设置Canvas尺寸
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // 4. 渲染上下文
    const context = canvas.getContext('2d');

    // 5. 渲染PDF页面
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };

    await page.render(renderContext).promise;

    return {
      width: viewport.width,
      height: viewport.height
    };
  } catch (error) {
    throw new Error(`渲染PDF失败: ${error.message}`);
  }
}
