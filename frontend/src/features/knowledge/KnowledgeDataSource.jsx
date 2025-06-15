import React, { useState, useEffect } from 'react';
import { Button, Steps, Upload, message, Select, Form } from 'antd';
import { PlusOutlined, InboxOutlined, LeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from '../../api';

const { Dragger } = Upload;
const { Option } = Select;

const KnowledgeDataSource = ({ onBack }) => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [knowledgeBases, setKnowledgeBases] = useState([]);
  const [selectedKb, setSelectedKb] = useState(null);
  const navigate = useNavigate();

  // 获取知识库列表
  useEffect(() => {
    const fetchKnowledgeBases = async () => {
      try {
        const res = await axios.get('/api/knowledgebases/');
        setKnowledgeBases(res.data.results || res.data);
        if (res.data.results?.length > 0 || res.data.length > 0) {
          setSelectedKb(res.data.results?.[0]?.id || res.data[0].id);
        }
      } catch (err) {
        console.error('获取知识库列表失败:', err);
        message.error('获取知识库列表失败');
      }
    };
    fetchKnowledgeBases();
  }, []);

  const handleUpload = (options) => {
    const { file, onSuccess, onError } = options;
    
    if (!selectedKb) {
      message.error('请先选择知识库');
      onError(new Error('请先选择知识库'));
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', file.name);
    formData.append('kb_id', selectedKb);

    console.log('上传数据:', {
      file: file.name,
      filename: file.name,
      kb_id: selectedKb
    });

    axios.post('/api/knowledgefiles/upload/', formData)
      .then(res => {
        message.success('上传成功');
        onSuccess(res.data, file);
        navigate('/dashboard/knowledge/segment', { state: { file: res.data } });
      })
      .catch(err => {
        console.error('上传失败:', err);
        console.error('错误详情:', err.response?.data);
        message.error(err.response?.data?.detail || err.response?.data?.error || '上传失败');
        onError(err);
      });
  };

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 24, minHeight: 520, width: '100%', maxWidth: '100%', margin: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <Button icon={<LeftOutlined />} type="text" onClick={onBack || (() => navigate('/dashboard/knowledge'))} style={{ marginRight: 8 }} />
        <span style={{ fontWeight: 600, fontSize: 18 }}>新建知识库</span>
      </div>
      <Steps current={0} style={{ marginBottom: 32 }} items={[
        { title: '选择数据源' },
        { title: '文本分段与清洗' },
        { title: '处理并完成' },
      ]} />
      <div style={{ marginBottom: 32 }}>
        <Button type="primary" icon={<PlusOutlined />} style={{ marginRight: 16 }}>导入已有文本</Button>
        <Button disabled style={{ marginRight: 16 }}>同步自 Notion 内容</Button>
        <Button disabled>同步自 Web 站点</Button>
      </div>
      <div style={{ marginBottom: 32 }}>
        <Form layout="vertical">
          <Form.Item label="选择知识库" required>
            <Select
              value={selectedKb}
              onChange={setSelectedKb}
              placeholder="请选择知识库"
              style={{ width: '100%', marginBottom: 16 }}
            >
              {knowledgeBases.map(kb => (
                <Option key={kb.id} value={kb.id}>{kb.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
        <Dragger
          customRequest={handleUpload}
          fileList={fileList}
          accept={['.txt', '.md', '.pdf', '.doc', '.docx', '.xlsx', '.xls', '.csv', '.markdown', '.mdx', '.html', '.htm', '.vtt', '.properties', '.eml', '.msg', '.pptx', '.xml', '.epub', '.ppt'].join(',')}
          maxCount={1}
          showUploadList={false}
          disabled={uploading || !selectedKb}
        >
          <p className="ant-upload-drag-icon"><InboxOutlined /></p>
          <p className="ant-upload-text">拖拽文件或文件夹至此，或者 <span style={{ color: '#3b82f6' }}>选择文件</span></p>
          <p className="ant-upload-hint" style={{ color: '#888' }}>
            已支持 TXT、MARKDOWN、MDX、PDF、HTML、XLSX、XLS、VTT、PROPERTIES、DOC、DOCX、CSV、EML、MSG、PPTX、XML、EPUB、PPT、MD、HTM，每个文件不超过 15MB。
          </p>
        </Dragger>
      </div>
      <Button type="primary" style={{ width: 160 }} disabled={!fileList.length} onClick={() => navigate('/dashboard/knowledge/segment', { state: { file: fileList[0] } })}>下一步</Button>
      <div style={{ marginTop: 32 }}>
        <Button type="link" style={{ padding: 0 }}>创建一个空知识库</Button>
      </div>
    </div>
  );
};

export default KnowledgeDataSource; 