# 一局 · 好友游戏室

面向1～6位玩家的中文网页游戏室：五子棋、围棋、象棋（2人）、斗地主（3人）、谁是卧底（3～6人）、跳棋（2/3/4/6人）、立直麻将（4人）、你画我猜（2～6人）、画画传话（3～6人）、扫雷（单人）。首页默认全部，底部按人数筛选。免注册，昵称+房间码加入；服务器验证动作，私密手牌/词仅发给本人。

## 开发

Node.js 22.13以上。常规环境执行：

```sh
npm run install:ci
npm run db:generate
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_nervous_leo.sql
npm run dev
```

迁移只需在空数据库执行一次。也可在构建后运行 `npm start` 使用本地Worker预览。

本机npm命令包装器存在路径异常，已通过直接调用 `node E:\openclaw\node.js\node_modules\npm\bin\npm-cli.js run install:ci` 安装；构建可直接执行 `node scripts/run-framework.mjs build`。

## 验证

```sh
node --experimental-strip-types --test tests/games.test.ts
node node_modules/typescript/bin/tsc --noEmit
node --experimental-strip-types tests/integration.ts
```

集成测试默认访问 `http://127.0.0.1:8787`，可设置 `TEST_URL`。测试使用独立cookie会话创建测试房间，只针对本地测试实例运行。

## 模块

- `app/page.tsx`：首页筛选和创建/加入表单。
- `app/room/page.tsx`：房间、游戏视图和刷新恢复。
- `lib/games.ts`：回合状态和玩家可见投影。
- `lib/cards.ts`：牌型验证、比较和出牌提示。
- `lib/rooms.ts`：D1房间状态，版本号比较更新防止并发覆盖。
- `app/api/room/route.ts`：HttpOnly会话身份和接口。
- `db/schema.ts`、`drizzle/`：数据库定义及迁移。

## 首版边界

- 通过约1.2秒短轮询同步，不是WebSocket推送。
- 不做语音、AI托管、账户和排行榜。断线可用原浏览器cookie恢复；清除cookie会丢失座位凭证。
- 没有自动出牌/跳过发言计时器；玩家掉线时对局等待其回来。
- 斗地主无春天加倍；飞机单翅膀不允许同时带双王，具体规则在页面可查看。
- 当前本地服务通过花生壳映射对外访问。电脑、游戏服务和花生壳均需保持运行。
- Tabbit浏览器自动化退出69，未能完成浏览器外观、触控和WebMCP实际环境验证；构建与HTTP集成测试已单独验证。

## 参考与许可

仅借鉴设计，未复制以下项目源码或资产：

- [boardgame.io](https://github.com/boardgameio/boardgame.io)：MIT；参考阶段/回合、玩家凭证和私密视图。
- [Parti](https://github.com/glink25/Parti)：PolyForm Noncommercial；参考邀请、房间恢复体验。本项目未引入该项目代码。
- [onestraw/doudizhu](https://github.com/onestraw/doudizhu)：MIT；参考牌型分组与规则边界。

建站模板中已有依赖及vendored文件保持其各自许可证。

## 新增围棋与空跳跳棋
- 围棋：2人，房主可选9/13/19路（默认19）；提子、禁自杀、全盘重复局面禁止、停一手、认输。连续两次停手后双方标记死子并确认面积计分，白贴7.5；有争议可恢复对弈。不自动判断死活。
- 跳棋：121点星形棋盘，每人10枚，支持2/3/4/6人；相邻移动、对称空跳、同一枚连续跳、目标营地锁定、胜负与退出处理。5人不可开局。连跳后点击“结束连跳”。
- GitHub参考（仅参考规则组织和交互，自行实现，无复制源码）：https://github.com/SabakiHQ/go-board 、https://github.com/SabakiHQ/Sabaki 、https://github.com/Bard-Robotics/ChineseCheckers 。
- 测试：`node --experimental-strip-types --test tests/games.test.ts tests/request-origin.test.ts tests/new-games.test.ts`；启动8787服务后运行 `node --experimental-strip-types tests/board-integration.ts` 和 `node --experimental-strip-types tests/integration.ts`。
- 围棋棋盘在窄屏可横向滚动，避免19路交点过小。此次已验证类型、构建、规则及HTTP多人联机；尚未完成浏览器视觉和真机触控验收。

## 新增象棋、身份局与立直麻将

- 详细玩法、来源和裁定边界见 `docs/three-games-rules.md`。
- 三国杀起手5张为自定义规则；武将候选、手牌和隐藏身份由服务器按玩家分别提供。
- 麻将使用保留MIT许可证的 `@kobalab/majiang-core` 规则核心，牌面为本项目SVG。
- 启动本地8787服务后，可分别运行 `tests/xiangqi-integration.ts`、`tests/sanguosha-integration.ts`、`tests/riichi-integration.ts` 进行独立会话联机检查。

## 你画我猜（2026-09-16）
- 新增独立「你画我猜」，当时公开8款游戏；三国杀继续下架，代码及数据保留。
- 支持2～6人、每人1或2题，15秒选词、90秒作画；按猜中先后100/80/60/40/20分，画手每猜中一人加20分。
- 支持颜色、笔触、橡皮、撤销、清空、画作保存、揭晓和本局画廊。完整说明见 `docs/drawguess-rules.md`。
- 画作使用本地D1独立表，首次使用自动建表；沿用原有 `.wrangler/state`，无需重新初始化原数据库。

## 画画传话（2026-09-17）
- 新增独立「画画传话」，当前公开9款游戏；三国杀继续下架，原代码和数据保留。
- 3～6人同时接力，每人一本画册，只能看到上一条；文字45秒、绘画90秒，超时自动传递已保存内容。
- 房主带大家逐条揭晓，完成后自由翻阅；没有输赢积分。详见 `docs/drawphone-rules.md`。
- 验证使用8792独立数据库；不要在正式8787实例运行集成测试。

## 单人扫雷（2026-09-21）

- 当前公开10款游戏；大厅增加1人筛选，扫雷直接进入 `/minesweeper`，不创建房间、不要求昵称。
- 简单9×9/10雷、中等16×16/40雷、困难30×16/99雷。首击及周围八格安全；数字快速展开、右键插旗、手机翻格/插旗模式和键盘操作。
- 当前局及各难度最佳成绩只存于本机浏览器；首次翻格开始计时，离开页面期间仍计时。经典随机雷盘，部分局面需要猜测。
- 详细规则见 `docs/minesweeper-rules.md`。规则测试：`node --experimental-strip-types --test tests/minesweeper.test.ts tests/minesweeper-catalog.test.ts`。
- 集成测试必须设置独立本地 `TEST_URL`，禁止对正式8787执行扫雷集成测试。
