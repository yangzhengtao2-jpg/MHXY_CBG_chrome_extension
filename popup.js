// popup.js

// ===================================================================
// 1. 数据和状态管理
// ===================================================================
let allCharactersData = null; // 缓存从页面提取的所有角色数据

// ===================================================================
// 2. DOM 元素获取
// ===================================================================
const extractBtn = document.getElementById('extract');
const estimateBtn = document.getElementById('estimate');
const characterSelect = document.getElementById('characterSelect');
const resultArea = document.getElementById('result');
const loading = document.getElementById('loading');

// ===================================================================
// 3. UI 辅助函数
// ===================================================================
function showLoading() {
  loading.style.display = 'block';
  resultArea.style.display = 'none';
}

function hideLoading() {
  loading.style.display = 'none';
  resultArea.style.display = 'block';
}

function showResult(content) {
  resultArea.innerHTML = content;
  hideLoading();
}

function showError(message) {
  showResult(`<div class="error">错误：${message}</div>`);
}

// ===================================================================
// 4. 核心估价逻辑 (与Python代码逻辑完全对齐)
// ===================================================================

// --- 消耗数据表 ---
const gongxiu25 = [45, 108, 195, 312, 465, 660, 903, 1200, 1557, 1980, 2475, 3048, 3705, 4452, 5295, 6240, 7293, 8460, 9747, 11160, 14118, 15663, 17346, 19173, 21150];
const fangxiu25 = [30, 72, 130, 208, 310, 440, 602, 800, 1038, 1320, 1650, 2032, 2470, 2968, 3530, 4160, 4862, 5640, 6498, 7440, 9412, 10442, 11564, 12782, 14100];
const congxiu25 = [150, 360, 650, 1040, 1550, 2200, 3010, 4000, 5190, 6600, 8250, 10160, 12350, 14840, 17650, 20800, 24310, 28200, 32490, 37200, 42350, 47960, 54050, 60640, 67750];
const shimen180 = [6, 18, 37, 65, 103, 154, 221, 307, 417, 556, 730, 946, 1212, 1537, 1930, 2402, 2965, 3632, 4418, 5337, 6407, 7645, 9071, 10707, 12575, 14699, 17103, 19817, 22867, 26287, 30107, 34362, 39087, 44321, 50104, 56478, 63487, 71177, 79596, 88795, 98827, 109747, 121612, 134483, 148421, 163491, 179761, 197301, 216183, 236482, 258277, 281648, 306679, 333456, 362069, 392610, 425175, 459862, 496773, 536013, 577689, 621913, 668799, 718465, 771033, 826628, 885377, 947413, 1012871, 1081890, 1154613, 1231187, 1311762, 1396492, 1485535, 1579053, 1677213, 1780184, 1888140, 2001259, 2119724, 2243722, 2373443, 2509083, 2650841, 2798921, 2953532, 3114887, 3283203, 3458703, 3641613, 3832164, 4030593, 4237141, 4452054, 4675583, 4907983, 5149516, 5400447, 5661046, 5931590, 6212360, 6503643, 6805730, 7118918, 7443510, 7779813, 8128141, 8488813, 8862152, 9248489, 9648160, 10061506, 10488874, 10930617, 11387094, 11858670, 12345715, 12848606, 13367726, 13903463, 14456212, 15026375, 15614359, 16220577, 16845450, 17489404, 18152872, 18836293, 19540112, 20264783, 21010764, 21778521, 22568526, 23381259, 24217206, 25076859, 25960719, 26869292, 27803091, 28762638, 29748460, 30761093, 31801079, 32868967, 33965314, 35090685, 36245650, 37430789, 38646689, 41141197, 43699616, 46323165, 49013079, 51770606, 56010213, 60355058, 64807085, 69368262, 74040581, 74490622, 79085185, 83765323, 88532092, 93386557, 98329783, 103362847, 108486832, 113702827, 119011927, 126216334, 133547824, 141007888, 148598017, 156319717, 166138192, 176124919, 186281812, 196610791, 208863391];
const bangpai160 = [4003, 12009, 24018, 40032, 60051, 84076, 112109, 144152, 180207, 220276, 264363, 312471, 364604, 420766, 480962, 545198, 613479, 685812, 762205, 842664, 927283, 1015996, 1108814, 1205748, 1306810, 1412012, 1521369, 1634894, 1752604, 1874514, 2000641, 2131003, 2265620, 2404511, 2547698, 2695202, 2847047, 3003256, 3163855, 3328871, 3498331, 3672263, 3850698, 4033667, 4221202, 4413337, 4610107, 4811548, 5017697, 5228594, 5444279, 5664794, 5890182, 6120488, 6355758, 6596040, 6841383, 7091838, 7347458, 7608296, 7874408, 8145851, 8422684, 8704968, 8992765, 9286139, 9585157, 9889886, 10200395, 10516756, 10839043, 11167330, 11501695, 11842216, 12188975, 12542055, 12901540, 13267518, 13640077, 14019309, 14405308, 14798168, 15197988, 15604867, 16018907, 16440212, 16868889, 17305047, 17748797, 18200252, 18659527, 19126741, 19602015, 20085471, 20577235, 21077435, 21586201, 22103666, 22629965, 23165237, 23709622, 24263263, 24826306, 25398900, 25981196, 26573347, 27175511, 27787847, 28410516, 29043684, 29687519, 30342192, 31007876, 31684747, 32372985, 33072773, 33784295, 34507740, 35243300, 35991168, 36751542, 37524623, 38310615, 39109724, 39922160, 40748137, 41587871, 42441581, 43309490, 44191825, 45088815, 46000693, 46927695, 47870061, 48828034, 49801860, 50791790, 51798076, 52820975, 53860748, 54917659, 55991975, 57083968, 58193912, 59322085, 60468770, 61634252, 62818821, 64022771, 65870025, 67753234, 69673008, 71629965, 73624728, 76364531, 79160953, 82014966, 84927554, 87899713, 90932443];
// 新增：强化60消耗表（Python代码中的qiangzhuang60）
const qiangzhuang60 = [430000, 925000, 1495000, 2150000, 2900000, 3755000, 4725000, 5820000, 7050000, 8425000, 9955000, 11650000, 13520000, 15575000, 17825000, 20280000, 22950000, 25845000, 28975000, 32350000, 35980000, 39875000, 44045000, 48500000, 53250000, 58305000, 63675000, 69370000, 75400000, 81775000, 88505000, 95600000, 103070000, 110925000, 119175000, 127830000, 136900000, 146395000, 156325000, 166700000, 179530000, 194825000, 212595000, 232850000, 255600000, 280855000, 308625000, 338920000, 371750000, 407125000, 445055000, 485550000, 528620000, 574275000, 622525000, 673380000, 726850000, 782945000, 841675000, 903050000];

