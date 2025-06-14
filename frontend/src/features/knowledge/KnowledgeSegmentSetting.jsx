import React, { useState } from 'react';
import { Button, Steps, Input, InputNumber, Checkbox, Select, Radio, Form, message, Spin } from 'antd';
import { LeftOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../../api';

const defaultParams = {
  chunk_size: 1024,
  chunk_overlap: 50,
  separators: ['\n\n'],
  parent_split_method: 'off',
  parent_separator: '',
  parent_chunk_size: 1024,
  parent_chunk_overlap: 50,
  child_separator: '',
  child_chunk_size: 512,
  child_chunk_overlap: 20,
  replace_whitespace: true,
  remove_url_email: false,
  embedding_model: 'text-embedding-3-large',
  index_mode: 'high',
};

const KnowledgeSegmentSetting = ({ onBack }) => {
  const location = useLocation();
  const file = location.state?.file;
  const [form] = Form.useForm();
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePreview = async () => {
    if (!file) {
      message.warning('请先上传文件');
      return;
    }
    try {
      const values = await form.validateFields();
      setLoading(true);
      // 假设file有id，实际应为后端已保存的文件id
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

  const parentMode = Form.useWatch('parent_split_method', form) === 'on';

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 24, minHeight: 520, width: '100%', maxWidth: '100%', margin: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <Button icon={<LeftOutlined />} type="text" onClick={onBack || (() => navigate(-1))} style={{ marginRight: 8 }} />
        <span style={{ fontWeight: 600, fontSize: 18 }}>新建知识库</span>
      </div>
      <Steps current={1} style={{ marginBottom: 32 }} items={[
        { title: '选择数据源' },
        { title: '文本分段与清洗' },
        { title: '处理并完成' },
      ]} />
      <Spin spinning={loading}>
        <div style={{ display: 'flex', gap: 32 }}>
          {/* 左侧分段设置 */}
          <div style={{ flex: 1, minWidth: 420 }}>
            <Form form={form} layout="vertical" initialValues={defaultParams}>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>分段设置</div>
              <div style={{ background: '#f7f8fa', borderRadius: 8, padding: 24, marginBottom: 24 }}>
                <div style={{ fontWeight: 500, marginBottom: 12 }}>通用</div>
                <Form.Item name="separators" label="分段标识符">
                  <Select mode="tags" style={{ width: 200 }} />
                </Form.Item>
                <Form.Item name="chunk_size" label="分段最大长度">
                  <InputNumber min={100} max={2000} style={{ width: 200 }} addonAfter="characters" />
                </Form.Item>
                <Form.Item name="chunk_overlap" label="分段重叠长度">
                  <InputNumber min={0} max={200} style={{ width: 200 }} addonAfter="characters" />
                </Form.Item>
                <Form.Item name="replace_whitespace" valuePropName="checked">
                  <Checkbox>替换掉连续的空格、换行符和制表符</Checkbox>
                </Form.Item>
                <Form.Item name="remove_url_email" valuePropName="checked">
                  <Checkbox>删除所有 URL 和电子邮件地址</Checkbox>
                </Form.Item>
                <Button icon={<EyeOutlined />} style={{ marginRight: 12 }} onClick={handlePreview}>预览块</Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
              </div>
              <div style={{ background: '#f7f8fa', borderRadius: 8, padding: 24, marginBottom: 24 }}>
                <div style={{ fontWeight: 500, marginBottom: 12 }}>父子分段</div>
                <Form.Item name="parent_split_method" label="父块分段方式">
                  <Radio.Group>
                    <Radio value="off">关闭</Radio>
                    <Radio value="on">开启</Radio>
                  </Radio.Group>
                </Form.Item>
                {parentMode && (
                  <>
                    <Form.Item name="parent_separator" label="父块分段标识符">
                      <Input style={{ width: 200 }} />
                    </Form.Item>
                    <Form.Item name="parent_chunk_size" label="父块分段最大长度">
                      <InputNumber min={50} max={2000} style={{ width: 120 }} />
                    </Form.Item>
                    <Form.Item name="parent_chunk_overlap" label="父块分段重叠">
                      <InputNumber min={0} max={200} />
                    </Form.Item>
                    <Form.Item name="child_separator" label="子块分段标识符">
                      <Input style={{ width: 200 }} />
                    </Form.Item>
                    <Form.Item name="child_chunk_size" label="子块分段最大长度">
                      <InputNumber min={50} max={2000} style={{ width: 120 }} />
                    </Form.Item>
                    <Form.Item name="child_chunk_overlap" label="子块分段重叠">
                      <InputNumber min={0} max={100} />
                    </Form.Item>
                  </>
                )}
                <div style={{ color: '#888', fontSize: 13, marginTop: 8 }}>使用父子模式时，子块用于检索，父块用于上下文</div>
              </div>
              <div style={{ background: '#f7f8fa', borderRadius: 8, padding: 24, marginBottom: 24 }}>
                <div style={{ fontWeight: 500, marginBottom: 12 }}>索引方式</div>
                <Form.Item name="index_mode" label="索引方式">
                  <Radio.Group>
                    <Radio value="high">高质量（推荐）</Radio>
                    <Radio value="eco">经济</Radio>
                  </Radio.Group>
                </Form.Item>
                <div style={{ color: '#888', fontSize: 13, marginTop: 8 }}>高质量模式下嵌入入库，无法切换回经济模式。</div>
              </div>
              <div style={{ background: '#f7f8fa', borderRadius: 8, padding: 24 }}>
                <div style={{ fontWeight: 500, marginBottom: 12 }}>Embedding 模型</div>
                <Form.Item name="embedding_model" label="Embedding模型">
                  <Select style={{ width: 260 }}>
                    <Select.Option value="text-embedding-3-large">text-embedding-3-large</Select.Option>
                    <Select.Option value="text-embedding-ada-002">text-embedding-ada-002</Select.Option>
                  </Select>
                </Form.Item>
              </div>
            </Form>
          </div>
          {/* 右侧文档预览 */}
          <div style={{ flex: 1, minWidth: 320, background: '#f7f8fa', borderRadius: 8, padding: 24, minHeight: 480 }}>
            <div style={{ fontWeight: 500, marginBottom: 16 }}>预览</div>
            {previewData ? (
              <div style={{ maxHeight: 400, overflow: 'auto' }}>
                {Array.isArray(previewData.chunks) && previewData.chunks.length > 0 ? (
                  previewData.chunks[0].children ? (
                    // 父子分段嵌套渲染
                    previewData.chunks.map(chunk => (
                      <div key={chunk.chunk_index} style={{ marginBottom: 16, border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
                        <b>Chunk-{chunk.chunk_index + 1} · {chunk.content.length} 字符</b>
                        <div style={{ margin: '8px 0', color: '#888', fontSize: 13 }}>{chunk.content}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {chunk.children && chunk.children.map(child => (
                            <span key={child.sub_index} style={{ background: '#f5f5f5', color: '#333', fontSize: 12, padding: '4px 8px', borderRadius: 6, marginBottom: 4, display: 'inline-block' }}>
                              <b>c-{child.sub_index + 1}</b> {child.content}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    // 通用分段平铺渲染
                    previewData.chunks.map(chunk => (
                      <div key={chunk.chunk_index} style={{ marginBottom: 16, border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
                        <b>Chunk-{chunk.chunk_index + 1} · {chunk.content.length} 字符</b>
                        <div style={{ color: '#333', fontSize: 13 }}>{chunk.content}</div>
                      </div>
                    ))
                  )
                ) : (
                  <div style={{ color: '#aaa', textAlign: 'center', marginTop: 120 }}>暂无分段预览</div>
                )}
              </div>
            ) : file ? (
              <div style={{ color: '#aaa', textAlign: 'center', marginTop: 120 }}>
                点击左侧的"预览块"按钮来加载预览
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