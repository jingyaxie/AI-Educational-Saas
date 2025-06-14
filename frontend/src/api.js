import axios from 'axios';

// 配置 axios 默认值
axios.defaults.baseURL = 'http://localhost:8000';  // 设置基础 URL
axios.defaults.withCredentials = true;  // 允许跨域携带 cookie
axios.defaults.headers.common['Accept'] = 'application/json';

// 请求拦截器
axios.interceptors.request.use(
  config => {
    // 自动携带token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    
    // 如果是FormData（文件上传），删除Content-Type，让浏览器自动处理
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else {
      config.headers['Content-Type'] = 'application/json';
    }
    
    // 记录请求信息
    console.log('🚀 发送请求:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data instanceof FormData ? 'FormData' : config.data,
      params: config.params
    });
    
    return config;
  },
  error => {
    // 记录请求错误
    console.error('❌ 请求错误:', {
      message: error.message,
      config: error.config
    });
    return Promise.reject(error);
  }
);

// 响应拦截器
axios.interceptors.response.use(
  response => {
    // 记录响应信息
    console.log('✅ 收到响应:', {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    });
    return response;
  },
  error => {
    // 记录详细的错误信息
    if (error.response) {
      // 服务器返回了错误状态码
      console.error('❌ 服务器响应错误:', {
        url: error.config.url,
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        data: error.response.data
      });
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('❌ 未收到响应:', {
        url: error.config.url,
        request: error.request
      });
    } else {
      // 请求配置出错
      console.error('❌ 请求配置错误:', {
        message: error.message,
        config: error.config
      });
    }
    return Promise.reject(error);
  }
);

export default axios; 