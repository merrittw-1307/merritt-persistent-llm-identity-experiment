#!/bin/bash
# Merritt 的照片搜索助手
# 用法: ./photo_search.sh [年份] [月份] [日期]

YEAR=${1:-2025}
MONTH=${2:-1}
DAY=${3:-5}

echo "🔍 正在搜索 ${YEAR}年${MONTH}月${DAY}日的照片..."
echo ""

# 导出照片元数据到临时文件
osascript << 'APPLESCRIPT'
tell application "Photos"
    set targetYear to $YEAR as integer
    set targetMonth to $MONTH as integer  
    set targetDay to $DAY as integer
    
    set results to {}
    set allPhotos to every media item
    
    repeat with aPhoto in allPhotos
        try
            set photoDate to date of aPhoto
            if year of photoDate is targetYear and month of photoDate is targetMonth and day of photoDate is targetDay then
                set photoName to name of aPhoto
                set photoTime to time string of photoDate
                set photoLoc to ""
                try
                    set photoLoc to location of aPhoto as string
                end try
                set end of results to (photoName & " | " & photoTime & " | " & photoLoc)
            end if
        on error
            -- 跳过无法读取的照片
        end try
    end repeat
    
    return results as string
end tell
APPLESCRIPT

echo ""
echo "搜索完成"
