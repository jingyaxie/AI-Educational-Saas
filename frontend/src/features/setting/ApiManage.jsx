import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Select, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from '../../api';

// 主流大模型选项
const modelOptions = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'deepseek', label: 'Deepseek' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'qwen', label: '通义千问' },
  { value: 'moonshot', label: 'Moonshot' },
];

const ApiManage = () => {
  // API列表数据
  const [apis, setApis] = useState([]);
  // 加载状态
  const [loading, setLoading] = useState(false);
  // 弹窗显示状态
  const [modalVisible, setModalVisible] = useState(false);
  // antd表单实例
  const [form] = Form.useForm();
  // 当前编辑的API对象
  const [editingApi, setEditingApi] = useState(null);

  // 获取API列表
  const fetchApis = async () => {
    setLoading(true);
    try {
      console.log('[ApiManage] 请求大模型API列表...');
      const res = await axios.get('/api/modelapis/');
      console.log('[ApiManage] API列表响应:', res.data);
      setApis(res.data);
      // 将API列表保存到全局变量，供getModelApiConfig使用
      window.__apis = res.data;
    } catch (err) {
      console.error('[ApiManage] 获取API列表失败:', err);
      message.error('获取API列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 首次加载时获取API列表
  useEffect(() => {
    fetchApis();
  }, []);

  // 打开新增/编辑弹窗
  const handleAddEdit = (record = null) => {
    setEditingApi(record);
    if (record) {
      console.log('[ApiManage] 编辑API，回显数据:', record);
      form.setFieldsValue(record);
    } else {
      console.log('[ApiManage] 新增API，重置表单');
      form.resetFields();
    }
    setModalVisible(true);
  };

  // 提交表单（新增/编辑）
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log('[ApiManage] 表单校验通过，提交内容：', values);
      if (editingApi) {
        console.log('[ApiManage] 更新API:', editingApi.id, values);
        await axios.put(`/api/modelapis/${editingApi.id}/`, values);
        message.success('更新成功');
      } else {
        console.log('[ApiManage] 新增API:', values);
        await axios.post('/api/modelapis/', values);
        message.success('添加成功');
      }
      setModalVisible(false);
      fetchApis();
    } catch (err) {
      console.error('[ApiManage] 保存API失败:', err);
      let errorMsg = '保存失败';
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') {
          errorMsg = err.response.data;
        } else if (err.response.data.detail) {
          errorMsg = err.response.data.detail;
        } else {
          errorMsg = Object.values(err.response.data).join('; ');
        }
      }
      message.error(errorMsg);
    }
  };

  // 删除API
  const handleDelete = async (id) => {
    try {
      console.log('[ApiManage] 删除API:', id);
      await axios.delete(`/api/modelapis/${id}/`);
      message.success('删除成功');
      fetchApis();
    } catch (err) {
      console.error('[ApiManage] 删除API失败:', err);
      message.error('删除失败');
    }
  };

  // 刷新token用量并刷新表格
  const handleRefreshUsage = async () => {
    setLoading(true);
    try {
      console.log('[ApiManage] 请求刷新所有大模型API的token用量...');
      await axios.post('/api/modelapis/refresh_usage/');
      message.success('token用量已刷新');
      fetchApis();
    } catch (err) {
      console.error('[ApiManage] 刷新token用量失败:', err);
      message.error('刷新token用量失败');
    } finally {
      setLoading(false);
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '大模型',
      dataIndex: 'model_display',
      key: 'model',
    },
    {
      title: 'API-key',
      dataIndex: 'apikey',
      key: 'apikey',
      render: (text) => <span style={{ fontFamily: 'monospace' }}>{text}</span>,
    },
    {
      title: 'token用量',
      dataIndex: 'usage',
      key: 'usage',
    },
    {
      title: '接入时间',
      dataIndex: 'time',
      key: 'time',
      render: (date) => date ? new Date(date).toLocaleString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleAddEdit(record)}>编辑</Button>
          <Popconfirm title="确定要删除这个API吗？" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #e5e5e5', padding: 32, width: '100%', minHeight: 500 }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 22, color: '#3b6ed6', fontWeight: 600 }}>API接口管理</span>
        <div>
          <Button icon={<ReloadOutlined />} onClick={handleRefreshUsage} style={{ marginRight: 12, minWidth: 80 }}>
            刷新
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleAddEdit()}
            style={{ minWidth: 120 }}
          >
            接入大模型
          </Button>
        </div>
      </div>
      <Table columns={columns} dataSource={apis} rowKey="id" loading={loading} />
      <Modal
        title={editingApi ? '编辑API' : '新增API'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          {/* 大模型下拉选择 */}
          <Form.Item name="model" label="大模型" rules={[{ required: true, message: '请选择大模型' }]}> 
            <Select options={modelOptions} placeholder="请选择大模型" />
          </Form.Item>
          {/* API-key 输入 */}
          <Form.Item name="apikey" label="API-key" rules={[{ required: true, message: '请输入API-key' }]}> 
            <Input allowClear />
          </Form.Item>
          {/* 新增base_url配置 */}
          <Form.Item name="base_url" label="Base URL" rules={[{ required: true, message: '请输入Base URL' }]}> 
            <Input allowClear />
          </Form.Item>
          {/* 新增model_name配置 */}
          <Form.Item name="model_name" label="Model Name" rules={[{ required: true, message: '请输入Model Name' }]}> 
            <Input allowClear />
          </Form.Item>
          {/* token用量只读，不可编辑，表单中不显示 */}
        </Form>
      </Modal>
    </div>
  );
};

export default ApiManage;

// 导出函数，供ChatPanel使用，返回当前已配置的API列表，格式为 { model: { baseURL, apiKey, model } }
export const getModelApiConfig = () => {
  const config = {};
  // 假设apis是当前组件内的状态，这里直接使用全局变量或通过props传入
  const apis = window.__apis || [];
  apis.forEach(api => {
    config[api.model] = {
      baseURL: api.base_url,
      apiKey: api.apikey,
      model: api.model_name || api.model
    };
  });
  return config;
}; 