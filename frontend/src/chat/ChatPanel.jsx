import React, { useState } from 'react';
import { Button, Input, Select, message, Tooltip } from 'antd';
import { SendOutlined, PlusOutlined, MenuOutlined, UserOutlined, MessageOutlined, DoubleRightOutlined, DoubleLeftOutlined } from '@ant-design/icons';

// 假数据：智能体、模型、知识库列表，后续可通过接口获取
const agentOptions = [
  { value: 'default', label: '通用助手' },
  { value: 'study', label: '学业顾问' },
  { value: 'career', label: '职业规划' },
];
const modelOptions = [
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'deepseek', label: 'Deepseek' },
  { value: 'gemini', label: 'Gemini' },
];
const kbOptions = [
  { value: 'none', label: '无知识库' },
  { value: 'univ', label: '大学库' },
  { value: 'policy', label: '政策库' },
];

const fakeHistory = [
  '大模型知识库技术',
  '云原生概念解析',
  '前端无法访问问题',
  'RagFlow工作流概述',
  '需求文档转化',
  '翻译不再提醒',
  'DFE3EB 转 ARGB 30%',
  '开源知识库排名',
  '远程连接家里电脑',
  '谷歌文档API使用教程',
  '基于LangChain的知识库',
  '透明度动画实现',
  'Curex写动画交互',
];

const ChatPanel = () => {
  // 聊天历史
  const [messages, setMessages] = useState([
    { role: 'system', content: '您今天在想什么？' }
  ]);
  // 输入内容
  const [input, setInput] = useState('');
  // 选中的智能体、模型、知识库
  const [agent, setAgent] = useState('default');
  const [model, setModel] = useState('gpt-4');
  const [kb, setKb] = useState('none');
  // 是否发送中
  const [sending, setSending] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 发送消息
  const handleSend = async () => {
    if (!input.trim()) {
      message.warning('请输入内容');
      return;
    }
    setSending(true);
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    console.log('发送消息:', { agent, model, kb, input });
    // TODO: 调用后端chat接口，传递agent/model/kb/历史消息等参数
    setTimeout(() => {
      // 假回复
      setMessages(prev => [...prev, { role: 'assistant', content: '（AI回复内容，后续对接大模型接口）' }]);
      setSending(false);
    }, 1000);
  };

  // 新建对话
  const handleNewChat = () => {
    setMessages([{ role: 'system', content: '您今天在想什么？' }]);
    setInput('');
    message.info('已新建对话');
    console.log('新建对话');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#fff' }}>
      {/* 左侧极简侧边栏 */}
      <div
        style={{
          width: sidebarCollapsed ? 56 : 270,
          background: '#fff',
          borderRight: '1px solid #eee',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          padding: 0,
          transition: 'width 0.3s cubic-bezier(.4,0,.2,1)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* 展开/收起按钮 */}
        <Button
          type="text"
          icon={sidebarCollapsed ? <DoubleRightOutlined /> : <DoubleLeftOutlined />}
          onClick={() => setSidebarCollapsed(c => !c)}
          style={{
            position: 'absolute',
            top: 18,
            right: sidebarCollapsed ? 8 : -18,
            zIndex: 10,
            width: 32,
            height: 32,
            borderRadius: 16,
            background: '#f5f5f5',
            boxShadow: '0 1px 4px #eee',
            transition: 'right 0.3s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
        />
        {/* 新建对话按钮 */}
        <div style={{ display: sidebarCollapsed ? 'none' : 'flex', justifyContent: 'center', alignItems: 'center', margin: '20px 0 8px 0', opacity: sidebarCollapsed ? 0 : 1, transition: 'opacity 0.3s' }}>
          <Button
            type="text"
            icon={<PlusOutlined style={{ fontSize: 18 }} />}
            onClick={handleNewChat}
            style={{
              width: 160,
              height: 38,
              fontWeight: 500,
              fontSize: 15,
              borderRadius: 20,
              background: '#f5f5f5',
              transition: 'background 0.2s',
              boxShadow: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
            onMouseOver={e => e.currentTarget.style.background = '#ededed'}
            onMouseOut={e => e.currentTarget.style.background = '#f5f5f5'}
          >
            新建聊天
          </Button>
        </div>
        {/* 历史对话列表 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 24px 0', opacity: sidebarCollapsed ? 0 : 1, transition: 'opacity 0.3s' }}>
          {!sidebarCollapsed && <div style={{ color: '#888', fontSize: 14, margin: '8px 0 8px 32px' }}>聊天</div>}
          {fakeHistory.map((item, idx) => (
            <div
              key={idx}
              style={{
                padding: sidebarCollapsed ? '8px 8px' : '8px 24px',
                borderRadius: 8,
                margin: sidebarCollapsed ? '2px 4px' : '2px 16px',
                cursor: 'pointer',
                color: '#222',
                fontSize: 15,
                background: '#fff',
                transition: 'background 0.2s, padding 0.3s, margin 0.3s',
                border: '1px solid transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              }}
              onMouseOver={e => e.currentTarget.style.background = '#f5f5f5'}
              onMouseOut={e => e.currentTarget.style.background = '#fff'}
            >
              <MessageOutlined style={{ marginRight: sidebarCollapsed ? 0 : 8, color: '#bbb', fontSize: 18 }} />
              {!sidebarCollapsed && item}
            </div>
          ))}
        </div>
      </div>
      {/* 右侧主区 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fff', minHeight: 0 }}>
        {/* 欢迎语/大标题 */}
        <div style={{ marginTop: 80, marginBottom: 32, fontSize: 28, color: '#222', fontWeight: 600, textAlign: 'center', letterSpacing: 1 }}>
          您今天在想什么？
        </div>
        {/* 聊天消息区 */}
        <div style={{ flex: 1, width: '100%', maxWidth: 720, margin: '0 auto', overflowY: 'auto', padding: '0 0 24px 0' }}>
          {messages.slice(1).map((msg, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', margin: '18px 0' }}>
              <div style={{
                background: msg.role === 'user' ? '#e8f5e9' : '#f6f6fa',
                color: '#222',
                borderRadius: 18,
                padding: '14px 22px',
                fontSize: 16,
                maxWidth: 480,
                boxShadow: '0 2px 8px #f5f5f5',
                lineHeight: 1.7,
              }}>{msg.content}</div>
            </div>
          ))}
        </div>
        {/* 底部输入区 */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
          <div style={{
            background: '#fff',
            borderRadius: 32,
            boxShadow: '0 2px 16px #f0f0f0',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            width: 600,
            maxWidth: '90%',
            border: '1px solid #eee',
          }}>
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="询问任何问题"
              bordered={false}
              style={{ fontSize: 17, background: 'transparent', boxShadow: 'none', outline: 'none', flex: 1 }}
              onPressEnter={e => { if (!e.shiftKey) { e.preventDefault(); handleSend(); } }}
              disabled={sending}
            />
            <Tooltip title="选择模型">
              <Select value={model} onChange={setModel} style={{ width: 100, margin: '0 8px' }} options={modelOptions} bordered={false} />
            </Tooltip>
            <Tooltip title="选择知识库">
              <Select value={kb} onChange={setKb} style={{ width: 100, marginRight: 8 }} options={kbOptions} bordered={false} />
            </Tooltip>
            <Button
              type="primary"
              shape="circle"
              icon={<SendOutlined />}
              onClick={handleSend}
              loading={sending}
              style={{ width: 44, height: 44, fontSize: 20, boxShadow: 'none', background: '#222', border: 'none' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel; 