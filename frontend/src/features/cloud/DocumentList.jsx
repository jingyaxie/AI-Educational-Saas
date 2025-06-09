import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Upload, Space } from 'antd';
import { UploadOutlined, DeleteOutlined, EditOutlined, DownloadOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import axios from '../../api';

const DocumentList = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingDoc, setEditingDoc] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const urlParams = new URLSearchParams(window.location.search);
  const spaceId = urlParams.get('space_id');

  // 获取文档列表
  const fetchDocs = async (page = 1, pageSize = 10, searchText = '') => {
    if (!spaceId) {
      message.error('未获取到空间ID，无法加载文档列表');
      console.error('spaceId无效，无法请求文档列表');
      return;
    }
    setLoading(true);
    try {
      console.log('请求文档列表，spaceId:', spaceId);
      const res = await axios.get(`/api/spaces/${spaceId}/documents/`, { params: { page, page_size: pageSize, search: searchText } });
      setDocs(res.data.results || res.data);
      setPagination({
        current: page,
        pageSize,
        total: res.data.count || (res.data.results ? res.data.results.length : 0)
      });
      console.log('文档列表响应:', res.data);
    } catch (err) {
      console.error('获取文档列表失败:', err);
      setDocs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (spaceId) fetchDocs();
  }, [spaceId]);

  const handleTableChange = (pagination) => {
    fetchDocs(pagination.current, pagination.pageSize, search);
  };

  // 搜索
  const handleSearch = () => {
    fetchDocs(1, pagination.pageSize, search);
  };

  // 上传文档
  const handleUpload = async ({ file }) => {
    if (!spaceId) {
      message.error('未获取到空间ID，无法上传文档');
      console.error('spaceId无效，无法上传文档');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name);
    try {
      console.log('上传文档，spaceId:', spaceId, '文件名:', file.name);
      await axios.post(`/api/spaces/${spaceId}/documents/`, formData);
      message.success('上传成功');
      fetchDocs(pagination.current, pagination.pageSize, search);
    } catch (err) {
      console.error('上传失败:', err);
      message.error('上传失败');
    } finally {
      setUploading(false);
    }
  };

  // 下载文档
  const handleDownload = (fileUrl, name) => {
    window.open(fileUrl, '_blank');
    console.log('下载文档:', fileUrl, name);
  };

  // 删除文档
  const handleDelete = async (id) => {
    if (!spaceId) {
      message.error('未获取到空间ID，无法删除文档');
      console.error('spaceId无效，无法删除文档');
      return;
    }
    try {
      await axios.delete(`/api/spaces/${spaceId}/documents/${id}/`);
      message.success('删除成功');
      fetchDocs(pagination.current, pagination.pageSize, search);
    } catch (err) {
      console.error('删除失败:', err);
      message.error('删除失败');
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (!spaceId) {
      message.error('未获取到空间ID，无法批量删除文档');
      console.error('spaceId无效，无法批量删除文档');
      return;
    }
    for (const id of selectedRowKeys) {
      await handleDelete(id);
    }
    setSelectedRowKeys([]);
  };

  // 重命名
  const handleRename = async (record) => {
    setEditingDoc(record);
    form.setFieldsValue({ name: record.name });
    setModalVisible(true);
  };
  const handleRenameSubmit = async () => {
    if (!spaceId) {
      message.error('未获取到空间ID，无法重命名文档');
      console.error('spaceId无效，无法重命名文档');
      return;
    }
    try {
      const values = await form.validateFields();
      await axios.put(`/api/spaces/${spaceId}/documents/${editingDoc.id}/`, { ...editingDoc, name: values.name });
      message.success('重命名成功');
      setModalVisible(false);
      fetchDocs(pagination.current, pagination.pageSize, search);
    } catch (err) {
      console.error('重命名失败:', err);
      message.error('重命名失败');
    }
  };

  const columns = [
    { title: '文档名', dataIndex: 'name', key: 'name' },
    { title: '创建时间', dataIndex: 'created', key: 'created', render: (date) => date ? new Date(date).toLocaleString() : '-' },
    { title: '大小', dataIndex: 'size', key: 'size' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button icon={<DownloadOutlined />} onClick={() => handleDownload(record.file, record.name)}>下载</Button>
          <Button icon={<EditOutlined />} onClick={() => handleRename(record)}>重命名</Button>
          <Popconfirm title="确定要删除这个文档吗？" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
            <Button danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #e5e5e5', padding: 32, width: '100%', minHeight: 500 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Space>
          <Input
            placeholder="请输入文档名"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 220 }}
            allowClear
            disabled={!spaceId}
          />
          <Button onClick={handleSearch} icon={<SearchOutlined />} disabled={!spaceId}>查询</Button>
        </Space>
        <Space>
          <Upload customRequest={handleUpload} showUploadList={false} multiple={false} disabled={!spaceId}>
            <Button icon={<UploadOutlined />} loading={uploading} disabled={!spaceId}>上传文档</Button>
          </Upload>
          <Button danger onClick={handleBatchDelete} disabled={selectedRowKeys.length === 0 || !spaceId}>批量删除</Button>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={spaceId ? docs : []}
        rowKey="id"
        loading={loading}
        rowSelection={spaceId ? { selectedRowKeys, onChange: setSelectedRowKeys } : undefined}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        onChange={handleTableChange}
        locale={{ emptyText: spaceId ? '暂无文档' : '请选择空间后查看文档' }}
      />
      <Modal
        title="重命名文档"
        open={modalVisible}
        onOk={handleRenameSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="新文档名" rules={[{ required: true, message: '请输入新文档名' }]}> <Input /> </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DocumentList; 