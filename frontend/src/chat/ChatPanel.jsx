import React, { useState, useEffect } from 'react';
import { Button, Input, Select, message, Tooltip } from 'antd';
import { SendOutlined, PlusOutlined, MessageOutlined, DoubleRightOutlined, DoubleLeftOutlined } from '@ant-design/icons';
import { getModelApiConfig } from '../features/setting/ApiManage';
import axios from '../api';

const kbOptions = [
  { value: 'none', label: '无知识库' },
  { value: 'univ', label: '大学库' },
  { value: 'policy', label: '政策库' },
];

// 生成唯一ID
const uuid = () => '_' + Math.random().toString(36).slice(2, 10) + Date.now();

const DEFAULT_WELCOME = '您今天在想什么？';

const getDefaultConversation = () => ({
  id: uuid(),
  title: '新对话',
  messages: [ { role: 'system', content: DEFAULT_WELCOME } ],
});

const LOCAL_KEY = 'ai_chat_conversations_v1';
const LOCAL_CUR = 'ai_chat_current_id_v1';

const ChatPanel = () => {
  // 多会话数据
  const [conversations, setConversations] = useState([getDefaultConversation()]);
  // 当前会话id
  const [currentId, setCurrentId] = useState(conversations[0].id);
  // 输入内容
  const [input, setInput] = useState('');
  // 动态模型选项和选中模型
  const [modelOptions, setModelOptions] = useState([]);
  const [model, setModel] = useState('');
  const [modelApiMap, setModelApiMap] = useState({}); // model值到API对象的映射
  const [kb, setKb] = useState('none');
  // 侧边栏收起
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // 是否发送中
  const [sending, setSending] = useState(false);

  // 加载本地历史
  useEffect(() => {
    const local = localStorage.getItem(LOCAL_KEY);
    const cur = localStorage.getItem(LOCAL_CUR);
    if (local) {
      try {
        const arr = JSON.parse(local);
        setConversations(arr.length ? arr : [getDefaultConversation()]);
        setCurrentId(cur || (arr[0] && arr[0].id) || getDefaultConversation().id);
      } catch {
        setConversations([getDefaultConversation()]);
        setCurrentId(getDefaultConversation().id);
      }
    }
  }, []);
  // 持久化
  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(conversations));
    localStorage.setItem(LOCAL_CUR, currentId);
  }, [conversations, currentId]);

  // 获取后端已配置模型列表
  useEffect(() => {
    async function fetchModels() {
      try {
        const res = await axios.get('/api/modelapis/');
        // 只展示已配置的API，每个API对象包含model, model_display, apikey, base_url, model_name等
        const opts = res.data.map(api => ({ value: api.model, label: api.model_display || api.model }));
        setModelOptions(opts);
        // 默认选中第一个
        if (opts.length > 0) setModel(opts[0].value);
        // 建立model到API对象的映射
        const map = {};
        res.data.forEach(api => { map[api.model] = api; });
        setModelApiMap(map);
      } catch (err) {
        setModelOptions([]);
        setModel('');
        setModelApiMap({});
        message.error('获取可用大模型失败');
      }
    }
    fetchModels();
  }, []);

  // 当前会话对象
  const currentConv = conversations.find(c => c.id === currentId) || conversations[0];

  // 新建聊天
  const handleNewChat = () => {
    const newConv = getDefaultConversation();
    setConversations([newConv, ...conversations]);
    setCurrentId(newConv.id);
    setInput('');
    message.info('已新建对话');
  };

  // 切换历史对话
  const handleSelectConv = (id) => {
    setCurrentId(id);
    setInput('');
  };

  // 发送消息
  const handleSend = async () => {
    if (!input.trim()) {
      message.warning('请输入内容');
      return;
    }
    setSending(true);
    // 追加到当前会话
    setConversations(convs => convs.map(c =>
      c.id === currentId
        ? { ...c, messages: [...c.messages, { role: 'user', content: input }] }
        : c
    ));
    setInput('');

    // 动态选择API配置
    const apiConf = getModelApiConfig()[model] || {};
    const apiUrl = apiConf.baseURL ? apiConf.baseURL + '/chat/completions' : '';
    const modelName = apiConf.model || model;
    const apiKey = apiConf.apiKey;
    const messagesToSend = (conversations.find(c => c.id === currentId)?.messages || []).concat({ role: 'user', content: input });

    if (apiUrl) {
      try {
        console.log('请求参数:', { apiUrl, modelName, apiKey, messagesToSend });
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}),
          },
          body: JSON.stringify({
            model: modelName,
            messages: messagesToSend,
          }),
        });
        if (!res.ok) throw new Error('API请求失败');
        const data = await res.json();
        console.log('AI响应数据:', data);
        const reply = data.choices?.[0]?.message?.content || '（AI无回复）';
        setConversations(convs => convs.map(c =>
          c.id === currentId
            ? { ...c, messages: [...c.messages, { role: 'assistant', content: reply }] }
            : c
        ));
      } catch (err) {
        setConversations(convs => convs.map(c =>
          c.id === currentId
            ? { ...c, messages: [...c.messages, { role: 'assistant', content: '【AI接口出错】' }] }
            : c
        ));
        message.error('AI接口出错: ' + err.message);
      } finally {
        setSending(false);
      }
    } else {
      message.error('未配置API，请先在API接口管理中配置大模型');
      setSending(false);
    }
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
          {conversations.map((conv, idx) => (
            <div
              key={conv.id}
              style={{
                padding: sidebarCollapsed ? '8px 8px' : '8px 24px',
                borderRadius: 8,
                margin: sidebarCollapsed ? '2px 4px' : '2px 16px',
                cursor: 'pointer',
                color: currentId === conv.id ? '#333' : '#222',
                fontSize: 15,
                background: currentId === conv.id ? '#e8f5e9' : '#fff',
                transition: 'background 0.2s, padding 0.3s, margin 0.3s',
                border: currentId === conv.id ? '1px solid #b2dfdb' : '1px solid transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                fontWeight: currentId === conv.id ? 600 : 400,
              }}
              onClick={() => handleSelectConv(conv.id)}
              onMouseOver={e => e.currentTarget.style.background = currentId === conv.id ? '#d0f0e6' : '#f5f5f5'}
              onMouseOut={e => e.currentTarget.style.background = currentId === conv.id ? '#e8f5e9' : '#fff'}
            >
              <MessageOutlined style={{ marginRight: sidebarCollapsed ? 0 : 8, color: currentId === conv.id ? '#fff' : '#bbb', fontSize: 18 }} />
              {!sidebarCollapsed && (conv.title || '新对话')}
            </div>
          ))}
        </div>
      </div>
      {/* 右侧主区 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fff', minHeight: 0 }}>
        {/* 欢迎语/大标题 */}
        <div style={{ marginTop: 80, marginBottom: 32, fontSize: 28, color: '#222', fontWeight: 600, textAlign: 'center', letterSpacing: 1 }}>
          {currentConv.messages[0]?.content || DEFAULT_WELCOME}
        </div>
        {/* 聊天消息区 */}
        <div style={{ flex: 1, width: '100%', maxWidth: 720, margin: '0 auto', overflowY: 'auto', padding: '0 0 24px 0' }}>
          {currentConv.messages.slice(1).map((msg, idx) => (
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
              <Select value={model} onChange={setModel} style={{ width: 120, margin: '0 8px' }} options={modelOptions} bordered={false} placeholder="选择模型" />
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