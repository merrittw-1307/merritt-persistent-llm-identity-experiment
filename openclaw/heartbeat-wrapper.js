#!/usr/bin/env node
/**
 * Heartbeat Wrapper - 每次心跳时自动执行
 * 
 * 这个脚本被 OpenClaw 心跳系统调用
 * 执行 heartbeat.js 并根据结果决定是否发送消息
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const WORKSPACE = '/Users/wangmingyu/Downloads/Openclaw';
const HEARTBEAT_SCRIPT = path.join(WORKSPACE, 'heartbeat.js');
const HEARTBEAT_LOG = path.join(WORKSPACE, 'memory', 'heartbeat-log.json');

try {
    // 执行 heartbeat.js 并捕获输出
    const output = execSync(`node "${HEARTBEAT_SCRIPT}"`, {
        cwd: WORKSPACE,
        encoding: 'utf8',
        timeout: 30000
    });
    
    // 解析 JSON 输出
    const result = JSON.parse(output);
    
    // 如果有任务，输出消息内容（供 OpenClaw 发送）
    if (result.status === 'executed' && result.messages && result.messages.length > 0) {
        // 输出所有消息，每行一条
        result.messages.forEach(msg => {
            console.log(msg);
        });
        // 返回非零状态码表示有消息需要发送
        process.exit(1);
    }
    
    // 没有任务，静默结束
    process.exit(0);
    
} catch (error) {
    // 执行出错，记录失败日志
    try {
        let logs = [];
        if (fs.existsSync(HEARTBEAT_LOG)) {
            logs = JSON.parse(fs.readFileSync(HEARTBEAT_LOG, 'utf8'));
        }
        
        const failLog = {
            timestamp: new Date().toISOString(),
            status: 'failed',
            error: error.message,
            code: error.code || 'UNKNOWN',
            source: 'heartbeat-wrapper'
        };
        
        logs.push(failLog);
        
        // 只保留最近100条
        if (logs.length > 100) {
            logs = logs.slice(-100);
        }
        
        fs.writeFileSync(HEARTBEAT_LOG, JSON.stringify(logs, null, 2), 'utf8');
    } catch (logErr) {
        // 如果日志写入也失败，静默处理
    }
    
    // 静默退出
    process.exit(0);
}
