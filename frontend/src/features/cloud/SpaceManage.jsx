import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined, FileOutlined, SearchOutlined } from '@ant-design/icons';
import axios from '../../api';

const SpaceManage = () => {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingSpace, setEditingSpace] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [search, setSearch] = useState('');
  const [memberModal, setMemberModal] = useState(false);
  const [members, setMembers] = useState([]);
  const [currentSpaceId, setCurrentSpaceId] = useState(null);

  // 获取空间列表
  const fetchSpaces = async (page = 1, pageSize = 10, searchText = '') => {
    setLoading(true);
    try {
      console.log('请求空间列表...');
      const res = await axios.get('/api/spaces/', { params: { page, page_size: pageSize, search: searchText } });
      setSpaces(res.data.results || res.data);
      setPagination({
        current: page,
        pageSize,
        total: res.data.count || (res.data.results ? res.data.results.length : 0)
      });
      console.log('空间列表响应:', res.data);
    } catch (err) {
      console.error('获取空间列表失败:', err);
      setSpaces([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  const handleTableChange = (pagination) => {
    fetchSpaces(pagination.current, pagination.pageSize, search);
  };

  // 搜索
  const handleSearch = () => {
    fetchSpaces(1, pagination.pageSize, search);
  };

  // 打开新增/编辑弹窗
  const handleAddEdit = (record = null) => {
    setEditingSpace(record);
    setModalVisible(true);
    setTimeout(() => {
      if (record) {
        form.setFieldsValue({ name: record.name });
        console.log('编辑模式，设置表单初始值:', { name: record.name });
      } else {
        form.resetFields();
        console.log('新增模式，重置表单');
      }
      console.log('当前表单值:', form.getFieldsValue());
    }, 0);
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log('提交空间表单值:', values);
      if (editingSpace) {
        await axios.put(`/api/spaces/${editingSpace.id}/`, values);
        message.success('更新成功');
      } else {
        await axios.post('/api/spaces/', values);
        message.success('添加成功');
      }
      setModalVisible(false);
      form.resetFields();
      fetchSpaces(pagination.current, pagination.pageSize, search);
    } catch (err) {
      console.error('空间保存失败:', err);
      message.error('保存失败');
    }
  };

  // 删除空间
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/spaces/${id}/`);
      message.success('删除成功');
      fetchSpaces(pagination.current, pagination.pageSize, search);
    } catch (err) {
      console.error('删除空间失败:', err);
      message.error('删除失败');
    }
  };

  // 成员管理
  const openMemberModal = async (spaceId) => {
    setCurrentSpaceId(spaceId);
    setMemberModal(true);
    try {
      const res = await axios.get(`/api/spaces/${spaceId}/members/`);
      setMembers(res.data);
      console.log('空间成员:', res.data);
    } catch (err) {
      setMembers([]);
      console.error('获取成员失败:', err);
    }
  };

  // 跳转文档列表
  const gotoDocs = (spaceId) => {
    window.location.href = `/cloud/docs?space_id=${spaceId}`;
  };

  const columns = [
    {
      title: '组名',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => <a onClick={() => gotoDocs(record.id)}>{text}</a>,
    },
    {
      title: '文档数量',
      dataIndex: 'doc_count',
      key: 'doc_count',
    },
    {
      title: '人数',
      dataIndex: 'members_count',
      key: 'members_count',
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
          <Popconfirm title="确定要删除这个空间吗？" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
          <Button type="link" icon={<TeamOutlined />} onClick={() => openMemberModal(record.id)}>成员管理</Button>
          <Button type="link" icon={<FileOutlined />} onClick={() => gotoDocs(record.id)}>进入文档</Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #e5e5e5', padding: 32, width: '100%', minHeight: 500 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Space>
          <Input
            placeholder="请输入组名"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 220 }}
            allowClear
          />
          <Button onClick={handleSearch} icon={<SearchOutlined />}>查询</Button>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAddEdit()}>创建组别</Button>
      </div>
      <Table
        columns={columns}
        dataSource={spaces}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        onChange={handleTableChange}
      />
      <Modal
        title={editingSpace ? '编辑空间' : '新增空间'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => { setModalVisible(false); form.resetFields(); }}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="空间名称" rules={[{ required: true, message: '请输入空间名称' }]}> 
            <Input allowClear onChange={e => console.log('Input变化:', e.target.value)} /> 
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="成员管理"
        open={memberModal}
        onCancel={() => setMemberModal(false)}
        footer={null}
        width={600}
      >
        <Table
          columns={[
            { title: '用户名', dataIndex: 'username', key: 'username' },
            { title: '角色', dataIndex: 'role', key: 'role' },
            { title: '加入时间', dataIndex: 'joined', key: 'joined', render: (date) => date ? new Date(date).toLocaleString() : '-' },
          ]}
          dataSource={members}
          rowKey="id"
          pagination={false}
        />
      </Modal>
    </div>
  );
};

export default SpaceManage; 