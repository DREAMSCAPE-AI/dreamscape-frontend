#!/usr/bin/env python3
"""Convert 16:9 images to 2:1 equirectangular format for VR panoramas"""

from PIL import Image
import os

def convert_to_equirectangular(input_path, output_path, target_size=(4096, 2048)):
    """
    Convert a 16:9 image to 2:1 equirectangular format

    Args:
        input_path: Path to input image (16:9)
        output_path: Path to save output image (2:1)
        target_size: Target resolution (width, height), default 4096x2048
    """
    # Open the image
    img = Image.open(input_path)
    print(f"[INFO] Image d'origine: {img.size[0]}x{img.size[1]}")

    # Create a new 2:1 image with black background
    target_width, target_height = target_size
    new_img = Image.new('RGB', (target_width, target_height), (0, 0, 0))

    # Resize input image to fit width while maintaining aspect ratio
    # For 16:9 image to fit in 2:1 canvas
    aspect_ratio = img.size[0] / img.size[1]  # Should be ~1.78 for 16:9

    # Calculate new dimensions to fit width
    new_width = target_width
    new_height = int(target_width / aspect_ratio)

    # Resize the image
    resized_img = img.resize((new_width, new_height), Image.LANCZOS)
    print(f"[INFO] Image redimensionnée: {new_width}x{new_height}")

    # Paste the resized image centered vertically
    y_offset = (target_height - new_height) // 2
    new_img.paste(resized_img, (0, y_offset))

    # Save the result
    new_img.save(output_path, 'JPEG', quality=85)
    print(f"[OK] Créé: {output_path} ({target_width}x{target_height})")

# Configuration
input_dir = "public/panoramas/paris/original"  # Mets tes images 16:9 ici
output_dir = "public/panoramas/paris"

# Create directories if they don't exist
os.makedirs(input_dir, exist_ok=True)
os.makedirs(output_dir, exist_ok=True)

print("[INFO] Conversion des images 16:9 vers format équirectangulaire 2:1...\n")

# List of panorama files to convert
panoramas = [
    ("eiffel-tower.png", "eiffel-tower.jpg", "Tour Eiffel 360"),
    ("louvre.png", "louvre.jpg", "Louvre Museum 360"),
    ("arc-triomphe.png", "arc-triomphe.jpg", "Arc de Triomphe 360"),
    ("notre-dame.png", "notre-dame.jpg", "Notre-Dame 360"),
    ("sacre-coeur.png", "sacre-coeur.jpg", "Sacre-Coeur 360")
]

# Convert each image
for input_filename, output_filename, description in panoramas:
    input_path = os.path.join(input_dir, input_filename)
    output_path = os.path.join(output_dir, output_filename)

    if os.path.exists(input_path):
        print(f"[CONVERSION] {description}")
        convert_to_equirectangular(input_path, output_path)
        print()
    else:
        print(f"[SKIP] {input_path} n'existe pas")
        print(f"       Place ton image 16:9 dans: {os.path.abspath(input_dir)}")
        print()

print("[SUCCESS] Conversion terminée!")
print(f"[INFO] Images converties dans: {os.path.abspath(output_dir)}")
