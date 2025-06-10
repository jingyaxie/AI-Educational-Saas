import React, { useState, useEffect } from 'react';
import HomeStats from '../components/HomeStats';
import DocumentList from '../features/cloud/DocumentList';
import SpaceManage from '../features/cloud/SpaceManage';
import AgentList from '../features/agent/AgentList';
import MemberList from '../features/user/MemberList';
import GroupList from '../features/user/GroupList';
import GroupManage from '../features/user/GroupManage';
import TokenStats from '../features/setting/TokenStats';
import ApiManage from '../features/setting/ApiManage';
import KnowledgeManage from '../features/knowledge/KnowledgeManage';
import ChatPanel from '../chat/ChatPanel';
import axios from '../api';
import { HomeOutlined, UserOutlined } from '@ant-design/icons';

const menuList = [
  { key: 'home', label: '首页' },
  { key: 'chat', label: '大模型对话' },
  { key: 'cloud', label: '云空间', children: [
    { key: 'doc', label: '文档列表' },
    { key: 'space', label: '空间管理' },
  ]},
  { key: 'knowledge', label: '知识库', children: [
    { key: 'knowledge-mgr', label: '知识库管理' },
  ]},
  { key: 'agent', label: '智能体', children: [
    { key: 'agent-mgr', label: '智能体管理' },
  ]},
  { key: 'user', label: '用户管理', children: [
    { key: 'member-list', label: '会员列表' },
    { key: 'group-list', label: '用户组管理' },
  ]},
  { key: 'setting', label: '设置', children: [
    { key: 'token', label: 'token统计' },
    { key: 'api', label: 'API接口管理' },
  ]},
];

