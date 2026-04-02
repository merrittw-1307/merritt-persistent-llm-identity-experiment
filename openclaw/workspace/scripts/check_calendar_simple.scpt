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
    
    -- 只检查前5个日历
    set calList to first 5 calendars
    repeat with cal in calList
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
    
    -- 排序事件
    set sortedEvents to my sortEventsByDate(allEvents)
    
    set resultText to "📅 下周日程（" & (short date string of nextMonday) & " - " & (short date string of nextSunday) & "）" & return & return
    
    repeat with evt in sortedEvents
        set evtDate to start date of evt
        set evtDay to (weekday of evtDate as string)
        set evtTime to time string of evtDate
        set evtSummary to summary of evt
        
        set resultText to resultText & evtDay & " " & evtTime & " | " & evtSummary & return
    end repeat
    
    return resultText
end tell

on sortEventsByDate(eventList)
    set sortedList to {}
    repeat with i from 1 to count of eventList
        set currentEvent to item i of eventList
        set currentDate to start date of currentEvent
        set inserted to false
        
        repeat with j from 1 to count of sortedList
            if currentDate < (start date of item j of sortedList) then
                set sortedList to (items 1 thru (j - 1) of sortedList) & {currentEvent} & (items j thru -1 of sortedList)
                set inserted to true
                exit repeat
            end if
        end repeat
        
        if not inserted then set end of sortedList to currentEvent
    end repeat
    return sortedList
end sortEventsByDate
