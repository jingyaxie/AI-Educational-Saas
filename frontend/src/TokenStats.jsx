import React from 'react';

const mockTokens = [
  { id: 1, username: '张小明', group: '学生', usage: '8723632K', reg: '20265-6-2' },
  { id: 2, username: '刘有', group: '学生', usage: '8723632K', reg: '20265-6-2' },
  { id: 3, username: '李老师', group: '老师', usage: '8723632K', reg: '20265-6-2' },
  { id: 4, username: '左老师', group: '教务', usage: '8723632K', reg: '20265-6-2' },
];

const TokenStats = () => {
  return (
    <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #e5e5e5', padding: 32, width: '100%', height: '100%', minHeight: 500 }}>
      <h2 style={{ color: '#3b6ed6', margin: '0 0 24px 0' }}>token用量表</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
        <thead>
          <tr style={{ background: '#f6faef', color: '#5a7d1a' }}>
            <th style={{ padding: '10px 8px', borderBottom: '2px solid #e0e0e0', textAlign: 'left' }}>用户名</th>
            <th style={{ padding: '10px 8px', borderBottom: '2px solid #e0e0e0' }}>用户组</th>
            <th style={{ padding: '10px 8px', borderBottom: '2px solid #e0e0e0' }}>用户量</th>
            <th style={{ padding: '10px 8px', borderBottom: '2px solid #e0e0e0' }}>注册时间</th>
          </tr>
        </thead>
        <tbody>
          {mockTokens.map(row => (
            <tr key={row.id} style={{ borderBottom: '1px solid #f0f0f0', transition: 'background 0.2s' }}>
              <td style={{ padding: '10px 8px' }}>{row.username}</td>
              <td style={{ padding: '10px 8px', textAlign: 'center' }}>{row.group}</td>
              <td style={{ padding: '10px 8px', textAlign: 'center' }}>{row.usage}</td>
              <td style={{ padding: '10px 8px', textAlign: 'center' }}>{row.reg}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* 分页 */}
      <div style={{ marginTop: 24, textAlign: 'right', color: '#666', fontSize: 16 }}>
        <span style={{ margin: '0 6px', cursor: 'pointer', color: '#3b6ed6' }}>1</span>
        <span style={{ margin: '0 6px', cursor: 'pointer' }}>2</span>
        <span style={{ margin: '0 6px', cursor: 'pointer' }}>3</span>
        <span style={{ margin: '0 6px', cursor: 'pointer' }}>4</span>
        <span style={{ margin: '0 6px', cursor: 'pointer' }}>5</span>
        <span style={{ margin: '0 6px', cursor: 'pointer' }}>6</span>
        <span style={{ margin: '0 6px', cursor: 'pointer' }}>7</span>
        <span style={{ margin: '0 6px' }}>…</span>
        <span style={{ margin: '0 6px', cursor: 'pointer' }}>下一页</span>
      </div>
    </div>
  );
};

export default TokenStats; 