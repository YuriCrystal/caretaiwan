// Top 50 情境資料 (Phase 1 = 35 條種子，10 條範例填充內容；其餘 stub 待補)
// 倒金字塔格式：level (red/orange/green) → steps → whenToER → source
// 內容草稿：必須經台灣醫護專業審核才能上線

export type Level = "red" | "orange" | "green";

export type Scenario = {
  id: string;        // "01", "02", ...
  category: CategoryId;
  title: string;     // 中文
  level: Level;
  headline: string;  // 紅橘綠下面的核心動作（一行）
  steps: string[];   // 處置 1-3 步
  whenToER: string;  // 何時送醫
  source: string;    // 具名來源
  details?: string;  // [可選] 詳細說明
  phase: 1 | 2;
};

export type CategoryId =
  | "emergency"
  | "vitals"
  | "medication"
  | "bedridden"
  | "dementia"
  | "feeding";

export const CATEGORIES: Record<CategoryId, { icon: string; label: string; color: string }> = {
  emergency:  { icon: "🚨", label: "緊急狀況", color: "bg-red-50 dark:bg-red-950" },
  vitals:     { icon: "🌡️", label: "生理徵象", color: "bg-orange-50 dark:bg-orange-950" },
  medication: { icon: "💊", label: "用藥",     color: "bg-blue-50 dark:bg-blue-950" },
  bedridden:  { icon: "🛏️", label: "臥床照護", color: "bg-purple-50 dark:bg-purple-950" },
  dementia:   { icon: "🧠", label: "失智行為", color: "bg-pink-50 dark:bg-pink-950" },
  feeding:    { icon: "🍚", label: "飲食吞嚥", color: "bg-green-50 dark:bg-green-950" },
};