// --- 全局配置 ---
const GUOZI_PRICE = 90;
const WAN_GOLD_TO_RMB = 13.7;

/**
 * 根据等级和消耗表计算消耗
 * @param {number} level - 技能或修炼等级
 * @param {Array<number>} table - 消耗表
 * @returns {number} - 总消耗
 */
function cost(level, table) {
    if (level <= 0) return 0;
    const safeLevelIndex = Math.min(level - 1, table.length - 1);
    return table[safeLevelIndex];
}

/**
 * 核心估价函数 (与Python calc_cost完全对齐)
 * @param {object} character - 包含 data 和 price 的完整角色对象
 * @returns {object} - 包含各项成本和性价比的计算结果
 */
function calculateCost(character) {
    const roleData = character.data;
    const domPriceText = character.price; // 从DOM获取的价格文本 (例如 "¥1,299.00")

    // 1. 人物修炼
    const renLevels = [roleData.iExptSki1 || 0, roleData.iExptSki2 || 0, roleData.iExptSki3 || 0, roleData.iExptSki4 || 0];
    const renPrice = cost(renLevels[0], gongxiu25) + cost(renLevels[1], fangxiu25) + cost(renLevels[2], gongxiu25) + cost(renLevels[3], fangxiu25);

    // 2. 宝宝修炼
    const chongLevels = [roleData.iBeastSki1 || 0, roleData.iBeastSki2 || 0, roleData.iBeastSki3 || 0, roleData.iBeastSki4 || 0];
    const chongPrice = chongLevels.reduce((sum, lvl) => sum + cost(lvl, congxiu25), 0) / 150 * GUOZI_PRICE;

    // 3. 师门技能
    const allSkills = roleData.all_skills || {};
    const shimenLevels = [];
    for (let k = 1; k < 133; k++) {
        if (allSkills.hasOwnProperty(String(k))) shimenLevels.push(allSkills[String(k)]);
    }
    const shimenPrice = shimenLevels.slice(0, 7).reduce((sum, lvl) => sum + cost(lvl, shimen180), 0);

    // 4. 帮派技能 (核心修改：拆分普通/特殊帮派技能计算)
    const specialKeys = ["230", "237"]; // 特殊帮派技能key
    const normalLevels = []; // 普通帮派技能等级（200-240 排除230/237）
    const specialLevels = []; // 特殊帮派技能等级（230/237）

    // 遍历200-240的帮派技能key
    for (let k = 200; k < 241; k++) {
        const kStr = String(k);
        if (allSkills.hasOwnProperty(kStr)) {
            const level = allSkills[kStr];
            // 区分普通/特殊技能
            if (specialKeys.includes(kStr)) {
                specialLevels.push(level);
            } else {
                normalLevels.push(level);
            }
        }
    }

    // 分别计算普通/特殊帮派技能成本
    const normalBangpaiPrice = normalLevels.reduce((sum, lvl) => sum + cost(lvl, bangpai160), 0) * 0.8; // 普通技能乘以0.8系数
    const specialBangpaiPrice = specialLevels.reduce((sum, lvl) => sum + cost(lvl, qiangzhuang60), 0);
    const bangpaiPrice = normalBangpaiPrice + specialBangpaiPrice; // 合并总成本
    
    // 5. 汇总计算
    const totalCostWan = renPrice + chongPrice + (shimenPrice / 10000) + (bangpaiPrice / 10000);
    const xianyuCost = (roleData.xianyu || 0) * 0.03;
    const rmbCost = totalCostWan / WAN_GOLD_TO_RMB + xianyuCost;
    
    // 提取网页标价
    let listPrice = 0;
    if (domPriceText && domPriceText !== '未知价格') {
        const listPriceStr = domPriceText.replace(/[^\d.]/g, ''); // 移除 "¥" 和 ","
        listPrice = parseFloat(listPriceStr) || 0;
    }
    
    const ratio = listPrice > 0 ? rmbCost / listPrice : 0;

    return {
        '人物修炼(万)': renPrice.toFixed(2),
        '宝宝修炼(万)': chongPrice.toFixed(2),
        '师门技能(万)': (shimenPrice / 10000).toFixed(2),
        '帮派技能(万)': (bangpaiPrice / 10000).toFixed(2),
        '总消耗(万)': totalCostWan.toFixed(2),
        '闲鱼币成本(RMB)': xianyuCost.toFixed(2),
        '总成本价(RMB)': rmbCost.toFixed(2),
        '网页标价(RMB)': listPrice.toFixed(2),
        '性价比': ratio.toFixed(3)
    };
}

