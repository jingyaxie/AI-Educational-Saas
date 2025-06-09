import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Space, Modal, Form, message, Popconfirm, Select, DatePicker, Card, Tag, Tooltip, Badge } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, ExportOutlined, ImportOutlined } from '@ant-design/icons';
import axios from '../../api';
import dayjs from 'dayjs';

const { Search } = Input;
const { RangePicker } = DatePicker;

const MemberList = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingMember, setEditingMember] = useState(null);
  const [groups, setGroups] = useState([]);
  const [dateRange, setDateRange] = useState(null);
  const [error, setError] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  // 获取用户组列表
  const fetchGroups = async () => {
    try {
      console.log('开始获取用户组列表...');
      const response = await axios.get('/api/users/groups/');
      console.log('用户组列表响应:', response.data);
      setGroups(response.data);
    } catch (error) {
      console.error('获取用户组列表失败:', error);
      console.error('错误详情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      message.error('获取用户组列表失败: ' + (error.response?.data?.detail || error.message));
      setGroups([]);
    }
  };

  // 获取会员列表
  const fetchMembers = async (page = 1, size = 10, search = '') => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        page_size: size,
        search
      };
      
      if (dateRange) {
        params.reg_start = dateRange[0].format('YYYY-MM-DD');
        params.reg_end = dateRange[1].format('YYYY-MM-DD');
      }

      console.log('开始获取会员列表，参数:', params);
      console.log('请求头:', axios.defaults.headers);
      
      const response = await axios.get('/api/users/', { params });
      console.log('会员列表响应:', response.data);
      
      if (Array.isArray(response.data)) {
        setMembers(response.data);
        setTotal(response.data.length);
      } else if (response.data && Array.isArray(response.data.results)) {
        setMembers(response.data.results);
        setTotal(response.data.count);
      } else {
        console.error('响应数据格式不正确:', response.data);
        message.error('数据格式错误');
        setError('数据格式错误');
      }
    } catch (error) {
      console.error('获取会员列表失败:', error);
      console.error('错误详情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      let errorMessage = '获取会员列表失败';
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = '未登录或登录已过期，请重新登录';
        } else if (error.response.status === 403) {
          errorMessage = '没有权限访问此页面';
        } else {
          errorMessage = error.response.data?.detail || error.response.data?.message || errorMessage;
        }
      } else if (error.request) {
        errorMessage = '网络请求失败，请检查网络连接';
      }
      
      message.error(errorMessage);
      setError(errorMessage);
      setMembers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers(currentPage, pageSize, searchText);
    fetchGroups();
  }, [currentPage, pageSize, searchText, dateRange]);

  // 处理搜索
  const handleSearch = (value) => {
    console.log('搜索关键词:', value);
    setSearchText(value);
    setCurrentPage(1);
  };

  // 处理日期范围变化
  const handleDateRangeChange = (dates) => {
    console.log('日期范围变化:', dates);
    setDateRange(dates);
    setCurrentPage(1);
  };

  // 处理分页
  const handleTableChange = (pagination) => {
    console.log('分页变化:', pagination);
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  // 处理新增/编辑
  const handleAddEdit = (record = null) => {
    console.log('打开编辑模态框:', record);
    setEditingMember(record);
    if (record) {
      form.setFieldsValue({
        ...record,
        group_id: record.group?.id,
        valid_until: record.valid_until ? dayjs(record.valid_until) : null,
        is_active: record.is_active === undefined ? true : record.is_active
      });
    } else {
      form.resetFields();
      // 设置默认值
      form.setFieldsValue({
        is_active: true,
        role: 'student'
      });
    }
    setModalVisible(true);
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log('表单数据:', values);

      const submitData = {
        ...values,
        valid_until: values.valid_until?.format('YYYY-MM-DD')
      };
      
      if (submitData.group_id === undefined) {
        delete submitData.group_id;
      }
      console.log('提交数据:', submitData);

      if (editingMember) {
        console.log('更新会员:', editingMember.id);
        const response = await axios.put(`/api/users/${editingMember.id}/`, submitData);
        console.log('更新响应:', response.data);
        message.success('更新成功');
        setModalVisible(false);
        fetchMembers(currentPage, pageSize, searchText);
      } else {
        console.log('新增会员');
        const response = await axios.post('/api/users/', submitData);
        console.log('新增响应:', response.data);
        message.success('添加成功');
        setModalVisible(false);
        setCurrentPage(1);
        setSearchText('');
        setTimeout(() => {
          fetchMembers(1, pageSize, '');
        }, 0);
      }
    } catch (error) {
      console.error('表单提交错误:', error);
      console.error('错误详情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = '操作失败';
      if (error.response) {
        errorMessage = error.response.data?.detail || error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = '网络请求失败，请检查网络连接';
      }
      
      message.error(errorMessage);
    }
  };

  // 处理删除
  const handleDelete = async (id) => {
    try {
      console.log('删除会员:', id);
      await axios.delete(`/api/users/${id}/`);
      console.log('删除成功');
      message.success('删除成功');
      fetchMembers(currentPage, pageSize, searchText);
    } catch (error) {
      console.error('删除失败:', error);
      console.error('错误详情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = '删除失败';
      if (error.response) {
        errorMessage = error.response.data?.detail || error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = '网络请求失败，请检查网络连接';
      }
      
      message.error(errorMessage);
    }
  };

  // 处理批量删除
  const handleBatchDelete = async () => {
    try {
      console.log('批量删除会员:', selectedRowKeys);
      await Promise.all(selectedRowKeys.map(id => axios.delete(`/api/users/${id}/`)));
      message.success('批量删除成功');
      setSelectedRowKeys([]);
      fetchMembers(currentPage, pageSize, searchText);
    } catch (error) {
      console.error('批量删除失败:', error);
      message.error('批量删除失败');
    }
  };

  // 处理导出
  const handleExport = async () => {
    try {
      const response = await axios.get('/api/users/export/', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `会员列表_${dayjs().format('YYYY-MM-DD')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败');
    }
  };

  // 处理导入
  const handleImport = async (file) => {
    try {
      setImportLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      await axios.post('/api/users/import/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      message.success('导入成功');
      setImportModalVisible(false);
      fetchMembers(currentPage, pageSize, searchText);
    } catch (error) {
      console.error('导入失败:', error);
      message.error('导入失败');
    } finally {
      setImportLoading(false);
    }
  };

  // 检查会员状态
  const checkMemberStatus = (validUntil) => {
    if (!validUntil) return { status: 'default', text: '未设置' };
    const now = dayjs();
    const validDate = dayjs(validUntil);
    if (validDate.isBefore(now)) {
      return { status: 'error', text: '已过期' };
    }
    if (validDate.diff(now, 'day') <= 7) {
      return { status: 'warning', text: '即将过期' };
    }
    return { status: 'success', text: '有效' };
  };

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => (
        <Space>
          <span>{text}</span>
          {record.is_active ? (
            <Badge status="success" text="活跃" />
          ) : (
            <Badge status="error" text="禁用" />
          )}
        </Space>
      ),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '用户组',
      dataIndex: ['group', 'name'],
      key: 'group',
      render: (_, record) => record.group?.name || '-',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const roleMap = {
          student: { text: '学生', color: 'blue' },
          teacher: { text: '老师', color: 'green' },
          admin: { text: '教务', color: 'orange' },
          sysadmin: { text: '系统管理员', color: 'red' }
        };
        const roleInfo = roleMap[role] || { text: role, color: 'default' };
        return <Tag color={roleInfo.color}>{roleInfo.text}</Tag>;
      }
    },
    {
      title: 'Token用量',
      dataIndex: 'token_usage',
      key: 'token_usage',
      render: (usage) => (
        <Tooltip title={`已使用 ${usage} 个 Token`}>
          <span>{usage}</span>
        </Tooltip>
      ),
    },
    {
      title: '有效期',
      dataIndex: 'valid_until',
      key: 'valid_until',
      render: (date) => {
        const status = checkMemberStatus(date);
        return (
          <Space>
            <span>{date ? dayjs(date).format('YYYY-MM-DD') : '-'}</span>
            <Tag color={status.status}>{status.text}</Tag>
          </Space>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'date_joined',
      key: 'date_joined',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleAddEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个会员吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <RangePicker
              onChange={handleDateRangeChange}
              value={dateRange}
              placeholder={['开始日期', '结束日期']}
            />
            <Search
              placeholder="搜索会员"
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
              style={{ width: 300 }}
            />
          </Space>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchMembers(currentPage, pageSize, searchText)}
            >
              刷新
            </Button>
            <Button
              icon={<ExportOutlined />}
              onClick={handleExport}
            >
              导出
            </Button>
            <Button
              icon={<ImportOutlined />}
              onClick={() => setImportModalVisible(true)}
            >
              导入
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleAddEdit()}
            >
              新增会员
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={members}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          onChange={handleTableChange}
          rowSelection={rowSelection}
        />
      </Card>

      <Modal
        title={editingMember ? '编辑会员' : '新增会员'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input />
          </Form.Item>
          {!editingMember && (
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item
            name="group_id"
            label="用户组"
          >
            <Select
              placeholder="请选择用户组"
              allowClear
            >
              {groups.map(group => (
                <Select.Option key={group.id} value={group.id}>
                  {group.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select>
              <Select.Option value="student">学生</Select.Option>
              <Select.Option value="teacher">老师</Select.Option>
              <Select.Option value="admin">教务</Select.Option>
              <Select.Option value="sysadmin">系统管理员</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="valid_until"
            label="有效期"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="is_active"
            label="状态"
          >
            <Select>
              <Select.Option value={true}>启用</Select.Option>
              <Select.Option value={false}>禁用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="导入会员"
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={null}
      >
        <Form.Item
          label="选择文件"
          extra="支持 .xlsx 格式"
        >
          <Input
            type="file"
            accept=".xlsx"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                handleImport(file);
              }
            }}
          />
        </Form.Item>
      </Modal>
    </div>
  );
};

export default MemberList; 