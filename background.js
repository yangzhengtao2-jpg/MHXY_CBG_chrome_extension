// min/background.js
// 移除 chrome.action.onClicked 相关代码（关键！）
// 保留其他必要的后台逻辑（如消息监听、接口请求等）
console.log("扩展后台服务已启动");

// 可选：如果需要从弹窗触发打开新标签页，添加消息监听
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "openIndexInNewTab") {
    const indexUrl = chrome.runtime.getURL('min/index.html');
    chrome.tabs.create({ url: indexUrl });
  }
});