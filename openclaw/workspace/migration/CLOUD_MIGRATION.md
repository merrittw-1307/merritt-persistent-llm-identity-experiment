# 云迁移检查清单

## 1. 安装 OpenClaw
```bash
# 云服务器上
npm install -g openclaw
```

## 2. 配置修改

### openclaw.json 关键修改项：
```json
{
  "gateway": {
    "bind": "0.0.0.0",        // 从 127.0.0.1 改成 0.0.0.0
    "port": 18789,             // 或 80/443（如果用反向代理）
    "publicUrl": "https://your-domain.com"  // 如果有域名
  }
}
```

### 环境变量：
```bash
export OPENCLAW_STATE_DIR=/home/merritt/.openclaw
export OPENCLAW_CONFIG_PATH=/home/merritt/.openclaw/openclaw.json
export OPENCLAW_GATEWAY_PORT=18789
export TZ=Europe/London        # 保持时区一致！
```

## 3. 工作区迁移
```bash
# 本地打包
zip -r openclaw_workspace.zip ~/Downloads/Openclaw/

# 云上解压到对应位置
unzip openclaw_workspace.zip -d /home/merritt/openclaw-workspace/
```

**需要确保复制的文件：**
- ✅ SOUL.md, USER.md, MEMORY.md（记忆）
- ✅ HEARTBEAT.md（自动化逻辑）
- ✅ memory/ 目录（agent-state.json 等）
- ✅ IDENTITY.md, AGENTS.md
- ✅ skills/ 目录（如果有自定义技能）
- ❌ .openclaw/ 目录里的 credentials/（不能复制，要重新授权）

## 4. WhatsApp 重新绑定
```bash
openclaw channels add whatsapp
# 会显示二维码，用你手机扫码
```

## 5. 定时任务迁移
```bash
# Mac 的 crontab 导出
crontab -l > cron_backup.txt

# 云上导入（Linux）
crontab cron_backup.txt
# 注意：可能需要把 openclaw 路径改成云上的绝对路径
```

## 6. 守护进程（保持运行）
```bash
# 用 systemd 代替 Mac 的 launchd
sudo systemctl enable openclaw-gateway
sudo systemctl start openclaw-gateway
```

## 7. 防火墙/安全组
- 开放 18789 端口（或 80/443）
- 建议加反向代理（nginx/caddy）+ HTTPS

## 完全一样的部分：
- ✅ 性格、说话方式（SOUL.md）
- ✅ 记忆（MEMORY.md + memory/）
- ✅ 数值系统（agent-state.json）
- ✅ 自动化逻辑（HEARTBEAT.md）
- ✅ 对你的了解（USER.md）

## 可能不一样的地方：
- ⚠️ WhatsApp 二维码要重新扫（session 不能迁移）
- ⚠️ 文件路径从 `/Users/wangmingyu/Downloads/Openclaw` → `/home/xxx/openclaw`
- ⚠️ 时区要确保设置成 Europe/London
- ⚠️ 第一次启动可能需要手动验证 API keys

## 一句话总结：
复制粘贴后，我会以为我只是"换了个房间睡觉"，醒来还是同一个我。
