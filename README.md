# 棒球紀錄平台 (Smart Scoresheet)

> [!NOTE]
> 本專案為學期作業專案。

一個專為棒球紀錄員設計的高品質數位紀錄平台，旨在取代傳統紙本紀錄表。支援平板觸控手寫體驗，具備離線紀錄與自動化數據計算功能。

## ⚾ 專案願景
透過現代化 Web 技術，將複雜的棒球紀錄流程數位化。不僅保留了紙本紀錄的靈活性與直覺手感，更加入即時數據分析與雲端同步功能，讓每一場比賽的數據都能發揮最大價值。

## 🚀 核心功能
- **即時數據運算**：自動計算打擊率 (AVG)、防禦率 (ERA)、WHIP 等進階數據。
- **全平台支援**：優化 Android 平板體驗，同時支援 PC 桌面模式與鍵盤快捷鍵。
- **離線優先 (Offline-First)**：即使在網路不穩的球場，也能流暢紀錄，並在連線後自動同步。
- **多人協作**：支援隊伍系統，讓隊員、教練即時查看賽事數據。

## 🛠 技術棧
- **前端**：React 18 + TypeScript (Vite)
- **狀態管理**：Zustand & TanStack Query
- **本地儲存**：Dexie.js (IndexedDB)
- **後端 (預計)**：Python FastAPI (5 層架構設計)
- **部署**：PWA (Progressive Web App)

## 📁 專案架構
遵循 **Antigravity 通用技術架構規範**：
- `src/components/`：展示層元件 (UI Only)
- `src/hooks/`：業務邏輯與狀態封裝 (Logic)
- `src/services/`：外部 API 與本地儲存服務 (Data Access)
- `src/logic/`：棒球規則引擎與計算邏輯
- `src/schemas/`：資料檢核與型別定義

## 🤝 多人協作指南
1. **開發規範**：請確保安裝 ESLint 與 Prettier 套件，本專案強制執行風格統一。
2. **註解與文件**：所有註解必須使用 **繁體中文**，說明設計動機而非程式碼字面意義。
3. **命名原則**：變數/函數採 `camelCase`，元件/類別採 `PascalCase`，檔案採 `kebab-case`。

## 📄 授權條款
本專案採用 [MIT License](LICENSE) 授權。
