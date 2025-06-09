import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from '../../api';

const { Option } = Select;

const GroupList = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingGroup, setEditingGroup] = useState(null);
  const [error, setError] = useState(null);

  // 获取用户组列表
  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('开始获取用户组列表...');
      const response = await axios.get('/api/users/groups/');
      console.log('用户组列表响应:', response.data);
      setGroups(response.data);
    } catch (error) {
      console.error('获取用户组列表失败:', error);
      console.error('错误详情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = '获取用户组列表失败';
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = '未登录或登录已过期，请重新登录';
        } else if (error.response.status === 403) {
          errorMessage = '没有权限访问此页面';
        } else {
          errorMessage = error.response.data?.detail || error.response.data?.message || errorMessage;
        }
      } else if (error.request) {
        errorMessage = '网络请求失败，请检查网络连接';
      }
      
      message.error(errorMessage);
      setError(errorMessage);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // 处理新增/编辑
  const handleAddEdit = (record = null) => {
    console.log('打开编辑模态框:', record);
    setEditingGroup(record);
    if (record) {
      form.setFieldsValue({
        ...record,
        modules: record.modules || []
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log('表单数据:', values);

      if (editingGroup) {
        console.log('更新用户组:', editingGroup.id);
        const response = await axios.put(`/api/users/groups/${editingGroup.id}/`, values);
        console.log('更新响应:', response.data);
        message.success('更新成功');
      } else {
        console.log('新增用户组');
        const response = await axios.post('/api/users/groups/', values);
        console.log('新增响应:', response.data);
        message.success('添加成功');
      }
      
      setModalVisible(false);
      fetchGroups();
    } catch (error) {
      console.error('表单提交错误:', error);
      console.error('错误详情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = '操作失败';
      if (error.response) {
        errorMessage = error.response.data?.detail || error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = '网络请求失败，请检查网络连接';
      }
      
      message.error(errorMessage);
    }
  };

  // 处理删除
  const handleDelete = async (id) => {
    try {
      console.log('删除用户组:', id);
      await axios.delete(`/api/users/groups/${id}/`);
      console.log('删除成功');
      message.success('删除成功');
      fetchGroups();
    } catch (error) {
      console.error('删除失败:', error);
      console.error('错误详情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = '删除失败';
      if (error.response) {
        errorMessage = error.response.data?.detail || error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = '网络请求失败，请检查网络连接';
      }
      
      message.error(errorMessage);
    }
  };

  const columns = [
    {
      title: '用户组名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '可用模块',
      dataIndex: 'modules',
      key: 'modules',
      render: (modules) => {
        if (!modules || !Array.isArray(modules)) return '-';
        return modules.join(', ');
      }
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => date ? new Date(date).toLocaleString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleAddEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个用户组吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 可用的模块列表
  const availableModules = [
    { value: 'chat', label: 'AI对话' },
    { value: 'knowledge', label: '知识库' },
    { value: 'course', label: '课程管理' },
    { value: 'user', label: '用户管理' },
    { value: 'group', label: '用户组管理' },
    { value: 'system', label: '系统设置' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleAddEdit()}
        >
          新增用户组
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={groups}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingGroup ? '编辑用户组' : '新增用户组'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="用户组名称"
            rules={[{ required: true, message: '请输入用户组名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="modules"
            label="可用模块"
            rules={[{ required: true, message: '请选择可用模块' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择可用模块"
              style={{ width: '100%' }}
            >
              {availableModules.map(module => (
                <Option key={module.value} value={module.value}>
                  {module.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GroupList; 