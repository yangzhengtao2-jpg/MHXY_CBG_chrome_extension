# 角色信息提取 Chrome 插件

一款用于自动提取页面中角色信息及关联价格的浏览器插件，支持结构化解析与展示。

---

## ✨ 功能特性

- 自动识别页面中 ID 以 `other_info_` 开头的 textarea 元素
- 解析 textarea 内的 JSON 格式角色数据
- 从页面 DOM 元素中提取角色名称（优先于 JSON 数据）
- 通过关联的 `img` 标签 `data_price` 属性获取并格式化价格
- 整合数据并返回结构化结果，支持批量处理

---

## 📦 安装步骤

1. **获取源码**
   - 点击右上角 `Code` → `Download ZIP` 下载压缩包
   - 解压至本地目录（例如 `./character-extract-plugin`）

2. **开启开发者模式**
   - 打开 Chrome 浏览器，访问 `chrome://extensions/`
   - 开启右上角 **开发者模式** 开关

3. **加载插件**
   - 点击 **加载已解压的扩展程序**
   - 选择解压后的插件目录完成安装

---

## 🚀 使用方法

1. 打开包含角色信息的目标页面
2. 点击浏览器工具栏中的插件图标（若未显示，可在扩展程序列表中查找）
3. 插件自动触发提取逻辑，解析页面中的角色数据
4. 在插件弹窗中查看提取的角色名称、价格及详细信息

---

## 🔍 核心逻辑说明

插件核心提取逻辑{insert\_element\_0\_5L2N5LqOIGBtaW4vY29udGVudC4=}js`，主要流程如下：

```javascript
// 监听来自扩展的提取命令
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.cmd !== 'extract_all') return;

  try {
    // 1. 查找所有 ID 以 'other_info_' 开头的 textarea
    const textareas = document.querySelectorAll('textarea[id^="other_info_"]');
    if (!textareas.length) {
      return sendResponse({ error: '未找到角色信息' });
    }

    const allCharactersData = [];

    // 2. 遍历解析每个 textarea
    textareas.forEach((textarea, index) => {
      try {
        const roleData = JSON.parse(textarea.value); // 解析 JSON 数据
        
        // 提取价格（从关联 img 标签的 data_price 属性）
        let price = '未知价格';
        const aTag = textarea.closest('a');
        if (aTag) {
          const iconImg = aTag.querySelector('img[data_price]');
          if (iconImg) {
            const priceFromData = iconImg.getAttribute('data_price');
            if (priceFromData && !isNaN(priceFromData)) {
              price = `¥${parseFloat(priceFromData).toLocaleString('zh-CN', { 
                minimumFractionDigits: 2 
              })}`;
            }
          }
        }

        // 提取角色名（优先从 DOM 获取）
        let roleName = roleData.cName || `角色 ${index + 1}`;
        const rowTag = textarea.closest('tr');
        if (rowTag) {
          const nameElement = rowTag.querySelector('td:nth-child(2) span.vertical-middle');
          if (nameElement) roleName = nameElement.textContent.trim();
        }

        allCharactersData.push({
          id: textarea.id,
          index,
          name: roleName,
          price,
          data: roleData
        });
      } catch (e) {
        console.warn(`解析第 ${index + 1} 个角色失败:`, e.message);
      }
    });

    // 3. 返回提取结果
    sendResponse({
      success: true,
      characters: allCharactersData,
      count: allCharactersData.length
    });
  } catch (e) {
    sendResponse({ error: '提取失败: ' + e.message });
  }
  
  return true; // 保持异步通信
});
