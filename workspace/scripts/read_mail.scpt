tell application "Mail"
    -- 获取收件箱中最近的5封邮件
    set inboxFolder to inbox
    set recentMessages to messages 1 thru 5 of inboxFolder
    
    set resultText to "📧 最近5封邮件:" & return & return
    
    repeat with i from 1 to count of recentMessages
        set currentMessage to item i of recentMessages
        
        set msgSubject to subject of currentMessage
        set msgSender to sender of currentMessage
        set msgDate to date received of currentMessage
        
        -- 截取发件人邮箱
        try
            set senderName to name of msgSender
            set senderEmail to address of msgSender
        on error
            set senderName to "未知"
            set senderEmail to "未知"
        end try
        
        set resultText to resultText & "【" & i & "】" & return
        set resultText to resultText & "主题: " & msgSubject & return
        set resultText to resultText & "发件人: " & senderName & " <" & senderEmail & ">" & return
        set resultText to resultText & "日期: " & (date string of msgDate) & " " & (time string of msgDate) & return
        set resultText to resultText & "---" & return
    end repeat
    
    return resultText
end tell
