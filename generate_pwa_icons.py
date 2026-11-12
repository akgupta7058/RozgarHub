import struct
import zlib
import math

def create_png(width, height, pixel_fn):
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # filter type 0: None
        for x in range(width):
            r, g, b, a = pixel_fn(x, y, width, height)
            raw_data.extend([
                max(0, min(255, int(r))),
                max(0, min(255, int(g))),
                max(0, min(255, int(b))),
                max(0, min(255, int(a)))
            ])
    
    compressed = zlib.compress(bytes(raw_data), 9)

    def chunk(tag, data):
        return (
            struct.pack('>I', len(data)) +
            tag +
            data +
            struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)
        )

    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr) + chunk(b'IDAT', compressed) + chunk(b'IEND', b'')

def render_rh_icon(x, y, w, h, maskable=False):
    # Normalized coords [0, 1]
    nx = x / float(w)
    ny = y / float(h)
    
    # Base deep blue colors: #1E3A8A (30, 58, 138) to #0F172A (15, 23, 42)
    t = (nx + ny) * 0.5
    bg_r = int(30 * (1 - t * 0.4) + 15 * (t * 0.4))
    bg_g = int(58 * (1 - t * 0.4) + 23 * (t * 0.4))
    bg_b = int(138 * (1 - t * 0.3) + 42 * (t * 0.3))
    
    if maskable:
        # Full bleed deep blue for maskable safe-zone
        scale = 0.72
        cx, cy = 0.5, 0.5
        px = (nx - cx) / scale + 0.5
        py = (ny - cy) / scale + 0.5
    else:
        # Subtle rounded corner card
        scale = 1.0
        px, py = nx, ny

    # Inside normalized artwork space [px, py]
    in_bounds = (0.0 <= px <= 1.0 and 0.0 <= py <= 1.0)
    
    # Outer shield / circle badge in center
    dx = px - 0.5
    dy = py - 0.48
    dist = math.sqrt(dx * dx + dy * dy)
    
    # Bright orange accent colors
    orange_r, orange_g, orange_b = 249, 115, 22
    amber_r, amber_g, amber_b = 251, 146, 60
    
    # Let's draw:
    # 1. Circular orange shield ring / glow (radius 0.38)
    # 2. Deep blue inner core
    # 3. Bold "RH" letterforms
    # 4. Orange tool accent / dot
    
    col_r, col_g, col_b = bg_r, bg_g, bg_b
    
    if in_bounds:
        # Orange circular background badge
        if dist <= 0.38:
            # Radial gradient for badge
            gt = dist / 0.38
            badge_r = int(orange_r * (1 - gt * 0.2) + 220 * gt * 0.2)
            badge_g = int(orange_g * (1 - gt * 0.3) + 70 * gt * 0.3)
            badge_b = int(orange_b * (1 - gt * 0.5) + 10 * gt * 0.5)
            
            # Inner circle (radius 0.33)
            if dist <= 0.33:
                # Dark blue-navy backing for the white letters
                col_r = 23
                col_g = 37
                col_b = 84
            else:
                col_r = badge_r
                col_g = badge_g
                col_b = badge_b
        
        # Subtle border ring on outer badge
        if 0.365 <= dist <= 0.385:
            col_r, col_g, col_b = 254, 215, 170

    # Letterform tests in coordinate space:
    # px: [0, 1], py: [0, 1]
    # 'R' centered around px in [0.27, 0.46], py in [0.32, 0.64]
    # 'H' centered around px in [0.52, 0.73], py in [0.32, 0.64]
    
    # R coordinates
    in_letter_r = False
    
    # Vertical spine of R: px in [0.28, 0.33], py in [0.32, 0.64]
    if 0.28 <= px <= 0.33 and 0.32 <= py <= 0.64:
        in_letter_r = True
    
    # Top bar of R: px in [0.33, 0.42], py in [0.32, 0.37]
    if 0.33 <= px <= 0.42 and 0.32 <= py <= 0.37:
        in_letter_r = True
        
    # Middle bar of R: px in [0.33, 0.42], py in [0.46, 0.51]
    if 0.33 <= px <= 0.42 and 0.46 <= py <= 0.51:
        in_letter_r = True
        
    # Curved outer loop of R: centered around (0.41, 0.415)
    ldx = (px - 0.40) / 0.08
    ldy = (py - 0.415) / 0.095
    ldist = ldx * ldx + ldy * ldy
    if 0.45 <= ldist <= 1.05 and px >= 0.38 and 0.32 <= py <= 0.51:
        in_letter_r = True
        
    # Diagonal leg of R: from (0.34, 0.49) to (0.47, 0.64)
    # y = py, target x = 0.34 + (py - 0.49) * 0.86
    if 0.48 <= py <= 0.64:
        target_rx = 0.34 + (py - 0.48) * 0.82
        if abs(px - target_rx) <= 0.032:
            in_letter_r = True

    # H coordinates
    in_letter_h = False
    
    # Left spine of H: px in [0.53, 0.58], py in [0.32, 0.64]
    if 0.53 <= px <= 0.58 and 0.32 <= py <= 0.64:
        in_letter_h = True
        
    # Right spine of H: px in [0.67, 0.72], py in [0.32, 0.64]
    if 0.67 <= px <= 0.72 and 0.32 <= py <= 0.64:
        in_letter_h = True
        
    # Crossbar of H: px in [0.58, 0.67], py in [0.45, 0.50]
    if 0.58 <= px <= 0.67 and 0.455 <= py <= 0.505:
        in_letter_h = True

    if in_letter_r or in_letter_h:
        # Crisp white with slight metallic top highlight
        col_r, col_g, col_b = 255, 255, 255

    # Bottom dot / badge accent under RH: orange/gold pill at py in [0.70, 0.73], px in [0.44, 0.56]
    if 0.69 <= py <= 0.73 and 0.44 <= px <= 0.56:
        col_r, col_g, col_b = 249, 115, 22

    # Corner rounding for non-maskable icons
    if not maskable:
        # Round outer corners of the 512 / 192 canvas
        corner_r = 0.22
        cx = 0.0
        cy = 0.0
        if nx < corner_r: cx = corner_r - nx
        elif nx > 1 - corner_r: cx = nx - (1 - corner_r)
        
        if ny < corner_r: cy = corner_r - ny
        elif ny > 1 - corner_r: cy = ny - (1 - corner_r)
        
        if cx > 0 and cy > 0:
            cdist = math.sqrt(cx * cx + cy * cy)
            if cdist > corner_r:
                # Transparent outside rounded corner
                return (0, 0, 0, 0)

    return (col_r, col_g, col_b, 255)

