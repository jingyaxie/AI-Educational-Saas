import React from 'react';
import { Form, Input, InputNumber, Select, Radio, List, Card, Tag } from 'antd';
import axios from '../api';
import { message } from 'antd';

const KnowledgeSegmentSetting = ({ fileId, previewData = [], mode = 'general', setPreviewData }) => {
  const [form] = Form.useForm();

  // 自动模式兼容的预览方法
  const handlePreview = async () => {
    try {
      const values = await form.validateFields();
      let params = {};
      if (mode === 'parent_child') {
        params = {
          parent_separator: values.parent_separator,
          parent_chunk_size: values.parent_chunk_size,
          child_separator: values.child_separator,
          child_chunk_size: values.child_chunk_size,
          // 可扩展其它父子参数
        };
      } else {
        params = {
          chunk_size: values.chunk_size,
          chunk_overlap: values.chunk_overlap,
          separators: values.separators,
        };
      }
      const res = await axios.post(`/api/knowledgebases/files/${fileId}/preview/`, params);
      setPreviewData(res.data);
    } catch (e) {
      message.error('分段预览失败');
    }
  };

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          chunk_size: 500,
          chunk_overlap: 50,
          separators: ['\n\n', '\n', '。', '！', '？'],
          parent_split_method: 'paragraph',
          parent_separator: '',
          parent_chunk_size: 102,
          parent_chunk_overlap: 50,
          child_separator: '',
          child_chunk_size: 512,
          child_chunk_overlap: 20,
        }}
      >
        <Form.Item label="分段大小" name="chunk_size">
          <InputNumber min={100} max={2000} />
        </Form.Item>
        <Form.Item label="分段重叠" name="chunk_overlap">
          <InputNumber min={0} max={200} />
        </Form.Item>
        <Form.Item label="分隔符" name="separators">
          <Select mode="tags" />
        </Form.Item>
        <Form.Item label="父块分段方式" name="parent_split_method">
          <Radio.Group>
            <Radio value="paragraph">按段落</Radio>
            <Radio value="full">全文</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="父块分段标识符" name="parent_separator">
          <Input style={{ width: 200 }} />
        </Form.Item>
        <Form.Item label="父块分段最大长度" name="parent_chunk_size">
          <InputNumber min={50} max={2000} style={{ width: 120 }} />
        </Form.Item>
        <Form.Item label="父块分段重叠" name="parent_chunk_overlap">
          <InputNumber min={0} max={200} />
        </Form.Item>
        <Form.Item label="子块分段标识符" name="child_separator">
          <Input style={{ width: 200 }} />
        </Form.Item>
        <Form.Item label="子块分段最大长度" name="child_chunk_size">
          <InputNumber min={50} max={2000} style={{ width: 120 }} />
        </Form.Item>
        <Form.Item label="子块分段重叠" name="child_chunk_overlap">
          <InputNumber min={0} max={100} />
        </Form.Item>
      </Form>

      <div style={{ margin: '0 16px' }}>
        {Array.isArray(previewData?.chunks) && previewData.chunks.length > 0 ? (
          previewData.chunks[0].children ? (
            // 父子分段嵌套渲染
            previewData.chunks.map(chunk => (
              <Card
                key={chunk.chunk_index}
                title={`Chunk-${chunk.chunk_index + 1} · ${chunk.content.length} characters`}
                style={{ marginBottom: 16 }}
              >
                <div style={{ marginBottom: 8, color: '#888', fontSize: 13 }}>
                  {chunk.content}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {chunk.children && chunk.children.map(child => (
                    <Tag key={child.sub_index} color="#f5f5f5" style={{ color: '#333', fontSize: 12, padding: '4px 8px', borderRadius: 6, marginBottom: 4 }}>
                      <b>c-{child.sub_index + 1}</b> {child.content}
                    </Tag>
                  ))}
                </div>
              </Card>
            ))
          ) : (
            // 通用分段平铺渲染
            previewData.chunks.map(chunk => (
              <Card
                key={chunk.chunk_index}
                title={`Chunk-${chunk.chunk_index + 1} · ${chunk.content.length} characters`}
                style={{ marginBottom: 16 }}
              >
                <div style={{ color: '#333', fontSize: 13 }}>{chunk.content}</div>
              </Card>
            ))
          )
        ) : (
          <div style={{ color: '#aaa', textAlign: 'center', margin: '32px 0' }}>暂无分段预览</div>
        )}
      </div>
    </>
  );
};

export default KnowledgeSegmentSetting; 