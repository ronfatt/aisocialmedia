import { db } from "../src/lib/db";

async function seedSparkClient() {
  console.log("Seeding SPARK QUANT LABS / SPARK AI Client Workspace...");

  // Find apex organization
  const org = await db.organization.findFirst();
  if (!org) {
    throw new Error("No organization found. Please run base seed first.");
  }

  // Check if SPARK client already exists
  let sparkClient = await db.client.findFirst({
    where: { name: "SPARK QUANT LABS" },
  });

  if (!sparkClient) {
    sparkClient = await db.client.create({
      data: {
        organizationId: org.id,
        name: "SPARK QUANT LABS",
        slug: "spark-quant-labs",
        brandName: "SPARK AI",
        industry: "AI Quantitative Finance / Web3 Quant Fund",
        locationCity: "Singapore / Global",
        locationState: "Central Region",
        locationCountry: "Singapore",
        accountManagerName: "Chief Quantitative Officer",
        status: "ACTIVE",
      },
    });
    console.log(`Created SPARK Client with ID: ${sparkClient.id}`);
  } else {
    console.log(`Found existing SPARK Client with ID: ${sparkClient.id}`);
  }

  const clientId = sparkClient.id;

  // 1. Client Profile
  await db.clientProfile.upsert({
    where: { clientId },
    update: {
      businessDescription:
        "SPARK 是一家全栈自研的机构级 AI 原生对冲基金与量化科研机构。全球首家将核心量化策略哈希值实时锚定链上，通过多智能体集群架构、自研 GPU+FPGA 硬件级亚毫秒底座与动态前置风控，全天候全自动捕获全球跨时区股票、债券、外汇、大宗商品及加密资产的流动性节律。在这里，透明度不是承诺，而是一种物理定律。",
      website: "https://sparkunioncapital.com",
      email: "research@sparkunioncapital.com",
      city: "Singapore",
      country: "Singapore",
      serviceAreas: "Global Cross-Border Quantitative Markets",
    },
    create: {
      clientId,
      businessDescription:
        "SPARK 是一家全栈自研的机构级 AI 原生对冲基金与量化科研机构。全球首家将核心量化策略哈希值实时锚定链上，通过多智能体集群架构、自研 GPU+FPGA 硬件级亚毫秒底座与动态前置风控，全天候全自动捕获全球跨时区股票、债券、外汇、大宗商品及加密资产的流动性节律。在这里，透明度不是承诺，而是一种物理定律。",
      website: "https://sparkunioncapital.com",
      email: "research@sparkunioncapital.com",
      city: "Singapore",
      country: "Singapore",
      serviceAreas: "Global Cross-Border Quantitative Markets",
    },
  });

  // 2. Client Brand Profile
  await db.clientBrandProfile.upsert({
    where: { clientId },
    update: {
      brandPositioning: "全球首家将核心策略哈希值实时锚定链上的机构级 AI 原生量化基金",
      brandTone: "机构级权威, 极客硬核, 密码学级透明, 犀利果决, 物理定律感 (Institutional, Hardcore Cyber-Quant, Transparent)",
      preferredLanguage: "Chinese",
      secondaryLanguage: "English",
      visualStyle: "Cyberpunk Financial Terminal, Dark Mode, High-precision Neon Teal & Electric Blue",
      brandColours: JSON.stringify(["#0B0F19", "#00F2FE", "#4FACFE", "#10B981"]),
      avoidedWords: JSON.stringify(["保本保收益", "稳赚不赔", "百倍币", "暴富内幕", "财富密码"]),
      preferredCta: "查阅链上存证哈希并访问官网：https://sparkunioncapital.com",
      companySlogan: "透明度不是一种承诺，而是一种物理定律。",
    },
    create: {
      clientId,
      brandPositioning: "全球首家将核心策略哈希值实时锚定链上的机构级 AI 原生量化基金",
      brandTone: "机构级权威, 极客硬核, 密码学级透明, 犀利果决, 物理定律感 (Institutional, Hardcore Cyber-Quant, Transparent)",
      preferredLanguage: "Chinese",
      secondaryLanguage: "English",
      visualStyle: "Cyberpunk Financial Terminal, Dark Mode, High-precision Neon Teal & Electric Blue",
      brandColours: JSON.stringify(["#0B0F19", "#00F2FE", "#4FACFE", "#10B981"]),
      avoidedWords: JSON.stringify(["保本保收益", "稳赚不赔", "百倍币", "暴富内幕", "财富密码"]),
      preferredCta: "查阅链上存证哈希并访问官网：https://sparkunioncapital.com",
      companySlogan: "透明度不是一种承诺，而是一种物理定律。",
    },
  });

  // 3. Client Target Market
  await db.clientTargetMarket.upsert({
    where: { clientId },
    update: {
      geographicTarget: "全球（美股、欧股、亚太、中东、新加坡及全球加密金融核心节点）",
      industryTarget: "Web3基金、对冲基金母基金（FOF）、家族办公室、高净值量化投资团队",
      customerType: "B2B",
      languages: JSON.stringify(["Chinese", "English"]),
      buyerPersona: "资深量化合伙人、家族财富首席投资官、对传统黑盒基金缺乏信任的数字原生资本",
      decisionMakers: JSON.stringify(["CIO 首席投资官", "量化基金合伙人", "风控总监", "家族办公室执行人"]),
    },
    create: {
      clientId,
      geographicTarget: "全球（美股、欧股、亚太、中东、新加坡及全球加密金融核心节点）",
      industryTarget: "Web3基金、对冲基金母基金（FOF）、家族办公室、高净值量化投资团队",
      customerType: "B2B",
      languages: JSON.stringify(["Chinese", "English"]),
      buyerPersona: "资深量化合伙人、家族财富首席投资官、对传统黑盒基金缺乏信任的数字原生资本",
      decisionMakers: JSON.stringify(["CIO 首席投资官", "量化基金合伙人", "风控总监", "家族办公室执行人"]),
    },
  });

  // 4. Strategy & 12 Content Pillars
  let strategy = await db.clientStrategy.findUnique({
    where: { clientId },
  });

  if (!strategy) {
    strategy = await db.clientStrategy.create({
      data: {
        clientId,
        brandPositioning: "AI原生端到端驱动，跨时区全球对冲，链上物理级透明",
        marketingObjectives: "打造全球加密量化与 AI 对冲领域第一思想领导力（Thought Leadership），以研报内参转化机构 LP",
        targetAudience: "全球机构 LP、家族办公室 CIO、加密原生成熟交易者",
        targetLocations: "Singapore, Hong Kong, Dubai, New York, London",
      },
    });
  }

  // Clear existing pillars to avoid duplicates
  await db.contentPillar.deleteMany({
    where: { strategyId: strategy.id },
  });

  const pillarsData = [
    {
      title: "【全球多市场全域覆盖】跨时区全资产全天候调度",
      description: "打通美股、欧股、亚太、外汇、全球期货、期权及加密资产，7x24小时全时区并行解析，打破单一市场局限。",
      orderIndex: 1,
    },
    {
      title: "【AI原生端到端投研闭环】强化学习与多模态模型",
      description: "AI 自动解析行情、微观订单流、新闻舆情等多模态数据，自主生成策略并持续外样本进化。",
      orderIndex: 2,
    },
    {
      title: "【全栈自研低延迟底座】GPU+FPGA 硬件级交易执行",
      description: "数据网关、AI推理引擎到订单执行全自研，机房专线托管，亚毫秒交易链路，抹平算力与延迟矛盾。",
      orderIndex: 3,
    },
    {
      title: "【动态AI前置风控】实时预测并拦截黑天鹅冲击",
      description: "多智能体实时监控敞口、流动性枯竭与国别风险，动态调仓前置隔离，绝非事后止损。",
      orderIndex: 4,
    },
    {
      title: "【跨周期自适应体系】牛市/熊市/震荡市动态切换",
      description: "不依赖单一固定策略，自动识别宏观范式，捕捉市场的呼吸节奏，追求稳健风险收益比。",
      orderIndex: 5,
    },
    {
      title: "【多智能体协同AI集群】分工协作剥离人性情绪",
      description: "因子挖掘、组合优化、算法拆单、合规校验由独立 AI Agent 各司其职，恪守纯粹纪律。",
      orderIndex: 6,
    },
    {
      title: "【全球化合规底座】跨境业务全流程穿透审计留痕",
      description: "严格适配海外主要资本市场监管框架，全流程留痕，满足主权基金与家族办公室最严苛审查。",
      orderIndex: 7,
    },
    {
      title: "【海量多模态数据处理】低信噪比中提取有效 Alpha",
      description: "全源异构数据清洗降噪，微秒级识别盘口异动，捕捉人类难以察觉的微小结构性机会。",
      orderIndex: 8,
    },
    {
      title: "【算法拆单与执行优化】智能流动性评估与严控滑点",
      description: "AI 实时评估深度，动态拆分子订单择时成交，降低大额交易市场冲击，显著增厚净收益。",
      orderIndex: 9,
    },
    {
      title: "【国际化复合研发团队】AI算法科学家+高并发极客+宏观老兵",
      description: "融合顶尖学术前沿科研力与数十年华尔街/跨国实盘经验，持续定义前沿量化新范式。",
      orderIndex: 10,
    },
    {
      title: "【链上策略哈希存证】透明度即物理定律",
      description: "全球首家将核心量化策略哈希实时锚定区块链，连矿工都在监督，告别传统黑盒。",
      orderIndex: 11,
    },
    {
      title: "【未来终极愿景】让 AI 自主发行一只 ETF",
      description: "从因子挖掘到链上清算全自主运行，培育能自我进化、自我赚钱、自我负责的数字生命体。",
      orderIndex: 12,
    },
  ];

  for (const p of pillarsData) {
    await db.contentPillar.create({
      data: {
        strategyId: strategy.id,
        title: p.title,
        description: p.description,
        orderIndex: p.orderIndex,
        isActive: true,
      },
    });
  }

  // 5. Active Services
  await db.clientService.deleteMany({ where: { clientId } });

  const servicesData = [
    {
      name: "SPARK AI Research Desk",
      category: "Macro & Quant Intelligence",
      description: "全天候 7×24 小时全球跨市场微观结构与宏观流动性研报内参，为机构提供高信噪比决策参考。",
      sellingPoints: JSON.stringify(["多模态数据降噪", "XAI人机对话式交易复盘", "无夸大收益的客观实盘洞察"]),
      targetCustomers: "机构投资者、家族办公室投资经理、资深个人量化者",
      priceInfo: "Institutional Tier Available",
      isActive: true,
    },
    {
      name: "SPARK Alpha Cluster",
      category: "Multi-Agent Quantitative Engine",
      description: "自研多智能体协同交易集群，自动完成因子挖掘、资产组合优化及动态对冲。",
      sellingPoints: JSON.stringify(["跨周期自适应", "全资产类别动态对冲", "彻底摒弃人为情绪贪婪"]),
      targetCustomers: "全球对冲基金 LP、资产管理机构",
      isActive: true,
    },
    {
      name: "SPARK On-Chain Transparency Vault",
      category: "Cryptographic Attestation",
      description: "核心量化策略哈希实时上链存证，不可篡改的物理级信任。",
      sellingPoints: JSON.stringify(["实时哈希锚定公链", "矿工级公证监督", "打破传统黑盒对冲基金迷信"]),
      targetCustomers: "加密原生基金、合规审计机构、高净值Web3投资人",
      isActive: true,
    },
    {
      name: "SPARK Ultra-Low Latency Execution Engine",
      category: "Hardware & Algorithmic Trading",
      description: "自研 GPU+FPGA 硬件级亚毫秒交易柜台与算法智能拆单系统。",
      sellingPoints: JSON.stringify(["机房专线物理托管", "大模型亚毫秒级低延迟推理", "严控滑点与市场冲击成本"]),
      targetCustomers: "高频配置方、跨境多资产流动性撮合方",
      isActive: true,
    },
  ];

  for (const s of servicesData) {
    await db.clientService.create({
      data: {
        clientId,
        name: s.name,
        category: s.category,
        description: s.description,
        sellingPoints: s.sellingPoints,
        targetCustomers: s.targetCustomers,
        priceInfo: s.priceInfo || null,
        isActive: true,
      },
    });
  }

  // Clear existing items and variants for clean re-seeding
  await db.postVariant.deleteMany({ where: { clientId } });
  await db.contentItem.deleteMany({ where: { clientId } });

  // 6. Pre-populate Sample Master Content Items with TWITTER & Multi-Platform Variants
  const sampleItems = [
    {
      title: "【SPARK 内参】连矿工都在盯着看的量化策略：透明度即物理定律",
      coreMessage: "全球首家将核心策略哈希实时锚定链上，打破传统基金黑盒，用数学和区块链建立不可篡改的信任。",
      callToAction: "查阅链上今日策略存证哈希：https://sparkunioncapital.com",
      platforms: ["TWITTER", "FACEBOOK", "INSTAGRAM", "TIKTOK"],
      status: "APPROVED",
      twitterHook: "“我们的策略，连矿工都在盯着看。”",
      twitterCaption: `全球首家将核心量化策略哈希值实时锚定链上的 AI 基金。

你不需要相信我们的“黑盒”，你只需要相信数学和不可篡改的区块。

在这里，透明度不是一种承诺，而是一种物理定律。

🔗 今日策略哈希：0x89e2...f54b
🌐 官网: https://sparkunioncapital.com
$BTC $ETH #AIQuant #Crypto #Alpha #SPARK`,
      fbCaption: `【SPARK 每日量化研报 | 透明度宣言】

“我们的策略，连矿工都在盯着看。”

在传统量化金融界，“黑盒”被包裹在保密协议与神话叙事中。但对 SPARK 而言，任何不能被公开检验的自信，本质上都是对不确定性的侥幸。

我们是全球首家将核心量化策略哈希值实时锚定在公链上的 AI 机构。通过多智能体集群实时运算，每次策略调整前均生成防篡改指纹直接广播上链。

在这里，透明度不是一种口头承诺，而是一种物理定律。

👉 查阅今日全量链上存证哈希并访问官网：https://sparkunioncapital.com`,
      igCaption: `“我们的策略，连矿工都在盯着看。” ⚡

打破传统对冲基金“只知其然”的黑盒。
在 SPARK，我们将核心策略哈希值实时锚定区块链。

你不需要盲信任何人；
你只需要相信数学、算法与不可篡改的区块。

🔗 探索：https://sparkunioncapital.com
#SPARKQuant #AI #QuantFinance #CryptoTrading #Transparency #FinTech #Alpha`,
      tiktokHook: "当对冲基金的策略连矿工都能查，传统金融沉默了",
      tiktokOnScreen: "全球首家策略哈希上链的 AI 量化基金 ⚡",
      tiktokVideoIdea: "黑白极客机房视觉 + 终端命令行代码滚屏 + 链上交易哈希生成微观动效",
    },
    {
      title: "【SPARK 内参】技术降维：当别人回测2024，我们在模拟2027流动性枯竭",
      coreMessage: "我们训练AI的不是历史数据，而是市场性格。通过对抗生成网络GAN模拟极端黑天鹅，具备穿透周期的预知力。",
      callToAction: "阅读完整黑天鹅压力测试报告：https://sparkunioncapital.com",
      platforms: ["TWITTER", "FACEBOOK", "INSTAGRAM", "TIKTOK"],
      status: "APPROVED",
      twitterHook: "“当别的模型还在回测2024，我们的AI已经在模拟2027的流动性枯竭。”",
      twitterCaption: `很多量化团队还在用历史数据过拟合。

而 SPARK 训练 AI 的不是历史，而是“市场性格”。

通过对抗生成网络（GAN）模拟极端黑天鹅，我们的量化引擎在实盘中展现的不是被动适应力，而是预知力。

🌐 研报白皮书: https://sparkunioncapital.com
#Quant #AI #MachineLearning #RiskManagement #SPARK`,
      fbCaption: `【SPARK AI 实验室 | 深度技术拆解】

“当别的模型还在回测 2024，我们的 AI 已经在模拟 2027 的流动性枯竭。”

金融市场的最大陷阱是“历史归纳法”。如果下一次危机注定以从未发生过的方式降临，那么过度优化过去十年的历史曲线，就是最精致的自杀。

SPARK 采用生成对抗网络（GAN）构建“合成极端市场”。通过两个神经网络的无限次博弈，主动制造闪崩、国别风暴与流动性完全枯竭的真空环境。

当真正的黑天鹅来临时，对人类而言是猝不及防的灾难；而对 SPARK 的算法而言，这只是它在虚拟机里跑过上亿次的普通一天。

👉 点击链接阅读 SPARK 极端情景压力测试白皮书：https://sparkunioncapital.com`,
      igCaption: `“当别的模型还在回测2024，我们的AI已经在模拟2027的流动性枯竭。” 🌪️

拒绝历史过拟合。
我们训练 AI 的不是死板数据，而是市场的真实“性格”。

在黑天鹅降临前，预知力才是最坚固的护城河。

🔗 研报详情：https://sparkunioncapital.com
#SPARK #Alpha #ArtificialIntelligence #RiskControl #QuantFund #Trading`,
      tiktokHook: "为什么 90% 靠过去数据做量化的模型都会爆仓？",
      tiktokOnScreen: "AI模拟2027极端流动性枯竭现场 ⚠️",
      tiktokVideoIdea: "波形图红绿剧烈震荡对比 + 极速AI对抗演练模拟界面",
    },
    {
      title: "【SPARK 内参】打破黑盒诅咒：我们逼着AI每次交易后写一份人类能懂的复盘",
      coreMessage: "可解释AI（XAI）实现人机对话。不仅告诉你买卖结论，还用自然语言阐述因果关系与宏观逻辑。",
      callToAction: "查看今日最新 XAI 人机对话实盘记录：https://sparkunioncapital.com",
      platforms: ["TWITTER", "FACEBOOK", "INSTAGRAM", "TIKTOK"],
      status: "APPROVED",
      twitterHook: "“我们逼着AI在每次交易后，写一份人类能看懂的复盘报告。”",
      twitterCaption: `打破深度学习“只知其然”的诅咒。

我们的 XAI（可解释AI）系统不仅告诉你怎么赚钱，还用自然语言告诉你为什么。

这是量化界的第一次真正“人机对话”。

🌐 实盘复盘: https://sparkunioncapital.com
$SPX $BTC #ExplainableAI #QuantFinance #FinTwit #SPARK`,
      fbCaption: `【SPARK 投研前线 | XAI 人机对话纪元】

“我们逼着 AI 在每次交易后，写一份人类能看懂的复盘报告。”

深度学习在金融领域长期被诟病为无法解释的“黑箱”。交易员只看到买入或卖出的数字跳动，却无法得知背后的真实逻辑。

SPARK 打破了这个诅咒。通过融合多模态大语言模型与强化学习决策树，我们的 XAI（可解释性 AI）会在每笔交易触发的亚毫秒内，自动梳理订单流特征、波动率曲面与跨资产相关性，并生成纯文本复盘简报。

不仅告诉你怎么赢，更让你看清系统为何这样决断。这是属于量化科技的真正人机对话。

👉 立即体验 SPARK 每日 XAI 复盘日志：https://sparkunioncapital.com`,
      igCaption: `“我们逼着AI在每次交易后，写一份人类能看懂的复盘报告。” 🤖📝

量化界第一次真正的“人机对话”。
用自然语言剖析每一笔交易背后的宏观逻辑与微观信号。

🔗 实盘对话记录：https://sparkunioncapital.com
#XAI #ExplainableAI #SPARKAI #QuantitativeTrading #FinTechInnovation`,
      tiktokHook: "你能想象吗？AI做完一笔数百万的交易后，还要自己写检讨和复盘",
      tiktokOnScreen: "让AI自己解释为什么在这秒买入 💻",
      tiktokVideoIdea: "屏幕显示AI自写报告逐行输出 + 交易员与系统交互近景",
    },
    {
      title: "【SPARK 内参】全天候跨资产对冲：无论美联储如何决策，只有服务器风扇的轰鸣",
      coreMessage: "通过全球股、债、汇、商品及加密资产的自适应对冲，不预测涨跌，只捕捉呼吸节奏。",
      callToAction: "查看跨资产自适应收益曲线：https://sparkunioncapital.com",
      platforms: ["TWITTER", "FACEBOOK", "INSTAGRAM", "TIKTOK"],
      status: "APPROVED",
      twitterHook: "“牛市里我们是镰刀，熊市里我们是收割机，震荡市里我们是绞肉机。”",
      twitterCaption: `通过全球股、债、汇、商品、加密资产的动态对冲，我们的 AI 不预测涨跌，只捕捉市场的“呼吸节奏”。

无论美联储加息还是降息，你听到的只有我们服务器风扇平稳的轰鸣。

🌐 访问主页: https://sparkunioncapital.com
#Macro #Quant #HedgeFund #GlobalMarkets #SPARK`,
      fbCaption: `【SPARK 宏观策略 | 全周期对冲哲学】

“牛市里我们是镰刀，熊市里我们是收割机，震荡市里我们是绞肉机。”

试图预测明天的利率或下周的通胀，是人类情绪的执念。真正的机构级量化不与宏观作对，而是把波动本身化为源源不断的动能。

通过打通美股、欧股、外汇、全球期货与加密多品类资产，SPARK 多智能体集群 7×24 小时动态平衡风险敞口。在单一资产剧震时，逆向资产早已平滑冲击。

无论华尔街喧嚣如何，无论美联储鸽派还是鹰派，在 SPARK 全球核心机房里，你听到的只有服务器风扇平稳的轰鸣。

👉 查阅 SPARK 跨周期自适应回撤控制表现：https://sparkunioncapital.com`,
      igCaption: `“牛市里是镰刀，熊市里是收割机，震荡市里是绞肉机。” ⚙️

全资产动态对冲。
不预测单边涨跌，只捕捉全球市场的呼吸节律。

🔗 宏观收益曲线：https://sparkunioncapital.com
#SPARK #HedgeFundLife #QuantTrading #RiskManagement #MacroAlpha`,
      tiktokHook: "为什么顶尖对冲基金根本不关心明天大盘是涨还是跌？",
      tiktokOnScreen: "听，这是机房服务器平稳的轰鸣声 🔊",
      tiktokVideoIdea: "机房散热指示灯特写 + 震撼声效与平稳收益曲线对比",
    },
    {
      title: "【SPARK 终极愿景】让 AI 自主发行一只 ETF，而人类只负责按下‘同意’",
      coreMessage: "全流程由 AI Agent 闭环运行，培育能自我进化、自我赚钱、自我负责的数字金融生命体。",
      callToAction: "加入 SPARK 全球机构观察者网络：https://sparkunioncapital.com",
      platforms: ["TWITTER", "FACEBOOK", "INSTAGRAM", "TIKTOK"],
      status: "APPROVED",
      twitterHook: "“我们的终极目标，是让AI自主发行一只ETF，而人类只负责按下‘同意’。”",
      twitterCaption: `从因子挖掘到策略构建，再到风险预算和链上清算，全流程由 AI Agent 完成。

我们不是在管理基金，我们是在培育一个能自己进化、自己赚钱、自己对自己负责的数字生命体。

🌐 探索未来: https://sparkunioncapital.com
#FutureOfFinance #AIAgents #Web3 #ETF #SPARK`,
      fbCaption: `【SPARK 远景宣言 | 数字生命体的黎明】

“我们的终极目标，是让 AI 自主发行一只 ETF，而人类只负责按下‘同意’。”

传统的资产管理体系建立在人性的层层审核与信任成本之上。而 SPARK 正在重构这一底层范式。

从多模态全球另类数据接入、算法因子挖掘，到组合风险预算、智能拆单与链上实时清算，全链路均由协同分工的 AI Agents 自动运转。

我们不把自己定义为传统的人力基金管理者；我们在物理与代码的交界处，培育一个能够自我学习、自我优化、自我负责的数字金融生命体。

未来已来。欢迎与 SPARK 一道见证金融新范式的确立。

👉 探索 SPARK AI 原生自主资产管理架构：https://sparkunioncapital.com`,
      igCaption: `“我们的终极目标，是让 AI 自主发行一只 ETF，而人类只负责按下‘同意’。” 🚀

全流程 AI Agent 自动化闭环。
重新定义数字时代的资产管理。

🔗 探索：https://sparkunioncapital.com
#SPARK #Web3Finance #ArtificialIntelligence #NextGenQuant #Innovation`,
      tiktokHook: "人类基金经理的时代，真的要被彻底终结了吗？",
      tiktokOnScreen: "让AI自主运营并发行一只ETF 🤖📈",
      tiktokVideoIdea: "未来概念科幻感金融UI + 智能体自主协作拓扑图动态展开",
    },
  ];

  for (const item of sampleItems) {
    const content = await db.contentItem.create({
      data: {
        organizationId: org.id,
        clientId,
        title: item.title,
        coreMessage: item.coreMessage,
        internalBrief: item.coreMessage,
        callToAction: item.callToAction,
        contentType: "IMAGE",
        platforms: JSON.stringify(item.platforms),
        status: item.status,
        createdBy: "SPARK AI Lead",
      },
    });

    // Create 4 variants: TWITTER, FACEBOOK, INSTAGRAM, TIKTOK
    await db.postVariant.createMany({
      data: [
        {
          organizationId: org.id,
          clientId,
          contentItemId: content.id,
          platform: "TWITTER",
          hook: item.twitterHook,
          caption: item.twitterCaption,
          cta: item.callToAction,
          hashtags: "#Quant #Alpha #AI #FinTwit #SPARK",
          language: "Chinese",
          generationStatus: "GENERATED",
          approvalStatus: "APPROVED",
        },
        {
          organizationId: org.id,
          clientId,
          contentItemId: content.id,
          platform: "FACEBOOK",
          headline: item.title,
          caption: item.fbCaption,
          cta: item.callToAction,
          hashtags: "#SPARKQuant #AI #GlobalMarkets #Transparency",
          language: "Chinese",
          generationStatus: "GENERATED",
          approvalStatus: "APPROVED",
        },
        {
          organizationId: org.id,
          clientId,
          contentItemId: content.id,
          platform: "INSTAGRAM",
          hook: item.twitterHook,
          caption: item.igCaption,
          cta: item.callToAction,
          hashtags: "#SPARK #Quant #Crypto #Finance #ArtificialIntelligence",
          language: "Chinese",
          generationStatus: "GENERATED",
          approvalStatus: "APPROVED",
        },
        {
          organizationId: org.id,
          clientId,
          contentItemId: content.id,
          platform: "TIKTOK",
          hook: item.tiktokHook,
          onScreenText: item.tiktokOnScreen,
          videoIdea: item.tiktokVideoIdea,
          caption: item.twitterCaption,
          cta: item.callToAction,
          hashtags: "#量化交易 #AI科技 #黑天鹅 #金融创新",
          language: "Chinese",
          generationStatus: "GENERATED",
          approvalStatus: "APPROVED",
        },
      ],
    });
  }

  console.log(`✅ SPARK QUANT LABS workspace successfully seeded with 12 Pillars, 4 Services, and 5 Multi-Platform Master Content items!`);
}

seedSparkClient()
  .catch((err) => {
    console.error("Error seeding SPARK:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
