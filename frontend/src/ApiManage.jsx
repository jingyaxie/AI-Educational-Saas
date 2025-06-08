import React from 'react';

const mockApis = [
  { id: 1, model: 'Deepseek V3', apikey: 'P92347235234', usage: '812366234K', time: '20265-6-2' },
  { id: 2, model: 'Gemini', apikey: 'P92347235234', usage: '812366234K', time: '20265-6-2' },
  { id: 3, model: 'SROK', apikey: 'P92347235234', usage: '812366234K', time: '20265-6-2' },
];

const ApiManage = () => {
  return (
    <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #e5e5e5', padding: 32, width: '100%', height: '100%', minHeight: 500 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ color: '#3b6ed6', margin: 0 }}>API接口管理</h2>
        <button style={{ background: '#5a7d1a', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 24px', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>+接入大模型</button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
        <thead>
          <tr style={{ background: '#f6faef', color: '#5a7d1a' }}>
            <th style={{ padding: '10px 8px', borderBottom: '2px solid #e0e0e0', textAlign: 'left' }}>大模型</th>
            <th style={{ padding: '10px 8px', borderBottom: '2px solid #e0e0e0' }}>API-key</th>
            <th style={{ padding: '10px 8px', borderBottom: '2px solid #e0e0e0' }}>token用户量</th>
            <th style={{ padding: '10px 8px', borderBottom: '2px solid #e0e0e0' }}>接入时间</th>
            <th style={{ padding: '10px 8px', borderBottom: '2px solid #e0e0e0' }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {mockApis.map(row => (
            <tr key={row.id} style={{ borderBottom: '1px solid #f0f0f0', transition: 'background 0.2s' }}>
              <td style={{ padding: '10px 8px' }}>{row.model}</td>
              <td style={{ padding: '10px 8px', textAlign: 'center' }}>{row.apikey}</td>
              <td style={{ padding: '10px 8px', textAlign: 'center' }}>{row.usage}</td>
              <td style={{ padding: '10px 8px', textAlign: 'center' }}>{row.time}</td>
              <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                <span style={{ color: '#e53935', cursor: 'pointer', fontSize: 20 }} title="删除">🗑️</span>
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
        1. 添加大模型：对接可支持调用的所有、智能体开发关联或上的大模型列表。可分开，具体看模型
      </div>
    </div>
  );
};

export default ApiManage; 