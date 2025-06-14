import React, { useState } from 'react';
import { Button, Steps, Upload } from 'antd';
import { PlusOutlined, InboxOutlined, LeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Dragger } = Upload;

const KnowledgeDataSource = ({ onBack }) => {
  const [fileList, setFileList] = useState([]);
  const navigate = useNavigate();

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
        <Dragger
          beforeUpload={file => { setFileList([file]); return false; }}
          fileList={fileList}
          accept={['.txt', '.md', '.pdf', '.doc', '.docx', '.xlsx', '.xls', '.csv'].join(',')}
          maxCount={1}
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