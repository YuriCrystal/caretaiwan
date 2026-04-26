// 就醫溝通常用短句（4 語：繁中／英／印尼／越南）
// 來源：北市府外籍看護照顧手冊三語版（2022）+ 看護常用情境
// Phase 1 提供，Phase 1.5 後可擴增

export type Phrase = {
  zh: string;
  en: string;
  id: string; // Bahasa Indonesia
  vi: string; // Tiếng Việt
};

export const UNIVERSAL_PHRASES: Phrase[] = [
  {
    zh: "我是看護，這是我照顧的長輩。",
    en: "I am the caregiver. This is the patient I look after.",
    id: "Saya pengasuh. Ini lansia yang saya rawat.",
    vi: "Tôi là người chăm sóc. Đây là người già tôi đang chăm sóc.",
  },
  {
    zh: "請聯繫家屬。",
    en: "Please contact the family.",
    id: "Tolong hubungi keluarga.",
    vi: "Xin liên hệ với gia đình.",
  },
  {
    zh: "請說中文，慢一點。",
    en: "Please speak Mandarin slowly.",
    id: "Tolong bicara Mandarin pelan-pelan.",
    vi: "Xin nói tiếng Trung chậm hơn.",
  },
  {
    zh: "我聽不懂，請寫下來。",
    en: "I don't understand. Please write it down.",
    id: "Saya tidak mengerti. Tolong tuliskan.",
    vi: "Tôi không hiểu. Xin viết ra giấy.",
  },
];

// 紅燈情境的就醫一句話描述
export const SCENARIO_PHRASES: Record<string, Phrase> = {
  "01": {
    zh: "他剛剛跌倒了，可能受傷。",
    en: "He just fell and may be injured.",
    id: "Dia baru saja jatuh dan mungkin terluka.",
    vi: "Bà ấy vừa bị ngã và có thể bị thương.",
  },
  "02": {
    zh: "他叫不醒、意識不清。",
    en: "He won't wake up. He's unconscious.",
    id: "Dia tidak bisa dibangunkan, tidak sadarkan diri.",
    vi: "Bà ấy gọi không tỉnh, mất ý thức.",
  },
  "03": {
    zh: "他嘴歪、半邊無力、講話含糊。可能中風。",
    en: "His face is drooping, one side is weak, speech is slurred. Possible stroke.",
    id: "Mulutnya miring, satu sisi tubuh lemas, bicaranya tidak jelas. Mungkin stroke.",
    vi: "Miệng méo, nửa người yếu, nói lắp bắp. Có thể bị đột quỵ.",
  },
  "04": {
    zh: "他胸痛、冒冷汗、喘不過氣。",
    en: "He has chest pain, cold sweat, and shortness of breath.",
    id: "Dia merasa nyeri dada, keringat dingin, dan sesak napas.",
    vi: "Bà ấy đau ngực, đổ mồ hôi lạnh, khó thở.",
  },
  "05": {
    zh: "他突然抽搐了。",
    en: "He had a sudden seizure.",
    id: "Dia tiba-tiba kejang.",
    vi: "Bà ấy đột nhiên co giật.",
  },
  "06": {
    zh: "他嘔吐物有血或像咖啡渣。",
    en: "His vomit has blood or looks like coffee grounds.",
    id: "Muntahnya berdarah atau seperti ampas kopi.",
    vi: "Bà ấy nôn ra máu hoặc giống bã cà phê.",
  },
  "07": {
    zh: "他解黑便或大量血便。",
    en: "His stool is black or has a lot of blood.",
    id: "Tinjanya hitam atau berdarah banyak.",
    vi: "Phân của bà ấy đen hoặc có nhiều máu.",
  },
  "08": {
    zh: "他呼吸急促、嘴唇發紫。",
    en: "He has rapid breathing and his lips are turning blue.",
    id: "Napasnya cepat dan bibirnya membiru.",
    vi: "Bà ấy thở gấp và môi tím tái.",
  },
  "09": {
    zh: "他剛剛哽到了，無法呼吸。",
    en: "He just choked and couldn't breathe.",
    id: "Dia baru saja tersedak dan tidak bisa bernapas.",
    vi: "Bà ấy vừa bị nghẹn và không thở được.",
  },
  "10": {
    zh: "他嚴重燙傷／撞傷流血。",
    en: "He has a serious burn / injury with bleeding.",
    id: "Dia luka bakar serius / luka berdarah.",
    vi: "Bà ấy bị bỏng nặng / chảy máu nhiều.",
  },
  "12": {
    zh: "他體溫太低，可能失溫。",
    en: "His body temperature is too low. Possible hypothermia.",
    id: "Suhu tubuhnya terlalu rendah. Mungkin hipotermia.",
    vi: "Nhiệt độ cơ thể quá thấp. Có thể bị hạ thân nhiệt.",
  },
  "13": {
    zh: "他血壓太高（超過 180/110），有頭痛／視力模糊／胸痛。",
    en: "His blood pressure is too high (over 180/110), with headache / blurred vision / chest pain.",
    id: "Tekanan darahnya terlalu tinggi (di atas 180/110), disertai sakit kepala / penglihatan kabur / nyeri dada.",
    vi: "Huyết áp quá cao (trên 180/110), kèm đau đầu / mờ mắt / đau ngực.",
  },
  "16": {
    zh: "他血糖太高（超過 300），可能需要調整胰島素。",
    en: "His blood sugar is too high (over 300). Insulin adjustment may be needed.",
    id: "Gula darahnya terlalu tinggi (di atas 300). Mungkin perlu penyesuaian insulin.",
    vi: "Đường huyết quá cao (trên 300). Có thể cần điều chỉnh insulin.",
  },
  "15": {
    zh: "他血糖太低（< 70），快不行了。",
    en: "His blood sugar is too low (below 70). It's an emergency.",
    id: "Gula darahnya terlalu rendah (di bawah 70). Darurat.",
    vi: "Đường huyết quá thấp (dưới 70). Khẩn cấp.",
  },
  "17": {
    zh: "他手腳冰冷、脈搏摸不到。",
    en: "His hands and feet are cold. I can't find his pulse.",
    id: "Tangan dan kakinya dingin. Saya tidak bisa menemukan denyutnya.",
    vi: "Tay chân lạnh, không bắt được mạch.",
  },
  "25": {
    zh: "他在吃抗凝血藥，現在受傷流血。",
    en: "He takes blood thinners and is now bleeding from an injury.",
    id: "Dia mengonsumsi obat pengencer darah dan sekarang berdarah karena cedera.",
    vi: "Bà ấy đang uống thuốc chống đông máu và đang chảy máu do bị thương.",
  },
  "29": {
    zh: "他的鼻胃管脫出來了。",
    en: "His nasogastric tube has come out.",
    id: "Selang makan hidungnya lepas.",
    vi: "Ống thông dạ dày qua mũi của bà ấy bị tuột ra.",
  },
  "41": {
    zh: "他失智，剛剛走失了。",
    en: "He has dementia and just got lost.",
    id: "Dia mengidap demensia dan baru saja hilang.",
    vi: "Bà ấy bị sa sút trí tuệ và vừa đi lạc.",
  },
  "50": {
    zh: "他突然不會吞口水，可能是中風。",
    en: "He suddenly can't swallow saliva. Possible stroke.",
    id: "Dia tiba-tiba tidak bisa menelan ludah. Mungkin stroke.",
    vi: "Bà ấy đột nhiên không nuốt được nước bọt. Có thể bị đột quỵ.",
  },
};
