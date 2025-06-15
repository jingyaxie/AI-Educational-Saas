import React, { useState } from 'react';
import { Button, Steps, Input, InputNumber, Checkbox, Select, Radio, Form, message, Spin, Tabs, Collapse, Space, Tooltip } from 'antd';
import { LeftOutlined, EyeOutlined, ReloadOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../../api';

const { TabPane } = Tabs;
const { Panel } = Collapse;

const defaultParams = {
  // 文档加载设置
  loader_type: 'text',
  encoding: 'utf-8',
  
  // 文本分割设置
  text_splitter: 'recursive',
  chunk_size: 1000,
  chunk_overlap: 200,
  separators: ['\n\n', '\n', '。', '！', '？', '.', '!', '?'],
  
  // 文本清洗设置
  clean_text: true,
  remove_urls: true,
  remove_emails: true,
  remove_extra_whitespace: true,
  remove_special_chars: false,
  
  // 向量化设置
  embedding_model: 'text-embedding-3-large',
  embedding_dimension: 1536,
  
  // 向量存储设置
  vector_store: 'chroma',
  similarity_metric: 'cosine',
  
  // 检索设置
  retrieval_strategy: 'similarity',
  top_k: 4,
  similarity_threshold: 0.7,
  
  // 高级设置
  use_metadata: true,
  metadata_fields: ['source', 'page', 'chunk'],
  use_parent_document: false,
  parent_chunk_size: 2000,
  parent_chunk_overlap: 400,
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

const KnowledgeSegmentSetting = ({ onBack }) => {
  const location = useLocation();
  const file = location.state?.file;
  const kb = location.state?.kb;
  const [form] = Form.useForm();
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 优先用知识库 embedding_config 作为初始值
  const initialValues = kb?.embedding_config ? {
    ...defaultParams,
    ...kb.embedding_config.loader_config,
    ...kb.embedding_config.clean_config,
    ...kb.embedding_config.splitter_config,
    ...kb.embedding_config.embedding_config,
    ...kb.embedding_config.vector_store_config,
    ...kb.embedding_config.retrieval_config,
    ...kb.embedding_config.metadata_config,
  } : defaultParams;

  const embeddingType = Form.useWatch ? Form.useWatch('embedding_type', form) : form.getFieldValue('embedding_type');
  const embeddingModelOptions = EMBEDDING_MODEL_OPTIONS[embeddingType] || [];

  const handlePreview = async () => {
    if (!file) {
      message.warning('请先上传文件');
      return;
    }
    try {
      const values = await form.validateFields();
      setLoading(true);
      const fileId = file.id || 1;
      const res = await axios.post(`/api/knowledgebases/files/${fileId}/preview/`, values);
      setPreviewData(res.data);
    } catch (e) {
      message.error('分段预览失败');
    }
    setLoading(false);
  };

  const handleReset = () => {
    form.setFieldsValue(defaultParams);
    setPreviewData(null);
  };

  const handleSaveAndProcess = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const fileId = file.id || 1;
      
      // 按照后端期望的格式组织数据
      const requestData = {
        loader_config: {
          encoding: values.encoding || 'utf-8'
        },
        clean_config: {
          clean_text: values.clean_text,
          remove_urls: values.remove_urls,
          remove_emails: values.remove_emails,
          remove_extra_whitespace: values.remove_extra_whitespace,
          remove_special_chars: values.remove_special_chars
        },
        splitter_config: {
          text_splitter: values.text_splitter,
          chunk_size: values.chunk_size,
          chunk_overlap: values.chunk_overlap,
          separators: values.separators
        },
        embedding_config: {
          model: values.embedding_model
        },
        vector_store_config: {
          type: values.vector_store
        },
        retrieval_config: {
          strategy: values.retrieval_strategy,
          top_k: values.top_k,
          similarity_threshold: values.similarity_threshold
        },
        metadata_config: {
          fields: values.metadata_fields
        }
      };

      const res = await axios.post(`/api/knowledgebases/files/${fileId}/process/`, requestData);
      navigate('/dashboard/knowledge/created', { state: { file, result: res.data } });
    } catch (e) {
      console.error('处理失败:', e);
      message.error(e.response?.data?.error || '保存并处理失败');
    }
    setLoading(false);
  };

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 24, minHeight: 520, width: '100%', maxWidth: '100%', margin: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <Button icon={<LeftOutlined />} type="text" onClick={onBack || (() => navigate(-1))} style={{ marginRight: 8 }} />
        <span style={{ fontWeight: 600, fontSize: 18 }}>知识库设置</span>
      </div>
      
      <Steps current={1} style={{ marginBottom: 32 }} items={[
        { title: '选择数据源' },
        { title: '配置处理参数' },
        { title: '完成创建' },
      ]} />

      <Spin spinning={loading}>
        <div style={{ display: 'flex', gap: 32 }}>
          {/* 左侧设置面板 */}
          <div style={{ flex: 1, minWidth: 420 }}>
            <Form form={form} layout="vertical" initialValues={initialValues}>
              <Tabs defaultActiveKey="1">
                <TabPane tab="基础设置" key="1">
                  <Collapse defaultActiveKey={['1', '2']}>
                    <Panel header="文档加载设置" key="1">
                      <Form.Item name="loader_type" label="文档类型">
                        <Select>
                          <Select.Option value="text">文本文件</Select.Option>
                          <Select.Option value="pdf">PDF文件</Select.Option>
                          <Select.Option value="docx">Word文件</Select.Option>
                          <Select.Option value="markdown">Markdown文件</Select.Option>
                        </Select>
                      </Form.Item>
                      <Form.Item name="encoding" label="文件编码">
                        <Select>
                          <Select.Option value="utf-8">UTF-8</Select.Option>
                          <Select.Option value="gbk">GBK</Select.Option>
                          <Select.Option value="gb2312">GB2312</Select.Option>
                        </Select>
                      </Form.Item>
                    </Panel>

                    <Panel header="文本分割设置" key="2">
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
                      <Form.Item name="separators" label="分割符">
                        <Select mode="tags" style={{ width: '100%' }} />
                      </Form.Item>
                    </Panel>

                    <Panel header="文本清洗设置" key="3">
                      <Form.Item name="clean_text" valuePropName="checked">
                        <Checkbox>启用文本清洗</Checkbox>
                      </Form.Item>
                      <Form.Item name="remove_urls" valuePropName="checked">
                        <Checkbox>移除URL</Checkbox>
                      </Form.Item>
                      <Form.Item name="remove_emails" valuePropName="checked">
                        <Checkbox>移除邮箱</Checkbox>
                      </Form.Item>
                      <Form.Item name="remove_extra_whitespace" valuePropName="checked">
                        <Checkbox>移除多余空白字符</Checkbox>
                      </Form.Item>
                      <Form.Item name="remove_special_chars" valuePropName="checked">
                        <Checkbox>移除特殊字符</Checkbox>
                      </Form.Item>
                    </Panel>
                  </Collapse>
                </TabPane>

                <TabPane tab="高级设置" key="2">
                  <Collapse defaultActiveKey={['1']}>
                    <Panel header="向量化设置" key="1">
                      <Form.Item name="embedding_type" label="Embedding类型" initialValue="local">
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
                      <Form.Item name="embedding_model" label="Embedding模型" rules={[{ required: true, message: '请选择Embedding模型' }]}>
                        <Select placeholder="请选择Embedding模型">
                          {embeddingModelOptions.map(opt => (
                            <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item name="embedding_dimension" label="向量维度">
                        <InputNumber disabled style={{ width: 200 }} />
                      </Form.Item>
                    </Panel>

                    <Panel header="向量存储设置" key="2">
                      <Form.Item name="vector_store" label="存储类型">
                        <Select>
                          <Select.Option value="chroma">Chroma</Select.Option>
                          <Select.Option value="faiss">FAISS</Select.Option>
                          <Select.Option value="pinecone">Pinecone</Select.Option>
                        </Select>
                      </Form.Item>
                      <Form.Item name="similarity_metric" label="相似度计算方式">
                        <Select>
                          <Select.Option value="cosine">余弦相似度</Select.Option>
                          <Select.Option value="euclidean">欧氏距离</Select.Option>
                          <Select.Option value="dot">点积</Select.Option>
                        </Select>
                      </Form.Item>
                    </Panel>

                    <Panel header="检索设置" key="3">
                      <Form.Item name="retrieval_strategy" label="检索策略">
                        <Select>
                          <Select.Option value="similarity">相似度检索</Select.Option>
                          <Select.Option value="mmr">MMR多样性检索</Select.Option>
                        </Select>
                      </Form.Item>
                      <Form.Item name="top_k" label="返回结果数量">
                        <InputNumber min={1} max={10} style={{ width: 200 }} />
                      </Form.Item>
                      <Form.Item name="similarity_threshold" label="相似度阈值">
                        <InputNumber min={0} max={1} step={0.1} style={{ width: 200 }} />
                      </Form.Item>
                    </Panel>

                    <Panel header="元数据设置" key="4">
                      <Form.Item name="use_metadata" valuePropName="checked">
                        <Checkbox>启用元数据</Checkbox>
                      </Form.Item>
                      <Form.Item name="metadata_fields" label="元数据字段">
                        <Select mode="multiple">
                          <Select.Option value="source">来源</Select.Option>
                          <Select.Option value="page">页码</Select.Option>
                          <Select.Option value="chunk">块索引</Select.Option>
                          <Select.Option value="timestamp">时间戳</Select.Option>
                        </Select>
                      </Form.Item>
                    </Panel>
                  </Collapse>
                </TabPane>
              </Tabs>

              <div style={{ marginTop: 24, textAlign: 'center' }}>
                <Space>
                  <Button type="primary" icon={<EyeOutlined />} onClick={handlePreview}>
                    预览效果
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={handleReset}>
                    重置设置
                  </Button>
                  <Button type="primary" onClick={handleSaveAndProcess}>
                    保存并处理
                  </Button>
                </Space>
              </div>
            </Form>
          </div>

          {/* 右侧预览面板 */}
          <div style={{ flex: 1, minWidth: 320, background: '#f7f8fa', borderRadius: 8, padding: 24, minHeight: 480 }}>
            <div style={{ fontWeight: 500, marginBottom: 16 }}>预览效果</div>
            {previewData ? (
              <div style={{ maxHeight: 400, overflow: 'auto' }}>
                {Array.isArray(previewData.chunks) && previewData.chunks.length > 0 ? (
                  previewData.chunks.map((chunk, index) => (
                    <div key={index} style={{ marginBottom: 16, border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <b>块 {index + 1}</b>
                        <span style={{ color: '#888' }}>{chunk.content.length} 字符</span>
                      </div>
                      <div style={{ color: '#333', fontSize: 13, whiteSpace: 'pre-wrap' }}>{chunk.content}</div>
                      {chunk.metadata && (
                        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                          {Object.entries(chunk.metadata).map(([key, value]) => (
                            <span key={key} style={{ marginRight: 12 }}>
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ color: '#aaa', textAlign: 'center', marginTop: 120 }}>暂无分段预览</div>
                )}
              </div>
            ) : file ? (
              <div style={{ color: '#aaa', textAlign: 'center', marginTop: 120 }}>
                点击"预览效果"按钮查看分段结果
              </div>
            ) : (
              <div style={{ color: '#aaa', textAlign: 'center', marginTop: 120 }}>
                请先上传文件
              </div>
            )}
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default KnowledgeSegmentSetting; 