# 项目详细文档：Ethereal Notes (极简思维日记)

## 1. 项目概览与设计哲学
**Ethereal Notes** 是一款专为个人反思设计的极简主义、AI 赋能的思维日记应用。其核心哲学是“隐私至上，AI 辅助的内在成长”。它提供了一个“无干扰”的环境，通过高端的衬线体美学（磨砂玻璃感 + 现代衬线体）捕捉转瞬即逝的想法。

## 2. 技术栈
- **框架**: React 19 (Vite)
- **语言**: TypeScript
- **样式**: Tailwind CSS (已集成 PostCSS)
- **AI**: Google Gemini Pro (通过 `@google/genai`)
- **图标**: Lucide React
- **存储**: 浏览器本地存储 (LocalStorage)
- **PDF 导出**: jsPDF

## 3. 项目结构概览
```text
recorde-1/
├── components/           # 组件目录
│   ├── Editor.tsx           # 编辑器：写作界面，触发 AI 分析
│   ├── Layout.tsx           # 布局：侧边栏导航、顶部栏、搜索
│   ├── OnboardingModal.tsx  # 入门引导：首次运行的用户设置
│   ├── PrivacyLock.tsx      # 隐私锁：基于 PIN 码的安全屏幕
│   ├── SettingsModal.tsx    # 设置：AI 配置、个人资料编辑、数据导出 (JSON/PDF)
│   └── ThoughtCard.tsx      # 思绪卡片：单条思绪的展示卡片
├── services/             # 服务层
│   ├── gemini.ts            # Gemini API 封装：情感分析逻辑
│   └── storage.ts           # 存储服务：LocalStorage 的增删改查
├── App.tsx                  # 根组件：状态编排与全局逻辑
├── types.ts                 # 类型定义：TypeScript 接口
├── index.html               # 入口 HTML
├── index.css                # 全局样式与 Tailwind 指令
└── vite.config.ts           # Vite 配置文件
```

## 4. 核心功能分析
### 🖋️ 极简编辑器
- 聚焦式布局，减少干扰。
- 手动情绪选择（可选）。
- 保存时自动触发 AI 情绪识别。

### 🧠 AI 核心 (Gemini)
- 思绪内容的情感分析。
- 心境趋势图谱映射。
- 支持自定义 API 代理地址和模型 ID。

### 🔒 隐私与安全
- 100% 本地数据存储，不上传服务器。
- 可选的访问密码 (PIN) 保护。
- 本地个人资料管理。

### 📊 数据管理
- 导出为 JSON (用于备份与迁移)。
- 导出为 PDF (用于日志留存或分享)。
- 危险区域：一键清空所有数据。

## 5. 数据模型
```typescript
interface Thought {
  id: string;
  content: string;
  createdAt: number;
  mood?: string;       // Calm, Happy, Anxious, Inspired, Reflective
  isFavorite?: boolean;
  tags: string[];
}

interface UserSettings {
  userName: string;
  isInitialized: boolean;
  isAiEnabled: boolean;
  apiKey?: string;
  password?: string;   // 访问密码 PIN
}
```
