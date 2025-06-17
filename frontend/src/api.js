import axios from 'axios';

// 根据环境变量自动切换 baseURL
axios.defaults.baseURL = '';
axios.defaults.withCredentials = true;  // 允许跨域携带 cookie
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

// 请求拦截器
axios.interceptors.request.use(
  config => {
    // 自动携带token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  error => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 响应拦截器
axios.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    return response;
  },
  error => {
    // 对响应错误做点什么
    if (error.response) {
      // 请求已发出，但服务器响应的状态码不在 2xx 范围内
      console.log('Error response:', error.response.data);
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      console.log('Error request:', error.request);
    } else {
      // 发送请求时出了点问题
      console.log('Error message:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axios; 