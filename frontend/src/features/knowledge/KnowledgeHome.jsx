import React, { useEffect, useState } from 'react';
import { Card, Button, Modal, Form, Input, message, Popconfirm, Spin, Tooltip, Table } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import axios from '../../api';
import { useNavigate } from 'react-router-dom';

const KnowledgeHome = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [blankModalOpen, setBlankModalOpen] = useState(false);
  const [blankForm] = Form.useForm();

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/knowledgebases/');
      setList(res.data);
    } catch {
      message.error('获取知识库列表失败');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleEdit = (kb) => {
    setEditing(kb);
    form.setFieldsValue({ name: kb.name, description: kb.description });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/knowledgebases/${id}/`);
      message.success('删除成功');
      fetchList();
    } catch {
      message.error('删除失败');
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await axios.put(`/api/knowledgebases/${editing.id}/`, values);
        message.success('编辑成功');
      } else {
        await axios.post('/api/knowledgebases/', values);
        message.success('创建成功');
      }
      setModalOpen(false);
      fetchList();
    } catch {}
  };

  const goDetail = (id) => {
    navigate(`/dashboard/knowledge/${id}`);
  };

  const showCreateModal = () => {
    navigate('/dashboard/knowledge/create');
  };

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 24, minHeight: 520, width: '100%', maxWidth: '100%', margin: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <Input
          placeholder="搜索知识库名称"
          prefix={<SearchOutlined />}
          allowClear
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 280, marginRight: 16 }}
        />
        <div style={{ flex: 1 }} />
        <Button type="primary" icon={<PlusOutlined />} onClick={showCreateModal} style={{ marginRight: 12 }}>
          新建知识库
        </Button>
        <Button onClick={() => setBlankModalOpen(true)}>
          空白知识库
        </Button>
      </div>
      <Table
        rowKey="id"
        columns={[
          { title: '名称', dataIndex: 'name', key: 'name' },
          { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
          { title: '文件数', dataIndex: 'files_count', key: 'files_count', width: 90 },
          { title: '字符数', dataIndex: 'char_count', key: 'char_count', width: 110 },
          { title: '创建时间', dataIndex: 'created', key: 'created', render: t => t && t.slice(0, 19).replace('T', ' ') },
          {
            title: '操作',
            key: 'action',
            render: (_, kb) => (
              <span>
                <Button size="small" type="link" onClick={() => handleEdit(kb)}>编辑</Button>
                <Popconfirm title="确定删除？" onConfirm={() => handleDelete(kb.id)}>
                  <Button size="small" type="link" danger>删除</Button>
                </Popconfirm>
              </span>
            ),
          },
        ]}
        dataSource={list.filter(kb => kb.name.includes(search))}
        pagination={false}
        style={{ background: '#fff', borderRadius: 8 }}
      />
      <Modal
        title={editing ? '编辑知识库' : '新建知识库'}
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="知识库名称" rules={[{ required: true, message: '请输入名称' }]}> <Input maxLength={32} /> </Form.Item>
          <Form.Item name="description" label="简介"> <Input.TextArea maxLength={200} rows={3} /> </Form.Item>
        </Form>
      </Modal>
      <Modal
        open={blankModalOpen}
        title="创建空白知识库"
        onCancel={() => setBlankModalOpen(false)}
        onOk={async () => {
          try {
            const values = await blankForm.validateFields();
            await axios.post('/api/knowledgebases/', values);
            setBlankModalOpen(false);
            fetchList();
            message.success('创建成功');
          } catch {
            message.error('创建失败');
          }
        }}
        okText="创建"
        cancelText="取消"
      >
        <Form form={blankForm} layout="vertical">
          <Form.Item name="name" label="知识库名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input maxLength={32} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea maxLength={128} rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default KnowledgeHome; 