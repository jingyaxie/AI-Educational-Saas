import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import axios from './api';

const Login = () => {
  const [captcha, setCaptcha] = useState({ image_url: '', captcha_key: '' });
  const [loading, setLoading] = useState(false);

  // 获取验证码
  const fetchCaptcha = async () => {
    const res = await axios.get('/api/captcha/');
    console.log('验证码响应:', res.data);
    setCaptcha(res.data);
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  // 登录提交
  const onFinish = async (values) => {
    setLoading(true);
    try {
      console.log('登录请求 URL:', '/api/login/');
      console.log('登录请求方法:', 'POST');
      console.log('开始登录请求，参数：', {
        username: values.username,
        password: values.password,
        captcha_key: captcha.captcha_key,
        captcha_value: values.captcha,
      });
      console.log('Axios 配置:', {
        baseURL: axios.defaults.baseURL,
        headers: axios.defaults.headers,
      });
      const res = await axios.post('/api/login/', {
        username: values.username,
        password: values.password,
        captcha_key: captcha.captcha_key,
        captcha_value: values.captcha,
      });
      console.log('登录响应：', res.data);
      
      // 使用 toast 显示登录成功消息
      message.success({
        content: '登录成功',
        duration: 2,
        style: {
          marginTop: '20vh',
        },
        icon: '🎉',
        className: 'custom-toast',
      });

      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        localStorage.setItem('token', res.data.access);
        window.location.href = '/';
      }, 1000);
    } catch (err) {
      console.log('登录错误详情：', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        headers: err.response?.headers,
        config: err.config,
      });
      console.log('登录错误：', err.response?.data || err.message);
      const errorMsg = err.response?.data?.error || err.response?.data?.detail || '登录失败';
      if (errorMsg.includes('验证码')) {
        message.error({
          content: errorMsg,
          duration: 2,
          style: {
            marginTop: '20vh',
            color: '#ff4d4f',
            fontSize: '16px',
            fontWeight: 'bold',
          },
        });
      } else {
        message.error({
          content: errorMsg,
          duration: 2,
          style: {
            marginTop: '20vh',
          },
        });
      }
      fetchCaptcha();
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fff' }}>
      {/* 左侧图片 */}
      <div style={{ flex: 1, background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
          alt="AI"
          style={{ width: '80%', borderRadius: 16 }}
        />
      </div>
      {/* 右侧表单 */}
      <div style={{ flex: 1, background: '#f6faef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 350, padding: 32, borderRadius: 8, background: '#f6faef' }}>
          <h2 style={{ textAlign: 'center', marginBottom: 32 }}>欢迎登录</h2>
          <Form onFinish={onFinish}>
            <Form.Item name="username" rules={[{ required: true, message: '请输入账号' }]}> 
              <Input placeholder="账号" size="large" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}> 
              <Input.Password placeholder="密码" size="large" />
            </Form.Item>
            <Form.Item style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Form.Item name="captcha" noStyle rules={[{ required: true, message: '请输入验证码' }]}> 
                  <Input placeholder="验证码" size="large" style={{ width: 120 }} />
                </Form.Item>
                <img
                  src={captcha.image_url}
                  alt="验证码"
                  style={{ marginLeft: 16, height: 40, cursor: 'pointer', borderRadius: 4 }}
                  onClick={fetchCaptcha}
                  title="点击刷新验证码"
                />
              </div>
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              style={{ width: '100%', background: '#5a7d1b', border: 'none', fontWeight: 'bold', letterSpacing: 8 }}
              loading={loading}
            >
              登 录
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login; 