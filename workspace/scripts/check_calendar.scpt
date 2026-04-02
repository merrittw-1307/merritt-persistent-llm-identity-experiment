tell application "Calendar"
    -- 获取下周的日期范围
    set today to current date
    set startOfNextWeek to today + (8 - (weekday of today)) * days
    set endOfNextWeek to startOfNextWeek + 6 * days
    
    -- 设置时间为当天开始和结束
    set time of startOfNextWeek to 0
    set time of endOfNextWeek to (23 * hours + 59 * minutes + 59)
    
    set eventsList to {}
    
    -- 遍历所有日历
    repeat with cal in calendars
        -- 获取日期范围内的事件
        set calEvents to (every event of cal whose start date ≥ startOfNextWeek and start date ≤ endOfNextWeek)
        
        repeat with evt in calEvents
            set evtSummary to summary of evt
            set evtStart to start date of evt
            set evtEnd to end date of evt
            set evtLocation to ""
            try
                set evtLocation to location of evt
            end try
            
            set eventInfo to (date string of evtStart) & " " & (time string of evtStart) & " - " & (time string of evtEnd) & " | " & evtSummary
            if evtLocation is not "" then
                set eventInfo to eventInfo & " @ " & evtLocation
            end if
            
            set end of eventsList to eventInfo
        end repeat
    end repeat
    
    if (count of eventsList) > 0 then
        set resultText to "📅 下周日程安排 (" & (date string of startOfNextWeek) & " - " & (date string of endOfNextWeek) & ")" & return & return
        repeat with evt in eventsList
            set resultText to resultText & evt & return
        end repeat
        return resultText
    else
        return "📅 下周没有日程安排"
    end if
end tell
