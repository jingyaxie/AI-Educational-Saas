import React from 'react';

const HomeStats = ({ stats }) => {
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

export default HomeStats; 