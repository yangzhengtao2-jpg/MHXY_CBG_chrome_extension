// content.js
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // 确保只响应 'extract_all' 命令
  if (msg.cmd !== 'extract_all') {
    return;
  }

  try {
    // 1. 查找页面上所有 ID 以 'other_info_' 开头的 textarea
    const textareas = document.querySelectorAll('textarea[id^="other_info_"]');

    if (!textareas || textareas.length === 0) {
      return sendResponse({ error: '未在当前页面找到任何角色信息。' });
    }

    const allCharactersData = [];

    // 2. 遍历所有找到的 textarea
    textareas.forEach((textarea, index) => {
      try {
        // 解析 textarea 中的 JSON 数据
        const roleData = JSON.parse(textarea.value);
        
        // --- 修复价格获取逻辑：从关联的 img 标签获取价格 ---
        let price = '未知价格'; // 设置一个默认值，以防找不到

        // 找到当前 textarea 所在的 a 标签（因为textarea直接嵌套在a标签内）
        const aTag = textarea.closest('a'); 
        
        if (aTag) {
            // 在a标签内直接查找带有data-price属性的img标签
            const iconImg = aTag.querySelector('img[data_price]');

            if (iconImg) {
                // 从 data-price 属性中获取价格
                const priceFromData = iconImg.getAttribute('data_price');
                if (priceFromData && !isNaN(priceFromData)) {
                    // 将价格格式化为更易读的形式，例如 "11888" -> "¥11,888.00"
                    price = `¥${parseFloat(priceFromData).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`;
                }
            }
        }
        // --- 价格获取逻辑结束 ---

        // 尝试从DOM获取角色名，如果JSON中没有的话
        let roleName = roleData.cName || `角色 ${index + 1}`;
        // 找到当前行(tr)用于获取角色名
        const rowTag = textarea.closest('tr');
        if (rowTag) {
            // 根据实际HTML结构调整角色名选择器（可根据实际情况修改）
            const nameElement = rowTag.querySelector('td:nth-child(2) span.vertical-middle');
            if (nameElement) {
                roleName = nameElement.textContent.trim();
            }
        }

        // 将提取的数据和元信息存入数组
        allCharactersData.push({
          id: textarea.id,
          index: index,
          name: roleName,
          price: price, // 使用从 data-price 获取并格式化后的价格
          data: roleData
        });

      } catch (e) {
        console.warn(`解析第 ${index + 1} 个角色信息失败:`, e.message);
        // 即使某个解析失败，也继续处理下一个
      }
    });

    if (allCharactersData.length === 0) {
      return sendResponse({ error: '找到角色信息，但全部解析失败。' });
    }

    // 3. 返回包含所有角色数据的数组
    sendResponse({
      success: true,
      characters: allCharactersData,
      count: allCharactersData.length
    });

  } catch (e) {
    sendResponse({ error: '提取过程发生未知错误: ' + e.message });
  }
  
  return true; // 保持异步通道
});