export const SCENARIOS: Scenario[] = [
  // 🚨 緊急狀況
  {
    id: "01", category: "emergency", phase: 1, level: "red",
    title: "跌倒後爬不起來／喊痛",
    headline: "立刻送醫",
    steps: [
      "不要拉起來。問哪裡痛、能不能動腳趾／手指",
      "蓋毯保暖，保持原姿勢",
      "撥 119",
    ],
    whenToER: "頭部撞到／無法移動／劇痛 → 119",
    source: "AHA 2025 摘要 + 北市府預防跌倒手冊",
    details: "等救護車時：保持清醒、不給水、記下跌倒時間。老人骨頭脆，移動可能造成二次傷害。",
  },
  {
    id: "02", category: "emergency", phase: 1, level: "red",
    title: "突然叫不醒、意識不清",
    headline: "立刻送醫",
    steps: [
      "大聲叫名字、捏耳垂測反應",
      "側躺（防嗆吐物），鬆開衣領",
      "撥 119，告知糖尿病史、用藥",
    ],
    whenToER: "叫不醒 → 直接 119",
    source: "AHA 2025 CPR & ECC 指南摘要（繁中）",
  },
  {
    id: "03", category: "emergency", phase: 1, level: "red",
    title: "嘴歪、半邊無力、講話含糊",
    headline: "中風 — 黃金 3 小時",
    steps: [
      "用 FAST 確認：F 笑容歪 / A 手舉不平 / S 講話含糊",
      "不要餵水或藥",
      "撥 119，記下症狀開始時間",
    ],
    whenToER: "FAST 任 1 項中 → 119",
    source: "台灣腦中風學會 2025 指引",
    details: "3 小時內到院可使用血栓溶解劑（rt-PA），能大幅降低終身失能風險。",
  },
  {
    id: "04", category: "emergency", phase: 1, level: "red",
    title: "胸痛、冒冷汗、喘不過氣",
    headline: "立刻送醫",
    steps: [
      "半坐臥姿勢，鬆開衣領",
      "若曾醫師開硝化甘油舌下含片，含 1 片",
      "撥 119",
    ],
    whenToER: "胸痛超過 5 分鐘 → 119",
    source: "AHA 2025 ACS 摘要",
    details: "女性／糖尿病老人可能無典型胸痛，只覺累、噁心也要警覺。",
  },
  {
    id: "05", category: "emergency", phase: 1, level: "red",
    title: "突然抽搐（癲癇）",
    headline: "立刻送醫",
    steps: [
      "不要壓制、不要塞東西進嘴",
      "移開周圍硬物，側躺保護頭部",
      "計時：超過 5 分鐘撥 119",
    ],
    whenToER: "首次發作 / >5 分鐘 / 連續發作 → 119",
    source: "AHA 2025 First Aid",
    details: "抽完後嗜睡是正常的，繼續側躺觀察呼吸。",
  },
  {
    id: "06", category: "emergency", phase: 1, level: "red",
    title: "嘔吐物有血或像咖啡渣",
    headline: "立刻送醫",
    steps: [
      "禁食禁水",
      "側躺，保留嘔吐物給醫護看",
      "撥 119",
    ],
    whenToER: "見血或咖啡渣 → 119",
    source: "急診醫學會",
  },
  {
    id: "07", category: "emergency", phase: 1, level: "red",
    title: "解黑便或大量血便",
    headline: "立刻送醫",
    steps: [
      "禁食禁水",
      "平躺、雙腳墊高",
      "拍照保留糞便給醫護看，撥 119",
    ],
    whenToER: "黑便（瀝青色）/ 鮮紅大量 → 119",
    source: "急診醫學會",
  },
  {
    id: "08", category: "emergency", phase: 1, level: "red",
    title: "呼吸急促、嘴唇發紫",
    headline: "立刻送醫",
    steps: [
      "半坐臥，鬆衣領",
      "若有家用氧氣，依醫囑使用",
      "撥 119",
    ],
    whenToER: "嘴唇／指尖發紫 → 119",
    source: "AHA 2025 摘要",
  },
  {
    id: "09", category: "emergency", phase: 1, level: "red",
    title: "哽到、無法呼吸",
    headline: "哈姆立克 + 119",
    steps: [
      "問「你能說話嗎？」完全不能 → 立刻動作",
      "從背後抱住，拳頭放肚臍上方，向內向上快速擠壓 5 次",
      "失敗就拍背 5 次，交替到吐出，期間請人撥 119",
    ],
    whenToER: "吐出後仍要送醫檢查",
    source: "AHA 2025 哈姆立克章節",
    details: "老人若坐輪椅／臥床：把人拉到地上做胸部按壓。",
  },
  {
    id: "10", category: "emergency", phase: 1, level: "red",
    title: "嚴重燙傷／撞傷流血止不住",
    headline: "立刻送醫",
    steps: [
      "沖、脫、泡、蓋、送：流動水沖 15-20 分鐘，輕輕脫衣（黏住的不要撕）",
      "出血傷口：用乾淨布直接加壓 10 分鐘，不要鬆",
      "撥 119",
    ],
    whenToER: "燙傷面積>手掌 1 個 / 血止不住 → 119",
    source: "紅十字會教材 + 北市傷口照顧",
  },

  // 🌡️ 生理徵象
  {
    id: "11", category: "vitals", phase: 1, level: "orange",
    title: "體溫超過 38.5°C",
    headline: "觀察 + 處置",
    steps: [
      "量耳溫或腋溫確認，補充水分",
      "移除厚被、開電扇（不直吹）",
      "依醫師處方退燒藥（普拿疼一般可，阿斯匹靈兒童禁用）",
    ],
    whenToER: ">39.5°C / 燒>3 天 / 意識改變 / 呼吸喘 → 急診",
    source: "北市府基礎照護手冊「測量體溫」",
  },
  {
    id: "12", category: "vitals", phase: 1, level: "red",
    title: "體溫低於 35°C（失溫）",
    headline: "立刻送醫",
    steps: [
      "移到溫暖處，蓋乾燥毯子（不要熱水袋直接貼皮膚）",
      "不要熱水泡澡、不要喝酒",
      "撥 119",
    ],
    whenToER: "<35°C → 119",
    source: "AHA 2025 + 衛福部寒流防護",
    details: "老人特別危險：可能無寒顫感、易惡化。",
  },
  {
    id: "13", category: "vitals", phase: 1, level: "red",
    title: "血壓 >180/110",
    headline: "可能高血壓危象",
    steps: [
      "休息 5 分鐘後再量一次",
      "平靜坐下，不要劇烈活動",
      "仍 >180/110 + 頭痛／視力模糊／胸痛 → 撥 119",
    ],
    whenToER: "上述任 1 項 → 119",
    source: "北市府「測量血壓與脈搏」",
  },
  {
    id: "14", category: "vitals", phase: 1, level: "orange",
    title: "血壓 <90/60、頭暈",
    headline: "觀察",
    steps: [
      "平躺，雙腳墊枕頭抬高",
      "補充水分（少量多次）",
      "15 分鐘後再量",
    ],
    whenToER: "仍低 / 意識變化 / 冒冷汗 → 119",
    source: "北市府「測量血壓與脈搏」",
  },
  {
    id: "15", category: "vitals", phase: 1, level: "red",
    title: "血糖 <70（低血糖）",
    headline: "立刻處置",
    steps: [
      "能吞嚥：給 15g 糖（半罐果汁、3 顆方糖、1 大匙蜂蜜）",
      "15 分鐘後再測，仍低再給 15g",
      "不能吞嚥：撥 119，不要灌東西",
    ],
    whenToER: "意識不清 / 灌不進去 → 119",
    source: "北市府「測量血糖」+ 糖尿病學會",
  },
  {
    id: "16", category: "vitals", phase: 1, level: "orange",
    title: "血糖 >300（高血糖）",
    headline: "觀察",
    steps: [
      "補充水分（不含糖）",
      "通知家屬，依醫囑調整胰島素",
      "30 分鐘後再測",
    ],
    whenToER: ">400 / 意識改變 / 呼吸帶水果味 / 嘔吐 → 119",
    source: "北市府「測量血糖」+ 糖尿病學會",
    details: "糖尿病酮酸中毒前兆：水果味呼吸 + 深快呼吸。",
  },
  {
    id: "17", category: "vitals", phase: 1, level: "red",
    title: "手腳冰冷／脈搏摸不到",
    headline: "立刻送醫",
    steps: [
      "平躺保暖，雙腳墊高",
      "量血壓、心跳",
      "撥 119",
    ],
    whenToER: "脈搏弱／快／不規則 → 119",
    source: "AHA 2025",
    details: "老人指尖摸不到脈搏：可改摸頸動脈。",
  },
  {
    id: "18", category: "vitals", phase: 1, level: "orange",
    title: "呼吸有痰音、咳不出來",
    headline: "觀察 + 處置",
    steps: [
      "半坐臥姿勢，拍背（手成杯狀，由下往上）",
      "鼓勵深呼吸 + 有效咳嗽",
      "若有抽痰機，依操作流程抽痰",
    ],
    whenToER: "呼吸喘 / 嘴唇發紫 / 發燒 → 119",
    source: "北市府「測量呼吸」",
    details: "長期臥床：每 2 小時翻身 + 拍背預防肺炎。",
  },

  // 💊 用藥
  {
    id: "19", category: "medication", phase: 1, level: "green",
    title: "漏吃一餐藥",
    headline: "一般處置",
    steps: [
      "想起時間 < 下次服藥的一半：補吃",
      "想起時間 ≥ 一半：跳過，下次正常吃",
      "不要吃雙倍",
    ],
    whenToER: "胰島素／抗凝血藥／降血糖藥漏 → 通知家屬",
    source: "藥師公會居家用藥指引（待確認）",
  },
  {
    id: "20", category: "medication", phase: 1, level: "orange",
    title: "吃完藥後吐了",
    headline: "觀察",
    steps: [
      "吐在 30 分鐘內：算沒吃，補一次",
      "吐在 30-60 分鐘：通常不補，特殊藥例外",
      "超過 60 分鐘：不補",
    ],
    whenToER: "連續嘔吐／吐血 → 119",
    source: "藥師公會居家用藥指引（待確認）",
  },
  {
    id: "22", category: "medication", phase: 1, level: "green",
    title: "不確定藥是哪一顆",
    headline: "查詢處置",
    steps: [
      "用「醫護卡」拍藥袋、藥盒對照",
      "找不到 → 撥健保署藥師諮詢專線 0800-030-598",
      "絕對不要猜著吃",
    ],
    whenToER: "—",
    source: "健保署藥師諮詢專線",
  },
  {
    id: "25", category: "medication", phase: 1, level: "red",
    title: "服抗凝血藥者受傷出血",
    headline: "立刻送醫",
    steps: [
      "直接加壓止血 15 分鐘（不要鬆開看）",
      "抬高傷口",
      "撥 119，告知藥名 + 上次服藥時間",
    ],
    whenToER: "抗凝血藥（華法林／可邁丁／普栓達）使用者只要傷口較深 → 119",
    source: "心臟學會 + 藥師公會",
    details: "家中要備藥袋／用藥清單方便急診查。",
  },

  // 🛏️ 臥床照護／管路
  {
    id: "26", category: "bedridden", phase: 1, level: "green",
    title: "翻身姿勢與頻率",
    headline: "日常照護",
    steps: [
      "每 2 小時翻一次（含半夜）",
      "順序：仰躺 → 左側 → 仰躺 → 右側",
      "側躺時：膝間夾枕、背後墊枕，避免壓傷",
    ],
    whenToER: "—",
    source: "北市府「翻身技巧」",
    details: "腳踝、屁股、肩胛骨易壓瘡。可用 3 秒記錄打勾翻身時間。",
  },
  {
    id: "27", category: "bedridden", phase: 1, level: "orange",
    title: "屁股出現紅斑（褥瘡前兆）",
    headline: "立刻處置",
    steps: [
      "不要按摩紅處（會更傷）",
      "立即翻身、避免壓那一面",
      "保持乾燥，可塗凡士林保護",
    ],
    whenToER: "紅斑 24 小時不退 / 破皮 / 滲液 → 回診",
    source: "北市府「壓傷照顧」",
  },
  {
    id: "29", category: "bedridden", phase: 1, level: "red",
    title: "鼻胃管脫出",
    headline: "不要自行插回",
    steps: [
      "絕對不要塞回去（可能誤插氣管）",
      "用紗布蓋住鼻孔",
      "通知家屬，撥 119 或回原院重置",
    ],
    whenToER: "脫出 → 立即就醫",
    source: "北市府「鼻胃管日常照顧」",
    details: "等候時：暫停灌食、口腔保持濕潤。",
  },
  {
    id: "30", category: "bedridden", phase: 1, level: "orange",
    title: "尿管阻塞或漏尿",
    headline: "處置",
    steps: [
      "檢查尿管有無折到、壓到",
      "確認尿袋低於膀胱位置",
      "鼓勵多喝水（若無限水醫囑）",
    ],
    whenToER: "12 小時無尿液 / 血尿 / 發燒 → 急診",
    source: "北市府「會陰沖洗及尿管照顧」",
  },
  {
    id: "31", category: "bedridden", phase: 1, level: "green",
    title: "鼻胃管灌食前確認步驟",
    headline: "日常 SOP",
    steps: [
      "抽回胃內容物：>100ml → 暫停灌，30 分鐘後再試",
      "確認灌食姿勢：頭部抬 30-45 度，灌完維持 30 分鐘",
      "灌食速度：200ml 約 15-20 分鐘",
    ],
    whenToER: "抽回物有血／咖啡渣／大量 → 通知家屬",
    source: "北市府「鼻胃管日常照顧」",
    details: "禁忌：平躺灌食、灌完立刻平躺（會嗆）。",
  },

  // 🧠 失智／行為
  {
    id: "34", category: "dementia", phase: 1, level: "green",
    title: "半夜不睡覺、想出門",
    headline: "陪伴 + 引導，不爭辯",
    steps: [
      "不要強拉、不要爭辯，先安靜陪伴",
      "開小燈，陪坐 5-10 分鐘，放輕音樂或熟悉的歌",
      "引導：「外面太晚了，我們等天亮再去」",
    ],
    whenToER: "突然性格大變 / 嚴重幻覺 → 神經科回診",
    source: "高雄長庚 KCG Q3-1 晚上睡不著",
    details:
      "白天預防：(1) 早晨曬太陽 30 分鐘調整生理時鐘 (2) 適度活動但不過量 (3) 午睡控制在 1 小時內 (4) 傍晚後減少咖啡、茶 (5) 固定時間就寢、固定臥室環境。失智長輩易日夜顛倒，需從白天活動著手，半夜處置只是末端。",
  },
  {
    id: "35", category: "dementia", phase: 2, level: "green",
    title: "不認人／指責看護偷東西",
    headline: "妄想是病症，不要爭辯",
    steps: [
      "不要否認、不要解釋，不爭「我沒偷」",
      "幫忙「找」東西：陪他一起找，假裝找到了",
      "重要物品（鈔票、首飾）放固定位置，準備幾個常被「藏」的角落清單",
    ],
    whenToER: "妄想加劇影響進食或睡眠 → 神經科",
    source: "高雄長庚 KCG Q4-3 看到不存在的人 + Q4-4 妄想偷竊",
    details:
      "妄想偷竊與認錯人都是失智症常見「精神行為症狀（BPSD）」，源於記憶斷層加上焦慮。爭辯只會強化指控。可以說：「我們一起找好嗎？我幫你」，找到後說：「啊它在這裡，記得放好喔」。長期可請醫師評估是否需藥物。",
  },
  {
    id: "38", category: "dementia", phase: 2, level: "green",
    title: "拒絕洗澡",
    headline: "不要強迫，等一下再試",
    steps: [
      "不要大聲責罵，不要強拉脫衣（會讓拒絕加劇）",
      "等幾分鐘到幾小時，心情變了再鼓勵：「我們等下要去拜訪 XXX，先洗一下」",
      "若仍拒絕，退一步：至少換件乾淨衣服",
    ],
    whenToER: "—",
    source: "高雄長庚 KCG Q2-1 不洗澡",
    details:
      "三大拒絕原因：(1) 自覺沒有洗澡的必要——若整天待冷氣房沒流汗 (2) 忘了怎麼洗澡——記憶倒退到沒蓮蓬頭年代，可改回肥皂＋水瓢的老方式 (3) 不喜歡協助方式——先聊天建立信任再洗。技巧：技巧性把茶水潑在衣角讓他想換衣、用「拜訪親友」「敬神」當理由。",
  },
  {
    id: "39", category: "dementia", phase: 1, level: "orange",
    title: "突然躁動、想打人（黃昏躁動）",
    headline: "安全第一",
    steps: [
      "保持距離，移開危險物（剪刀、熱水、玻璃）",
      "不要正面阻擋，從旁站立、雙手放低",
      "用平緩語氣轉移：「我們去窗邊看夕陽」「來喝點水」",
    ],
    whenToER: "傷及自己或他人 / 持續超過 1 小時 → 119（緊急）／神經科（後續）",
    source: "高雄長庚 KCG Q4-2 黃昏躁動",
    details:
      "「黃昏症候群（Sundowning）」是失智症常見現象——傍晚因疲勞、光線變化、白天活動太多累積後爆發。預防：(1) 白天規律活動但不過量 (2) 黃昏時段拉開窗簾保持光線 (3) 播放熟悉音樂 (4) 不要安排訪客或新刺激。自身安全：必要時離開房間、先保自己。",
  },
  {
    id: "40", category: "dementia", phase: 2, level: "green",
    title: "不肯吃飯／藏食物",
    headline: "找原因，不強餵",
    steps: [
      "確認牙齒、口腔有沒有不舒服（牙痛、潰瘍）",
      "改變食物：切碎、加香料增加味道、少量多餐",
      "陪伴吃飯，看護自己也坐下吃一點，營造氣氛",
    ],
    whenToER: "1 週體重明顯下降 / 完全拒食超過 24 小時 → 回診",
    source: "高雄長庚 KCG Q1-2 不吃飯",
    details:
      "不吃飯的常見原因：味覺退化、牙齒問題、藥物副作用、憂鬱、忘了如何使用餐具。技巧：(1) 用熟悉的碗筷 (2) 食物溫度適中 (3) 餐桌簡潔不放雜物 (4) 每次只給一道菜避免選擇困擾 (5) 鼓勵但不催促。藏食物是常見行為，不必責怪，定期清查藏處避免變質。",
  },
  {
    id: "41", category: "dementia", phase: 1, level: "red",
    title: "走失應變",
    headline: "黃金 30 分鐘",
    steps: [
      "先找住家附近 500 公尺、慣去地點（公園、廟宇、舊家方向）",
      "撥 110 報失蹤，準備：照片、衣著、健保卡資料",
      "通知家屬，啟動老人手鍊／GPS（若有）",
    ],
    whenToER: "—",
    source: "高雄長庚 KCG Q4-1 預防走失 + 失智症協會",
    details:
      "預防：(1) 縫姓名電話於外衣 (2) 配戴愛的手鍊（失智症協會免費申請）(3) 拍近期清晰照片備用 (4) 大門裝上響鈴或反鎖機制 (5) 認識鄰居、留聯絡方式。失智關懷專線 0800-474-580。走失多發生在「走出去後不知怎麼回」，不一定是想離開。",
  },
  {
    id: "21", category: "dementia", phase: 2, level: "green",
    title: "拒絕吃藥",
    headline: "不要硬塞，找原因",
    steps: [
      "不要大聲斥責或強塞（會加劇拒絕、可能受傷）",
      "觀察拒絕原因：(a) 藥太大難吞 (b) 副作用不舒服 (c) 心理排斥",
      "通知家屬，下次回診跟醫師商量改藥型（藥水／貼片／粉狀）",
    ],
    whenToER: "完全拒藥 ≥ 2 餐 / 是急性病用藥 → 通知家屬／回診",
    source: "高雄長庚 KCG Q1-3 排斥吃藥",
    details:
      "技巧（KCG 建議）：(1) 將藥水加入飲水或軟食 (2) 將藥丸放入空維他命罐，告訴他「這是保健品，吃了有精神」(3) 不可擅自停藥或改劑量 (4) 觀察吃藥前後身心變化告訴醫師。心理排斥常因久病情緒低落，多用鼓勵語句。",
  },

  // 🍚 飲食吞嚥／排泄
  {
    id: "42", category: "feeding", phase: 1, level: "orange",
    title: "吃飯一直嗆咳",
    headline: "處置",
    steps: [
      "立刻停止餵食",
      "坐直、頭略前傾（不要後仰）",
      "拍背幫助咳出",
    ],
    whenToER: "發燒 + 呼吸喘（吸入性肺炎）/ 反覆嗆咳 → 急診",
    source: "北市府「餵食須知」",
    details: "改善：食物切碎、加增稠劑、小口慢吃。長期請語言治療師評估吞嚥。",
  },
  {
    id: "44", category: "feeding", phase: 1, level: "green",
    title: "三天沒大便（便秘）",
    headline: "日常處置",
    steps: [
      "增加水分、纖維（蔬果、燕麥）",
      "腹部按摩（順時針，肚臍周圍）",
      "鼓勵活動／坐起",
    ],
    whenToER: ">5 天 / 腹脹硬 / 嘔吐 → 急診（可能腸阻塞）",
    source: "北市府「便祕照顧」",
  },
  {
    id: "45", category: "feeding", phase: 1, level: "orange",
    title: "拉肚子超過一天",
    headline: "觀察 + 補水",
    steps: [
      "少量多次補水（運動飲料對半稀釋、米湯）",
      "暫停高纖、奶製品、油膩",
      "記錄次數 + 量 + 顏色",
    ],
    whenToER: "發燒 / 血便 / 脫水（皮膚捏起不回彈、尿量少）→ 急診",
    source: "國健署老人腹瀉脫水評估",
    details: "老人脫水快：超過 6 次／天 → 回診。",
  },
  {
    id: "46", category: "feeding", phase: 1, level: "orange",
    title: "一天嘔吐 3 次以上",
    headline: "觀察",
    steps: [
      "暫停進食 1-2 小時",
      "少量多次補水（一次 1 大匙）",
      "側躺防嗆",
    ],
    whenToER: "吐血 / 咖啡渣 / 意識變化 / 嚴重腹痛 → 119",
    source: "急診醫學會",
    details: "老人嘔吐 + 頭痛：警覺中風、腦壓高。",
  },
  {
    id: "50", category: "feeding", phase: 1, level: "red",
    title: "突然不會吞口水（吞嚥障礙）",
    headline: "立刻送醫",
    steps: [
      "禁食禁水",
      "半坐臥，避免口水嗆入肺",
      "撥 119",
    ],
    whenToER: "突發性 → 可能中風（用 FAST 再確認）",
    source: "台灣腦中風學會 2025",
    details: "流口水 + 嘴歪 → 中風機率高，黃金 3 小時送醫。",
  },
];

export function getScenarioById(id: string) {
  return SCENARIOS.find((s) => s.id === id);
}

export function getScenariosByCategory(cat: CategoryId) {
  return SCENARIOS.filter((s) => s.category === cat);
}

export function searchScenarios(query: string) {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return SCENARIOS.filter(
    (s) =>
      s.title.toLowerCase().includes(q) ||
      s.headline.toLowerCase().includes(q) ||
      s.steps.some((st) => st.toLowerCase().includes(q))
  );
}
