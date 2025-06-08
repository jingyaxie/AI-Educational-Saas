import React from 'react';

const mockKnowledge = [
  { id: 1, type: 'doc', name: '报考大学指南', count: 3, created: '20265-6-2' },
  { id: 2, type: 'xls', name: '各大学名单', count: 4, created: '20265-6-2' },
  { id: 3, type: 'doc', name: '报考流程', count: 6, created: '20265-6-2' },
  { id: 4, type: 'xls', name: '每个学校双联名额', count: 5, created: '20265-6-2' },
];

const iconMap = {
  doc: <span style={{ fontSize: 28, marginRight: 8 }}>📄</span>,
  xls: <span style={{ fontSize: 28, marginRight: 8 }}>📊</span>,
};

const KnowledgeManage = () => {
  return (
    <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #e5e5e5', padding: 32, width: '100%', height: '100%', minHeight: 500 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <input placeholder="创建时间" style={{ border: '1px solid #d0d0d0', borderRadius: 4, padding: '6px 12px', fontSize: 15 }} />
          <input placeholder="请输入文件名" style={{ border: '1px solid #d0d0d0', borderRadius: 4, padding: '6px 12px', fontSize: 15 }} />
          <button style={{ background: '#5a7d1a', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 24px', fontWeight: 500, fontSize: 15, cursor: 'pointer' }}>查询</button>
        </div>
        <button style={{ background: '#5a7d1a', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 24px', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>+创建知识库</button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
        <thead>
          <tr style={{ background: '#f6faef', color: '#5a7d1a' }}>
            <th style={{ padding: '10px 8px', borderBottom: '2px solid #e0e0e0', textAlign: 'left' }}>类型</th>
            <th style={{ padding: '10px 8px', borderBottom: '2px solid #e0e0e0' }}>文件名称</th>
            <th style={{ padding: '10px 8px', borderBottom: '2px solid #e0e0e0' }}>文件数</th>
            <th style={{ padding: '10px 8px', borderBottom: '2px solid #e0e0e0' }}>创建时间</th>
            <th style={{ padding: '10px 8px', borderBottom: '2px solid #e0e0e0' }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {mockKnowledge.map(row => (
            <tr key={row.id} style={{ borderBottom: '1px solid #f0f0f0', transition: 'background 0.2s' }}>
              <td style={{ padding: '10px 8px' }}>{iconMap[row.type]}</td>
              <td style={{ padding: '10px 8px', textAlign: 'center' }}>{row.name}</td>
              <td style={{ padding: '10px 8px', textAlign: 'center' }}>{row.count}</td>
              <td style={{ padding: '10px 8px', textAlign: 'center' }}>{row.created}</td>
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
      {/* 说明 */}
      <div style={{ marginTop: 32, color: '#888', fontSize: 14 }}>
        需求与交互说明：<br />
        1. 一个文件下面有多个子文件
      </div>
    </div>
  );
};

export default KnowledgeManage; 