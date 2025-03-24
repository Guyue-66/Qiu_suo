// 云函数入口文件
const cloud = require('wx-server-sdk');
const axios = require('axios');

// 使用动态环境ID
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    console.log('接收到的消息:', JSON.stringify(event.messages));
    
    // 获取OpenAI API密钥 - 请替换为您的实际API密钥
    const apiKey = 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
    
    // 检查API密钥格式
    if (!apiKey || apiKey === 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
      console.error('API密钥未设置或格式不正确');
      return {
        error: {
          message: '请配置有效的API密钥',
          code: 'INVALID_API_KEY'
        }
      };
    }
    
    // 构建请求数据
    const requestData = {
      model: event.modelId || 'gpt-3.5-turbo',
      messages: event.messages || [],
      temperature: 0.7,
      max_tokens: 2000
    };
    
    console.log('请求OpenAI API...');
    console.log('使用模型:', requestData.model);
    
    // 调用OpenAI API
    const response = await axios({
      method: 'post',
      url: 'https://api.openai.com/v1/chat/completions',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`  // 确保没有多余的空格
      },
      data: requestData,
      timeout: 30000 // 30秒超时
    });
    
    console.log('API调用成功');
    return response.data;
  } catch (error) {
    console.error('调用OpenAI API失败:', error);
    
    // 详细记录错误信息
    let errorMessage = error.message || '未知错误';
    let errorCode = 'UNKNOWN';
    
    if (error.response) {
      console.error('错误响应状态:', error.response.status);
      console.error('错误响应数据:', JSON.stringify(error.response.data));
      errorMessage = JSON.stringify(error.response.data);
      errorCode = error.response.status;
    } else if (error.request) {
      console.error('未收到响应，请求详情:', error.request);
      errorMessage = '未收到API响应';
      errorCode = 'NO_RESPONSE';
    }
    
    return {
      error: {
        message: errorMessage,
        code: errorCode
      }
    };
  }
}; 