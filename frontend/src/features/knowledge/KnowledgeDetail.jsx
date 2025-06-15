import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Spin, Descriptions, message, Input, Button, Table, Tag, Tooltip, Menu } from 'antd';
import { PlusOutlined, FileWordOutlined, LeftOutlined } from '@ant-design/icons';
import axios from '../../api';

const menuItems = [
  { key: 'docs', label: '文档', icon: <FileWordOutlined /> },
  { key: 'recall', label: '召回测试' },
  { key: 'setting', label: '设置' },
];

const KnowledgeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [kb, setKb] = useState(null);
  const [files, setFiles] = useState([]);
  const [fileLoading, setFileLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeMenu, setActiveMenu] = useState('docs');

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/knowledgebases/${id}/`);
        setKb(res.data);
      } catch {
        message.error('获取知识库详情失败');
      }
      setLoading(false);
    };
    fetchDetail();
  }, [id]);

  useEffect(() => {
    if (activeMenu === 'docs') fetchFiles();
    // 其他菜单可扩展
    // eslint-disable-next-line
  }, [id, activeMenu]);

  const fetchFiles = async () => {
    setFileLoading(true);
    try {
      const res = await axios.get(`/api/knowledgefiles/`, { params: { kb: id } });
      setFiles(res.data);
    } catch {
      message.error('获取文件列表失败');
    }
    setFileLoading(false);
  };

  const columns = [
    { title: '#', dataIndex: 'index', key: 'index', width: 60, render: (_, __, i) => i + 1 },
    { title: '名称', dataIndex: 'filename', key: 'filename', render: (text) => <span><FileWordOutlined style={{color:'#1890ff',marginRight:6}} />{text}</span> },
    { title: '分段模式', dataIndex: 'segment_mode', key: 'segment_mode', render: () => <Tag>通用</Tag> },
    { title: '字符数', dataIndex: 'char_count', key: 'char_count', render: (v) => v ? (v >= 1000 ? (v/1000).toFixed(1)+'k' : v) : '-' },
    { title: '召回次数', dataIndex: 'recall_count', key: 'recall_count', render: v => v || 0 },
    { title: '上传时间', dataIndex: 'created', key: 'created', render: t => t && t.slice(0, 19).replace('T', ' ') },
    { title: '状态', dataIndex: 'status', key: 'status', render: () => <Tag color="green">可用</Tag> },
    { title: '操作', key: 'action', render: () => <Button size="small" type="link">···</Button> },
  ];

  return (
    <div style={{ display: 'flex', minHeight: 600 }}>
      {/* 左侧卡片和菜单 */}
      <div style={{ width: 150, marginRight: 16 }}>
        <Card style={{ marginBottom: 16 }} loading={loading}>
          {kb && (
            <>
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{kb.name}</div>
              <div style={{ color: '#888', fontSize: 13, marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{kb.description || '无描述'}</div>
              <div style={{ color: '#aaa', fontSize: 12, marginBottom: 8 }}>本地文档</div>
              <div style={{ color: '#aaa', fontSize: 12, marginBottom: 8 }}>无关联应用</div>
            </>
          )}
        </Card>
        <Menu
          mode="inline"
          selectedKeys={[activeMenu]}
          onClick={e => setActiveMenu(e.key)}
          items={menuItems}
          style={{ borderRadius: 8, marginBottom: 16 }}
        />
      </div>
      {/* 右侧文档表格区 */}
      <div style={{ flex: 1, background: '#fff', borderRadius: 12, padding: 24 }}>
        {/* 顶部返回按钮和搜索框 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Button type="link" icon={<LeftOutlined />} onClick={() => navigate(-1)} style={{ paddingLeft: 0 }}>
            返回
          </Button>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Input
              placeholder="搜索"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: 260, marginRight: 16 }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/dashboard/knowledge/segment', { state: { kb } })}>添加文件</Button>
          </div>
        </div>
        {activeMenu === 'docs' && (
          <>
            <div style={{ color: '#888', marginBottom: 8 }}>
              知识库的所有文件都在这里显示，整个知识库都可以链接到 Dify 引用或通过 Chat 插件进行索引。
              <a href="https://docs.dify.ai/docs/knowledge/intro" target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8 }}>了解更多</a>
            </div>
            <Table
              rowKey="id"
              columns={columns}
              dataSource={files.filter(f => !search || f.filename.includes(search))}
              loading={fileLoading}
              pagination={false}
              style={{ background: '#fff', borderRadius: 8 }}
            />
          </>
        )}
        {/* 其他菜单内容可扩展 */}
      </div>
    </div>
  );
};

export default KnowledgeDetail; 