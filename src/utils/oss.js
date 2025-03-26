import OSS from 'ali-oss'

// 添加调试日志
console.log('环境变量检查:', {
  API_KEY: import.meta.env.VITE_API_KEY ? '已设置' : '未设置'
})

// 基础配置
const API_ENDPOINT = 'https://api.yama-lei.top/api/oss/config';
const API_KEY = import.meta.env.VITE_API_KEY || 'lIlI****';

// 调试信息
console.log('API配置:', {
  endpoint: API_ENDPOINT,
  apiKey: API_KEY ? '已设置' : '未设置'
});

/**
 * 获取 OSS 客户端配置
 * @returns {Promise<Object>} OSS 配置
 */
const getOssConfig = async () => {
  try {
    console.log('正在请求OSS配置...');
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      }
    });
    
    console.log('API响应状态:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API响应错误:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`获取OSS配置失败: HTTP ${response.status}`);
    }
    
    const result = await response.json();
    console.log('API响应数据:', result);
    
    if (!result.success) {
      throw new Error(result.error || '获取OSS配置失败');
    }
    
    return {
      region: result.data.region,
      bucket: result.data.bucket,
      accessKeyId: result.data.accessKeyId,
      accessKeySecret: result.data.accessKeySecret,
      secure: true
    };
  } catch (error) {
    console.error('获取OSS配置失败:', error);
    
    // 开发环境下，使用临时配置
    if (import.meta.env.DEV) {
      console.warn('开发环境下使用临时配置');
      return {
        region: import.meta.env.VITE_OSS_REGION || 'oss-cn-nanjing',
        bucket: import.meta.env.VITE_OSS_BUCKET || 'vqaplatform',
        accessKeyId: import.meta.env.VITE_OSS_ACCESS_KEY_ID || '',
        accessKeySecret: import.meta.env.VITE_OSS_ACCESS_KEY_SECRET || '',
        secure: true
      };
    }
    
    throw error;
  }
}

/**
 * 创建OSS客户端
 * @returns {Promise<OSS>} OSS客户端实例
 */
export const createOssClient = async () => {
  const config = await getOssConfig();
  return new OSS(config);
}

/**
 * 生成文件访问或上传的签名URL
 * @param {String} objectName 对象名称
 * @param {String} operation 操作类型，'get'或'put'
 * @param {Number} expires URL有效期（秒）
 * @returns {Promise<String>} 签名URL
 */
export const getSignedUrl = async (objectName, operation = 'get', expires = 3600) => {
  try {
    const client = await createOssClient()
    
    // 添加详细的日志
    console.log('原始objectName:', objectName)
    
    // 确保objectName格式正确
    let normalizedObjectName = objectName
    if (normalizedObjectName.startsWith('/')) {
      normalizedObjectName = normalizedObjectName.slice(1)
    }
    
    // 检查是否已经包含类型目录前缀
    const typePrefixes = ['paper/', 'code/', 'note/', 'video/']
    const hasTypePrefix = typePrefixes.some(prefix => normalizedObjectName.startsWith(prefix))
    
    if (!hasTypePrefix) {
      // 如果没有类型前缀，根据文件扩展名添加
      const extension = normalizedObjectName.split('.').pop().toLowerCase()
      let typePrefix = 'other/'
      
      if (extension === 'pdf') {
        typePrefix = 'paper/'
      } else if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
        typePrefix = 'note/'
      } else if (['mp4', 'webm', 'ogg'].includes(extension)) {
        typePrefix = 'video/'
      } else if (['js', 'py', 'java', 'cpp', 'c', 'h', 'html', 'css'].includes(extension)) {
        typePrefix = 'code/'
      }
      
      normalizedObjectName = typePrefix + normalizedObjectName
    }
    
    console.log('标准化后的objectName:', normalizedObjectName)
    
    // 获取文件扩展名
    const extension = normalizedObjectName.split('.').pop().toLowerCase()
    console.log('文件扩展名:', extension)
    
    // 根据文件类型设置不同的响应头
    const options = {
      expires,
      method: operation.toUpperCase(),
      'response-content-disposition': 'inline',
      'response-content-type': getContentType(normalizedObjectName),
      'response-cache-control': 'no-cache',
      'response-cors-allow-origin': '*',
      'response-cors-allow-methods': 'GET, HEAD, OPTIONS',
      'response-cors-allow-headers': '*',
      'response-cors-expose-headers': 'ETag, Content-Length',
      'response-content-security-policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; frame-ancestors 'self' *"
    }
    
    // 对PDF文件特殊处理
    if (extension === 'pdf') {
      options['response-content-type'] = 'application/pdf'
      options['response-content-disposition'] = 'inline; filename="' + encodeURIComponent(normalizedObjectName.split('/').pop()) + '"'
      options['response-content-encoding'] = 'identity'
    }
    
    // 对Office文件特殊处理
    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) {
      options['response-content-type'] = 'application/octet-stream'
      options['response-content-disposition'] = 'inline; filename="' + encodeURIComponent(normalizedObjectName.split('/').pop()) + '"'
      options['response-content-encoding'] = 'identity'
    }
    
    // 对图片文件特殊处理
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
      options['response-content-type'] = `image/${extension}`
      options['response-content-disposition'] = 'inline'
      options['response-cache-control'] = 'public, max-age=31536000'
    }
    
    // 对视频文件特殊处理
    if (['mp4', 'webm', 'ogg'].includes(extension)) {
      options['response-content-type'] = `video/${extension}`
      options['response-content-disposition'] = 'inline'
      options['response-cache-control'] = 'public, max-age=31536000'
    }
    
    // 对Markdown文件特殊处理
    if (extension === 'md') {
      options['response-content-type'] = 'text/markdown'
      options['response-content-disposition'] = 'inline'
    }
    
    // 对文本文件特殊处理
    if (extension === 'txt') {
      options['response-content-type'] = 'text/plain'
      options['response-content-disposition'] = 'inline'
    }
    
    console.log('生成签名URL的选项:', options)
    
    const url = client.signatureUrl(normalizedObjectName, options)
    // 确保 URL 使用 HTTPS
    const secureUrl = url.replace('http://', 'https://')
    console.log(`生成${operation}签名URL成功:`, secureUrl)
    return secureUrl
  } catch (error) {
    console.error('生成签名URL失败:', error)
    console.error('错误详情:', {
      message: error.message,
      code: error.code,
      requestId: error.requestId,
      objectName: objectName
    })
    throw error
  }
}

