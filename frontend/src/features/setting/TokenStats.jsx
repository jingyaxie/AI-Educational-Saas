import React, { useEffect, useState } from 'react';
import { Table, Tag, Input, Space, Button } from 'antd';
import axios from '../../api';

const TokenStats = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // 获取token消耗明细
  const fetchData = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const res = await axios.get('/api/tokenusages/', {
        params: { page, page_size: pageSize }
      });
      setData(res.data.results || res.data);
      setPagination({
        current: page,
        pageSize,
        total: res.data.count || (res.data.results ? res.data.results.length : 0)
      });
    } catch (err) {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTableChange = (pagination) => {
    fetchData(pagination.current, pagination.pageSize);
  };

  const columns = [
    {
      title: '用户',
      dataIndex: 'username',
      key: 'username',
      render: (text) => <b>{text}</b>,
    },
    {
      title: '智能体',
      dataIndex: 'agent_name',
      key: 'agent_name',
      render: (text) => text || '-',
    },
    {
      title: 'API-key',
      dataIndex: 'apikey',
      key: 'apikey',
      render: (text) => <span style={{ fontFamily: 'monospace' }}>{text?.slice(0, 8) + '...'} </span>,
    },
    {
      title: 'token消耗',
      dataIndex: 'tokens',
      key: 'tokens',
      render: (num) => <Tag color="blue">{num}</Tag>,
    },
    {
      title: '调用时间',
      dataIndex: 'created',
      key: 'created',
      render: (date) => date ? new Date(date).toLocaleString() : '-',
    },
    {
      title: '请求摘要',
      dataIndex: 'prompt',
      key: 'prompt',
      render: (text) => <span title={text}>{text?.slice(0, 40) || '-'}</span>,
    },
  ];

  return (
    <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #e5e5e5', padding: 32, width: '100%', minHeight: 500 }}>
      <h2 style={{ color: '#3b6ed6', marginBottom: 24 }}>Token消耗明细</h2>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default TokenStats; 