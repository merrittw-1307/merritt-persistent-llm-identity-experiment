tell application "Photos"
    activate
    
    -- 获取所有照片
    set allPhotos to every media item
    
    if (count of allPhotos) > 0 then
        -- 找到最新的照片（按日期排序）
        set latestPhoto to item 1 of allPhotos
        set latestDate to date of latestPhoto
        
        repeat with aPhoto in allPhotos
            set aDate to date of aPhoto
            if aDate > latestDate then
                set latestPhoto to aPhoto
                set latestDate to aDate
            end if
        end repeat
        
        set photoName to name of latestPhoto
        set photoDateStr to date string of latestDate
        set photoTimeStr to time string of latestDate
        
        -- 导出到临时目录
        set exportFolder to (path to temporary items from user domain) as string
        set exportPath to exportFolder & "latest_photo_export.jpg"
        
        export {latestPhoto} to file exportPath
        
        return "照片名称: " & photoName & return & "拍摄时间: " & photoDateStr & " " & photoTimeStr & return & "导出路径: " & exportPath
    else
        return "相册中没有照片"
    end if
end tell