/**
 * 上传文件到OSS
 * @param {File} file 要上传的文件对象
 * @param {String} directory 存储目录
 * @returns {Promise<Object>} 上传结果，包含URL和对象名称
 */
export const uploadFile = async (file, directory = '') => {
  try {
    const client = await createOssClient()
    
    // 如果用户指定了目录，使用用户指定的目录
    // 否则使用默认的other目录
    const typeDir = directory || 'other'
    console.log('使用目录:', typeDir)
    
    // 生成OSS对象名称
    const objectName = `${typeDir}/${file.name}`
    console.log('生成的对象名称:', objectName)
    
    // 上传文件
    const result = await client.put(objectName, file)
    console.log('文件上传成功:', result)
    
    // 生成访问URL
    const accessUrl = await getSignedUrl(objectName)
    console.log('生成访问URL:', accessUrl)
    
    return {
      success: true,
      url: accessUrl,
      objectName: objectName,
      type: typeDir
    }
  } catch (error) {
    console.error('文件上传失败:', error)
    throw error
  }
}

/**
 * 获取文件的Content-Type
 * @param {String} fileName 文件名
 * @returns {String} Content-Type
 */
const getContentType = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase()
  switch (extension) {
    case 'pdf':
      return 'application/pdf'
    case 'doc':
    case 'docx':
      return 'application/msword'
    case 'xls':
    case 'xlsx':
      return 'application/vnd.ms-excel'
    case 'ppt':
    case 'pptx':
      return 'application/vnd.ms-powerpoint'
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'gif':
      return 'image/gif'
    case 'svg':
      return 'image/svg+xml'
    case 'webp':
      return 'image/webp'
    case 'mp4':
      return 'video/mp4'
    case 'webm':
      return 'video/webm'
    case 'ogg':
      return 'video/ogg'
    case 'md':
      return 'text/markdown'
    case 'txt':
      return 'text/plain'
    default:
      return 'application/octet-stream'
  }
}

/**
 * 获取文件列表
 * @param {String} directory 目录前缀
 * @param {Number} maxKeys 最大返回数量
 * @returns {Promise<Array>} 文件列表，每个文件包含签名URL
 */
export const listFiles = async (directory = '', maxKeys = 100) => {
  try {
    const client = await createOssClient()
    console.log('正在获取目录列表:', directory)
    
    // 如果没有指定目录，则获取所有类型的文件
    const typeDirectories = directory ? [directory] : ['paper/', 'code/', 'note/', 'video/', 'other/']
    let allFiles = []
    
    for (const typeDir of typeDirectories) {
      console.log('正在获取目录:', typeDir)
      const result = await client.list({
        prefix: typeDir,
        'max-keys': maxKeys
      })
      
      if (result.objects) {
        console.log(`目录 ${typeDir} 中的文件:`, result.objects.map(obj => obj.name))
        allFiles = allFiles.concat(result.objects)
      }
    }
    
    console.log('获取到的所有文件列表:', allFiles.map(obj => obj.name))
    
    // 为每个文件生成签名URL，使它们可以被访问
    const filesWithUrls = await Promise.all(allFiles.map(async obj => ({
      name: obj.name.split('/').pop(), // 提取文件名
      url: await getSignedUrl(obj.name),
      objectName: obj.name,
      size: obj.size,
      lastModified: obj.lastModified,
      type: obj.name.split('/')[0] // 提取文件类型
    })))
    
    return filesWithUrls
  } catch (error) {
    console.error('获取文件列表失败:', error)
    console.error('错误详情:', {
      message: error.message,
      code: error.code,
      requestId: error.requestId,
      directory: directory
    })
    throw error
  }
}

/**
 * 删除OSS中的文件
 * @param {String} objectName 对象名称
 * @returns {Promise<Boolean>} 是否删除成功
 */
export const deleteFile = async (objectName) => {
  try {
    const client = await createOssClient()
    await client.delete(objectName)
    return true
  } catch (error) {
    console.error('删除文件失败:', error)
    throw error
  }
}

/**
 * 通过签名URL下载文件
 * @param {String} objectName 对象名称
 * @param {String} fileName 下载后的文件名
 */
export const downloadFile = (objectName, fileName) => {
  const url = getSignedUrl(objectName)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName || objectName.split('/').pop()
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 测试OSS连接
 * @returns {Promise<boolean>} 连接测试结果
 */
export const testOssConnection = async () => {
  try {
    console.log('开始测试OSS连接...')
    const client = await createOssClient()
    const result = await client.list({ 'max-keys': 1 })
    console.log('OSS连接成功')
    return true
  } catch (error) {
    console.error('OSS连接测试失败:', error)
    throw error
  }
}

export default {
  createOssClient,
  getSignedUrl,
  uploadFile,
  listFiles,
  deleteFile,
  downloadFile,
  testOssConnection
}
