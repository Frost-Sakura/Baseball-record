---
trigger: always_on
---

# Antigravity 通用技術架構規範 (Standard Architecture Rules)

## 一、 架構設計原則 (Architectural Principles)

* **關注點分離 (SoC)**：嚴格區分展示層、業務邏輯層與資料存取層。
* **高內聚低耦合**：模組應獨立且專注，減少跨模組的直接依賴。
* **介面導向程式設計**：組件間通訊應基於定義好的 Contract (Interface/Schema)，而非具體實作。
* **防禦性編程**：對所有外部輸入（API、使用者輸入、資料庫）進行嚴格校驗。

---

## 二、 核心開發約定

### 1. 語言與格式
* **全繁體中文**：所有說明文件、註解、Git Commit Message、文件內容必須使用繁體中文。
* **技術命名**：識別符（變數、函數、類別）使用英文；日誌與錯誤訊息建議使用英文以便搜尋。

### 2. 統一命名規範
| 項目 | 命名格式 | 範例 |
| :--- | :--- | :--- |
| **變數 / 函數** | `camelCase` | `getUserInfo` |
| **類別 / 元件 / 介面** | `PascalCase` | `AuthService`, `UserCard` |
| **常數** | `UPPER_SNAKE_CASE` | `MAX_RETRY_COUNT` |
| **資料夾 / 檔案** | `kebab-case` | `user-profile.tsx` |

---

## 三、 前端架構規範 (Modern Web)

### 1. 邏輯抽離規則
* **UI 與 Logic 分離**：UI 元件僅負責渲染，複雜的狀態更新或 API 呼叫必須封裝於 **Hook** 或 **Store** 中。
* **單一職責**：一個元件檔案原則上不超過 200 行，超過則需考慮拆分子元件。

### 2. 狀態管理
* **本地狀態**：僅限於 UI 切換（如 Modal 開關）。
* **全域狀態**：用於跨頁面數據（如 User Profile）。
* **伺服器快取**：使用專門的 Library 管理非同步數據，禁止將 API 數據直接放入全域 Store。

### 3. 強制要求
* **禁止使用 `any`**：若類型不明，應使用 `unknown` 並進行類型斷言。
* **嚴格模式**：必須開啟編譯器的嚴格模式 (Strict Mode)。
* **Props 介面化**：所有傳入參數必須定義 Interface/Type。

---

## 四、 後端架構規範 (Layered Architecture)

### 1. 五層架構定義 (Standard Layers)
後端必須遵循以下層級遞進，禁止跨層調用：

1.  **Transport/Controller (API)**：負責請求解析、回應封裝、Status Code 定義。
2.  **Service (Business)**：**核心邏輯所在層**。負責協調數據與業務規則，禁止在此層寫原生 SQL。
3.  **Repository (Persistence)**：封裝資料庫 CRUD 操作。
4.  **Schema/DTO**：定義輸入輸出格式，負責資料校驗與過濾（脫敏）。
5.  **Model (Domain)**：定義資料表結構或領域實體。

### 2. 非同步與併發
* **I/O 密集型**：必須使用非同步 (Async/Await) 處理。
* **長耗時任務**：必須移至 Task Queue (如 Redis Queue) 處理，不佔用請求線程。

---

## 五、 錯誤處理與日誌 (Observability)

### 1. 錯誤處理規範
* **結構化錯誤**：回應應包含 `code` (內部錯誤碼), `message` (友善提示), `details` (錯誤細節)。
* **禁止沈默失敗**：所有的 `try-catch` 必須有對應的處理或紀錄，禁止空白 catch。

### 2. 日誌等級
* **DEBUG**：開發環境詳細流程。
* **INFO**：重要業務節點（如：登入、訂單建立）。
* **WARNING**：可恢復的異常（如：API 逾時重試）。
* **ERROR**：系統崩潰或嚴重功能缺失，需觸發告警。

---

## 六、 安全與資安規範

* **認證與授權**：
    * 敏感 API 必須經過身份驗證。
    * 權限判斷必須在 **Service 層** 進行，防止越權訪問 (IDOR)。
* **資料加密**：
    * 資料庫內敏感欄位需加密存儲。
    * 密鑰必須透過環境變數傳入，嚴禁硬編碼 (Hard-code)。
* **傳輸安全**：
    * 全站強制 HTTPS。
    * 敏感 Cookie 必須設定 `HttpOnly`, `Secure`。

---

## 七、 AI 協作與交付標準

1.  **自解釋性**：產出的程式碼應具備高度可讀性，無需註解也能讀懂「做了什麼」。
2.  **註解重點**：註解必須說明「為什麼」(Design Decision)，而非「如何做」(Implementation)。
3.  **單元測試**：核心業務邏輯必須附帶測試案例。
4.  **Linter 遵循**：所有程式碼產出必須符合該語言與項目的排版規範。