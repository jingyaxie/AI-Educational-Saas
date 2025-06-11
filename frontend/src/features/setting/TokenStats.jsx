import React, { useEffect, useState } from 'react';
import { Table, Tag, Input, Space, Button, Card, Row, Col, Statistic, DatePicker, message } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import axios from '../../api';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const TokenStats = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    yesterday: 0,
    week: 0,
    month: 0
  });
  const [dateRange, setDateRange] = useState([dayjs().subtract(7, 'day'), dayjs()]);

  // 获取token消耗明细
  const fetchData = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const params = {
        page,
        page_size: pageSize,
        start_date: dateRange[0].format('YYYY-MM-DD'),
        end_date: dateRange[1].format('YYYY-MM-DD')
      };
      console.log('获取token消耗明细，参数:', params);
      const res = await axios.get('/api/tokenusages/', { params });
      console.log('获取token消耗明细，响应:', res.data);
      setData(res.data.results || res.data);
      setPagination({
        current: page,
        pageSize,
        total: res.data.count || (res.data.results ? res.data.results.length : 0)
      });
    } catch (err) {
      console.error('获取token消耗明细失败:', err.response?.data || err);
      setData([]);
      message.error('获取token消耗明细失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取统计数据
  const fetchStats = async () => {
    try {
      console.log('获取token统计数据');
      const res = await axios.get('/api/tokenusages/stats/');
      console.log('获取token统计数据，响应:', res.data);
      setStats(res.data);
    } catch (err) {
      console.error('获取token统计数据失败:', err.response?.data || err);
      message.error('获取token统计数据失败');
    }
  };

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [dateRange]);

  const handleTableChange = (pagination) => {
    fetchData(pagination.current, pagination.pageSize);
  };

  const handleDateRangeChange = (dates) => {
    if (dates) {
      setDateRange(dates);
    }
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
      render: (num) => <Tag color="blue">{num.toLocaleString()}</Tag>,
      sorter: (a, b) => a.tokens - b.tokens,
    },
    {
      title: '调用时间',
      dataIndex: 'created',
      key: 'created',
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '-',
      sorter: (a, b) => dayjs(a.created).unix() - dayjs(b.created).unix(),
    },
    {
      title: '请求摘要',
      dataIndex: 'prompt',
      key: 'prompt',
      render: (text) => <span title={text}>{text?.slice(0, 40) || '-'}</span>,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Row gutter={16}>
              <Col span={4}>
                <Statistic
                  title="总消耗"
                  value={stats.total}
                  suffix="tokens"
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<ArrowUpOutlined />}
                />
              </Col>
              <Col span={4}>
                <Statistic
                  title="今日消耗"
                  value={stats.today}
                  suffix="tokens"
                  valueStyle={{ color: '#cf1322' }}
                  prefix={<ArrowUpOutlined />}
                />
              </Col>
              <Col span={4}>
                <Statistic
                  title="昨日消耗"
                  value={stats.yesterday}
                  suffix="tokens"
                  valueStyle={{ color: '#cf1322' }}
                  prefix={<ArrowDownOutlined />}
                />
              </Col>
              <Col span={4}>
                <Statistic
                  title="本周消耗"
                  value={stats.week}
                  suffix="tokens"
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<ArrowUpOutlined />}
                />
              </Col>
              <Col span={4}>
                <Statistic
                  title="本月消耗"
                  value={stats.month}
                  suffix="tokens"
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<ArrowUpOutlined />}
                />
              </Col>
              <Col span={4}>
                <div style={{ marginTop: 32 }}>
                  <RangePicker
                    value={dateRange}
                    onChange={handleDateRangeChange}
                    style={{ width: '100%' }}
                  />
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={24}>
          <Card title="Token消耗明细" style={{ marginTop: 16 }}>
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
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TokenStats; 