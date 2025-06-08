import React from 'react';

const mockGroups = [
  { id: 1, group: '学生', modules: '智能体、云盘', created: '2025-06-01 12:21:43' },
  { id: 2, group: '教务', modules: '问答智能体、云盘', created: '2025-06-01 12:21:43' },
  { id: 3, group: '艺术老师', modules: '智能体、云盘', created: '2025-06-01 12:21:43' },
  { id: 4, group: '法语老师', modules: '智能体、云盘', created: '2025-06-01 12:21:43' },
];

const GroupManage = () => {
  return (
    <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #e5e5e5', padding: 32, width: '100%', height: '100%', minHeight: 500 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ color: '#3b6ed6', margin: 0 }}>用户组管理</h2>
        <button style={{ background: '#5a7d1a', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 24px', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>+创建用户组</button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
        <thead>
          <tr style={{ background: '#f6faef', color: '#5a7d1a' }}>
            <th style={{ padding: '10px 8px', borderBottom: '2px solid #e0e0e0', textAlign: 'left' }}>用户组</th>
            <th style={{ padding: '10px 8px', borderBottom: '2px solid #e0e0e0' }}>功能模块</th>
            <th style={{ padding: '10px 8px', borderBottom: '2px solid #e0e0e0' }}>创建时间</th>
            <th style={{ padding: '10px 8px', borderBottom: '2px solid #e0e0e0' }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {mockGroups.map(group => (
            <tr key={group.id} style={{ borderBottom: '1px solid #f0f0f0', transition: 'background 0.2s' }}>
              <td style={{ padding: '10px 8px' }}>{group.group}</td>
              <td style={{ padding: '10px 8px', textAlign: 'center' }}>{group.modules}</td>
              <td style={{ padding: '10px 8px', textAlign: 'center' }}>{group.created}</td>
              <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                <span style={{ color: '#3b6ed6', cursor: 'pointer', fontWeight: 500 }}>修改</span>
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

export default GroupManage; 