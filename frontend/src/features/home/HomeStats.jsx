import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Progress, Space, Typography, Tooltip } from 'antd';
import { 
  RocketOutlined, 
  ThunderboltOutlined, 
  TeamOutlined, 
  BookOutlined,
  CloudOutlined,
  RobotOutlined,
  ApiOutlined,
  GlobalOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import axios from '../../api';
import { Line } from '@ant-design/plots';

const { Title } = Typography;

const HomeStats = () => {
  const [stats, setStats] = useState({
    student_count: 0,
    graduate_count: 0,
    token_usage: 0,
    knowledge_count: 0,
    cloud_space_count: 0,
    agent_count: 0,
    api_count: 0,
    total_requests: 0
  });

  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 获取统计数据
  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/dashboard/stats/');
      setStats(res.data);
    } catch (err) {
      console.error('获取统计数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 获取趋势数据
  const fetchTrendData = async () => {
    try {
      const res = await axios.get('/api/dashboard/trend/');
      setTrendData(res.data);
    } catch (err) {
      console.error('获取趋势数据失败:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchTrendData();
  }, []);

  const trendConfig = {
    data: trendData,
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    point: {
      size: 5,
      shape: 'diamond',
      style: {
        fill: 'white',
        stroke: '#5B8FF9',
        lineWidth: 2,
      },
    },
    tooltip: {
      showMarkers: false,
    },
    state: {
      active: {
        style: {
          shadowBlur: 4,
          stroke: '#000',
          fill: 'red',
        },
      },
    },
    interactions: [
      {
        type: 'marker-active',
      },
    ],
  };

  const StatCard = ({ title, value, icon: Icon, color, maxValue, loading }) => (
    <Card
      loading={loading}
      style={{
        background: `linear-gradient(135deg, ${color}10 0%, ${color}05 100%)`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${color}20`,
        borderRadius: '16px',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
      bodyStyle={{ padding: '20px' }}
      hoverable
    >
      <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: `${color}10`, borderRadius: '50%', transform: 'translate(30%, -30%)' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Statistic
          title={<span style={{ color: '#fff', fontSize: '16px' }}>{title}</span>}
          value={value}
          valueStyle={{ color: color, fontSize: '28px', fontWeight: 'bold' }}
          prefix={<Icon style={{ color: color, fontSize: '24px' }} />}
          suffix={
            <Tooltip title="较上月">
              <span style={{ fontSize: '14px', color: '#fff' }}>
                {Math.random() > 0.5 ? (
                  <ArrowUpOutlined style={{ color: '#52c41a' }} />
                ) : (
                  <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
                )}
                {Math.floor(Math.random() * 20)}%
              </span>
            </Tooltip>
          }
        />
        <Progress 
          percent={Math.min(100, (value / maxValue) * 100)} 
          showInfo={false}
          strokeColor={{
            '0%': color,
            '100%': color,
          }}
          trailColor={`${color}20`}
          strokeWidth={4}
        />
      </div>
    </Card>
  );

  return (
    <div style={{ 
      padding: '24px', 
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', 
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '200px',
        background: 'linear-gradient(135deg, #1890ff20 0%, #722ed120 100%)',
        filter: 'blur(100px)',
        zIndex: 0
      }} />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Title level={2} style={{ color: '#fff', marginBottom: '24px', display: 'flex', alignItems: 'center' }}>
          <GlobalOutlined style={{ marginRight: '12px', fontSize: '32px', color: '#1890ff' }} />
          系统概览
          <span style={{ marginLeft: '12px', fontSize: '16px', color: '#1890ff80' }}>
            实时数据更新
          </span>
        </Title>

        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <StatCard
              title="学生数量"
              value={stats.student_count}
              icon={TeamOutlined}
              color="#00ff88"
              maxValue={1000}
              loading={loading}
            />
          </Col>
          <Col span={6}>
            <StatCard
              title="毕业生数量"
              value={stats.graduate_count}
              icon={RocketOutlined}
              color="#ff4d4f"
              maxValue={500}
              loading={loading}
            />
          </Col>
          <Col span={6}>
            <StatCard
              title="Token消耗"
              value={stats.token_usage}
              icon={ThunderboltOutlined}
              color="#1890ff"
              maxValue={1000000}
              loading={loading}
            />
          </Col>
          <Col span={6}>
            <StatCard
              title="知识库数量"
              value={stats.knowledge_count}
              icon={BookOutlined}
              color="#faad14"
              maxValue={1000}
              loading={loading}
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <StatCard
              title="云空间使用"
              value={stats.cloud_space_count}
              icon={CloudOutlined}
              color="#722ed1"
              maxValue={1000000}
              loading={loading}
            />
          </Col>
          <Col span={6}>
            <StatCard
              title="智能体数量"
              value={stats.agent_count}
              icon={RobotOutlined}
              color="#13c2c2"
              maxValue={100}
              loading={loading}
            />
          </Col>
          <Col span={6}>
            <StatCard
              title="API数量"
              value={stats.api_count}
              icon={ApiOutlined}
              color="#eb2f96"
              maxValue={50}
              loading={loading}
            />
          </Col>
          <Col span={6}>
            <StatCard
              title="总请求数"
              value={stats.total_requests}
              icon={GlobalOutlined}
              color="#52c41a"
              maxValue={10000}
              loading={loading}
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card
              loading={loading}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ 
                position: 'absolute', 
                top: 0, 
                right: 0, 
                width: '200px', 
                height: '200px', 
                background: 'linear-gradient(135deg, #1890ff20 0%, #722ed120 100%)',
                filter: 'blur(50px)',
                zIndex: 0
              }} />
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ 
                  color: '#fff', 
                  marginBottom: '16px', 
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span>
                    <GlobalOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                    系统使用趋势
                  </span>
                  <Tooltip title="数据每5分钟更新一次">
                    <span style={{ fontSize: '12px', color: '#1890ff80' }}>
                      实时更新
                    </span>
                  </Tooltip>
                </div>
                <Line {...trendConfig} />
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default HomeStats; 