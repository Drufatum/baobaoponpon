from PIL import Image

# 讀取圖片
img = Image.open("fly.png")

# 原始尺寸
w, h = img.size

# 新畫布尺寸（例如調整成16:9）
target_ratio = 16 / 9
new_w = max(w, int(h * target_ratio))
new_h = max(h, int(w / target_ratio))

# 建立透明背景
new_img = Image.new("RGBA", (new_w, new_h), (0, 0, 0, 0))

# 將原圖貼到中間
offset = ((new_w - w) // 2, (new_h - h) // 2)
new_img.paste(img, offset)

# 儲存結果
new_img.save("resized_canvas.png")
