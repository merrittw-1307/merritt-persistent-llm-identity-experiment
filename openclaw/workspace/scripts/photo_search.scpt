-- Merritt 的照片搜索助手 (AppleScript)
-- 用法：在 Script Editor 中运行，或保存为应用程序

set targetYear to 2025
set targetMonth to 1
set targetDay to 5
set targetLocation to "冰岛" -- 可选，留空 "" 则不筛选地点

 tell application "Photos"
    activate
    
    display dialog "正在搜索 " & targetYear & "年" & targetMonth & "月" & targetDay & "日的照片..." giving up after 2
    
    set foundPhotos to {}
    set photoCount to 0
    
    -- 遍历所有照片（这可能需要一段时间）
    set allPhotos to every media item
    set totalCount to count of allPhotos
    
    repeat with i from 1 to totalCount
        set aPhoto to item i of allPhotos
        
        try
            set photoDate to date of aPhoto
            
            if year of photoDate is targetYear and month of photoDate is targetMonth and day of photoDate is targetDay then
                set photoName to name of aPhoto
                set photoTime to time string of photoDate
                
                -- 检查地点（如果指定了）
                set locationMatch to true
                if targetLocation is not "" then
                    try
                        set photoLoc to location of aPhoto
                        if photoLoc does not contain targetLocation then
                            set locationMatch to false
                        end if
                    on error
                        set locationMatch to false
                    end try
                end if
                
                if locationMatch then
                    set end of foundPhotos to "📸 " & photoTime & " - " & photoName
                    set photoCount to photoCount + 1
                    
                    -- 选择这张照片
                    select aPhoto
                end if
            end if
            
        on error
            -- 跳过无法读取的照片
        end try
        
        -- 每1000张照片更新一次进度
        if i mod 1000 is 0 then
            display notification "已扫描 " & i & " / " & totalCount & " 张照片" with title "照片搜索"
        end if
    end repeat
    
    -- 显示结果
    if photoCount > 0 then
        set resultText to "找到 " & photoCount & " 张照片:" & return & return
        repeat with photoInfo in foundPhotos
            set resultText to resultText & photoInfo & return
        end repeat
        
        display dialog resultText buttons {"在照片中查看", "好"} default button "好"
    else
        display dialog "❌ 未找到 " & targetYear & "年" & targetMonth & "月" & targetDay & "日" & (if targetLocation is not "" then "在" & targetLocation & "的" else "") & "照片" buttons {"好"} default button "好"
    end if
end tell
