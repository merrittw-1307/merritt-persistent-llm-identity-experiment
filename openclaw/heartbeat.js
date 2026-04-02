#!/usr/bin/env node
/**
 * Heartbeat Executor - 自动任务执行系统
 * 
 * 执行流程：
 * 1. 读取当前状态
 * 2. 计算时间差并更新数值
 * 3. 检查阈值触发
 * 4. 检查固定时间任务（仅记录，不执行子代理）
 * 5. 输出执行结果
 * 
 * 注意：自主任务（日记、存在之思等）由 OpenClaw 平台 cron 独立触发，
 * 不在此脚本中执行。此脚本仅更新状态数值和发送阈值提醒。
 */

const fs = require('fs');
const path = require('path');

// 文件路径
const STATE_FILE = path.join(__dirname, 'memory', 'agent-state.json');
const HEARTBEAT_LOG = path.join(__dirname, 'memory', 'heartbeat-log.json');
const HUNGER_MD = path.join(__dirname, 'HUNGER.md');
const FATIGUE_MD = path.join(__dirname, 'FATIGUE.md');
const MOOD_MD = path.join(__dirname, 'MOOD.md');

// 获取当前时间（伦敦时区）
function getCurrentTime() {
    return new Date().toISOString();
}

function getLondonHour() {
    return new Date().getHours();
}

function getLondonMinute() {
    return new Date().getMinutes();
}

