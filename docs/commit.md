---
summary: 'Git 提交规范：Conventional Commits 格式、原子提交、HEREDOC 用法'
read_when:
  - 准备提交代码
  - 编写 commit message
  - 需要了解提交规范
---

# Git 提交规范

## Commit Message 格式

```
<type>[optional scope]: <imperative summary>

[optional body]

[optional footer(s)]
```

- summary 用祈使句，不超过 72 字符
- 不要以句号结尾
- scope 仅在能增加清晰度时使用（如 `auth`、`api`、`ui`）
- 破坏性变更用 `!`（如 `feat!:`）或 `BREAKING CHANGE:` footer

## 可用的 Type

| Type | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档更新 |
| `style` | 格式化（无逻辑变更） |
| `refactor` | 代码重构（无行为变更） |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `build` | 构建系统或依赖变更 |
| `ci` | CI/CD 变更 |
| `chore` | 维护任务 |
| `revert` | 回退提交 |

## 原子提交原则

1. 一个 commit 只做一件事
2. 每个 commit 后仓库应可构建/运行
3. 可独立回退，只影响该特定变更
4. 行为变更时在同一 commit 包含相关测试
5. 不要混合 重构/格式化 和 行为变更

## 提交流程

```bash
# 1. 查看变更
git status --short
git diff --staged --stat

# 2. 选择性暂存（不要 git add -A）
git add <specific-files>

# 3. 查看将提交的内容
git diff --staged

# 4. 提交（HEREDOC 格式）
git commit -m "$(cat <<'EOF'
<type>[scope]: <summary>

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

## 注意事项

- 不要提交 `.env`、credentials 等敏感文件
- pre-commit hook 失败后，修复问题创建**新 commit**（不要 `--amend`）
- 不要自动 push，等用户指示