const Dashboard = () => {
  const [selectedKey, setSelectedKey] = useState('home');
  const [userInfo, setUserInfo] = useState({ username: '', real_name: '' });

  useEffect(() => {
    axios.get('/api/userinfo/')
      .then(res => setUserInfo(res.data))
      .catch(() => setUserInfo({ username: localStorage.getItem('username') || '' }));
  }, []);

  // 辅助函数：获取一级菜单的第一个子菜单key
  const getFirstChildKey = (item) => {
    if (item.children && item.children.length > 0) {
      return item.children[0].key;
    }
    return item.key;
  };

  // 优化点击一级菜单时自动选中第一个子菜单
  const handleMenuClick = (item) => {
    if (item.children && item.children.length > 0) {
      setSelectedKey(item.children[0].key);
    } else {
      setSelectedKey(item.key);
    }
  };

  // 假数据，可后续从后端接口获取
  const stats = {
    student_count: 78,
    graduate_count: 32,
    token_usage: 109887,
    knowledge_count: 998,
    cloud_space_count: 876987,
    username: localStorage.getItem('username') || '张晓娜',
  };

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  // 渲染侧边栏菜单
  const renderMenu = () => (
    <div style={{
      width: 220,
      background: '#fff',
      minHeight: 'calc(100vh - 60px)',
      boxShadow: '2px 0 8px #e5e5e5',
      borderRadius: '0 16px 16px 0',
      padding: '32px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      {menuList.map(item => (
        <div key={item.key}>
          <div
            onClick={() => handleMenuClick(item)}
            style={{
              fontWeight: 'bold',
              padding: '10px 32px',
              borderRadius: '0 20px 20px 0',
              background: selectedKey === item.key ? 'linear-gradient(90deg, #e8f5e9 60%, #c8e6c9 100%)' : 'none',
              color: selectedKey === item.key ? '#5a7d1a' : '#333',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: selectedKey === item.key ? '2px 2px 8px #e0e0e0' : 'none',
            }}
          >
            {item.label}
          </div>
          {item.children && (selectedKey === item.key || item.children.some(child => child.key === selectedKey)) && (
            <div style={{ marginLeft: 24, marginTop: 4 }}>
              {item.children.map(child => (
                <div
                  key={child.key}
                  onClick={e => { e.stopPropagation(); setSelectedKey(child.key); }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    margin: '4px 0',
                    background: selectedKey === child.key ? '#e8f5e9' : 'none',
                    color: selectedKey === child.key ? '#388e3c' : '#666',
                    fontWeight: selectedKey === child.key ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {child.label}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // 渲染内容区
  const renderContent = () => {
    if (selectedKey === 'chat') {
      return <ChatPanel />;
    }
    if (selectedKey === 'doc') {
      return <DocumentList />;
    }
    if (selectedKey === 'space') {
      return <SpaceManage />;
    }
    if (selectedKey === 'agent-mgr') {
      return <AgentList />;
    }
    if (selectedKey === 'member-list') {
      return <MemberList />;
    }
    if (selectedKey === 'group-list') {
      return <GroupList />;
    }
    if (selectedKey === 'token') {
      return <TokenStats />;
    }
    if (selectedKey === 'api') {
      return <ApiManage />;
    }
    if (selectedKey === 'knowledge-mgr') {
      return <KnowledgeManage />;
    }
    // 默认首页内容
    return (
      <div style={{
        background: 'linear-gradient(135deg, #e8f5e9 0%, #f6faef 100%)',
        borderRadius: 16,
        boxShadow: '0 4px 24px #e0e0e0',
        padding: 40,
        maxWidth: 900,
        margin: '40px auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', gap: 32, width: '100%', marginBottom: 32 }}>
          <div style={{ flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #e5e5e5', padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'box-shadow 0.2s', minWidth: 180 }}>
            <span style={{ fontSize: 36, color: '#5a7d1a', marginBottom: 8 }}>🎓</span>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#333' }}>{stats.student_count}</div>
            <div style={{ color: '#888', marginTop: 8 }}>学生</div>
          </div>
          <div style={{ flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #e5e5e5', padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 180 }}>
            <span style={{ fontSize: 36, color: '#3b6ed6', marginBottom: 8 }}>🎓</span>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#333' }}>{stats.graduate_count}</div>
            <div style={{ color: '#888', marginTop: 8 }}>毕业</div>
          </div>
          <div style={{ flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #e5e5e5', padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 180 }}>
            <span style={{ fontSize: 36, color: '#ff9800', marginBottom: 8 }}>🔑</span>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#333' }}>{stats.token_usage}B</div>
            <div style={{ color: '#888', marginTop: 8 }}>token用量</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 32, width: '100%' }}>
          <div style={{ flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #e5e5e5', padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 180 }}>
            <span style={{ fontSize: 36, color: '#388e3c', marginBottom: 8 }}>📚</span>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#333' }}>{stats.knowledge_count}</div>
            <div style={{ color: '#888', marginTop: 8 }}>知识库</div>
          </div>
          <div style={{ flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #e5e5e5', padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 180 }}>
            <span style={{ fontSize: 36, color: '#00bcd4', marginBottom: 8 }}>☁️</span>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#333' }}>{stats.cloud_space_count}</div>
            <div style={{ color: '#888', marginTop: 8 }}>云空间</div>
          </div>
        </div>
        <div style={{ marginTop: 40, color: '#888', fontSize: 15, width: '100%' }}>
          <b>简单交互说明：</b><br />
          1. 全站的统计性数据，不用实时，每天同步一次即可。
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* 顶部状态栏 */}
      <div style={{ height: 60, background: '#fff', boxShadow: '0 2px 8px #e5e5e5', display: 'flex', alignItems: 'center', padding: '0 24px', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 20, fontWeight: 600, color: '#333' }}>AI教育SaaS系统</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: '#666' }}>欢迎，{userInfo.real_name || userInfo.username}</span>
          <button onClick={handleLogout} style={{ border: 'none', background: 'none', color: '#3b6ed6', cursor: 'pointer', fontSize: 16 }}>退出登录</button>
        </div>
      </div>
      {/* 主体内容 */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {renderMenu()}
        <div style={{ flex: 1, padding: 24, overflow: 'auto' }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 