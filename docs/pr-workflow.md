---
summary: 'PR 工作流：提交、推送、创建 Pull Request 的完整流程'
read_when:
  - 创建 Pull Request
  - 推送代码到远程
  - 需要完成 commit-push-pr 全流程
---

# PR 工作流

## 完整流程

1. **提交**：按 `docs/commit.md` 规范完成提交
2. **检查分支**：
   ```bash
   git branch --show-current
   ```
   如果在 main 分支，先创建功能分支：
   ```bash
   git checkout -b <合适的分支名>
   ```
3. **推送**：
   ```bash
   git push -u origin $(git branch --show-current)
   ```
4. **创建 PR**：
   ```bash
   gh pr create --title "<简洁标题>" --body "$(cat <<'EOF'
   ## Summary
   <1-3 个要点>

   ## Test plan
   - [ ] <测试检查项>

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   EOF
   )"
   ```
5. 输出 PR URL

## PR 标题规范

- 不超过 70 字符
- 用 body 写详情，不要堆在标题里