// ===================================================================
// 5. 更新角色选择下拉框
// ===================================================================
function populateCharacterSelect(characters) {
  characterSelect.innerHTML = '';
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = `-- 共找到 ${characters.length} 个角色，请选择 --`;
  characterSelect.appendChild(defaultOption);

  characters.forEach(char => {
    const option = document.createElement('option');
    option.value = char.index;
    option.textContent = `${char.name} (${char.price})`;
    characterSelect.appendChild(option);
  });

  characterSelect.disabled = false;
}

// ===================================================================
// 6. 事件监听器
// ===================================================================

// 提取所有角色信息
extractBtn.onclick = async () => {
    try {
        showLoading();
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tab.url.includes('xyq.cbg.163.com')) {
            return showError('请在梦幻西游藏宝阁角色列表页或详情页使用。');
        }

        const response = await chrome.tabs.sendMessage(tab.id, { cmd: 'extract_all' });

        if (response.error) {
            showError(response.error);
            allCharactersData = null;
            characterSelect.disabled = true;
            estimateBtn.disabled = true;
            characterSelect.innerHTML = '<option value="">-- 提取失败 --</option>';
        } else {
            allCharactersData = response.characters;
            populateCharacterSelect(allCharactersData);
            estimateBtn.disabled = false;
            showResult('<div class="info">✅ 角色列表已加载，请从上方选择一个角色进行估价。</div>');
        }
    } catch (e) {
        showError('与页面通信失败，请刷新页面重试。\n' + e.message);
        allCharactersData = null;
        characterSelect.disabled = true;
        estimateBtn.disabled = true;
    }
};

// 当选择不同角色时，自动触发估价
characterSelect.onchange = () => {
    if (characterSelect.value) {
        // 清空上一次的结果并显示加载状态，提供即时反馈
        resultArea.innerHTML = '';
        showLoading();
        // 使用 setTimeout 确保UI更新后再执行估价，避免卡顿感
        setTimeout(() => {
            estimateBtn.click();
        }, 50);
    } else {
        showResult('<div class="info">请从上方选择一个角色进行估价。</div>');
    }
};

// 估计选中角色的价格
estimateBtn.onclick = () => {
    if (!allCharactersData) {
        return showError('请先点击"提取所有角色"按钮。');
    }
    
    const selectedIndex = characterSelect.value;
    if (selectedIndex === null || selectedIndex === undefined || selectedIndex === '') {
        return showError('请先从下拉列表中选择一个角色。');
    }

    try {
        const selectedCharacter = allCharactersData.find(char => char.index == selectedIndex);
        if (!selectedCharacter) {
            throw new Error("未找到选中的角色数据");
        }

        const result = calculateCost(selectedCharacter);

        let content = `<div class="price-estimate"><h4>📊 估价结果: ${selectedCharacter.name}</h4>`;
        content += `<div><strong>总成本价:</strong> <span class="value">¥${result['总成本价(RMB)']}</span></div>`;
        content += `<div><strong>网页标价:</strong> <span class="value">¥${result['网页标价(RMB)']}</span></div>`;
        const ratioClass = parseFloat(result['性价比']) > 1 ? 'high' : '';
        content += `<div><strong>性价比:</strong> <span class="value ${ratioClass}">${result['性价比']}</span></div>`;
        content += `</div>`;

        content += `<div class="detailed-analysis"><h4>📋 成本构成明细 (单位: 万MHB)</h4>`;
        content += `<pre>${JSON.stringify(result, null, 2)}</pre></div>`;

        showResult(content);
    } catch (e) {
        showError('估价计算出错！\n' + e.message);
    }
};

// ===================================================================
// 7. 初始化
// ===================================================================
characterSelect.disabled = true;
estimateBtn.disabled = true;