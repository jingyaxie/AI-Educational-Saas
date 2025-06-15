import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Spin, Descriptions, message, Input, Button, Table, Tag, Tooltip, Menu, Collapse, Form, Select, InputNumber, Modal } from 'antd';
import { PlusOutlined, FileWordOutlined, LeftOutlined, SettingOutlined, SaveOutlined } from '@ant-design/icons';
import axios from '../../api';

const { Panel } = Collapse;

const menuItems = [
  { key: 'docs', label: '文档', icon: <FileWordOutlined /> },
  { key: 'recall', label: '召回测试' },
  { key: 'setting', label: '设置' },
];

const defaultParams = {
  // 文本分割设置
  text_splitter: 'recursive',
  chunk_size: 1000,
  chunk_overlap: 200,
  separators: ['\n\n', '\n', '。', '！', '？', '.', '!', '?'],
  
  // 向量化设置
  embedding_type: 'local',
  embedding_model: 'sentence-transformers/all-MiniLM-L6-v2',
  
  // 检索设置
  retrieval_strategy: 'similarity',
  top_k: 4,
  similarity_threshold: 0.7,
};

const EMBEDDING_MODEL_OPTIONS = {
  local: [
    { value: 'sentence-transformers/all-MiniLM-L6-v2', label: 'all-MiniLM-L6-v2 (本地)' },
  ],
  openai: [
    { value: 'text-embedding-3-large', label: 'text-embedding-3-large (OpenAI)' },
    { value: 'text-embedding-ada-002', label: 'text-embedding-ada-002 (OpenAI)' },
  ],
};

const KnowledgeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [kb, setKb] = useState(null);
  const [files, setFiles] = useState([]);
  const [fileLoading, setFileLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeMenu, setActiveMenu] = useState('docs');
  const [form] = Form.useForm();
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/knowledgebases/${id}/`);
        setKb(res.data);
        // 设置表单初始值
        if (res.data.embedding_config) {
          const config = res.data.embedding_config;
          form.setFieldsValue({
            text_splitter: config.splitter_config?.text_splitter || defaultParams.text_splitter,
            chunk_size: config.splitter_config?.chunk_size || defaultParams.chunk_size,
            chunk_overlap: config.splitter_config?.chunk_overlap || defaultParams.chunk_overlap,
            separators: config.splitter_config?.separators || defaultParams.separators,
            embedding_type: config.embedding_config?.type || defaultParams.embedding_type,
            embedding_model: config.embedding_config?.model || defaultParams.embedding_model,
            retrieval_strategy: config.retrieval_config?.strategy || defaultParams.retrieval_strategy,
            top_k: config.retrieval_config?.top_k || defaultParams.top_k,
            similarity_threshold: config.retrieval_config?.similarity_threshold || defaultParams.similarity_threshold,
          });
        }
      } catch {
        message.error('获取知识库详情失败');
      }
      setLoading(false);
    };
    fetchDetail();
  }, [id, form]);

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

  const handleSaveConfig = async () => {
    try {
      const values = await form.validateFields();
      setSaveLoading(true);
      
      // 按照后端期望的格式组织数据
      const requestData = {
        splitter_config: {
          text_splitter: values.text_splitter,
          chunk_size: values.chunk_size,
          chunk_overlap: values.chunk_overlap,
          separators: values.separators
        },
        embedding_config: {
          type: values.embedding_type,
          model: values.embedding_model
        },
        retrieval_config: {
          strategy: values.retrieval_strategy,
          top_k: values.top_k,
          similarity_threshold: values.similarity_threshold
        }
      };

      await axios.put(`/api/knowledgebases/${id}/`, {
        embedding_config: requestData
      });
      
      message.success('配置保存成功');
      // 重新获取知识库详情
      const res = await axios.get(`/api/knowledgebases/${id}/`);
      setKb(res.data);
    } catch (e) {
      console.error('保存失败:', e);
      message.error(e.response?.data?.error || '保存失败');
    }
    setSaveLoading(false);
  };

  const columns = [
    { title: '#', dataIndex: 'index', key: 'index', width: 60, render: (_, __, i) => i + 1 },
    { title: '名称', dataIndex: 'filename', key: 'filename', render: (text) => <span><FileWordOutlined style={{color:'#1890ff',marginRight:6}} />{text}</span> },
    { title: '分段模式', dataIndex: 'segment_mode', key: 'segment_mode', render: () => <Tag>通用</Tag> },
    { title: '字符数', dataIndex: 'char_count', key: 'char_count', render: (v) => {
      if (!v && v !== 0) return '-';
      if (v >= 10000) return (v/10000).toFixed(1).replace(/\.0$/, '') + '万';
      if (v >= 1000) return (v/1000).toFixed(1).replace(/\.0$/, '') + 'k';
      return v.toString();
    }},
    { title: '召回次数', dataIndex: 'recall_count', key: 'recall_count', render: v => v || 0 },
    { title: '上传时间', dataIndex: 'created', key: 'created', render: t => t && t.slice(0, 19).replace('T', ' ') },
    { title: '状态', dataIndex: 'status', key: 'status', render: () => <Tag color="green">可用</Tag> },
    { title: '操作', key: 'action', render: () => <Button size="small" type="link">···</Button> },
  ];

  const renderEmbeddingConfig = () => {
    if (!kb?.embedding_config) return null;
    const config = kb.embedding_config;
    
    return (
      <Collapse defaultActiveKey={['1']} style={{ marginTop: 16 }}>
        <Panel header={<span><SettingOutlined style={{ marginRight: 8 }} />向量化配置</span>} key="1">
          <Descriptions column={2} size="small">
            <Descriptions.Item label="文本分割方式">
              {config.splitter_config?.text_splitter === 'recursive' ? '递归分割' : 
               config.splitter_config?.text_splitter === 'character' ? '字符分割' : 
               config.splitter_config?.text_splitter === 'token' ? 'Token分割' : '通用'}
            </Descriptions.Item>
            <Descriptions.Item label="块大小">{config.splitter_config?.chunk_size || 1000} 字符</Descriptions.Item>
            <Descriptions.Item label="重叠大小">{config.splitter_config?.chunk_overlap || 200} 字符</Descriptions.Item>
            <Descriptions.Item label="Embedding模型">
              {config.embedding_config?.type === 'local' ? '本地模型' : 
               config.embedding_config?.type === 'openai' ? 'OpenAI' : '未知'}
            </Descriptions.Item>
            <Descriptions.Item label="模型名称">{config.embedding_config?.model || 'sentence-transformers/all-MiniLM-L6-v2'}</Descriptions.Item>
            <Descriptions.Item label="检索策略">
              {config.retrieval_config?.strategy === 'similarity' ? '相似度检索' : 
               config.retrieval_config?.strategy === 'mmr' ? 'MMR检索' : '通用'}
            </Descriptions.Item>
            <Descriptions.Item label="Top K">{config.retrieval_config?.top_k || 4}</Descriptions.Item>
            <Descriptions.Item label="相似度阈值">{config.retrieval_config?.similarity_threshold || 0.7}</Descriptions.Item>
          </Descriptions>
        </Panel>
      </Collapse>
    );
  };

  const renderSettingContent = () => {
    return (
      <div style={{ background: '#fff', borderRadius: 8, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ margin: 0 }}>知识库设置</h3>
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={handleSaveConfig}
            loading={saveLoading}
          >
            保存设置
          </Button>
        </div>
        <Form
          form={form}
          layout="vertical"
          initialValues={defaultParams}
        >
          <Collapse defaultActiveKey={['1', '2', '3']}>
            <Panel header="文本分割设置" key="1">
              <Form.Item name="text_splitter" label="分割方式">
                <Select>
                  <Select.Option value="recursive">递归分割</Select.Option>
                  <Select.Option value="character">字符分割</Select.Option>
                  <Select.Option value="token">Token分割</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="chunk_size" label="块大小">
                <InputNumber min={100} max={2000} style={{ width: 200 }} addonAfter="字符" />
              </Form.Item>
              <Form.Item name="chunk_overlap" label="重叠大小">
                <InputNumber min={0} max={200} style={{ width: 200 }} addonAfter="字符" />
              </Form.Item>
            </Panel>
            <Panel header="向量化设置" key="2">
              <Form.Item name="embedding_type" label="Embedding类型">
                <Select
                  onChange={val => {
                    const opts = EMBEDDING_MODEL_OPTIONS[val] || [];
                    form.setFieldsValue({ embedding_model: opts.length ? opts[0].value : undefined });
                  }}
                >
                  <Select.Option value="local">本地模型</Select.Option>
                  <Select.Option value="openai">OpenAI</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="embedding_model" label="Embedding模型">
                <Select>
                  {EMBEDDING_MODEL_OPTIONS[form.getFieldValue('embedding_type') || 'local']?.map(opt => (
                    <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Panel>
            <Panel header="检索设置" key="3">
              <Form.Item name="retrieval_strategy" label="检索策略">
                <Select>
                  <Select.Option value="similarity">相似度检索</Select.Option>
                  <Select.Option value="mmr">MMR检索</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="top_k" label="Top K">
                <InputNumber min={1} max={10} style={{ width: 200 }} />
              </Form.Item>
              <Form.Item name="similarity_threshold" label="相似度阈值">
                <InputNumber min={0} max={1} step={0.1} style={{ width: 200 }} />
              </Form.Item>
            </Panel>
          </Collapse>
        </Form>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: 600 }}>
      {/* 左侧卡片和菜单 */}
      <div style={{ width: 150, marginRight: 16 }}>
        <Button type="link" icon={<LeftOutlined />} onClick={() => navigate(-1)} style={{ paddingLeft: 0, marginBottom: 8, width: '100%' }}>
          返回
        </Button>
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
      {/* 右侧内容区 */}
      <div style={{ flex: 1, background: '#fff', borderRadius: 12, padding: 24 }}>
        {/* 顶部搜索框 */}
        {activeMenu === 'docs' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 16 }}>
            <Input
              placeholder="搜索"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: 260, marginRight: 16 }}
              allowClear
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/dashboard/knowledge/segment', { state: { kb } })}>添加文件</Button>
          </div>
        )}
        {activeMenu === 'docs' && (
          <>
            <div style={{ color: '#888', marginBottom: 8 }}>
              知识库的所有文件都在这里显示，整个知识库都可以链接到 Dify 引用或通过 Chat 插件进行索引。
              <a href="https://docs.dify.ai/docs/knowledge/intro" target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8 }}>了解更多</a>
            </div>
            <Table
              rowKey="id"
              columns={columns}
              dataSource={files}
              loading={fileLoading}
              pagination={false}
              style={{ background: '#fff', borderRadius: 8, marginTop: 16 }}
            />
          </>
        )}
        {activeMenu === 'setting' && renderSettingContent()}
        {/* 其他菜单内容可扩展 */}
      </div>
    </div>
  );
};

export default KnowledgeDetail; 