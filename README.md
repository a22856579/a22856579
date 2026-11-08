# 日常清單

繁體中文、手機優先的代辦事項 App。使用 HTML、CSS 與原生 JavaScript 製作，不需要先安裝框架或套件。

## 功能

- 新增、編輯與刪除待辦事項
- 設定期限、選擇生活／工作／學習／其他分類
- 標記完成，依全部／今天／未來／已完成篩選
- 使用瀏覽器 `localStorage` 保留資料
- 可在 iPhone Safari 開啟，並加入主畫面

## 在電腦預覽

1. 在專案資料夾開啟 PowerShell 或終端機。
2. 輸入 `python -m http.server 8000`（若沒有 `python`，可試 `py -m http.server 8000`）。
3. 在瀏覽器前往 `http://localhost:8000`。
4. 要停止伺服器時，回到終端機按 `Ctrl+C`。

## 在 iPhone 預覽

1. 電腦與 iPhone 連上同一個 Wi-Fi。
2. 在電腦終端機以 `ipconfig` 查看「IPv4 位址」（例如 `192.168.1.23`）。
3. 保持 `python -m http.server 8000` 執行，在 iPhone Safari 開啟 `http://電腦的IPv4位址:8000`，例如 `http://192.168.1.23:8000`。
4. Safari 點「分享」→「加入主畫面」，之後就能像 App 一樣從主畫面開啟。

> 以上方式適合本機預覽；`localStorage` 資料留在目前使用的瀏覽器與裝置，不會自動同步到其他裝置。iPhone 若無法連線，請確認同一 Wi-Fi 並允許電腦防火牆的私人網路連線。

## 發佈到 GitHub Pages

首次啟用時，請到儲存庫的 **Settings → Pages**，在 **Build and deployment → Source** 選擇 **GitHub Actions**。之後推送到 `master` 分支時，GitHub Actions 會自動部署網站。

網站網址：<https://a22856579.github.io/a22856579/>
