export interface Project {
  cat: string;
  tag: 'work' | 'academic' | 'personal';
  name: string;
  role: string;
  result: string;
  star: { bg: string; role: string; solve: string; result: string };
  techs: string[];
}

export const projects: Project[] = [
  {
    cat: '工作项目', tag: 'work',
    name: '某大型电商平台测试体系建设', role: '测试主管', result: '覆盖率从30%→80%，发版周期缩短50%',
    star: {
      bg: '引入质量体系前，团队测试覆盖率低、发版失控，缺陷逃逸率高。',
      role: '主导整个测试团队转型，负责体系规划与推动落地。',
      solve: '建立用例分层体系 + 自动化金字塔 + AI辅助生成，推动全员参与质量度量。',
      result: '自动化覆盖率从30%到80%，缺陷逃逸率下降60%，发版周期缩短50%。',
    },
    techs: ['Pytest', 'Jenkins', 'AI测试', 'Python'],
  },
  {
    cat: '工作项目', tag: 'work',
    name: '接口自动化框架重构', role: '高级测试工程师', result: '误报率降低40%，维护成本减半',
    star: {
      bg: '原有框架维护成本高，接口变更后用例大面积失效，误报率超30%。',
      role: '独立负责框架设计与重构，兼顾日常测试执行。',
      solve: '引入 AI 自动识别接口变更模块，重构数据驱动层，接入 CI 流水线。',
      result: '误报率从30%降至18%，用例维护时间减少50%，框架被全团队采用。',
    },
    techs: ['Python', 'FastAPI Mock', 'OpenAI API', 'Jenkins'],
  },
  {
    cat: '学术项目', tag: 'academic',
    name: '研究生技术开发类竞赛项目', role: '项目负责人', result: '获奖（待填写具体奖项）',
    star: {
      bg: '研究生期间参与XX类竞赛，需要在有限时间内完成技术方案设计与实现。',
      role: '担任项目负责人，负责整体方案设计与核心模块开发。',
      solve: '设计并实现了（待填写技术方案），解决了（待填写核心问题）。',
      result: '获得（待填写奖项），方案被（待填写评价）。',
    },
    techs: ['待填写'],
  },
  {
    cat: '个人项目', tag: 'personal',
    name: '个人测试工具站', role: '独立开发者', result: '日均 UV 500+',
    star: {
      bg: '日常测试中积累了大量工具脚本，希望系统化整合并对外分享。',
      role: '独立完成产品设计、前后端开发、部署运维全链路。',
      solve: '用 Python + FastAPI 搭建后端，React 前端，接入 AI 能力实现智能接口调试。',
      result: '上线后持续迭代，日均 UV 500+，收到多位测试工程师正向反馈。',
    },
    techs: ['React', 'Python', 'FastAPI', 'Docker'],
  },
];

export interface AiSkill {
  icon: string;
  title: string;
  tag: string;
  status: string;
  statusBg: string;
  statusClr: string;
  statusBdr: string;
  desc: string;
  techs: string[];
}

export const aiSkills: AiSkill[] = [
  {
    icon: '🧪', title: 'AI 生成用例 Skill', tag: '测试效率',
    status: '已落地', statusBg: 'var(--green-lt)', statusClr: 'var(--green)', statusBdr: 'oklch(82% .1 152)',
    desc: '结合 LLM 大模型，根据需求文档自动生成测试用例，支持边界值、等价类、异常场景全覆盖，较人工提效 60%+。',
    techs: ['GPT-4o', 'Python', 'Pytest', 'Prompt Engineering'],
  },
  {
    icon: '🔧', title: '接口自动化维护 Skill', tag: '自动化',
    status: '已落地', statusBg: 'var(--green-lt)', statusClr: 'var(--green)', statusBdr: 'oklch(82% .1 152)',
    desc: 'AI 自动识别接口变更，智能修复断言与请求参数，大幅降低自动化用例维护成本，减少误报率 40%+。',
    techs: ['OpenAI API', 'Postman', 'Jenkins', 'Python'],
  },
  {
    icon: '📊', title: '测试报告生成 Skill', tag: '报告',
    status: '已落地', statusBg: 'var(--green-lt)', statusClr: 'var(--green)', statusBdr: 'oklch(82% .1 152)',
    desc: '自动聚合测试数据，通过 AI 生成具有分析结论、风险提示、改进建议的专业测试报告，支持 PDF/HTML 导出。',
    techs: ['LangChain', 'Jinja2', 'WeasyPrint', 'Python'],
  },
  {
    icon: '🔍', title: '缺陷智能分析 Skill', tag: '质量',
    status: '探索中', statusBg: 'var(--amber-lt)', statusClr: 'var(--amber)', statusBdr: 'oklch(85% .1 82)',
    desc: '通过 AI 对历史缺陷数据进行聚类分析，识别高频缺陷模式，为测试策略优化提供数据驱动的决策支持。',
    techs: ['OpenAI', 'Pandas', 'Sklearn', 'Streamlit'],
  },
];

export interface Honor {
  year: string;
  month: string;
  cat: 'work' | 'school' | 'cert';
  event: string;
  place: string;
  desc: string;
  location: string;
  hasImg: boolean;
}

