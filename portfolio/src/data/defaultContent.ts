import type { SiteContent } from '../types/content'

/**
 * 默认内容 —— 同时用于：
 * 1. 首次访问时云端无数据的降级展示
 * 2. 后台「恢复默认内容」功能
 * 与 types/content.ts 的模型保持一致。
 */
export const defaultContent: SiteContent = {
  profile: {
    name: '李运辰',
    headline: '欢迎访问，',
    roles: '测试主管· 测试经理 · 测试专家 · AI测试工程师',
    intro: '专注于互联网产品质量保障，擅长测试体系建设、AI辅助测试落地、自动化框架研发。用 AI 重新定义测试效率。',
    avatar: '/avatar.jpg',
    codeCard: {
      exp: '10年+',
      focus: ['AI辅助测试', '自动化框架', '质量体系建设', '团队管理'],
      open: true,
    },
    seoDescription:
      '李运辰 · 测试主管 / 测试经理 / 测试专家 / AI测试工程师，专注测试体系建设、AI 辅助测试落地与自动化框架研发。',
  },

  experiences: [
    {
      id: 'exp-1',
      order: 1,
      type: 'work',
      time: '2022.06 – 至今',
      org: '广州钛动科技有限公司',
      role: '测试主管',
      achievement: '主导 AI 辅助测试体系落地，自动化覆盖率从 30% 提升至 80%，带领测试团队完成多个核心业务线质量保障工作。',
      tags: ['测试管理', 'AI测试', '自动化'],
    },
    {
      id: 'exp-2',
      order: 2,
      type: 'work',
      time: '2019.03 – 2022.05',
      org: '某互联网科技公司',
      role: '高级测试工程师',
      achievement: '主导接口自动化框架建设，推动 CI/CD 流水线落地，版本交付效率提升 40%。',
      tags: ['自动化', 'CI/CD', '接口测试'],
    },
    {
      id: 'exp-3',
      order: 3,
      type: 'edu',
      time: '2016 – 2019',
      org: '北京信息科技大学',
      role: '硕士研究生 · 软件工程',
      achievement: '研究方向：软件质量与测试。参与多项技术开发类比赛并获奖，发表论文若干。',
      tags: ['学术研究', '竞赛获奖'],
    },
    {
      id: 'exp-4',
      order: 4,
      type: 'work',
      time: '2014.07 – 2016.06',
      org: '某互联网公司',
      role: '测试工程师',
      achievement: '独立负责移动端 App 功能/兼容性测试，熟悉敏捷开发流程，缺陷发现率行业前10%。',
      tags: ['功能测试', '移动端', '敏捷'],
    },
    {
      id: 'exp-5',
      order: 5,
      type: 'edu',
      time: '2012 – 2016',
      org: '北京信息科技大学',
      role: '本科 · 计算机科学与技术',
      achievement: '打下扎实的计算机基础，开始接触软件测试领域，参加校级编程竞赛获奖。',
      tags: ['本科', '计算机基础'],
    },
  ],

  abilities: [
    { id: 'ab-1', order: 1, group: '测试管理', name: '测试体系建设', level: 95, label: '专家' },
    { id: 'ab-2', order: 2, group: '测试管理', name: '团队管理', level: 90, label: '专家' },
    { id: 'ab-3', order: 3, group: '测试管理', name: '质量度量', level: 85, label: '熟练' },
    { id: 'ab-4', order: 4, group: '测试管理', name: '测试策略', level: 92, label: '专家' },
    { id: 'ab-5', order: 5, group: 'AI 测试', name: 'AI 用例生成', level: 88, label: '熟练' },
    { id: 'ab-6', order: 6, group: 'AI 测试', name: '接口 AI 维护', level: 82, label: '熟练' },
    { id: 'ab-7', order: 7, group: 'AI 测试', name: '报告智能生成', level: 85, label: '熟练' },
    { id: 'ab-8', order: 8, group: 'AI 测试', name: 'Prompt 工程', level: 80, label: '熟练' },
    { id: 'ab-9', order: 9, group: '自动化', name: 'Pytest / Python', level: 90, label: '专家' },
    { id: 'ab-10', order: 10, group: '自动化', name: 'Selenium / Appium', level: 85, label: '熟练' },
    { id: 'ab-11', order: 11, group: '自动化', name: '接口自动化', level: 92, label: '专家' },
    { id: 'ab-12', order: 12, group: '自动化', name: 'CI/CD 集成', level: 80, label: '熟练' },
    { id: 'ab-13', order: 13, group: '性能 & 安全', name: 'JMeter', level: 80, label: '熟练' },
    { id: 'ab-14', order: 14, group: '性能 & 安全', name: '性能调优分析', level: 75, label: '掌握' },
    { id: 'ab-15', order: 15, group: '性能 & 安全', name: '安全测试基础', level: 65, label: '了解' },
  ],

  projects: [
    {
      id: 'pr-1',
      order: 1,
      category: 'work',
      name: '某大型电商平台测试体系建设',
      role: '测试主管',
      result: '覆盖率从 30%→80%，发版周期缩短 50%',
      techs: ['Pytest', 'Jenkins', 'AI测试', 'Python'],
      cover: '',
      star: {
        bg: '引入质量体系前，团队测试覆盖率低、发版失控，缺陷逃逸率高。',
        role: '主导整个测试团队转型，负责体系规划与推动落地。',
        solve: '建立用例分层体系 + 自动化金字塔 + AI 辅助生成，推动全员参与质量度量。',
        result: '自动化覆盖率从 30% 到 80%，缺陷逃逸率下降 60%，发版周期缩短 50%。',
      },
    },
    {
      id: 'pr-2',
      order: 2,
      category: 'work',
      name: '接口自动化框架重构',
      role: '高级测试工程师',
      result: '误报率降低 40%，维护成本减半',
      techs: ['Python', 'FastAPI Mock', 'OpenAI API', 'Jenkins'],
      cover: '',
      star: {
        bg: '原有框架维护成本高，接口变更后用例大面积失效，误报率超 30%。',
        role: '独立负责框架设计与重构，兼顾日常测试执行。',
        solve: '引入 AI 自动识别接口变更模块，重构数据驱动层，接入 CI 流水线。',
        result: '误报率从 30% 降至 18%，用例维护时间减少 50%，框架被全团队采用。',
      },
    },
    {
      id: 'pr-3',
      order: 3,
      category: 'academic',
      name: '研究生技术开发类竞赛项目',
      role: '项目负责人',
      result: '获奖',
      techs: ['待填写'],
      cover: '',
      star: {
        bg: '研究生期间参与技术类竞赛，需要在有限时间内完成技术方案设计与实现。',
        role: '担任项目负责人，负责整体方案设计与核心模块开发。',
        solve: '设计方案与核心实现（待补充）。',
        result: '获得奖项（待补充）。',
      },
    },
    {
      id: 'pr-4',
      order: 4,
      category: 'personal',
      name: '个人测试工具站',
      role: '独立开发者',
      result: '日均 UV 500+',
      techs: ['React', 'Python', 'FastAPI', 'Docker'],
      cover: '',
      star: {
        bg: '日常测试中积累了大量工具脚本，希望系统化整合并对外分享。',
        role: '独立完成产品设计、前后端开发、部署运维全链路。',
        solve: '用 Python + FastAPI 搭建后端，React 前端，接入 AI 能力实现智能接口调试。',
        result: '上线后持续迭代，日均 UV 500+，收到多位测试工程师正向反馈。',
      },
    },
  ],

  aiSkills: [
    {
      id: 'ai-1',
      order: 1,
      icon: '🧪',
      title: 'AI 生成用例 Skill',
      tag: '测试效率',
      status: 'done',
      desc: '结合 LLM 大模型，根据需求文档自动生成测试用例，支持边界值、等价类、异常场景全覆盖，较人工提效 60%+。',
      techs: ['GPT-4o', 'Python', 'Pytest', 'Prompt Engineering'],
      cover: '',
      demoUrl: '',
      repoUrl: '',
    },
    {
      id: 'ai-2',
      order: 2,
      icon: '🔧',
      title: '接口自动化维护 Skill',
      tag: '自动化',
      status: 'done',
      desc: 'AI 自动识别接口变更，智能修复断言与请求参数，大幅降低自动化用例维护成本，减少误报率 40%+。',
      techs: ['OpenAI API', 'Postman', 'Jenkins', 'Python'],
      cover: '',
      demoUrl: '',
      repoUrl: '',
    },
    {
      id: 'ai-3',
      order: 3,
      icon: '📊',
      title: '测试报告生成 Skill',
      tag: '报告',
      status: 'done',
      desc: '自动聚合测试数据，通过 AI 生成具有分析结论、风险提示、改进建议的专业测试报告，支持 PDF/HTML 导出。',
      techs: ['LangChain', 'Jinja2', 'WeasyPrint', 'Python'],
      cover: '',
      demoUrl: '',
      repoUrl: '',
    },
    {
      id: 'ai-4',
      order: 4,
      icon: '🔍',
      title: '缺陷智能分析 Skill',
      tag: '质量',
      status: 'exploring',
      desc: '通过 AI 对历史缺陷数据进行聚类分析，识别高频缺陷模式，为测试策略优化提供数据驱动的决策支持。',
      techs: ['OpenAI', 'Pandas', 'Sklearn', 'Streamlit'],
      cover: '',
      demoUrl: '',
      repoUrl: '',
    },
  ],

  honors: [
    {
      id: 'ho-1',
      order: 1,
      category: 'work',
      date: '2024.08',
      event: '年度优秀员工',
      place: '年度荣誉',
      desc: '在所在公司荣获年度优秀员工称号，表彰在 AI 辅助测试落地与团队建设方面的突出贡献。',
      location: '公司内部',
      image: '',
    },
    {
      id: 'ho-2',
      order: 2,
      category: 'work',
      date: '2023.11',
      event: '季度最佳技术实践奖',
      place: '季度荣誉',
      desc: '主导自动化测试框架升级项目，显著提升测试效率，获公司季度技术创新奖。',
      location: '公司内部',
      image: '',
    },
    {
      id: 'ho-3',
      order: 3,
      category: 'cert',
      date: '2023.05',
      event: 'ISTQB 高级测试分析师',
      place: '国际认证',
      desc: '通过 ISTQB Advanced Level Test Analyst 国际认证考试，全球认可的测试专业资质。',
      location: '线上',
      image: '',
    },
    {
      id: 'ho-4',
      order: 4,
      category: 'school',
      date: '2022.09',
      event: '研究生技术开发类竞赛',
      place: '一等奖',
      desc: '参加技术开发类比赛，荣获一等奖。',
      location: '待填写',
      image: '',
    },
    {
      id: 'ho-5',
      order: 5,
      category: 'school',
      date: '2021.06',
      event: '研究生学术竞赛',
      place: '获奖',
      desc: '参加学术竞赛，荣获奖项。',
      location: '待填写',
      image: '',
    },
  ],

  posts: [
    {
      id: 'bl-1',
      order: 1,
      title: '如何用 AI 生成高质量测试用例：从 Prompt 到落地',
      date: '2026-09-15',
      readMin: 8,
      tags: ['AI测试', 'Prompt工程', '用例设计'],
      summary: '分享从需求文档自动生成测试用例的完整 Prompt 工程实践，包含边界值、异常场景的设计策略。',
      cover: '',
      sections: [
        { id: 's1', level: 2, title: '为什么用 AI 生成用例' },
        { id: 's2', level: 2, title: 'Prompt 设计三要素' },
        { id: 's3', level: 2, title: '边界值与异常场景的处理' },
        { id: 's4', level: 2, title: '质量验收标准' },
        { id: 's5', level: 2, title: '落地实践总结' },
      ],
      content: `<h2 id="s1">为什么用 AI 生成用例</h2>
<p>传统用例编写是测试团队最耗时的工作之一。一个中型功能模块，经验丰富的测试工程师往往需要 2-3 天完成用例设计，其中大量时间花在等价类划分、边界值计算这些可以被系统化的工作上。</p>
<p>引入 LLM 之后，这部分工作可以压缩到 2-3 小时：工程师专注于业务规则梳理和 Prompt 调优，AI 负责穷举和格式化。</p>
<div class="article-callout">核心结论：AI 擅长"已知规则的穷举"，测试工程师擅长"隐式规则的发现"。两者分工而非替代。</div>
<h2 id="s2">Prompt 设计三要素</h2>
<p>经过三个月的实践，我们总结出高质量用例 Prompt 的三个关键要素：</p>
<ul>
  <li><strong>角色设定</strong>：给 AI 一个明确的专业角色，如"资深测试工程师"，而不是让它扮演"助手"</li>
  <li><strong>需求上下文</strong>：提供完整的功能描述、业务规则、入参约束，避免 AI 凭想象补全</li>
  <li><strong>输出格式约束</strong>：明确要求用例 ID、用例名、前置条件、步骤、预期结果的结构</li>
</ul>
<pre><code>// 示例 Prompt 结构
你是一名资深测试工程师，请根据以下需求生成测试用例：

【功能描述】用户登录功能
【业务规则】
- 手机号格式：11位数字，1开头
- 密码：8-16位，包含字母和数字
- 连续失败5次锁定30分钟

请生成覆盖正常流程、边界值、异常场景的完整用例集。</code></pre>
<h2 id="s3">边界值与异常场景的处理</h2>
<p>AI 对显式规则的边界值处理非常好，但容易遗漏"组合异常"。例如密码正确但账号被锁定的场景，AI 通常不会主动生成，需要在 Prompt 中显式提示。</p>
<p>我们的解决方案是建立一个"场景检查清单"，在 Prompt 末尾附加：</p>
<ul>
  <li>权限异常：无权限、越权访问</li>
  <li>状态异常：账号冻结、数据已删除</li>
  <li>并发场景：同时操作同一资源</li>
  <li>网络异常：超时、断网重连</li>
</ul>
<h2 id="s4">质量验收标准</h2>
<p>AI 生成的用例必须经过三道验收才能入库：</p>
<ol>
  <li><strong>自动化校验</strong>：与需求矩阵对照，确认所有功能点都有对应用例</li>
  <li><strong>人工抽检</strong>：每批抽查 20%，重点检查边界值和异常场景的准确性</li>
  <li><strong>执行反馈闭环</strong>：记录 AI 用例在执行中发现的缺陷数，持续调优 Prompt</li>
</ol>
<div class="article-callout warn">⚠️ 注意：AI 对"隐式业务规则"的理解较弱，例如"VIP 用户享受不同逻辑"等场景务必人工补充。</div>
<h2 id="s5">落地实践总结</h2>
<p>经过三个迭代周期的实践，我们团队的用例编写效率提升了约 60%，同时首轮评审通过率从 72% 提升到 88%。</p>
<p>AI 生成用例不是替代测试工程师，而是把工程师从重复劳动中解放出来，专注于更有价值的测试设计和风险判断。</p>`,
    },
    {
      id: 'bl-2',
      order: 2,
      title: '接口自动化框架的三层架构设计与 AI 维护实践',
      date: '2026-08-20',
      readMin: 12,
      tags: ['自动化', '架构设计', 'Python'],
      summary: '拆解一套经过三个团队验证的接口自动化分层架构，以及接入 AI 后如何实现智能变更识别。',
      cover: '',
      sections: [
        { id: 's1', level: 2, title: '框架设计的核心矛盾' },
        { id: 's2', level: 2, title: '分层架构设计' },
        { id: 's3', level: 2, title: '数据驱动层实现' },
        { id: 's4', level: 2, title: 'CI 流水线接入' },
      ],
      content: `<h2 id="s1">框架设计的核心矛盾</h2>
<p>接口自动化框架最常见的问题是：随着接口数量增长，维护成本呈指数级上升。一次后端重构，可能导致数百条用例同时失效。</p>
<p>解决这个问题的核心是<strong>把不稳定的部分隔离出来</strong>，让框架只依赖稳定的抽象层。</p>
<h2 id="s2">分层架构设计</h2>
<p>经过多个项目的实践，我沉淀出一套三层架构：</p>
<ul>
  <li><strong>接口层</strong>：只定义请求结构，不包含任何断言逻辑</li>
  <li><strong>业务层</strong>：组合接口调用，实现业务场景</li>
  <li><strong>用例层</strong>：纯数据驱动，包含测试数据和预期结果</li>
</ul>
<h2 id="s3">数据驱动层实现</h2>
<p>数据驱动的精髓是：用例代码零改动，只更新数据文件。我们使用 YAML 存储测试数据，通过参数化注入到用例中。</p>
<pre><code>@pytest.mark.parametrize("case", load_cases("order_create.yaml"))
def test_order_create(case):
    resp = api.order.create(**case["input"])
    assert_response(resp, case["expect"])</code></pre>
<h2 id="s4">CI 流水线接入</h2>
<p>框架本身跑通后，接入 Jenkins 流水线才能发挥最大价值。我们配置了三道门禁：提交触发冒烟测试、PR 合并触发全量回归、每日定时触发性能基线检测。</p>`,
    },
    {
      id: 'bl-3',
      order: 3,
      title: '测试主管的团队建设心得：从执行到管理',
      date: '2026-07-10',
      readMin: 6,
      tags: ['团队管理', '职业成长'],
      summary: '从测试工程师到测试主管，关于团队氛围、绩效量化、1on1 的实战经验分享。',
      cover: '',
      sections: [
        { id: 's1', level: 2, title: '从执行到管理的断层' },
        { id: 's2', level: 2, title: '绩效量化' },
        { id: 's3', level: 2, title: '1on1 的正确打开方式' },
      ],
      content: `<h2 id="s1">从执行到管理的断层</h2>
<p>技术能力和管理能力是两套不同的技能树。很多测试工程师晋升主管后最大的痛苦来源是：过去靠个人产出证明自己，现在要靠团队产出证明自己。</p>
<h2 id="s2">绩效量化</h2>
<p>测试团队很难量化绩效，因为"没出事故"本身就是成果。我的做法是把指标拆成三类：</p>
<ul>
  <li><strong>质量类</strong>：线上缺陷数、缺陷逃逸率、复现率</li>
  <li><strong>效率类</strong>：自动化覆盖率、用例维护成本、发版耗时</li>
  <li><strong>能力类</strong>：团队成员成长、文档沉淀、新人上手时间</li>
</ul>
<h2 id="s3">1on1 的正确打开方式</h2>
<p>1on1 不是汇报会。它的价值在于：管理者提供信息和资源，员工提供真实反馈。一个高频犯的错误是把它开成任务分配会。</p>`,
    },
    {
      id: 'bl-4',
      order: 4,
      title: 'JMeter 性能测试：从脚本到监控全链路实践',
      date: '2026-06-05',
      readMin: 10,
      tags: ['性能测试', 'JMeter', '监控'],
      summary: '一次完整的性能测试项目复盘：压测脚本设计、环境隔离、瓶颈定位到报告输出。',
      cover: '',
      sections: [
        { id: 's1', level: 2, title: '压测前的环境准备' },
        { id: 's2', level: 2, title: '脚本设计要点' },
        { id: 's3', level: 2, title: '瓶颈定位方法' },
      ],
      content: `<h2 id="s1">压测前的环境准备</h2>
<p>性能测试最大的教训是：环境不隔离，结论不可信。上线前的压测必须保证数据量级、配置、网络条件与生产可比。</p>
<h2 id="s2">脚本设计要点</h2>
<p>jmeter 脚本设计的核心原则是"参数化一切"。把可变因素全部抽到 CSV 或配置中心，避免为了改一个并发数就去改脚本。</p>
<h2 id="s3">瓶颈定位方法</h3>
<p>从监控指标反推瓶颈：CPU 打满看计算，内存打满看对象堆积，响应时间陡增但资源正常则大概率是下游依赖瓶颈。</p>`,
    },
    {
      id: 'bl-5',
      order: 5,
      title: '安全测试入门：测试工程师的视角',
      date: '2026-05-01',
      readMin: 7,
      tags: ['安全测试', '渗透测试', 'OWASP'],
      summary: '从功能测试跨界安全测试的学习路径，OWASP Top 10 实战演练与工具链介绍。',
      cover: '',
      sections: [
        { id: 's1', level: 2, title: '为什么测试要懂安全' },
        { id: 's2', level: 2, title: 'OWASP Top 10 实战' },
        { id: 's3', level: 2, title: '工具链推荐' },
      ],
      content: `<h2 id="s1">为什么测试要懂安全</h2>
<p>功能测试和安全测试在思路上高度互补。安全缺陷往往藏在"功能没报错但做错了事"的地方，这正是测试最擅长发现的问题类型。</p>
<h2 id="s2">OWASP Top 10 实战</h2>
<p>注入、XSS、CSRF 是最容易上手的三类。建议每个业务接口都手工验证一遍这三类漏洞，成本低、收益高。</p>
<h2 id="s3">工具链推荐</h2>
<p>SQLMap、Burp Suite Community、ZAP 三件套足以覆盖日常安全测试需求。工具用来验证假设，而不是替代思考。</p>`,
    },
  ],

  contacts: [
    { id: 'ct-1', order: 1, kind: 'phone', icon: '📱', label: '手机', value: '138-XXXX-XXXX', url: '' },
    {
      id: 'ct-2',
      order: 2,
      kind: 'email',
      icon: '📧',
      label: '邮箱',
      value: 'your-name@example.com',
      url: 'mailto:your-name@example.com',
    },
    { id: 'ct-3', order: 3, kind: 'github', icon: '🐙', label: 'GitHub', value: 'github.com/your-handle', url: 'https://github.com/your-handle' },
    { id: 'ct-4', order: 4, kind: 'wechat', icon: '💬', label: '公众号', value: '李运辰测试笔记', url: '' },
  ],

  sites: [
    { id: 'st-1', order: 1, icon: '🧪', name: '测试平台演示站', desc: '用例管理 · 报告 · AI辅助', url: '' },
    { id: 'st-2', order: 2, icon: '⚙️', name: '自动化工具站', desc: '接口调试 · 数据构造', url: '' },
    { id: 'st-3', order: 3, icon: '✍️', name: '技术博客', desc: '测试工程 · AI 实践', url: '' },
    { id: 'st-4', order: 4, icon: '🏠', name: '个人网站', desc: '本站 · 求职展示', url: '' },
  ],

  stats: [
    { id: 'stt-1', order: 1, num: '10+', label: '年测试经验' },
    { id: 'stt-2', order: 2, num: '30+', label: '交付项目' },
    { id: 'stt-3', order: 3, num: '80%', label: '自动化覆盖率' },
    { id: 'stt-4', order: 4, num: '60%', label: 'AI提效幅度' },
    { id: 'stt-5', order: 5, num: '5+', label: '荣誉奖项' },
  ],

  overviews: [
    {
      id: 'ov-1',
      order: 1,
      icon: '🧪',
      title: '测试专家',
      desc: '主导测试体系建设，覆盖功能/性能/安全多维度',
      link: 'experience',
    },
    {
      id: 'ov-2',
      order: 2,
      icon: '🤖',
      title: 'AI 测试先行',
      desc: 'AI生成用例、自动化维护、报告生成三大落地技能',
      link: 'ai',
    },
    {
      id: 'ov-3',
      order: 3,
      icon: '🏆',
      title: '多项荣誉',
      desc: '在校比赛获奖 + 工作优秀员工，点击荣誉墙查看',
      link: 'honors',
    },
    {
      id: 'ov-4',
      order: 4,
      icon: '🌐',
      title: '多个项目',
      desc: '工作测试项目、学术项目、个人站点全覆盖',
      link: 'projects',
    },
  ],
}