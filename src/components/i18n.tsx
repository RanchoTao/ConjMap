'use client';
import { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'en' | 'zh';
const Context = createContext<{ language: Language; setLanguage: (value: Language) => void }>({
  language: 'en', setLanguage: () => {},
});
const STORAGE_KEY = 'conjmap-language-v1';
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'zh' || stored === 'en') setLanguage(stored);
        else if (navigator.language.toLowerCase().startsWith('zh')) setLanguage('zh');
      } catch { /* Local storage is optional. */ }
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.documentElement.dataset.language = language;
  }, [language]);
  const select = (value: Language) => {
    setLanguage(value);
    try { localStorage.setItem(STORAGE_KEY, value); } catch { /* Persist when permitted. */ }
  };
  return <Context.Provider value={{ language, setLanguage: select }}>{children}</Context.Provider>;
}
export const useLanguage = () => useContext(Context);

const translations: Record<string, string> = {
  'Atlas':'图谱','Problems':'问题','Sources':'数据来源','About':'关于',
  'Contribute':'参与贡献','Skip to content':'跳转到正文',
  'Mapping the frontiers. Preserving the evidence.':'绘制数学前沿，保留研究证据。',
  'Open source · Apache-2.0':'开源 · Apache-2.0',
  'Data & attribution':'数据与署名',
  'AN OPEN MAP OF MATHEMATICAL POSSIBILITY':'一张开放的数学未知领域地图',
  'Every answer begins':'每一个答案，都始于','at the frontier.':'未知前沿。',
  'Explore the questions mathematics has yet to settle.':'探索数学中尚未解决的问题。',
  'Follow the connections. Trace the evidence. Find your next problem.':'追踪问题关联，核查研究证据，发现下一个值得探索的问题。',
  'Explore the atlas':'探索数学图谱','Browse problems':'浏览问题',
  'Open infrastructure for mathematical discovery':'面向数学发现的开放基础设施',
  'PUBLIC READ-ONLY':'公开只读版','LOCAL EDITION':'本地版本',
  'THE KNOWN':'已知','THE STILL POSSIBLE ↗':'仍待探索 ↗',
  'SOURCE-BACKED PROBLEMS':'有来源的问题','MATHEMATICAL FIELDS':'数学领域',
  'DISCOVERY ASSOCIATIONS':'探索关联','INDEPENDENTLY VERIFIED':'独立核验',
  '01 / THE LANDSCAPE':'01 / 数学全景',
  'Ideas don’t live in isolation.':'数学思想并非孤立存在。',
  'Explore all connections':'探索所有关联',
  '02 / FIND YOUR FIELD':'02 / 探索学科',
  'Many disciplines. One frontier.':'众多领域，同一片前沿。',
  'Choose a direction to explore.':'选择感兴趣的数学方向。',
  '03 / A PLACE TO START':'03 / 从这里开始',
  'Questions with a long horizon.':'值得长期探索的问题。',
  'View the problem index':'查看问题索引',
  'status unknown':'状态未知',
  'Evidence is part of the map.':'证据是地图的一部分。',
  'Every statement links to a pinned source. Retrieval, review, and mathematical verification remain distinct.':'每项陈述均链接至固定版本的来源；资料获取、文献审查和数学验证有严格区别。',
  'A map built in the open.':'一张开放共建的地图。',
  'Source code, data contracts, and import provenance are inspectable. Better references and corrections are welcome.':'代码、数据规范和导入出处均可检查。欢迎提交更好的文献与勘误。',
  'Connected to what comes next.':'连接未来的研究。',
  'Separate mock and authenticated real adapters preserve research provenance. The real MathForge connection remains blocked pending a compatible engine API.':'模拟接口与受认证的真实接口相互隔离。MathForge 的真实连接仍需兼容的引擎 API。',
  'COLLECTION SNAPSHOT':'数据快照',
  'Read the source audit':'查看数据来源审计',
  'THE RESEARCH LANDSCAPE':'数学研究全景',
  'The atlas':'数学图谱',
  'Follow a question. Discover its neighborhood. Find a new direction.':'从一个问题出发，探索关联问题与新的研究方向。',
  'THE PROBLEM INDEX':'数学问题索引',
  'Questions worth asking':'值得研究的问题',
  'A starting point for exploration.':'从这里开始探索。',
  'Evidence before certainty.':'证据先于结论。',
  'Imported statements and discovery links are unverified.':'导入的数学陈述及探索关联尚未独立核验。',
  'Source-reported open problems are indexed here. Imported statements and associations await independent review; ConjMap records their mathematical status as unknown.':'这里收录来自原始来源的开放问题陈述；所有导入内容与关联仍待独立审查，ConjMap 将其数学状态标记为未知。',
  'Search problems, statements, aliases, MSC…':'搜索问题、名称、别名、MSC……',
  'All fields':'全部领域','All statuses':'全部状态',
  'Search problems':'搜索问题','Filter by field':'按领域筛选','Filter by status':'按状态筛选',
  'Sort problems':'排序问题','Title: A → Z':'名称：A → Z','Title: Z → A':'名称：Z → A',
  'Mathematical field':'数学领域','Status':'状态',
  'PROBLEM / CANONICAL ID':'问题 / 规范 ID','FIELD':'领域',
  'STATUS':'状态','EVIDENCE':'证据',
  'problems found':'个匹配问题','indexed':'条已收录',
  'No matching problems':'没有匹配的问题',
  'Try a different term or clear the filters. Independent status review is pending for this first collection.':'请尝试其他关键词或清除筛选条件。这批问题仍待独立核验。',
  'Reset filters':'重置筛选','Previous':'上一页','Next':'下一页','Showing':'显示',
  'Problem index':'问题索引','Back to the problem index':'返回问题列表',
  'status: ':'状态：','statement: unverified':'数学陈述：未经核验',
  '01 / MATHEMATICAL STATEMENT':'01 / 数学陈述',
  'Source transcription':'原始资料转录（英文）',
  'Formal statement · Lean 4':'形式化陈述 · Lean 4',
  'A statement is not a proof. This edition does not run Lean or validate the formalization.':'形式化陈述不等于证明；本版本尚未运行 Lean 核验其正确性。',
  '02 / STATUS & EVIDENCE':'02 / 状态与证据',
  'What the source establishes':'来源实际上说明了什么',
  'UPSTREAM LABEL':'来源标签','research open':'来源标注：开放研究问题',
  'CONJMAP STATUS':'ConjMap 核验状态',
  'unknown':'未知','unverified':'未核验','reviewed':'已审查','rejected':'已拒绝',
  'open':'未解决','solved':'已解决','disputed':'有争议','partially_resolved':'部分解决',
  '03 / REFERENCES':'03 / 参考文献','Follow the provenance':'追踪原始出处',
  '04 / RESEARCH RECORD':'04 / 研究记录',
  'Attempts, including the dead ends.':'记录每一次尝试，包括失败路线。',
  'PROBLEM PASSPORT':'问题档案','NEARBY QUESTIONS':'相关问题',
  'No relationships recorded.':'暂无关联记录。',
  'Suggest an evidence-backed edit':'提交附证据的修改',
  'V0.2 / EVIDENCE DIMENSIONS & SOURCE HISTORY':'V0.2 / 证据维度与来源历史',
  'Review scope, without collapsed certainty.':'审查范围明确，不混淆可信程度。',
  'Search scope, limitations & literature leads':'检索范围、局限与文献线索',
  'Cross-source observations':'跨来源观察',
  'Substantive relationship candidates':'实质性数学关系候选',
  'No second-source observation linked to this record.':'暂无关联的第二来源记录。',
  'Pending for all imported content':'所有导入内容仍待核验',
  'PROJECT NOTES':'项目说明',
  
  'MAPPING THE FRONTIERS OF MATHEMATICS':'绘制数学研究前沿',
  'An atlas for the questions ahead':'面向未解问题的数学地图',
  'ConjMap is open research infrastructure for finding problems and following their evidence.':'ConjMap 是一套开放科研基础设施，用于发现数学问题并追踪证据。',
  'A shared map, with clear boundaries.':'开放协作，明确边界。',
  'Small pieces, explicit contracts.':'模块清晰，接口明确。',
  'Contribute something checkable.':'贡献可核验的内容。',
  'What this first map can establish.':'当前地图能够证明什么。',
  'PROVENANCE IS A FIRST-CLASS CITIZEN':'数据出处优先',
  'Built on traceable sources':'建立在可追溯来源之上',
  'Resources audited':'已审计来源','Licensed sources integrated':'已接入授权来源',
  'Unverified source statements':'未经核验的来源陈述',
  'Audit only · no import':'仅完成审计 · 未导入',
  'Visit source':'访问来源','Evidence':'证据',
  'Access':'访问情况','License':'许可证','Maintenance':'维护情况',
  'Format':'格式','Update frequency':'更新频率','Import constraints':'导入限制',
  '404 / BEYOND THIS MAP':'404 / 地图之外','This problem isn’t indexed.':'尚未收录这个问题。',
  'The canonical ID may have changed, or this question has yet to be added.':'规范 ID 可能已变更，也可能尚未收录。',
  'This view could not load.':'页面加载失败。',
  'Your source catalog is unchanged. Retry this view or return to the problem index.':'原始数据未受影响，请重试或返回问题列表。',
  'Try again':'重试',
  'Number theory':'数论','Combinatorics':'组合数学','Algebra':'代数',
  'Geometry & topology':'几何与拓扑','Analysis':'分析','Logic & foundations':'逻辑与基础','Probability':'概率论',
  'SOURCE_IMPORTED':'来源已导入','STATEMENT_CHECKED':'命题已核查',
  'LITERATURE_REVIEWED':'文献已审查','MATHEMATICAL_RELATION_VERIFIED':'数学关系已核验',
  'FORMAL_STATEMENT_CHECKED':'形式化陈述已核查','PROOF_KERNEL_VERIFIED':'证明内核已验证',
  'HUMAN_REVIEW_PENDING':'待人工审查','pending':'待审查','not_run':'未运行',
  'established':'已建立','revoked':'已撤销','PARTIAL':'部分完成',
  'implies':'蕴含','equivalent':'等价','generalizes':'推广',
  'special_case_of':'特例','depends_on':'依赖','related_to':'相关',
};