export const honors: Honor[] = [
  { year: '2024', month: '08', cat: 'work',   event: '年度优秀员工',         place: '年度荣誉',         desc: '在所在公司荣获年度优秀员工称号，表彰在 AI 辅助测试落地与团队建设方面的突出贡献。', location: '公司内部', hasImg: true },
  { year: '2023', month: '11', cat: 'work',   event: '季度最佳技术实践奖',   place: '季度荣誉',         desc: '主导自动化测试框架升级项目，显著提升测试效率，获公司季度技术创新奖。',           location: '公司内部', hasImg: true },
  { year: '2023', month: '05', cat: 'cert',   event: 'ISTQB 高级测试分析师', place: '国际认证',         desc: '通过 ISTQB Advanced Level Test Analyst 国际认证考试，全球认可的测试专业资质。',  location: '线上',    hasImg: false },
  { year: '2022', month: '09', cat: 'school', event: '研究生技术开发类竞赛',  place: '一等奖（待填写）', desc: '参加XX类技术开发比赛，荣获（待填写奖项）。',                                       location: '待填写',  hasImg: true },
  { year: '2021', month: '06', cat: 'school', event: '研究生学术竞赛',        place: '获奖（待填写）',   desc: '参加XX学术竞赛，荣获（待填写奖项）。',                                           location: '待填写',  hasImg: true },
];

export interface BlogPost {
  title: string;
  date: string;
  readMin: number;
  tags: string[];
  summary: string;
}

export const blogPosts: BlogPost[] = [
  { title: '如何用 AI 生成高质量测试用例：从 Prompt 到落地', date: '2026-09-15', readMin: 8, tags: ['AI测试', 'Prompt工程', '用例设计'], summary: '分享从需求文档自动生成测试用例的完整 Prompt 工程实践，包含边界值、异常场景的设计策略。' },
  { title: '接口自动化框架的三层架构设计与 AI 维护实践',   date: '2026-08-20', readMin: 12, tags: ['自动化', '架构设计', 'Python'],   summary: '拆解一套经过三个团队验证的接口自动化分层架构，以及接入 AI 后如何实现智能变更识别。' },
  { title: '测试主管的团队建设心得：从执行到管理',         date: '2026-07-10', readMin: 6,  tags: ['团队管理', '职业成长'],            summary: '从测试工程师到测试主管，关于团队氛围、绩效量化、1on1 的实战经验分享。' },
  { title: 'JMeter 性能测试：从脚本到监控全链路实践',      date: '2026-06-05', readMin: 10, tags: ['性能测试', 'JMeter', '监控'],      summary: '一次完整的性能测试项目复盘：压测脚本设计、环境隔离、瓶颈定位到报告输出。' },
  { title: '安全测试入门：测试工程师的视角',               date: '2026-05-01', readMin: 7,  tags: ['安全测试', '渗透测试', 'OWASP'],   summary: '从功能测试跨界安全测试的学习路径，OWASP Top 10 实战演练与工具链介绍。' },
];

export interface HubContact {
  icon: string;
  key: string;
  val: string;
  bar: string;
  bg: string;
  border: string;
  url: string | null;
}

export const hubContacts: HubContact[] = [
  { icon: '📱', key: '手机',  val: '138-XXXX-XXXX',        bar: 'var(--accent)', bg: 'var(--accent-lt)', border: 'var(--a-200)',              url: null },
  { icon: '📧', key: '邮箱',  val: 'your-name@example.com', bar: 'var(--green)',  bg: 'var(--green-lt)',  border: 'oklch(82% .1 152)',          url: 'mailto:your-name@example.com' },
  { icon: '🐙', key: 'GitHub',val: 'github.com/your-handle',  bar: 'var(--purple)', bg: 'var(--purple-lt)', border: 'oklch(85% .08 300)',         url: 'https://github.com/your-handle' },
  { icon: '💬', key: '公众号', val: '李运辰测试笔记',        bar: 'var(--amber)',  bg: 'var(--amber-lt)',  border: 'oklch(85% .1 82)',           url: '#' },
];

export const hubSites = [
  { icon: '🧪', name: '测试平台演示站', desc: '用例管理 · 报告 · AI辅助', url: '#', bar: 'var(--accent)' },
  { icon: '⚙️', name: '自动化工具站',   desc: '接口调试 · 数据构造',      url: '#', bar: 'var(--green)' },
  { icon: '✍️', name: '技术博客',       desc: '测试工程 · AI 实践',       url: '#', bar: 'var(--purple)' },
  { icon: '🏠', name: '个人网站',       desc: '本站 · 求职展示',           url: '#', bar: 'var(--amber)' },
];

export const stats = [
  { num: '10+', label: '年测试经验' },
  { num: '30+', label: '交付项目' },
  { num: '80%', label: '自动化覆盖率' },
  { num: '60%', label: 'AI提效幅度' },
  { num: '5+',  label: '荣誉奖项' },
];

export const overviews = [
  { icon: '🧪', title: '测试专家',    desc: '主导测试体系建设，覆盖功能/性能/安全多维度',     color: 'var(--accent)', border: 'var(--accent)', bg: 'var(--accent-lt)' },
  { icon: '🤖', title: 'AI 测试先行', desc: 'AI生成用例、自动化维护、报告生成三大落地技能',   color: 'var(--green)',  border: 'var(--green)',  bg: 'var(--green-lt)' },
  { icon: '🏆', title: '多项荣誉',    desc: '在校比赛获奖 + 工作优秀员工，点击荣誉墙查看',   color: 'var(--amber)',  border: 'var(--amber)',  bg: 'var(--amber-lt)' },
  { icon: '🌐', title: '多个项目',    desc: '工作测试项目、学术项目、个人站点全覆盖',         color: 'var(--purple)', border: 'var(--purple)', bg: 'var(--purple-lt)' },
];
