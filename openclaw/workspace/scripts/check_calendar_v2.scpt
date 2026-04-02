tell application "Calendar"
    -- 获取下周的开始（下周一）和结束（下周日）
    set today to current date
    set daysUntilMonday to (9 - (weekday of today)) mod 7
    if daysUntilMonday = 0 then set daysUntilMonday to 7
    set nextMonday to today + daysUntilMonday * days
    set nextSunday to nextMonday + 6 * days
    
    set time of nextMonday to 0
    set time of nextSunday to (23 * hours + 59 * minutes)
    
    set allEvents to {}
    
    -- 检查所有日历
    repeat with cal in calendars
        try
            set calEvents to (every event of cal whose start date ≥ nextMonday and start date ≤ nextSunday)
            repeat with evt in calEvents
                set end of allEvents to evt
            end repeat
        end try
    end repeat
    
    if (count of allEvents) = 0 then
        return "📅 下周（" & (short date string of nextMonday) & " - " & (short date string of nextSunday) & "）没有日程安排"
    end if
    
    set resultText to "📅 下周日程（" & (short date string of nextMonday) & " - " & (short date string of nextSunday) & "）" & return & return
    
    repeat with evt in allEvents
        set evtDate to start date of evt
        set evtTime to time string of evtDate
        set evtSummary to summary of evt
        
        set resultText to resultText & (short date string of evtDate) & " " & evtTime & " | " & evtSummary & return
    end repeat
    
    return resultText
end tell