const titleExceptions: Record<string,string> = {
  'Riemann hypothesis':'黎曼猜想',
  'Weak Birch and Swinnerton-Dyer conjecture over Q':'有理数域上的弱 Birch–Swinnerton-Dyer 猜想',
  'Smooth four-dimensional Poincaré conjecture':'四维光滑庞加莱猜想',
  'abc conjecture (constant-bound formulation)':'abc 猜想（常数上界形式）',
  "Agrawal's conjecture":'Agrawal 猜想',
  'Amicable numbers':'亲和数问题',"Andrica's conjecture":'Andrica 猜想',
  'Artin primitive roots: the selected density statement':'Artin 原根猜想（指定密度命题）',
  'Babai–Seress Conjectures on the Diameter of Finite Groups':'Babai–Seress 有限群直径猜想',
  'Balanced prime conjecture':'平衡素数猜想','Beal conjecture':'Beal 猜想',
  'Beaver Math Olympiad (BMO)':'Beaver 数学奥林匹克问题',
  'Beck–Fiala theorem and conjecture':'Beck–Fiala 定理与猜想',
  'Betrothed numbers':'拟亲和数问题',"Exact value of Bloch's constant":'Bloch 常数的精确值',
  "Brocard's Conjecture":'Brocard 猜想','Bunyakovsky conjecture':'Bunyakovsky 猜想',
  "Büchi's problem":'Büchi 问题',"Carmichael's totient function conjecture":'Carmichael 欧拉函数猜想',
  "Pillai's conjecture on differences of perfect powers":'Pillai 完全幂差猜想',
  'Class number problem for real quadratic fields':'实二次域类数问题',
  "Congruent numbers: the odd converse to Tunnell's criterion":'同余数：Tunnell 判别法的奇数情形逆命题',
  'Conjectures about the Mandelbrot and Multibrot sets':'Mandelbrot 与 Multibrot 集相关猜想',
  'Convergence of the Flint Hills and Cookson Hills series':'Flint Hills 与 Cookson Hills 级数的收敛性',
  'Dedekind Numbers':'Dedekind 数问题','Determinantal conjecture':'行列式猜想',
  "Dickson's conjecture":'Dickson 猜想','Equational Theories':'等式理论问题',
  'Euler sum of powers: selected open variant':'Euler 幂和问题（指定开放变体）',
  'Four exponentials conjecture':'四指数猜想',
  'Feit-Thompson conjecture on primes':'Feit–Thompson 素数猜想',
  'Fibonacci Primes':'Fibonacci 素数问题',
  'Second Hardy–Littlewood conjecture':'第二 Hardy–Littlewood 猜想',
  "Fuglede's conjecture in dimensions 1 and 2 (dim 2)":'二维 Fuglede 猜想',
  'Gap conjecture':'间隙猜想','Gauss circle problem':'高斯圆问题',
  'Graceful Tree Conjecture (Ringel–Kotzig conjecture)':'优美树猜想（Ringel–Kotzig 猜想）',
  "Grimm's conjecture":'Grimm 猜想','Inscribed rectangle problem':'内接矩形问题',
  "Kaplansky's Conjectures":'Kaplansky 猜想',
  'Kummer–Vandiver conjecture':'Kummer–Vandiver 猜想',
  'Köthe conjecture (general matrix)':'Köthe 猜想（一般矩阵情形）',
  'Lander, Parkin, and Selfridge Conjecture':'Lander–Parkin–Selfridge 猜想',
  "Lehmer's Mahler measure problem (best)":'Lehmer 的 Mahler 测度问题',
  'Local uniformization':'局部一致化问题',"Moser's Worm":'Moser 蠕虫问题',
  'Normality of Irrational Algebraic Numbers':'无理代数数的正规性',
  'Packing':'填充问题','Pebbling number conjecture':'石子移动数猜想',
  'Polynomial-time computability of factoring':'整数分解的多项式时间可计算性',
  'The Ramsey number R(5,5)':'Ramsey 数 R(5,5)',
  'Resolution of singularities':'奇点消解问题',
  "Serre's multiplicity conjectures":'Serre 重数猜想',
  'Tournament anti-Sidorenko trees conjecture':'锦标赛反 Sidorenko 树猜想',
  'Snake in the box':'盒中蛇问题',
  'Some conjectures about ranks of elliptic curves over ℚ':'有理数域上椭圆曲线秩的相关猜想',
  "Tarski's exponential function problem":'Tarski 指数函数问题',
  'The 1/3–2/3 conjecture':'1/3–2/3 猜想',
  'The Bing-Borsuk Conjecture':'Bing–Borsuk 猜想',
  'The Gerstenhaber problem for three commuting matrices':'三个交换矩阵的 Gerstenhaber 问题',
  'The Hasse--Weil conjecture for elliptic curves':'椭圆曲线的 Hasse–Weil 猜想',
  'The Rule 30 Prize Problems':'Rule 30 悬赏问题',
  'The small Cohen-Macaulay modules conjecture':'小 Cohen–Macaulay 模猜想',
  'Symbol length in Milnor K-theory over complex function fields':'复函数域上 Milnor K 理论的符号长度问题',
  'Union-closed sets conjecture':'并封闭集族猜想',
  "Vizing's conjecture (1968)":'Vizing 猜想（1968）',
  'Černý Conjecture':'Černý 猜想',
};
export function problemTitle(title: string, language: Language) {
  if (language === 'en') return title;
  if (titleExceptions[title]) return titleExceptions[title];
  return title
    .replace(/^Ben Green's Open Problem (\d+)(.*)$/,'本·格林开放问题 $1$2')
    .replace(/^Green's Open Problem (\d+)(.*)$/,'格林开放问题 $1$2')
    .replace(/^Erdős Problem (\d+)(.*)$/,'厄尔多斯问题 $1$2');
}
export function translate(text: string, language: Language) {
  return language === 'zh' ? (translations[text] ?? text) : text;
}
export function T({ en, zh }: { en: string; zh?: string }) {
  const { language } = useLanguage();
  return <>{language === 'zh' ? (zh ?? translate(en, language)) : en}</>;
}
export function ProblemName({ title }: { title: string }) {
  const { language } = useLanguage();
  return <>{problemTitle(title, language)}</>;
}
export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  return (
    <div className="language-switch" role="group" aria-label="Language / 语言" title="Language / 语言">
      <button type="button" lang="zh-CN" aria-label="切换到中文" aria-pressed={language === 'zh'}
        onClick={() => setLanguage('zh')}>中</button>
      <span aria-hidden="true">/</span>
      <button type="button" lang="en" aria-label="Switch to English" aria-pressed={language === 'en'}
        onClick={() => setLanguage('en')}>EN</button>
    </div>
  );
}
