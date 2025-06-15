import React from 'react';
import { Button, Result, Card, Descriptions, Tag, message } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';

const KnowledgeCreated = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const file = location.state?.file;
  const result = location.state?.result;

  // 处理无 file 的情况
  if (!file) {
    message.error('未找到知识库信息');
    navigate('/dashboard/knowledge');
    return null;
  }

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 32, minHeight: 520, width: '100%', maxWidth: '100%', margin: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <Button icon={<LeftOutlined />} type="text" onClick={() => navigate(-1)} style={{ marginRight: 8 }} />
        <span style={{ fontWeight: 600, fontSize: 18 }}>🎉 知识库已创建</span>
      </div>
      <div style={{ display: 'flex', gap: 32 }}>
        {/* 左侧主要信息 */}
        <div style={{ flex: 1, minWidth: 420 }}>
          <Card bordered={false} style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 8 }}>{file.name || '知识库'}</div>
            <div style={{ color: '#888', marginBottom: 16 }}>我们已自动为该知识库起了个名称，您也可以随时修改</div>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="分段模式">{result?.split_mode || '自定义'}</Descriptions.Item>
              <Descriptions.Item label="最大分段长度">{result?.chunk_size || 1024}</Descriptions.Item>
              <Descriptions.Item label="文本预处理规则">{result?.preprocess_rule || '替换掉连续的空格、换行符和制表符'}</Descriptions.Item>
              <Descriptions.Item label="索引方式">{result?.index_mode === 'eco' ? '经济' : '高质量'}</Descriptions.Item>
              <Descriptions.Item label="检索设置">{result?.retrieval || '向量检索'}</Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 24 }}>
              <Button type="primary" onClick={() => navigate(`/dashboard/knowledge/${file.kb || file.kb_id}`)}>前往文档</Button>
            </div>
          </Card>
        </div>
        {/* 右侧说明 */}
        <div style={{ flex: 1, minWidth: 320, background: '#f7f8fa', borderRadius: 8, padding: 24, minHeight: 480 }}>
          <div style={{ fontWeight: 500, marginBottom: 16 }}>接下来做什么</div>
          <div style={{ color: '#555', fontSize: 15, marginBottom: 16 }}>
            当文档完成索引处理后，知识库即可集成至应用内作为上下文使用。你可以在提示词编辑和插件中找到上下文设置。你也可以创建成可独立使用的 ChatGPT 索引插件发布。
          </div>
          <Button type="default" onClick={() => navigate(`/dashboard/knowledge/${file.kb || file.kb_id}`)}>返回知识库首页</Button>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeCreated; 