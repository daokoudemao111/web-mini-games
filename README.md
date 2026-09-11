# 一局 · 好友游戏室

面向2～6位好友的中文网页游戏室：五子棋（2人）、斗地主（3人）、谁是卧底（4～6人）。首页默认全部，底部按人数筛选。免注册，昵称+房间码加入；服务器验证动作，私密手牌/词仅发给本人。

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
- `app/room/page.tsx`：房间、三款游戏视图和刷新恢复。
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
- 私密部署默认仅网站所有者可访问；对外邀请前需要配置网站访问范围。
- Tabbit浏览器自动化退出69，未能完成浏览器外观、触控和WebMCP实际环境验证；构建与HTTP集成测试已单独验证。

## 参考与许可

仅借鉴设计，未复制以下项目源码或资产：

- [boardgame.io](https://github.com/boardgameio/boardgame.io)：MIT；参考阶段/回合、玩家凭证和私密视图。
- [Parti](https://github.com/glink25/Parti)：PolyForm Noncommercial；参考邀请、房间恢复体验。本项目未引入该项目代码。
- [onestraw/doudizhu](https://github.com/onestraw/doudizhu)：MIT；参考牌型分组与规则边界。

建站模板中已有依赖及vendored文件保持其各自许可证。
