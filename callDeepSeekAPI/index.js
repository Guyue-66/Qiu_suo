const cloud = require('wx-server-sdk');
const axios = require('axios');

// 使用动态环境ID
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  try {
    // 详细日志
    console.log('===== DeepSeek API 调用开始 =====');
    console.log('接收到的消息内容:', JSON.stringify(event.messages));
    
    // 尝试三种不同的模型名称
    const modelNames = ['deepseek-chat', 'deepseek-llm', 'deepseek-coder'];
    const selectedModel = event.modelId || modelNames[0];
    
    console.log('尝试使用模型:', selectedModel);
    
    // 使用新的API密钥或已充值账户的密钥
    const apiKey = '您的新API密钥';
    
    // 打印请求详情（安全起见隐藏部分密钥）
    const maskedKey = apiKey.substring(0, 7) + '...' + apiKey.substring(apiKey.length - 5);
    console.log('使用API密钥:', maskedKey);
    
    // 构建请求数据
    const requestData = {
      model: selectedModel,
      messages: event.messages,
      temperature: 0.7,
      max_tokens: 2000
    };
    
    console.log('请求数据:', JSON.stringify(requestData));
    
    // 尝试两个可能的端点
    const endpoints = [
      'https://api.deepseek.com/v1/chat/completions',
      'https://api.deepseek.com/v1/messages'
    ];
    
    let response = null;
    let lastError = null;
    
    // 尝试不同的端点
    for (const endpoint of endpoints) {
      try {
        console.log('尝试端点:', endpoint);
        
        response = await axios({
          method: 'post',
          url: endpoint,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey.trim()}`
          },
          data: requestData,
          timeout: 60000  // 增加超时时间到60秒
        });
        
        console.log('API调用成功! HTTP状态码:', response.status);
        console.log('响应头部:', JSON.stringify(response.headers));
        // 如果成功，跳出循环
        break;
      } catch (err) {
        lastError = err;
        console.error(`端点 ${endpoint} 调用失败:`, err.message);
        if (err.response) {
          console.error('错误响应数据:', JSON.stringify(err.response.data));
          console.error('错误响应状态:', err.response.status);
        }
        // 继续尝试下一个端点
      }
    }
    
    // 如果所有端点都失败
    if (!response) {
      throw lastError || new Error('所有端点调用失败');
    }
    
    console.log('===== DeepSeek API 调用成功 =====');
    return response.data;
  } catch (error) {
    console.error('===== DeepSeek API 调用失败 =====');
    console.error('错误类型:', error.name);
    console.error('错误消息:', error.message);
    
    // 详细错误处理
    let errorMessage = error.message || '未知错误';
    let errorCode = 'UNKNOWN';
    
    if (error.response) {
      errorMessage = JSON.stringify(error.response.data);
      errorCode = error.response.status;
      console.error('响应错误详情:', {
        status: error.response.status,
        headers: error.response.headers,
        data: error.response.data
      });
    } else if (error.request) {
      errorMessage = '未收到API响应';
      errorCode = 'NO_RESPONSE';
      console.error('未收到响应，请求详情:', error.request);
    }
    
    return {
      error: {
        message: errorMessage,
        code: errorCode,
        isDeepSeekError: true  // 标记错误来源
      }
    };
  }
}; 