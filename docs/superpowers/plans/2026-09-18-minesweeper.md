# Minesweeper Implementation Plan

**Goal:** 在现有网站新增经典单人扫雷。
**Architecture:** 纯规则模块、校验本地存档模块、独立客户端页面；大厅单人入口不使用房间API。
**Tech Stack:** TypeScript、React、现有Vinext、localStorage、node:test。

## Global Constraints
保留现有九款游戏与下架三国杀代码数据；不新增依赖；首次点击及邻格安全；三个标准难度；手机可滚动。

- [x] 任务1：tests/minesweeper.test.ts先写失败用例；实现lib/minesweeper.ts与lib/minesweeper-storage.ts，验证规则和恢复校验。
- [x] 任务2：实现app/minesweeper/page.tsx和minesweeper.css，首击计时、插旗、数字展开、成绩、恢复、键盘及触屏模式。
- [x] 任务3：扩展lib/catalog.ts、app/page.tsx、app/globals.css，增加1人筛选与独立入口；lib/rooms.ts明确拒绝创建单人房间，测试目录人数与API边界。
- [x] 任务4：规则/渲染/类型与构建检查；独立HTTP回归；备份正式dist，更新8787并检查公网；补文档并同步GitHub。

## 完成验证（2026-09-21）
71项规则测试、TypeScript、SSR、生产构建通过；独立8793实例HTTP及原游戏回归通过。Tabbit真实浏览器验证首击/旗帜/胜负/恢复/纪录；390像素视口验证难度按钮一排、简单棋盘适配、大棋盘内部滚动；手机物理真机未测。旧版本与数据库已备份，三国杀两房间摘要不变。8787更新使用同一通过验证的构建。