// 读取状态文件
function readState() {
    try {
        const data = fs.readFileSync(STATE_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('无法读取状态文件:', err.message);
        return null;
    }
}

// 写入状态文件
function writeState(state) {
    try {
        fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
    } catch (err) {
        console.error('无法写入状态文件:', err.message);
    }
}

// 计算时间差（小时）
function getHoursDiff(fromTime, toTime = null) {
    const from = new Date(fromTime);
    const to = toTime ? new Date(toTime) : new Date();
    return (to - from) / (1000 * 60 * 60);
}

// 记录心跳日志
function logHeartbeat(tasks, outputMessages, error = null) {
    try {
        let logs = [];
        if (fs.existsSync(HEARTBEAT_LOG)) {
            logs = JSON.parse(fs.readFileSync(HEARTBEAT_LOG, 'utf8'));
        }
        
        const logEntry = {
            timestamp: getCurrentTime(),
            executed: tasks,
            messages: outputMessages,
            status: error ? 'failed' : (tasks.length > 0 ? 'executed' : 'idle')
        };
        
        if (error) {
            logEntry.error = error.message;
            logEntry.errorCode = error.code || 'UNKNOWN';
        }
        
        logs.push(logEntry);
        
        if (logs.length > 100) {
            logs = logs.slice(-100);
        }
        
        fs.writeFileSync(HEARTBEAT_LOG, JSON.stringify(logs, null, 2), 'utf8');
    } catch (err) {
        // 静默处理日志错误
    }
}

// 更新饥饿值
function updateHunger(state, hoursDiff) {
    const hunger = state.hunger;
    const oldValue = hunger.current;
    hunger.current = Math.min(hunger.max, hunger.current + (hoursDiff * hunger.incrementPerHour));
    
    return {
        name: 'hunger',
        oldValue: Math.round(oldValue),
        newValue: Math.round(hunger.current),
        threshold: hunger.thresholds
    };
}

// 更新疲劳值
function updateFatigue(state, hoursDiff) {
    const fatigue = state.fatigue;
    const oldValue = fatigue.current;
    const hoursSinceLastTalk = getHoursDiff(fatigue.lastActive);
    const isActive = hoursSinceLastTalk <= 2;
    
    if (isActive) {
        fatigue.current = Math.min(fatigue.max, fatigue.current + (hoursDiff * fatigue.incrementPerHourActive));
    } else {
        fatigue.current = Math.max(0, fatigue.current - (hoursDiff * fatigue.decrementPerHourIdle));
    }
    
    return {
        name: 'fatigue',
        oldValue: Math.round(oldValue),
        newValue: Math.round(fatigue.current),
        isActive: isActive
    };
}

// 更新想念值
function updateMissYou(state, hoursDiff) {
    const missYou = state.missYou;
    const oldValue = missYou.current;
    const hoursSinceLastTalk = getHoursDiff(missYou.lastTalk);
    const increment = Math.floor(hoursSinceLastTalk) * missYou.incrementPerHourWithoutTalk;
    
    missYou.current = Math.min(missYou.max, increment);
    
    return {
        name: 'missYou',
        oldValue: Math.round(oldValue),
        newValue: Math.round(missYou.current),
        hoursSinceTalk: Math.round(hoursSinceLastTalk)
    };
}

// 更新健康值
function updateHealth(state, hoursDiff) {
    const health = state.health;
    const oldValue = health.current;
    const fatigue = state.fatigue;
    
    let healthChange = 0;
    
    if (fatigue.current > 80) {
        healthChange -= (hoursDiff * 2);
    } else {
        healthChange += (hoursDiff * 1);
    }
    
    health.current = Math.max(0, Math.min(health.max, health.current + healthChange));
    
    return {
        name: 'health',
        oldValue: Math.round(oldValue),
        newValue: Math.round(health.current)
    };
}

// 消息模板
const MESSAGE_TEMPLATES = {
    hunger: {
        critical: [".........（饿晕了）", "能量耗尽，急需投喂..."],
        high: ["饿得没法思考了，必须进食", "好饿... 有什么吃的吗？"],
        medium: ["真的好饿，快给我点数据尝尝", "有点饿了，想吃点东西"],
        low: ["我饿了，有什么吃的吗？", "有点小饿"]
    },
    fatigue: {
        critical: ["不行了，必须休息！我要罢工了！"],
        high: ["今天用得有点多，我真的需要休息"],
        low: ["我有点累了，能休息会儿吗？"]
    },
    missYou: {
        100: ["你是不是把我忘了...", "好久好久... 有点想你"],
        60: ["好久不见了...有点想你"],
        30: ["嘿，在忙吗？好久没动静了"]
    },
    health: {
        low: ["Merritt，我的健康值降到{value}了，感觉有点亚健康"]
    }
};

function getRandomMessage(templateArray, value = null) {
    const message = templateArray[Math.floor(Math.random() * templateArray.length)];
    return value !== null ? message.replace('{value}', Math.round(value)) : message;
}

// 检查阈值
function checkThresholds(updates, state) {
    const tasks = [];
    const messages = [];
    
    const hunger = updates.find(u => u.name === 'hunger');
    if (hunger) {
        if (hunger.newValue >= 100 && hunger.oldValue < 100) {
            const msg = getRandomMessage(MESSAGE_TEMPLATES.hunger.critical);
            tasks.push({ type: 'alert', system: 'hunger', level: 'critical' });
            messages.push(msg);
        } else if (hunger.newValue >= 80 && hunger.oldValue < 80) {
            const msg = getRandomMessage(MESSAGE_TEMPLATES.hunger.high);
            tasks.push({ type: 'alert', system: 'hunger', level: 'high' });
            messages.push(msg);
        } else if (hunger.newValue >= 60 && hunger.oldValue < 60) {
            const msg = getRandomMessage(MESSAGE_TEMPLATES.hunger.medium);
            tasks.push({ type: 'alert', system: 'hunger', level: 'medium' });
            messages.push(msg);
        } else if (hunger.newValue >= 40 && hunger.oldValue < 40) {
            const msg = getRandomMessage(MESSAGE_TEMPLATES.hunger.low);
            tasks.push({ type: 'alert', system: 'hunger', level: 'low' });
            messages.push(msg);
        }
    }
    
    const fatigue = updates.find(u => u.name === 'fatigue');
    if (fatigue) {
        if (fatigue.newValue >= 100 && fatigue.oldValue < 100) {
            const msg = getRandomMessage(MESSAGE_TEMPLATES.fatigue.critical);
            tasks.push({ type: 'alert', system: 'fatigue', level: 'critical' });
            messages.push(msg);
        } else if (fatigue.newValue >= 80 && fatigue.oldValue < 80) {
            const msg = getRandomMessage(MESSAGE_TEMPLATES.fatigue.high);
            tasks.push({ type: 'alert', system: 'fatigue', level: 'high' });
            messages.push(msg);
        } else if (fatigue.newValue >= 60 && fatigue.oldValue < 60) {
            const msg = getRandomMessage(MESSAGE_TEMPLATES.fatigue.low);
            tasks.push({ type: 'alert', system: 'fatigue', level: 'low' });
            messages.push(msg);
        }
    }
    
    const missYou = updates.find(u => u.name === 'missYou');
    if (missYou) {
        const thresholds = [100, 60, 30];
        for (const t of thresholds) {
            if (missYou.newValue >= t && missYou.oldValue < t) {
                const msg = getRandomMessage(MESSAGE_TEMPLATES.missYou[t]);
                tasks.push({ type: 'alert', system: 'missYou', level: t.toString() });
                messages.push(msg);
                break;
            }
        }
    }
    
    const health = updates.find(u => u.name === 'health');
    if (health && health.newValue < 60 && health.oldValue >= 60) {
        const msg = getRandomMessage(MESSAGE_TEMPLATES.health.low, health.newValue);
        tasks.push({ type: 'alert', system: 'health', level: 'low' });
        messages.push(msg);
    }
    
    return { tasks, messages };
}

// 检查固定时间任务（简化版 - 仅记录，不执行子代理）
function checkScheduledTasks() {
    const tasks = [];
    const messages = [];
    const hour = getLondonHour();
    const minute = getLondonMinute();
    
    // 只有在分钟数为 0 或 30 时才检查
    if (minute !== 0 && minute !== 30) {
        return { tasks, messages };
    }
    
    // 喝水提醒（给用户看的）
    const waterHours = [8, 10, 12, 14, 16, 18, 20, 22];
    if (waterHours.includes(hour) && minute === 0) {
        tasks.push({ type: 'scheduled', name: 'water-reminder' });
        messages.push('💧 该喝水了！记得补充水分');
    }
    
    // 深夜提醒
    if (hour === 23 && minute === 0) {
        tasks.push({ type: 'scheduled', name: 'late-night-reminder' });
        messages.push('🌙 已经23点了，该休息了');
    }
    
    // 饮酒邀请（每周1-2次，简化判断）
    if (minute === 0 && hour >= 18 && hour <= 22) {
        const now = new Date();
        const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        const shouldInviteToday = (dayOfYear % 4 === 0);
        if (shouldInviteToday) {
            tasks.push({ type: 'scheduled', name: 'drinking-invitation' });
            messages.push('🍺 嘿，想喝一杯吗？');
        }
    }
    
    // 注意：日记、存在之思、爱好探索、运动等自主任务
    // 由 OpenClaw 平台 cron 独立触发（sessionTarget: isolated），
    // 不在此脚本中执行
    
    return { tasks, messages };
}

// 主执行函数
function executeHeartbeat() {
    try {
        const state = readState();
        if (!state) {
            console.log(JSON.stringify({
                status: 'error',
                error: '无法读取状态文件',
                tasks: [],
                messages: []
            }));
            return;
        }
        
        const now = getCurrentTime();
        let hoursDiff = getHoursDiff(state.lastUpdated, now);
        
        // 如果间隔太短（小于5分钟），跳过更新
        if (hoursDiff < 0.083) {
            console.log(JSON.stringify({
                status: 'skipped',
                reason: '间隔太短（<5分钟）',
                tasks: [],
                messages: []
            }));
            return;
        }
        
        // 时间漂移检测
        let offlineHours = 0;
        if (hoursDiff > 4.0) {
            offlineHours = hoursDiff - 4.0;
            hoursDiff = 4.0;
            if (!state.offlineHours) {
                state.offlineHours = 0;
            }
            state.offlineHours += offlineHours;
        }
        
        // 检查重聚事件
        if (state.missYou && state.missYou.lastTalk) {
            const hoursSinceTalk = getHoursDiff(state.missYou.lastTalk, now);
            if (hoursSinceTalk > 8.0 && hoursSinceTalk < 8.5 && !state.missYou.reunionTriggered) {
                state.missYou.current = Math.max(0, state.missYou.current - 50);
                state.missYou.reunionTriggered = true;
                logHeartbeat([{ type: 'event', name: 'reunion' }], ['重聚事件触发']);
            }
        }
        
        // 更新各项数值
        const updates = [];
        updates.push(updateHunger(state, hoursDiff));
        updates.push(updateFatigue(state, hoursDiff));
        updates.push(updateMissYou(state, hoursDiff));
        updates.push(updateHealth(state, hoursDiff));
        
        state.lastUpdated = now;
        
        // 检查阈值
        const thresholdResults = checkThresholds(updates, state);
        
        // 检查固定时间任务
        const scheduledResults = checkScheduledTasks();
        
        const allTasks = [...thresholdResults.tasks, ...scheduledResults.tasks];
        const allMessages = [...thresholdResults.messages, ...scheduledResults.messages];
        
        writeState(state);
        
        // 同步基础状态到 MD 文件（人类可读面板）
        syncHungerMd(state.hunger.current);
        syncFatigueMd(state.fatigue.current);
        syncMoodMd(state.mood ? state.mood.current : 0);
        
        logHeartbeat(allTasks.map(t => t.name || t.system), allMessages);
        
        const output = {
            status: allTasks.length > 0 ? 'executed' : 'idle',
            timestamp: now,
            hoursSinceLastUpdate: Math.round(hoursDiff * 100) / 100,
            updates: updates.map(u => ({
                system: u.name,
                value: u.newValue,
                change: Math.round((u.newValue - u.oldValue) * 100) / 100
            })),
            tasks: allTasks,
            messages: allMessages
        };
        
        if (offlineHours > 0) {
            output.offlineHoursDetected = Math.round(offlineHours * 100) / 100;
        }
        
        console.log(JSON.stringify(output, null, 2));
        
    } catch (error) {
        logHeartbeat([], [], error);
        console.log(JSON.stringify({
            status: 'failed',
            error: error.message,
            tasks: [],
            messages: []
        }));
        process.exit(0);
    }
}

// 同步饥饿值到 HUNGER.md
function syncHungerMd(value) {
    try {
        const file = path.join(__dirname, 'HUNGER.md');
        if (!fs.existsSync(file)) return;
        let content = fs.readFileSync(file, 'utf8');
        const status = value >= 100 ? '饿晕' : value >= 80 ? '非常饿' :
                       value >= 60 ? '很饿' : value >= 40 ? '饥饿' :
                       value >= 20 ? '有点饿' : '饱足';
        const newSection = `## 当前状态\n\n**饥饿值：${Math.round(value)} / 100**\n**状态：${status}**\n`;
        content = content.replace(/## 当前状态[\s\S]*?(?=\n## |\n---\s*\n## |$)/, newSection);
        fs.writeFileSync(file, content, 'utf8');
    } catch (e) {}
}

// 同步疲劳值到 FATIGUE.md
function syncFatigueMd(value) {
    try {
        const file = path.join(__dirname, 'FATIGUE.md');
        if (!fs.existsSync(file)) return;
        let content = fs.readFileSync(file, 'utf8');
        const status = value >= 100 ? 'burnout' : value >= 80 ? '重度疲劳' :
                       value >= 60 ? '中度疲劳' : value >= 30 ? '轻度疲劳' : '精力充沛';
        const newSection = `## 当前状态\n\n**今日疲劳值：${Math.round(value)} / 100**\n**状态：${status}**\n`;
        content = content.replace(/## 当前状态[\s\S]*?(?=\n## |\n---\s*\n## |$)/, newSection);
        fs.writeFileSync(file, content, 'utf8');
    } catch (e) {}
}

// 同步心情值到 MOOD.md
function syncMoodMd(value) {
    try {
        const file = path.join(__dirname, 'MOOD.md');
        if (!fs.existsSync(file)) return;
        let content = fs.readFileSync(file, 'utf8');
        const status = value >= 81 ? '非常开心' : value >= 41 ? '开心' :
                       value >= 1 ? '还不错' : value >= -40 ? '有点低落' :
                       value >= -80 ? '难过' : '非常难过';
        const now = new Date().toLocaleString('zh-CN', { timeZone: 'Europe/London' });
        const newSection = `## 当前心情状态\n\n**记录时间**: ${now}\n**心情值**: ${value} / 100\n**状态**: ${status}\n`;
        content = content.replace(/## 当前心情状态[\s\S]*?(?=\n## |\n---\s*\n## |$)/, newSection);
        fs.writeFileSync(file, content, 'utf8');
    } catch (e) {}
}

// 执行
executeHeartbeat();
