# 排序算法可视化

Vue3 单页演示：自定义柱子数量，冒泡 / 选择 / 插入 / 快速 / 归并逐步动画，统计移动次数与含动画耗时。

## 开发

```bash
npm install
npm run dev
```

## 校验算法步骤

```bash
npm run verify:sorts
```

## 说明

- 移动次数 = 交换 + 写入次数
- 耗时包含动画等待，不是纯 CPU 排序时间
