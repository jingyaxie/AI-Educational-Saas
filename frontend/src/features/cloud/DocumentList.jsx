import React from 'react';

const mockDocs = [
  { id: 1, name: '课程大纲.docx', created: '2024-06-01 10:23', size: '1.2MB' },
  { id: 2, name: '学生名单.xlsx', created: '2024-06-02 09:10', size: '500KB' },
  { id: 3, name: '毕业论文模板.pdf', created: '2024-06-03 14:45', size: '2.1MB' },
];

const DocumentList = () => {
  return (
    <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #e5e5e5', padding: 32, width: '100%', height: '100%', minHeight: 500 }}>
      <h2 style={{ marginBottom: 24, color: '#3b6ed6' }}>文档列表</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
        <thead>
          <tr style={{ background: '#f6faef', color: '#5a7d1a' }}>
            <th style={{ padding: '10px 8px', borderBottom: '2px solid #e0e0e0', textAlign: 'left' }}>文档名</th>
            <th style={{ padding: '10px 8px', borderBottom: '2px solid #e0e0e0' }}>创建时间</th>
            <th style={{ padding: '10px 8px', borderBottom: '2px solid #e0e0e0' }}>大小</th>
            <th style={{ padding: '10px 8px', borderBottom: '2px solid #e0e0e0' }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {mockDocs.map(doc => (
            <tr key={doc.id} style={{ borderBottom: '1px solid #f0f0f0', transition: 'background 0.2s' }}>
              <td style={{ padding: '10px 8px' }}>{doc.name}</td>
              <td style={{ padding: '10px 8px', textAlign: 'center' }}>{doc.created}</td>
              <td style={{ padding: '10px 8px', textAlign: 'center' }}>{doc.size}</td>
              <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                <button style={{ background: '#5a7d1a', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 14px', cursor: 'pointer', marginRight: 8 }}>下载</button>
                <button style={{ background: '#e53935', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 14px', cursor: 'pointer' }}>删除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DocumentList; 