import React from 'react';

const mockAgents = [
  { id: 1, name: '课程答疑', created: '20265-6-2', apikey: 'jk10938iej000', role: '教务, 学生' },
  { id: 2, name: '报考指南', created: '20265-6-2', apikey: 'jk10938iej000', role: '教务, 老师' },
  { id: 3, name: '课后作业', created: '20265-6-2', apikey: 'jk10938iej000', role: '教务, 老师' },
];

const AgentList = () => {
  return (
    <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #e5e5e5', padding: 32, width: '100%', height: '100%', minHeight: 500 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ color: '#3b6ed6', margin: 0 }}>智能体列表</h2>
        <button style={{ background: '#5a7d1a', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 24px', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>+创建智能体</button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
        <thead>
          <tr style={{ background: '#f6faef', color: '#5a7d1a' }}>
            <th style={{ padding: '10px 8px', borderBottom: '2px solid #e0e0e0', textAlign: 'left' }}>名称</th>
            <th style={{ padding: '10px 8px', borderBottom: '2px solid #e0e0e0' }}>创建时间</th>
            <th style={{ padding: '10px 8px', borderBottom: '2px solid #e0e0e0' }}>API-key</th>
            <th style={{ padding: '10px 8px', borderBottom: '2px solid #e0e0e0' }}>权限</th>
            <th style={{ padding: '10px 8px', borderBottom: '2px solid #e0e0e0' }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {mockAgents.map(agent => (
            <tr key={agent.id} style={{ borderBottom: '1px solid #f0f0f0', transition: 'background 0.2s' }}>
              <td style={{ padding: '10px 8px' }}>{agent.name}</td>
              <td style={{ padding: '10px 8px', textAlign: 'center' }}>{agent.created}</td>
              <td style={{ padding: '10px 8px', textAlign: 'center' }}>{agent.apikey}</td>
              <td style={{ padding: '10px 8px', textAlign: 'center' }}>{agent.role}</td>
              <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                <span style={{ fontSize: 22, color: '#888', cursor: 'pointer' }}>⋯</span>
              </td>
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

export default AgentList; 