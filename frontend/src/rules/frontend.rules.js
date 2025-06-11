/**
 * 前端规则配置
 */

// 用户角色配置
export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
  SYSADMIN: 'sysadmin'
};

// 用户角色显示名称
export const USER_ROLE_NAMES = {
  [USER_ROLES.STUDENT]: '学生',
  [USER_ROLES.TEACHER]: '老师',
  [USER_ROLES.ADMIN]: '教务',
  [USER_ROLES.SYSADMIN]: '系统管理员'
};

// 用户角色权限配置
export const USER_ROLE_PERMISSIONS = {
  [USER_ROLES.STUDENT]: ['chat', 'knowledge', 'cloud'],
  [USER_ROLES.TEACHER]: ['chat', 'knowledge', 'cloud', 'student_manage'],
  [USER_ROLES.ADMIN]: ['chat', 'knowledge', 'cloud', 'student_manage', 'system_config'],
  [USER_ROLES.SYSADMIN]: ['*']
};

// 大模型配置
export const AI_MODELS = {
  OPENAI: 'openai',
  DEEPSEEK: 'deepseek',
  GEMINI: 'gemini',
  QWEN: 'qwen',
  MOONSHOT: 'moonshot'
};

// 大模型显示名称
export const AI_MODEL_NAMES = {
  [AI_MODELS.OPENAI]: 'OpenAI',
  [AI_MODELS.DEEPSEEK]: 'Deepseek',
  [AI_MODELS.GEMINI]: 'Gemini',
  [AI_MODELS.QWEN]: '通义千问',
  [AI_MODELS.MOONSHOT]: 'Moonshot'
};

// 知识库类型配置
export const KNOWLEDGE_TYPES = {
  DOC: 'doc',
  XLS: 'xls'
};

// 知识库类型显示名称
export const KNOWLEDGE_TYPE_NAMES = {
  [KNOWLEDGE_TYPES.DOC]: '文档',
  [KNOWLEDGE_TYPES.XLS]: '表格'
};

// 本地存储键名配置
export const STORAGE_KEYS = {
  CHAT_CONVERSATIONS: 'ai_chat_conversations_v1',
  CHAT_CURRENT_ID: 'ai_chat_current_id_v1',
  CHAT_MODEL: 'ai_chat_model_v1',
  CHAT_KB: 'ai_chat_kb_v1',
  CHAT_SIDEBAR: 'ai_chat_sidebar_v1',
  USER_TOKEN: 'user_token',
  USER_INFO: 'user_info'
};

// 文件上传限制
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['.doc', '.docx', '.pdf', '.txt', '.xls', '.xlsx'],
  MAX_FILES_PER_UPLOAD: 10
};

// 聊天配置
export const CHAT_CONFIG = {
  MAX_PROMPT_LENGTH: 2000,
  MAX_HISTORY_LENGTH: 50,
  STREAM_TIMEOUT: 30000, // 30秒
  RETRY_TIMES: 3,
  RETRY_DELAY: 1000 // 1秒
};

// API请求配置
export const API_CONFIG = {
  TIMEOUT: 30000, // 30秒
  RETRY_TIMES: 3,
  RETRY_DELAY: 1000, // 1秒
  BASE_URL: '/api'
};

// 界面配置
export const UI_CONFIG = {
  THEME: {
    LIGHT: 'light',
    DARK: 'dark'
  },
  LAYOUT: {
    SIDEBAR_WIDTH: 270,
    SIDEBAR_COLLAPSED_WIDTH: 56,
    HEADER_HEIGHT: 64,
    FOOTER_HEIGHT: 48
  },
  RESPONSIVE: {
    MOBILE: 576,
    TABLET: 768,
    DESKTOP: 992,
    LARGE_DESKTOP: 1200
  }
};

// 错误码配置
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR'
};

// 错误消息配置
export const ERROR_MESSAGES = {
  [ERROR_CODES.NETWORK_ERROR]: '网络连接失败，请检查网络设置',
  [ERROR_CODES.TIMEOUT_ERROR]: '请求超时，请稍后重试',
  [ERROR_CODES.AUTH_ERROR]: '登录已过期，请重新登录',
  [ERROR_CODES.PERMISSION_ERROR]: '没有操作权限',
  [ERROR_CODES.VALIDATION_ERROR]: '输入数据有误，请检查',
  [ERROR_CODES.SERVER_ERROR]: '服务器错误，请稍后重试'
};

// 默认配置
export const DEFAULT_CONFIG = {
  MODEL: AI_MODELS.OPENAI,
  KNOWLEDGE_TYPE: KNOWLEDGE_TYPES.DOC,
  THEME: UI_CONFIG.THEME.LIGHT,
  LANGUAGE: 'zh-CN'
};

// 导出所有规则
export default {
  USER_ROLES,
  USER_ROLE_NAMES,
  USER_ROLE_PERMISSIONS,
  AI_MODELS,
  AI_MODEL_NAMES,
  KNOWLEDGE_TYPES,
  KNOWLEDGE_TYPE_NAMES,
  STORAGE_KEYS,
  UPLOAD_LIMITS,
  CHAT_CONFIG,
  API_CONFIG,
  UI_CONFIG,
  ERROR_CODES,
  ERROR_MESSAGES,
  DEFAULT_CONFIG
}; 