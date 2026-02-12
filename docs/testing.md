---
summary: '测试指南：Vitest 运行方式、路径约束、覆盖率'
read_when:
  - 运行测试
  - 编写测试
  - 测试失败排障
---

# 测试指南

## 关键约束

**必须从仓库根目录运行**，避免 `globalSetup` 与 alias 路径错位。

## 命令

```bash
# 全部测试
pnpm test

# 单个测试文件
pnpm exec vitest run <test-file-path>

```

## 测试前检查

- 确保相关代码的类型检查通过
- 变更应附带可验证测试

## 目录

| 路径 | 用途 |
|------|------|
| `test/` | 测试主目录 |
| `coverage/` | 覆盖率输出 |
