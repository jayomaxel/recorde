# PROJECT_DOCUMENTATION

## 1. 项目概述
`Ethereal Notes` 是一个 Local-first 的前端思绪记录应用，当前定位是：
- 快速记录文本思绪。
- 在启用 AI 后，对单条记录生成 `mood + tags`。
- 基于历史记录生成“心境趋势 + 深度分析”。
- 默认仅使用浏览器本地存储（`localStorage`），无自有后端账号系统。

当前形态为单页应用（SPA），运行端口为 `3002`（开发环境）。

## 2. 技术栈
- 框架：React 19 + Vite 6
- 语言：TypeScript
- 样式：Tailwind CSS + PostCSS
- 图标：Lucide React
- PDF 导出：jsPDF
- 持久化：`localStorage`
- AI 接入：Gemini Native / OpenAI 兼容接口（`fetch`）

## 3. 目录结构
```text
recorde/
├── App.tsx
├── types.ts
├── services/
│   ├── storage.ts
│   └── gemini.ts
├── components/
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   └── templates/
├── public/
│   ├── favicon.svg
│   └── favicon.ico
├── index.html
├── index.css
├── tailwind.config.js
├── vite.config.ts
├── PROJECT_DOCUMENTATION.md
└── PROJECT_DEEP_DIVE.md
```

## 4. 核心功能
### 4.1 首次引导（Onboarding）
- 首次启动读取 `ethereal_settings_v2`。
- 未初始化时进入 `OnboardingModal`，要求填写昵称、ID、邮箱、4 位 PIN。
- 强制勾选风险确认（忘记 PIN 无法找回）。

### 4.2 隐私锁屏
- 若存在 `passwordHash`，应用启动先进入 `PrivacyLock`。
- 支持 PIN 键盘和手动输入两种解锁模式。
- 提供“重置应用”流程：清空本地数据后 `window.location.reload()`。

### 4.3 思绪管理
- 新建/编辑/删除记录。
- 收藏切换与收藏筛选。
- 搜索支持内容和标签匹配。
- 标签来源：优先 AI 返回，其次原有标签，再次内容回退提取。

### 4.4 随机漫游
- `RandomExplorer` 提供卡片轨道浏览。
- 支持上一条/下一条/随机抽取。

### 4.5 趋势与深度分析
- `MoodAnalytics` 统计 `mood` 分布并计算主导情绪。
- `streamDeepInsight` 流式输出三段分析文本。

### 4.6 设置与数据管理
- 账户信息：昵称、头像、PIN 变更。
- AI 配置：`API Key`、`Base URL`、`Model`、连通性测试。
- 数据操作：JSON 导出、PDF 导出、清空本地记录。

## 5. AI 流程设计
### 5.1 单条分析 `analyzeThought`
- 输入：思绪文本。
- 输出：`{ mood, tags }`。
- 约束：强制 JSON 输出，`mood` 归一到固定枚举。
- 协议：
  - Gemini Native：`generateContent`
  - OpenAI 兼容：`chat/completions` + `response_format: json_object`

### 5.2 人格风格 `aiPersonality`
- `aiPersonality` 已接入 prompt 策略，不再是摆设字段。
- 选项：`philosophical | poetic | concise`
- 影响范围：
  - 单条情绪分析提示词风格
  - 深度分析提示词风格

### 5.3 连通性测试 `testApiConnection`
- 发送最小请求（`hi`）验证 `apiKey/baseUrl/model`。
- 返回统一结构：`{ success: boolean, message?: string }`。

### 5.4 深度分析 `streamDeepInsight`
- 输入：最近最多 30 条记录内容。
- 输出：流式文本增量。
- 支持协议：
  - Gemini Native：`streamGenerateContent?alt=sse`
  - OpenAI 兼容：SSE 风格 `chat/completions` 流
- 显示清洗：移除 `*` 避免 markdown 污染 UI。

## 6. 数据模型与存储
### 6.1 Thought（运行时）
```ts
{
  id: string;
  content: string;
  createdAt: string;      // ISO
  updatedAt?: string;
  tags: string[];
  aiInsight?: string;
  summary?: string;
  mood?: string;
  isFavorite?: boolean;
}
```

### 6.2 AIAnalysisResult
```ts
{
  mood: string;
  tags?: string[];
}
```

### 6.3 UserSettings（运行时）
```ts
{
  userId: string;
  userName: string;
  email?: string;
  passwordHash?: string;
  avatarUrl: string;
  isInitialized: boolean;
  isAiEnabled: boolean;
  aiPersonality: 'philosophical' | 'poetic' | 'concise';
  showMoodTrends: boolean;
  apiKey?: string;
  apiBaseUrl?: string;
  customModel?: string;
}
```

### 6.4 LocalStorage Key
- `ethereal_notes_v2`：记录数组（可能为加密串）
- `ethereal_settings_v2`：用户设置

## 7. 安全与隐私边界（当前实现）
### 7.1 已实现
- 不再存储明文密码，改为 `passwordHash`。
- 运行时会话密码仅保存在内存变量（`sessionPassword`）。
- 思绪数据与 API Key 支持本地轻量加密（`enc:v1:` 前缀）。
- 锁屏页提供“忘记密码 -> 重置应用”闭环。

### 7.2 关键事实（必须对外明确）
- 当前哈希为轻量 FNV1a 方案，非强密码学哈希。
- 当前“加密”是基于 XOR + salt 的轻量方案，非企业级标准加密。
- 无找回机制：忘记 PIN 将导致历史加密数据不可恢复。
- 启用 AI 后，用户输入会发送到用户配置的第三方模型服务。

### 7.3 开发环境注意
- `index.html` 中存在本地开发自动初始化脚本（便于快速调试）。
- 生产部署前建议移除此脚本，避免环境行为不一致。

## 8. 工程与兼容性修复（2026-03-03）
- 开发端口统一为 `3002`（`vite.config.ts` + `start-ethereal.bat`）。
- 已补 `favicon.svg` + `favicon.ico`，避免 `/favicon.ico` 404。
- 已补可访问性：
  - icon-only 按钮增加 `aria-label/title`
  - 关键输入框补齐 `id/name`
- CSS 兼容性增强：
  - `text-size-adjust` / `-webkit-text-size-adjust`
  - `-webkit-backdrop-filter` 兼容 Safari
- Vite dev/preview 响应头增强：
  - `X-Content-Type-Options: nosniff`
  - 优先 `Cache-Control`，去除 `Expires`
  - 去除 `X-XSS-Protection`
  - 常见静态资源 `Content-Type` + `charset=utf-8` 归一化

## 9. 运行与构建
```bash
npm install
npm run dev
npm run build
npm run preview
```

本地验证（2026-03-03）：
- `npm run build` 成功。
- Tailwind `content` 扫描范围已收敛（不再误扫 `node_modules`）。
- 主入口 chunk 已降至 `< 500kB`。

## 10. 已知问题与技术债
- 密码变更会触发全量本地重加密，当前在主线程执行；大体量数据存在 UI 卡顿风险（未使用 Web Worker）。
- 深度分析仅按“最多 30 条”控制上下文，尚未做 token 估算与按 token 截断。
- 加密/哈希方案仍属轻量实现，距离高安全等级存在差距。
- AI 链路缺少更完整的重试、断路、可观测错误码。

## 11. 后续建议
1. 升级到标准密码学方案（AES-GCM + PBKDF2/Argon2）。
2. 对密码变更重加密流程引入 Web Worker，降低主线程阻塞。
3. 为深度分析增加 token 预算器和截断策略。
4. 增加 AI 调用超时、重试与结构化错误码。
