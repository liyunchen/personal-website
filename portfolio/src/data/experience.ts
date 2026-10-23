export interface ExpItem {
  type: 'work' | 'edu';
  time: string;
  dot: 'accent' | 'edu';
  org: string;
  role: string;
  achievement: string;
  tags: string[];
}

export const expItems: ExpItem[] = [
  {
    type: 'work',
    time: '2022.06 – 至今',
    dot: 'accent',
    org: '广州钛动科技有限公司',
    role: '测试主管',
    achievement: '主导 AI 辅助测试体系落地，自动化覆盖率从30%提升至80%，带领测试团队完成多个核心业务线质量保障工作。',
    tags: ['测试管理', 'AI测试', '自动化'],
  },
  {
    type: 'work',
    time: '2019.03 – 2022.05',
    dot: 'accent',
    org: '某互联网科技公司',
    role: '高级测试工程师',
    achievement: '主导接口自动化框架建设，推动 CI/CD 流水线落地，版本交付效率提升 40%。',
    tags: ['自动化', 'CI/CD', '接口测试'],
  },
  {
    type: 'edu',
    time: '2016 – 2019',
    dot: 'edu',
    org: '北京信息科技大学',
    role: '硕士研究生 · 软件工程',
    achievement: '研究方向：软件质量与测试。参与多项技术开发类比赛并获奖，发表论文 X 篇。',
    tags: ['学术研究', '竞赛获奖'],
  },
  {
    type: 'work',
    time: '2014.07 – 2016.06',
    dot: 'accent',
    org: '某互联网公司',
    role: '测试工程师（实习/初级）',
    achievement: '独立负责移动端 App 功能/兼容性测试，熟悉敏捷开发流程，缺陷发现率行业前10%。',
    tags: ['功能测试', '移动端', '敏捷'],
  },
  {
    type: 'edu',
    time: '2012 – 2016',
    dot: 'edu',
    org: '北京信息科技大学',
    role: '本科 · 计算机科学与技术',
    achievement: '打下扎实的计算机基础，开始接触软件测试领域，参加校级编程竞赛获奖。',
    tags: ['本科', '计算机基础'],
  },
];

export interface AbilityGroup {
  icon: string;
  title: string;
  color: string;
  bg: string;
  items: { name: string; level: number; label: string }[];
}

export const abilityGroups: AbilityGroup[] = [
  {
    icon: '🧪', title: '测试管理', color: 'var(--accent)', bg: 'var(--accent-lt)',
    items: [
      { name: '测试体系建设', level: 95, label: '专家' },
      { name: '团队管理',     level: 90, label: '专家' },
      { name: '质量度量',     level: 85, label: '熟练' },
      { name: '测试策略',     level: 92, label: '专家' },
    ],
  },
  {
    icon: '🤖', title: 'AI 测试', color: 'var(--green)', bg: 'var(--green-lt)',
    items: [
      { name: 'AI 用例生成',  level: 88, label: '熟练' },
      { name: '接口AI维护',   level: 82, label: '熟练' },
      { name: '报告智能生成', level: 85, label: '熟练' },
      { name: 'Prompt 工程', level: 80, label: '熟练' },
    ],
  },
  {
    icon: '⚙️', title: '自动化', color: 'var(--purple)', bg: 'var(--purple-lt)',
    items: [
      { name: 'Pytest / Python', level: 90, label: '专家' },
      { name: 'Selenium/Appium', level: 85, label: '熟练' },
      { name: '接口自动化',     level: 92, label: '专家' },
      { name: 'CI/CD 集成',    level: 80, label: '熟练' },
    ],
  },
  {
    icon: '📊', title: '性能 & 安全', color: 'var(--amber)', bg: 'var(--amber-lt)',
    items: [
      { name: 'JMeter',      level: 80, label: '熟练' },
      { name: '性能调优分析', level: 75, label: '掌握' },
      { name: '安全测试基础', level: 65, label: '了解' },
    ],
  },
];
