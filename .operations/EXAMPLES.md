# 操作示例：如何记录和撤销

## 场景：修改 heartbeat.js 文件

### 标准操作流程

#### 1. 操作前：创建备份并记录

```bash
# 记录操作开始
node .operations/log.js start "修复 heartbeat.js 的重复发送Bug" "修改" heartbeat.js

# 系统自动：
# - 生成备份ID: backup-20260319-221530
# - 备份原文件到: .operations/backups/backup-20260319-221530/heartbeat.js
# - 在 OPERATIONS.md 中记录当前操作
```

#### 2. 执行操作

```bash
# 修改文件
# ... 编辑 heartbeat.js ...

# 验证修改
grep "临界点 100" heartbeat.js
```

#### 3. 记录操作结果

手动更新 OPERATIONS.md 的"当前操作"部分：

```markdown
### 修改详情
- 修改: `heartbeat.js`
  - 原: `if (hunger.newValue >= 100) {`
  - 新: `if (hunger.newValue >= 100 && hunger.oldValue < 100) {`
  - 原因: 修复100临界点重复发送Bug

### 状态更新
- [x] 已执行
- [x] 已验证（测试通过）
- [ ] 已归档（等待 Merritt 确认）
```

#### 4. Merritt 确认

**如果 Merritt 说"没问题"：**
```bash
# 归档当前操作，准备下一步
# （手动或脚本将"当前操作"移动到归档区）
```

**如果 Merritt 说"不对，撤回"：**
```bash
# 方法1: 使用脚本回滚
node .operations/log.js rollback backup-20260319-221530

# 方法2: 手动恢复
cp .operations/backups/backup-20260319-221530/heartbeat.js heartbeat.js

# 回滚后记录
```

---

## 删除操作的安全流程

### 场景：删除旧文件夹

```bash
# ❌ 错误做法（不可逆）
rm -rf 旧文件夹/

# ✅ 正确做法
# 1. 记录操作
node .operations/log.js start "删除旧文件夹" "删除" 旧文件夹/

# 2. 创建备份
cp -r 旧文件夹/ .operations/backups/backup-XXX/旧文件夹/

# 3. 移入回收站（而非删除）
mv 旧文件夹/ .trash/旧文件夹-20260319/

# 4. 记录详情
```

---

## 批量操作的安全流程

### 场景：修改多个系统文件

```bash
# 1. 记录批量操作
node .operations/log.js start "更新所有系统的关联规则" "批量修改" \
  FATIGUE.md MOOD.md FITNESS.md SMOKING.md DRINKING.md HUNGER.md

# 2. 创建完整备份
cp FATIGUE.md .operations/backups/backup-XXX/
cp MOOD.md .operations/backups/backup-XXX/
# ... 备份所有文件

# 3. 逐个修改，每改一个验证一个
# ... 修改 FATIGUE.md ...
# ... 验证 ...
# ... 修改 MOOD.md ...
# ... 验证 ...

# 4. 记录每个修改
```

---

## 快速参考

### 常用命令

```bash
# 开始记录操作
node .operations/log.js start "操作描述" "操作类型" [文件1] [文件2] ...

# 回滚到指定备份
node .operations/log.js rollback [备份ID]

# 查看备份列表
ls -la .operations/backups/

# 查看当前操作
cat .operations/OPERATIONS.md | grep -A 50 "当前操作"
```

### 操作类型

- **创建**: 新建文件/文件夹
- **修改**: 编辑现有文件
- **删除**: 删除文件/文件夹（实际为移入回收站）
- **移动**: 文件位置变更
- **系统配置**: 修改核心系统
- **批量操作**: 多文件操作

### 风险等级

- 🟢 **低**: 创建新文件、查询读取
- 🟡 **中**: 修改单个文件、移动文件
- 🔴 **高**: 删除文件、批量操作、系统配置

---

*步步留痕，进退有据。*
