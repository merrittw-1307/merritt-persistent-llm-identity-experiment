#!/usr/bin/env python3
"""
Merritt 的照片元数据导出工具
扫描照片库并导出元数据到 CSV，便于搜索
"""

import sqlite3
import os
from datetime import datetime
import csv

PHOTOS_DB_PATH = os.path.expanduser("~/Pictures/Photos Library.photoslibrary/database/Photos.sqlite")
OUTPUT_CSV = os.path.expanduser("~/merritt_photos_metadata.csv")

def extract_photos_metadata():
    """从Photos数据库提取元数据"""
    if not os.path.exists(PHOTOS_DB_PATH):
        print(f"❌ 找不到照片数据库: {PHOTOS_DB_PATH}")
        print("请确保照片库路径正确")
        return
    
    print("🔍 正在扫描照片库...")
    print("这可能需要几分钟（40万张照片）")
    
    try:
        # 连接到Photos数据库
        conn = sqlite3.connect(PHOTOS_DB_PATH)
        cursor = conn.cursor()
        
        # 查询照片信息
        query = """
        SELECT 
            ZDATECREATED,
            ZLATITUDE,
            ZLONGITUDE,
            ZFILENAME,
            ZUNIFORMTYPEIDENTIFIER
        FROM ZGENERICASSET
        WHERE ZDATECREATED IS NOT NULL
        ORDER BY ZDATECREATED DESC
        """
        
        cursor.execute(query)
        photos = cursor.fetchall()
        
        print(f"✅ 找到 {len(photos)} 张照片")
        
        # 导出到CSV
        with open(OUTPUT_CSV, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['日期', '时间', '文件名', '纬度', '经度', '类型'])
            
            for photo in photos:
                timestamp, lat, lon, filename, filetype = photo
                
                # 转换Apple的日期格式（从2001-01-01开始的秒数）
                apple_epoch = datetime(2001, 1, 1)
                photo_date = apple_epoch + timestamp
                
                writer.writerow([
                    photo_date.strftime('%Y-%m-%d'),
                    photo_date.strftime('%H:%M:%S'),
                    filename,
                    lat if lat else '',
                    lon if lon else '',
                    filetype if filetype else ''
                ])
        
        conn.close()
        print(f"✅ 元数据已导出到: {OUTPUT_CSV}")
        print(f"📊 共 {len(photos)} 张照片")
        
    except Exception as e:
        print(f"❌ 错误: {e}")
        print("可能需要授予终端访问照片库的权限")

def search_photos_by_date(year, month, day):
    """按日期搜索照片"""
    if not os.path.exists(OUTPUT_CSV):
        print("❌ 还未导出元数据，请先运行导出")
        return
    
    target_date = f"{year}-{month:02d}-{day:02d}"
    print(f"🔍 搜索 {target_date} 的照片...")
    
    with open(OUTPUT_CSV, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        matches = [row for row in reader if row['日期'] == target_date]
    
    if matches:
        print(f"✅ 找到 {len(matches)} 张照片:")
        for photo in matches:
            print(f"  📸 {photo['时间']} - {photo['文件名']}")
    else:
        print(f"❌ {target_date} 没有照片")
    
    return matches

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("用法:")
        print("  python3 photo_tool.py export     # 导出所有元数据")
        print("  python3 photo_tool.py search 2025 1 5  # 搜索2025年1月5日")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "export":
        extract_photos_metadata()
    elif command == "search" and len(sys.argv) >= 5:
        year, month, day = int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4])
        search_photos_by_date(year, month, day)
    else:
        print("未知命令")
