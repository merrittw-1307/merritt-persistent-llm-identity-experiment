#!/usr/bin/env node
/**
 * 操作记录工具
 * 
 * 使用:
 * node .operations/log.js start "操作描述" "操作类型"
 * node .operations/log.js complete
 * node .operations/log.js rollback [备份ID]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OPS_DIR = path.join(__dirname);
const BACKUPS_DIR = path.join(OPS_DIR, 'backups');
const LOG_FILE = path.join(OPS_DIR, 'OPERATIONS.md');

// 确保目录存在
if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
}

// 生成备份ID
function generateBackupId() {
    const now = new Date();
    return `backup-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`;
}

// 创建备份
function createBackup(filesToBackup, backupId) {
    const backupPath = path.join(BACKUPS_DIR, backupId);
    fs.mkdirSync(backupPath, { recursive: true });
    
    filesToBackup.forEach(file => {
        const src = path.join(process.cwd(), '..', file);
        if (fs.existsSync(src)) {
            const dest = path.join(backupPath, path.basename(file));
            fs.cpSync(src, dest, { recursive: true });
        }
    });
    
    return backupPath;
}

// 记录操作开始
function logOperationStart(description, type, files) {
    const backupId = generateBackupId();
    const timestamp = new Date().toISOString();
    
    // 创建备份
    const backupPath = createBackup(files, backupId);
    
    // 读取当前日志
    let logContent = fs.readFileSync(LOG_FILE, 'utf8');
    
    // 如果有"当前操作"，先归档
    const currentOpMatch = logContent.match(/## 当前操作[\s\S]*?(?=---\n\n## 操作历史|$)/);
    if (currentOpMatch) {
        // 归档当前操作
        logContent = archiveCurrentOperation(logContent);
    }
    
    // 添加新操作
    const newOperation = `## 当前操作 - ${timestamp}

**操作类型**: ${type}
**操作描述**: ${description}
**执行原因**: 待填写

### 涉及文件
${files.map(f => `- ${f}`).join('\n')}

### 备份信息
- 备份ID: \`${backupId}\`
- 备份位置: \`.operations/backups/${backupId}/\`
- 备份时间: ${timestamp}

### 回滚方法
如需撤销此操作：
\`\`\`bash
# 方法1: 手动恢复
cp -r .operations/backups/${backupId}/* .

# 方法2: 使用脚本
node .operations/log.js rollback ${backupId}
\`\`\`

### 状态
- [x] 已执行
- [ ] 已验证（Merritt 确认无误）
- [ ] 已归档

---

`;
    
    // 插入到"当前操作记录"部分之前
    logContent = logContent.replace(
        /## 当前操作记录/,
        newOperation + '## 当前操作记录'
    );
    
    fs.writeFileSync(LOG_FILE, logContent);
    
    console.log(`✅ 操作已记录: ${description}`);
    console.log(`📦 备份ID: ${backupId}`);
    console.log(`📍 备份位置: ${backupPath}`);
    
    return backupId;
}

// 归档当前操作
function archiveCurrentOperation(logContent) {
    const currentOpMatch = logContent.match(/## 当前操作[\s\S]*?(?=---\n\n## 操作历史|$)/);
    if (!currentOpMatch) return logContent;
    
    const currentOp = currentOpMatch[0];
    const timestamp = new Date().toISOString();
    
    // 提取关键信息
    const typeMatch = currentOp.match(/\*\*操作类型\*\*: (.*)/);
    const descMatch = currentOp.match(/\*\*操作描述\*\*: (.*)/);
    const backupMatch = currentOp.match(/备份ID: `(.*)`/);
    
    const type = typeMatch ? typeMatch[1] : '未知';
    const desc = descMatch ? descMatch[1] : '未知';
    const backupId = backupMatch ? backupMatch[1] : '无';
    
    // 创建归档条目
    const archiveEntry = `| 序号 | ${timestamp} | ${type} | ${desc} | ${backupId} | 已归档 |\n`;
    
    // 添加到历史归档表格
    logContent = logContent.replace(
        /(## 操作历史归档\n\n.*?\n)(\|.*\|)/,
        `$1${archiveEntry}$2`
    );
    
    // 移除当前操作部分
    logContent = logContent.replace(/## 当前操作[\s\S]*?(?=---\n\n## 操作历史|$)/, '');
    
    return logContent;
}

// 回滚操作
function rollback(backupId) {
    const backupPath = path.join(BACKUPS_DIR, backupId);
    
    if (!fs.existsSync(backupPath)) {
        console.error(`❌ 备份 ${backupId} 不存在`);
        return false;
    }
    
    // 先备份当前状态
    const preRollbackId = generateBackupId();
    const preRollbackPath = path.join(BACKUPS_DIR, preRollbackId);
    fs.mkdirSync(preRollbackPath, { recursive: true });
    
    // 复制备份回原位置
    const files = fs.readdirSync(backupPath);
    files.forEach(file => {
        const src = path.join(backupPath, file);
        const dest = path.join(process.cwd(), '..', file);
        
        // 先备份当前文件
        if (fs.existsSync(dest)) {
            fs.cpSync(dest, path.join(preRollbackPath, file), { recursive: true });
        }
        
        // 恢复备份文件
        fs.cpSync(src, dest, { recursive: true });
    });
    
    console.log(`✅ 已回滚到 ${backupId}`);
    console.log(`📦 回滚前状态已备份: ${preRollbackId}`);
    
    return true;
}

// 主函数
function main() {
    const command = process.argv[2];
    
    switch (command) {
        case 'start':
            const description = process.argv[3] || '未命名操作';
            const type = process.argv[4] || '其他';
            const files = process.argv.slice(5);
            logOperationStart(description, type, files);
            break;
            
        case 'rollback':
            const backupId = process.argv[3];
            if (!backupId) {
                console.error('请提供备份ID');
                process.exit(1);
            }
            rollback(backupId);
            break;
            
        default:
            console.log('用法:');
            console.log('  node log.js start "操作描述" "操作类型" [文件1] [文件2] ...');
            console.log('  node log.js rollback [备份ID]');
    }
}

main();
