import React from 'react';

const mockMembers = [
  { id: 1, username: '李小梅', group: '学生', valid: '2026-05-09', reg: '2025-06-01 12:21:43' },
  { id: 2, username: '张明超', group: '教务', valid: '2026-05-09', reg: '2025-06-01 12:21:43' },
  { id: 3, username: '刘小力', group: '艺术老师', valid: '2026-05-09', reg: '2025-06-01 12:21:43' },
  { id: 4, username: '张黑黑', group: '法语老师', valid: '2026-05-09', reg: '2025-06-01 12:21:43' },
  { id: 5, username: '兰老师', group: '系统管理员', valid: '2026-05-09', reg: '2025-06-01 12:21:43' },
];

const MemberList = () => {
  return (
    <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #e5e5e5', padding: 32, width: '100%', height: '100%', minHeight: 500 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <input placeholder="注册时间" style={{ border: '1px solid #d0d0d0', borderRadius: 4, padding: '6px 12px', fontSize: 15 }} />
          <input placeholder="请输入用户名" style={{ border: '1px solid #d0d0d0', borderRadius: 4, padding: '6px 12px', fontSize: 15 }} />
          <button style={{ background: '#5a7d1a', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 24px', fontWeight: 500, fontSize: 15, cursor: 'pointer' }}>查询</button>
        </div>
        <button style={{ background: '#5a7d1a', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 24px', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>+新建用户</button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
        <thead>
          <tr style={{ background: '#f6faef', color: '#5a7d1a' }}>
            <th style={{ padding: '10px 8px', borderBottom: '2px solid #e0e0e0', textAlign: 'left' }}>用户名</th>
            <th style={{ padding: '10px 8px', borderBottom: '2px solid #e0e0e0' }}>用户组</th>
            <th style={{ padding: '10px 8px', borderBottom: '2px solid #e0e0e0' }}>有效期</th>
            <th style={{ padding: '10px 8px', borderBottom: '2px solid #e0e0e0' }}>注册时间</th>
            <th style={{ padding: '10px 8px', borderBottom: '2px solid #e0e0e0' }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {mockMembers.map(member => (
            <tr key={member.id} style={{ borderBottom: '1px solid #f0f0f0', transition: 'background 0.2s' }}>
              <td style={{ padding: '10px 8px' }}>{member.username}</td>
              <td style={{ padding: '10px 8px', textAlign: 'center' }}>{member.group}</td>
              <td style={{ padding: '10px 8px', textAlign: 'center' }}>{member.valid}</td>
              <td style={{ padding: '10px 8px', textAlign: 'center' }}>{member.reg}</td>
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

export default MemberList; 