"""
后端规则配置
"""

# 用户角色配置
USER_ROLES = {
    'STUDENT': 'student',
    'TEACHER': 'teacher',
    'ADMIN': 'admin',
    'SYSADMIN': 'sysadmin'
}

# 用户角色显示名称
USER_ROLE_NAMES = {
    USER_ROLES['STUDENT']: '学生',
    USER_ROLES['TEACHER']: '老师',
    USER_ROLES['ADMIN']: '教务',
    USER_ROLES['SYSADMIN']: '系统管理员'
}

# 用户角色权限配置
USER_ROLE_PERMISSIONS = {
    USER_ROLES['STUDENT']: ['chat', 'knowledge', 'cloud'],
    USER_ROLES['TEACHER']: ['chat', 'knowledge', 'cloud', 'student_manage'],
    USER_ROLES['ADMIN']: ['chat', 'knowledge', 'cloud', 'student_manage', 'system_config'],
    USER_ROLES['SYSADMIN']: ['*']
}

# 大模型配置
AI_MODELS = {
    'OPENAI': 'openai',
    'DEEPSEEK': 'deepseek',
    'GEMINI': 'gemini',
    'QWEN': 'qwen',
    'MOONSHOT': 'moonshot'
}

# 大模型显示名称
AI_MODEL_NAMES = {
    AI_MODELS['OPENAI']: 'OpenAI',
    AI_MODELS['DEEPSEEK']: 'Deepseek',
    AI_MODELS['GEMINI']: 'Gemini',
    AI_MODELS['QWEN']: '通义千问',
    AI_MODELS['MOONSHOT']: 'Moonshot'
}

# 知识库类型配置
KNOWLEDGE_TYPES = {
    'DOC': 'doc',
    'XLS': 'xls'
}

# 知识库类型显示名称
KNOWLEDGE_TYPE_NAMES = {
    KNOWLEDGE_TYPES['DOC']: '文档',
    KNOWLEDGE_TYPES['XLS']: '表格'
}

# 文件上传限制
UPLOAD_LIMITS = {
    'MAX_FILE_SIZE': 10 * 1024 * 1024,  # 10MB
    'ALLOWED_FILE_TYPES': ['.doc', '.docx', '.pdf', '.txt', '.xls', '.xlsx'],
    'MAX_FILES_PER_UPLOAD': 10
}

# API配置
API_CONFIG = {
    'TIMEOUT': 30,  # 30秒
    'MAX_RETRIES': 3,
    'RETRY_DELAY': 1,  # 1秒
    'RATE_LIMIT': {
        'RATE': '100/h',  # 每小时100次请求
        'BLOCK_TIME': 3600  # 超出限制后封禁1小时
    }
}

# Token使用限制
TOKEN_LIMITS = {
    'MAX_TOKENS_PER_REQUEST': 4000,
    'MAX_TOKENS_PER_DAY': 100000,
    'MAX_TOKENS_PER_MONTH': 2000000
}

# 缓存配置
CACHE_CONFIG = {
    'DEFAULT_TIMEOUT': 300,  # 5分钟
    'MAX_ENTRIES': 1000,
    'CULL_FREQUENCY': 3
}

# 日志配置
LOG_CONFIG = {
    'MAX_BYTES': 10 * 1024 * 1024,  # 10MB
    'BACKUP_COUNT': 5,
    'FORMAT': '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
}

# 安全配置
SECURITY_CONFIG = {
    'PASSWORD_MIN_LENGTH': 8,
    'PASSWORD_MAX_LENGTH': 32,
    'PASSWORD_PATTERN': r'^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$',
    'TOKEN_EXPIRE_DAYS': 1,
    'REFRESH_TOKEN_EXPIRE_DAYS': 7,
    'MAX_LOGIN_ATTEMPTS': 5,
    'LOGIN_BLOCK_TIME': 1800  # 30分钟
}

# 错误码配置
ERROR_CODES = {
    'NETWORK_ERROR': 'NETWORK_ERROR',
    'TIMEOUT_ERROR': 'TIMEOUT_ERROR',
    'AUTH_ERROR': 'AUTH_ERROR',
    'PERMISSION_ERROR': 'PERMISSION_ERROR',
    'VALIDATION_ERROR': 'VALIDATION_ERROR',
    'SERVER_ERROR': 'SERVER_ERROR'
}

# 错误消息配置
ERROR_MESSAGES = {
    ERROR_CODES['NETWORK_ERROR']: '网络连接失败，请检查网络设置',
    ERROR_CODES['TIMEOUT_ERROR']: '请求超时，请稍后重试',
    ERROR_CODES['AUTH_ERROR']: '登录已过期，请重新登录',
    ERROR_CODES['PERMISSION_ERROR']: '没有操作权限',
    ERROR_CODES['VALIDATION_ERROR']: '输入数据有误，请检查',
    ERROR_CODES['SERVER_ERROR']: '服务器错误，请稍后重试'
}

# 默认配置
DEFAULT_CONFIG = {
    'MODEL': AI_MODELS['OPENAI'],
    'KNOWLEDGE_TYPE': KNOWLEDGE_TYPES['DOC'],
    'LANGUAGE': 'zh-CN'
}

# 导出所有规则
__all__ = [
    'USER_ROLES',
    'USER_ROLE_NAMES',
    'USER_ROLE_PERMISSIONS',
    'AI_MODELS',
    'AI_MODEL_NAMES',
    'KNOWLEDGE_TYPES',
    'KNOWLEDGE_TYPE_NAMES',
    'UPLOAD_LIMITS',
    'API_CONFIG',
    'TOKEN_LIMITS',
    'CACHE_CONFIG',
    'LOG_CONFIG',
    'SECURITY_CONFIG',
    'ERROR_CODES',
    'ERROR_MESSAGES',
    'DEFAULT_CONFIG'
] 