import React, { useEffect, useState } from 'react';
import { Card, Button, Modal, Form, Input, message, Popconfirm, Spin, Tooltip, Table, Select, Dropdown, Menu } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, EllipsisOutlined } from '@ant-design/icons';
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
    setModalOpen(true);
    setTimeout(() => {
      form.setFieldsValue({
        name: kb.name || '',
        description: kb.description || '',
      });
    }, 0);
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
        setModalOpen(false);
        fetchList();
      } else {
        const res = await axios.post('/api/knowledgebases/', values);
        message.success('创建成功');
        setModalOpen(false);
        fetchList();
        navigate(`/dashboard/knowledge/${res.data.id}`);
      }
    } catch {}
  };

  const goDetail = (id) => {
    navigate(`/dashboard/knowledge/${id}`);
  };

  const showCreateModal = () => {
    navigate('/dashboard/knowledge/create');
  };

  function formatCharCount(num) {
    if (num >= 10000) return (num / 10000).toFixed(1).replace(/\.0$/, '') + '万';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + '千';
    if (num >= 100) return (num / 100).toFixed(1).replace(/\.0$/, '') + '百';
    return num + '';
  }

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
          { title: '字符数', dataIndex: 'char_count', key: 'char_count', width: 110, render: formatCharCount },
          { title: '创建时间', dataIndex: 'created', key: 'created', render: t => t && t.slice(0, 19).replace('T', ' ') },
          {
            title: '操作',
            key: 'action',
            render: (_, kb) => {
              const menu = (
                <Menu>
                  <Menu.Item key="edit" icon={<EditOutlined />} onClick={e => { e.domEvent.stopPropagation(); handleEdit(kb); }}>
                    编辑
                  </Menu.Item>
                  <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={e => { e.domEvent.stopPropagation(); }}>
                    <Popconfirm title="确定删除？" onConfirm={e => { e.stopPropagation(); handleDelete(kb.id); }} onClick={e => e.stopPropagation()}>
                      删除
                    </Popconfirm>
                  </Menu.Item>
                </Menu>
              );
              return (
                <Dropdown overlay={menu} trigger={["click"]} onClick={e => e.stopPropagation()}>
                  <Button size="small" type="link" icon={<EllipsisOutlined />} />
                </Dropdown>
              );
            },
          },
        ]}
        dataSource={list.filter(kb => kb.name.includes(search))}
        pagination={false}
        style={{ background: '#fff', borderRadius: 8 }}
        onRow={record => ({
          onClick: () => goDetail(record.id),
        })}
        rowClassName={(record) => {
          if (window.location.pathname.endsWith(`/knowledge/${record.id}`)) {
            return 'ant-table-row-selected';
          }
          return '';
        }}
      />
      <Modal
        title={editing ? '编辑知识库' : '新建知识库'}
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <Form
          key={editing ? editing.id : 'new'}
          form={form}
          layout="vertical"
        >
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