def main():
    print("Generating crisp 'RH' PWA icons...")
    
    # 1. pwa-192x192.png
    png_192 = create_png(192, 192, lambda x, y, w, h: render_rh_icon(x, y, w, h, maskable=False))
    with open('public/pwa-192x192.png', 'wb') as f:
        f.write(png_192)
    print("-> Generated public/pwa-192x192.png (192x192)")

    # 2. pwa-512x512.png
    png_512 = create_png(512, 512, lambda x, y, w, h: render_rh_icon(x, y, w, h, maskable=False))
    with open('public/pwa-512x512.png', 'wb') as f:
        f.write(png_512)
    print("-> Generated public/pwa-512x512.png (512x512)")

    # 3. pwa-maskable-512x512.png (safe-zone padded)
    png_maskable = create_png(512, 512, lambda x, y, w, h: render_rh_icon(x, y, w, h, maskable=True))
    with open('public/pwa-maskable-512x512.png', 'wb') as f:
        f.write(png_maskable)
    print("-> Generated public/pwa-maskable-512x512.png (512x512 maskable)")

    # 4. apple-touch-icon.png (180x180)
    png_180 = create_png(180, 180, lambda x, y, w, h: render_rh_icon(x, y, w, h, maskable=False))
    with open('public/apple-touch-icon.png', 'wb') as f:
        f.write(png_180)
    print("-> Generated public/apple-touch-icon.png (180x180)")

    # 5. favicon.ico
    with open('public/favicon.ico', 'wb') as f:
        f.write(png_192)
    print("-> Generated public/favicon.ico")

if __name__ == '__main__':
    main()
