export default function Popup() {
    const startAutoFill = () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { type: "AUTO_FILL" });
      });
    };
  
    return (
      <button onClick={startAutoFill}>
        Start Tatkal
      </button>
    );
  }
  