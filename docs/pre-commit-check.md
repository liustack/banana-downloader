---
summary: '提交前全量检查：lint、格式化、测试一次跑完'
read_when:
  - 准备提交前做最终检查
  - CI 失败后本地复现
---

# 提交前全量检查

依次运行，遇到错误立即修复：

```bash
# 1. Lint
pnpm lint

# 2. 格式化
pnpm format-code

# 3. 测试
pnpm test

# 4. 确认状态
git status --short
```

全部通过后可以提交。
