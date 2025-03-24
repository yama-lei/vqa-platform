import OSS from 'ali-oss'

// OSS客户端配置
const ossConfig = {
  region: 'oss-cn-nanjing',
  bucket: 'vqaplatform',
  accessKeyId: process.env.VITE_OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.VITE_OSS_ACCESS_KEY_SECRET
}

/**
 * 创建OSS客户端
 * @returns {OSS} OSS客户端实例
 */
export const createOssClient = () => {
  return new OSS(ossConfig)
}

/**
 * 生成文件访问或上传的签名URL
 * @param {String} objectName 对象名称
 * @param {String} operation 操作类型，'get'或'put'
 * @param {Number} expires URL有效期（秒）
 * @returns {String} 签名URL
 */
export const getSignedUrl = (objectName, operation = 'get', expires = 3600) => {
  try {
    const client = createOssClient()
    
    // 确保objectName格式正确
    const normalizedObjectName = objectName.startsWith('/') ? objectName.slice(1) : objectName
    
    const options = {
      expires,
      method: operation.toUpperCase(),
      'response-content-disposition': 'inline',
      'response-content-type': getContentType(normalizedObjectName),
      'response-cache-control': 'no-cache',
      process: normalizedObjectName.toLowerCase().endsWith('.pdf') ? 'pdf' : undefined
    }
    
    const url = client.signatureUrl(normalizedObjectName, options)
    console.log(`生成${operation}签名URL成功:`, url)
    return url
  } catch (error) {
    console.error('生成签名URL失败:', error)
    throw error
  }
}

// 添加一个辅助函数来获取文件的content-type
const getContentType = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase()
  const contentTypes = {
    'pdf': 'application/pdf',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'md': 'text/markdown',
    'txt': 'text/plain'
  }
  return contentTypes[extension] || 'application/octet-stream'
}

/**
 * 上传文件到OSS
 * @param {File} file 要上传的文件对象
 * @param {String} directory 存储目录
 * @param {Function} onProgress 上传进度回调函数，参数为0-1之间的小数
 * @returns {Promise<Object>} 上传结果，包含URL和对象名称
 */
export const uploadFile = async (file, directory = 'uploads', onProgress = null) => {
  try {
    console.log('开始上传文件:', file.name, '类型:', file.type, '大小:', file.size)
    
    // 直接使用原始文件名，只添加目录前缀
    const objectName = `${directory}/${file.name}`
    console.log('生成的对象名称:', objectName)
    
    const client = createOssClient()
    console.log('OSS客户端创建成功')
    
    // 使用普通上传
    const result = await client.put(objectName, file, {
      headers: {
        'Content-Type': file.type || getContentType(file.name),
        'Cache-Control': 'no-cache',
        'x-oss-forbid-overwrite': false
      },
      progress: (p) => {
        if (onProgress) {
          onProgress(p)
        }
        console.log('上传进度:', Math.floor(p * 100) + '%')
      }
    })
    
    if (result.res && result.res.status === 200) {
      console.log('上传成功, 状态码:', result.res.status)
      // 返回可访问的签名URL和对象信息
      const accessUrl = getSignedUrl(objectName)
      return {
        url: accessUrl,
        objectName: objectName,
        name: file.name,
        size: file.size,
        status: 'success'
      }
    } else {
      throw new Error(`上传失败: ${result.res?.status || '未知错误'}`)
    }
  } catch (error) {
    console.error('上传文件失败:', error)
    throw error
  }
}

/**
 * 获取文件列表
 * @param {String} directory 目录前缀
 * @param {Number} maxKeys 最大返回数量
 * @returns {Promise<Array>} 文件列表，每个文件包含签名URL
 */
export const listFiles = async (directory = '', maxKeys = 100) => {
  const client = createOssClient()
  try {
    const result = await client.list({
      prefix: directory,
      'max-keys': maxKeys
    })
    
    // 为每个文件生成签名URL，使它们可以被访问
    return result.objects ? result.objects.map(obj => ({
      name: obj.name.split('/').pop(), // 提取文件名
      url: getSignedUrl(obj.name),
      objectName: obj.name,
      size: obj.size,
      lastModified: obj.lastModified
    })) : []
  } catch (error) {
    console.error('获取文件列表失败:', error)
    throw error
  }
}

/**
 * 删除OSS中的文件
 * @param {String} objectName 对象名称
 * @returns {Promise<Boolean>} 是否删除成功
 */
export const deleteFile = async (objectName) => {
  const client = createOssClient()
  try {
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
    console.log('开始测试OSS连接...');
    console.log('OSS配置:', {
      region: ossConfig.region,
      bucket: ossConfig.bucket,
      accessKeyId: ossConfig.accessKeyId.substring(0, 3) + '***' + ossConfig.accessKeyId.substring(ossConfig.accessKeyId.length - 3),
    });
    
    const client = createOssClient();
    
    // 使用list方法替代getBucketInfo来测试连接，因为getBucketInfo方法不存在
    console.log('注意: 当前使用的是AccessKey直接访问方式，生产环境建议使用STS Token，详见：https://help.aliyun.com/document_detail/32077.html');
    const result = await client.list({
      'max-keys': 1
    });
    console.log('OSS连接成功, 获取到列表:', result);
    return true;
  } catch (error) {
    console.error('OSS连接测试失败:', error);
    throw error;
  }
};

export default {
  createOssClient,
  getSignedUrl,
  uploadFile,
  listFiles,
  deleteFile,
  downloadFile,
  testOssConnection
}
