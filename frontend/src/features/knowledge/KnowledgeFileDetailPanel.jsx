import React, { useEffect, useState } from 'react';
import { Button, Table, Tag, Tooltip, Descriptions, Spin, Pagination, message } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import axios from '../../api';

const PAGE_SIZE = 10;

const KnowledgeFileDetailPanel = ({ file, onBack }) => {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchSegments(1);
    // eslint-disable-next-line
  }, [file]);

  const fetchSegments = async (pageNum) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/knowledgefiles/${file.id}/segments/`, { params: { page: pageNum, page_size: PAGE_SIZE } });
      setSegments(res.data.results || res.data);
      setTotal(res.data.count || (res.data.results ? res.data.results.length : 0));
      setPage(pageNum);
    } catch {
      message.error('获取分段内容失败');
    }
    setLoading(false);
  };

  const columns = [
    { title: '分段号', dataIndex: 'index', key: 'index', width: 80, render: (_, __, i) => (page - 1) * PAGE_SIZE + i + 1 },
    { title: '内容', dataIndex: 'content', key: 'content', render: text => <Tooltip title={text}><div style={{ maxWidth: 420, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</div></Tooltip> },
    { title: '标签', dataIndex: 'tags', key: 'tags', render: tags => tags ? tags.map(t => <Tag key={t}>{t}</Tag>) : '-' },
    { title: '启用', dataIndex: 'enabled', key: 'enabled', render: v => v ? <Tag color="green">已启用</Tag> : <Tag>未启用</Tag> },
    { title: '操作', key: 'action', render: () => <Button size="small" type="link">···</Button> },
  ];

  return (
    <div style={{ display: 'flex', gap: 32, minHeight: 520 }}>
      {/* 左侧分段内容列表 */}
      <div style={{ flex: 2, minWidth: 480 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <Button icon={<LeftOutlined />} type="text" onClick={onBack} style={{ marginRight: 8 }} />
          <span style={{ fontWeight: 600, fontSize: 18 }}>{file.filename || file.name}</span>
        </div>
        <Spin spinning={loading}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={segments}
            pagination={false}
            size="middle"
            style={{ background: '#fff', borderRadius: 8 }}
          />
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Pagination
              current={page}
              pageSize={PAGE_SIZE}
              total={total}
              onChange={fetchSegments}
              showSizeChanger={false}
            />
          </div>
        </Spin>
      </div>
      {/* 右侧文档元数据和技术参数 */}
      <div style={{ flex: 0.66, minWidth: 220 }}>
        <Descriptions column={1} bordered size="small" title="文档信息" style={{ marginBottom: 24 }}>
          <Descriptions.Item label="原始文件名">{file.filename || '-'}</Descriptions.Item>
          <Descriptions.Item label="文件大小">{file.size ? (file.size / 1024).toFixed(2) + ' KB' : '-'}</Descriptions.Item>
          <Descriptions.Item label="上传日期">{file.created ? file.created.slice(0, 19).replace('T', ' ') : '-'}</Descriptions.Item>
          <Descriptions.Item label="分段规则">{file.segment_mode || '自定义'}</Descriptions.Item>
          <Descriptions.Item label="段落数">{file.segment_count || '-'}</Descriptions.Item>
          <Descriptions.Item label="平均段落长度">{file.avg_segment_length || '-'}</Descriptions.Item>
        </Descriptions>
        <Descriptions column={1} bordered size="small" title="技术参数">
          <Descriptions.Item label="召回次数">{file.recall_count || 0}</Descriptions.Item>
          <Descriptions.Item label="嵌入用时">{file.embedding_time ? file.embedding_time + ' sec' : '-'}</Descriptions.Item>
          <Descriptions.Item label="嵌入花费">{file.embedding_tokens ? file.embedding_tokens + ' tokens' : '-'}</Descriptions.Item>
        </Descriptions>
      </div>
    </div>
  );
};

export default KnowledgeFileDetailPanel; 