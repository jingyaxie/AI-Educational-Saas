import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Space, Tag, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from '../../api';

const AgentList = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingAgent, setEditingAgent] = useState(null);
  const [error, setError] = useState(null);

  // 可用角色列表
  const roleOptions = [
    { value: 'student', label: '学生' },
    { value: 'teacher', label: '老师' },
    { value: 'admin', label: '教务' },
    { value: 'sysadmin', label: '系统管理员' },
  ];

  // 获取智能体列表
  const fetchAgents = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('请求智能体列表...');
      const res = await axios.get('/api/agents/');
      console.log('智能体列表响应:', res.data);
      setAgents(res.data);
    } catch (err) {
      console.error('获取智能体列表失败:', err);
      setError('获取智能体列表失败');
      message.error('获取智能体列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  // 打开新增/编辑弹窗
  const handleAddEdit = (record = null) => {
    setEditingAgent(record);
    if (record) {
      form.setFieldsValue({
        ...record,
        role: record.role ? record.role.split(',') : []
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log('表单校验通过，提交内容：', values);
      const submitData = {
        ...values,
        role: Array.isArray(values.role) ? values.role.join(',') : values.role
      };
      if (editingAgent) {
        console.log('更新智能体:', editingAgent.id, submitData);
        await axios.put(`/api/agents/${editingAgent.id}/`, submitData);
        message.success('更新成功');
      } else {
        console.log('新增智能体:', submitData);
        await axios.post('/api/agents/', submitData);
        message.success('添加成功');
      }
      setModalVisible(false);
      fetchAgents();
    } catch (err) {
      console.error('表单校验失败:', err);
      if (err.errorFields) {
        err.errorFields.forEach(field => {
          console.error('字段校验失败:', field.name, field.errors);
        });
      }
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

  // 删除智能体
  const handleDelete = async (id) => {
    try {
      console.log('删除智能体:', id);
      await axios.delete(`/api/agents/${id}/`);
      message.success('删除成功');
      fetchAgents();
    } catch (err) {
      console.error('删除智能体失败:', err);
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <b>{text}</b>,
    },
    {
      title: 'API-key',
      dataIndex: 'apikey',
      key: 'apikey',
      render: (text) => <span style={{ fontFamily: 'monospace' }}>{text}</span>,
    },
    {
      title: '权限',
      dataIndex: 'role',
      key: 'role',
      render: (role) => role.split(',').map(r => <Tag key={r}>{r}</Tag>),
    },
    {
      title: '创建时间',
      dataIndex: 'created',
      key: 'created',
      render: (date) => date ? new Date(date).toLocaleString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleAddEdit(record)}>编辑</Button>
          <Popconfirm title="确定要删除这个智能体吗？" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #e5e5e5', padding: 32, width: '100%', minHeight: 500 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ color: '#3b6ed6', margin: 0 }}>智能体列表</h2>
        <span style={{ flex: 1 }} />
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchAgents}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAddEdit()}>创建智能体</Button>
        </Space>
      </div>
      <Table columns={columns} dataSource={agents} rowKey="id" loading={loading} />
      <Modal
        title={editingAgent ? '编辑智能体' : '新增智能体'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}> 
            <Input allowClear /> 
          </Form.Item>
          <Form.Item name="apikey" label="API-key" rules={[{ required: true, message: '请输入API-key' }]}> 
            <Input allowClear /> 
          </Form.Item>
          <Form.Item name="role" label="权限" rules={[{ required: true, message: '请选择权限' }]}> 
            <Select mode="multiple" options={roleOptions} placeholder="请选择权限" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AgentList; 