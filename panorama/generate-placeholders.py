#!/usr/bin/env python3
"""Generate placeholder panorama images for testing"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_panorama_placeholder(filename, text, color=(135, 206, 235), size=(4096, 2048)):
    """Create a placeholder equirectangular panorama image"""
    # Create image with solid color
    img = Image.new('RGB', size, color=color)
    draw = ImageDraw.Draw(img)

    # Try to use a nice font, fall back to default if not available
    try:
        font = ImageFont.truetype("arial.ttf", 200)
    except:
        font = ImageFont.load_default()

    # Draw text in center
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]

    position = ((size[0] - text_width) // 2, (size[1] - text_height) // 2)
    draw.text(position, text, fill=(255, 255, 255), font=font)

    # Save image
    img.save(filename, 'JPEG', quality=85)
    print(f"[OK] Created: {filename}")

# Create Paris panoramas
paris_dir = "public/panoramas/paris"
os.makedirs(paris_dir, exist_ok=True)

print("[INFO] Generating Paris panoramas...")
create_panorama_placeholder(f"{paris_dir}/eiffel-tower.jpg", "Tour Eiffel 360", (135, 206, 235))
create_panorama_placeholder(f"{paris_dir}/louvre.jpg", "Louvre Museum 360", (255, 215, 0))
create_panorama_placeholder(f"{paris_dir}/arc-triomphe.jpg", "Arc de Triomphe 360", (255, 107, 107))
create_panorama_placeholder(f"{paris_dir}/notre-dame.jpg", "Notre-Dame 360", (169, 169, 169))
create_panorama_placeholder(f"{paris_dir}/sacre-coeur.jpg", "Sacre-Coeur 360", (240, 255, 240))

print("\n[SUCCESS] All Paris panoramas generated!")
print(f"[INFO] Location: {os.path.abspath(paris_dir)}")
