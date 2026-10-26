# 算法可视化

Vue3 + Vue Router。当前功能：排序算法可视化。

## 开发

```bash
npm install
npm run dev
```

- `/` → 重定向到 `/sort`
- `/sort` → `src/views/sort` 排序可视化

后续功能按 `src/views/<功能>` 加页面，并在 `src/router/index.ts` 注册路由即可。

## 校验排序步骤

```bash
npm run verify:sorts
```

## 说明

- 移动次数 = 交换 + 写入次数
- 耗时包含动画等待，不是纯 CPU 排序时间
