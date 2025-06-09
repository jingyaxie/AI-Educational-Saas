import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Select, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from '../../api';

const typeOptions = [
  { value: 'doc', label: '文档' },
  { value: 'xls', label: '表格' },
];

const iconMap = {
  doc: <span style={{ fontSize: 28, marginRight: 8 }}>📄</span>,
  xls: <span style={{ fontSize: 28, marginRight: 8 }}>📊</span>,
};

const KnowledgeManage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingKb, setEditingKb] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [search, setSearch] = useState('');
  const [formKey, setFormKey] = useState(0);

  // 获取知识库列表
  const fetchData = async (page = 1, pageSize = 10, searchText = '') => {
    setLoading(true);
    try {
      const res = await axios.get('/api/knowledgebases/', {
        params: { page, page_size: pageSize, search: searchText }
      });
      setData(res.data.results || res.data);
      setPagination({
        current: page,
        pageSize,
        total: res.data.count || (res.data.results ? res.data.results.length : 0)
      });
    } catch (err) {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTableChange = (pagination) => {
    fetchData(pagination.current, pagination.pageSize, search);
  };

  // 搜索
  const handleSearch = () => {
    fetchData(1, pagination.pageSize, search);
  };

  // 打开新增/编辑弹窗
  const handleAddEdit = (record = null) => {
    setEditingKb(record);
    setFormKey(prev => prev + 1);
    setModalVisible(true);
    setTimeout(() => {
      if (record) {
        console.log('编辑模式，设置表单初始值:', record);
        form.setFieldsValue(record);
        console.log('setFieldsValue后表单值:', form.getFieldsValue());
      } else {
        form.resetFields();
        console.log('新增模式，重置表单');
      }
    }, 0);
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log('提交表单值:', values);
      if (editingKb) {
        await axios.put(`/api/knowledgebases/${editingKb.id}/`, values);
        message.success('更新成功');
      } else {
        await axios.post('/api/knowledgebases/', values);
        message.success('添加成功');
      }
      setModalVisible(false);
      fetchData(pagination.current, pagination.pageSize, search);
    } catch (err) {
      console.error('表单提交失败:', err, '当前表单值:', form.getFieldsValue());
      message.error('保存失败');
    }
  };

  // 删除知识库
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/knowledgebases/${id}/`);
      message.success('删除成功');
      fetchData(pagination.current, pagination.pageSize, search);
    } catch (err) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => iconMap[type] || '-',
    },
    {
      title: '知识库名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '文件数',
      dataIndex: 'files_count',
      key: 'files_count',
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
          <Popconfirm title="确定要删除这个知识库吗？" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #e5e5e5', padding: 32, width: '100%', minHeight: 500 }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Input
            placeholder="请输入知识库名称"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 220 }}
            allowClear
          />
          <Button onClick={handleSearch} type="default">查询</Button>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAddEdit()}>创建知识库</Button>
      </div>
      <Table
        columns={columns}
        dataSource={data}
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
        title={editingKb ? '编辑知识库' : '新增知识库'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
        okButtonProps={{ loading: loading }}
      >
        <Form
          key={formKey}
          form={form}
          layout="vertical"
        >
          <Form.Item name="name" label="知识库名称" rules={[{ required: true, message: '请输入知识库名称' }]} validateTrigger="onChange">
            <Input />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true, message: '请选择类型' }]} validateTrigger="onChange">
            <Select options={typeOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default KnowledgeManage; 