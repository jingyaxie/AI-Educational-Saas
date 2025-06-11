import React, { useEffect, useState } from 'react';
import { Table, Tag, Input, Space, Button, Card, Row, Col, Statistic, DatePicker, message, Select } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, SearchOutlined } from '@ant-design/icons';
import axios from '../../api';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

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
  const [agents, setAgents] = useState([]);
  const [modelApis, setModelApis] = useState([]);
  const [filters, setFilters] = useState({
    agent: undefined,
    apikey: undefined,
    search: '',
    username: ''
  });

  // 获取智能体列表
  const fetchAgents = async () => {
    try {
      const res = await axios.get('/api/agents/');
      setAgents(res.data);
    } catch (err) {
      console.error('[TokenStats] 获取智能体列表失败:', err);
    }
  };

  // 获取API列表
  const fetchModelApis = async () => {
    try {
      const res = await axios.get('/api/modelapis/');
      setModelApis(res.data);
    } catch (err) {
      console.error('[TokenStats] 获取API列表失败:', err);
    }
  };

  useEffect(() => {
    fetchAgents();
    fetchModelApis();
  }, []);

  // 获取token消耗明细
  const fetchData = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const params = {
        page,
        page_size: pageSize,
        start_date: dateRange[0].format('YYYY-MM-DD'),
        end_date: dateRange[1].format('YYYY-MM-DD'),
        ...filters
      };
      console.log('[TokenStats] 开始获取token消耗明细');
      console.log('[TokenStats] 请求参数:', params);
      console.log('[TokenStats] 认证信息:', axios.defaults.headers.common);
      
      const res = await axios.get('/api/tokenusages/', { params });
      
      console.log('[TokenStats] 获取token消耗明细成功');
      console.log('[TokenStats] 响应状态:', res.status);
      console.log('[TokenStats] 响应数据:', res.data);
      console.log('[TokenStats] 响应头:', res.headers);
      
      setData(res.data.results || res.data);
      setPagination({
        current: page,
        pageSize,
        total: res.data.count || (res.data.results ? res.data.results.length : 0)
      });
    } catch (err) {
      console.error('[TokenStats] 获取token消耗明细失败');
      console.error('[TokenStats] 错误详情:', err);
      console.error('[TokenStats] 错误响应:', err.response?.data);
      console.error('[TokenStats] 错误状态:', err.response?.status);
      console.error('[TokenStats] 错误头:', err.response?.headers);
      setData([]);
      message.error('获取token消耗明细失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取统计数据
  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/tokenusages/stats/');
      setStats(res.data);
    } catch (err) {
      console.error('[TokenStats] 获取统计数据失败:', err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [dateRange, filters]);

  const handleTableChange = (pagination) => {
    fetchData(pagination.current, pagination.pageSize);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = (value, type) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120,
      render: (text) => <b>{text}</b>,
    },
    {
      title: '智能体',
      dataIndex: 'agent_name',
      key: 'agent_name',
      width: 150,
    },
    {
      title: 'API-key',
      dataIndex: 'apikey',
      key: 'apikey',
      width: 200,
      render: (text) => text ? `${text.slice(0, 8)}...` : '-',
    },
    {
      title: '消耗token数',
      dataIndex: 'tokens',
      key: 'tokens',
      width: 120,
      sorter: (a, b) => a.tokens - b.tokens,
    },
    {
      title: '调用时间',
      dataIndex: 'created',
      key: 'created',
      width: 180,
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
      sorter: (a, b) => dayjs(a.created).unix() - dayjs(b.created).unix(),
    },
    {
      title: '请求内容摘要',
      dataIndex: 'prompt',
      key: 'prompt',
      ellipsis: true,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card>
            <Space size="large" style={{ width: '100%', justifyContent: 'space-between' }}>
              <Space>
                <RangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  style={{ width: 300 }}
                />
                <Select
                  placeholder="选择智能体"
                  style={{ width: 200 }}
                  allowClear
                  value={filters.agent}
                  onChange={(value) => handleFilterChange('agent', value)}
                >
                  {agents.map(agent => (
                    <Option key={agent.id} value={agent.id}>{agent.name}</Option>
                  ))}
                </Select>
                <Select
                  placeholder="选择API"
                  style={{ width: 200 }}
                  allowClear
                  value={filters.apikey}
                  onChange={(value) => handleFilterChange('apikey', value)}
                >
                  {modelApis.map(api => (
                    <Option key={api.id} value={api.apikey}>{api.model_display}</Option>
                  ))}
                </Select>
                <Input.Search
                  placeholder="搜索用户名"
                  style={{ width: 200 }}
                  onSearch={(value) => handleSearch(value, 'username')}
                  allowClear
                />
                <Input.Search
                  placeholder="搜索提示词"
                  style={{ width: 200 }}
                  onSearch={(value) => handleSearch(value, 'search')}
                  allowClear
                />
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={4.8}>
          <Card>
            <Statistic
              title="总消耗"
              value={stats.total}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col span={4.8}>
          <Card>
            <Statistic
              title="今日消耗"
              value={stats.today}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col span={4.8}>
          <Card>
            <Statistic
              title="昨日消耗"
              value={stats.yesterday}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col span={4.8}>
          <Card>
            <Statistic
              title="本周消耗"
              value={stats.week}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col span={4.8}>
          <Card>
            <Statistic
              title="本月消耗"
              value={stats.month}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default TokenStats; 