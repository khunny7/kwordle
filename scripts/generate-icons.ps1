Param()
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

function New-RoundedRectPath {
    Param(
        [System.Drawing.RectangleF]$Rect,
        [float]$Radius
    )
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = $Radius * 2
    $x = $Rect.X; $y = $Rect.Y; $w = $Rect.Width; $h = $Rect.Height
    $path.AddArc($x, $y, $d, $d, 180, 90)
    $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
    $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
    $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
    $path.CloseFigure()
    return $path
}

function New-IconPng {
    Param(
        [int]$Size,
        [string]$OutPath
    )
    $bmp = New-Object System.Drawing.Bitmap $Size, $Size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = 'HighQuality'
    $g.InterpolationMode = 'HighQualityBicubic'
    $g.Clear([System.Drawing.Color]::FromArgb(0,0,0,0))

    # Gradient background
    $rect = New-Object System.Drawing.Rectangle 0,0,$Size,$Size
    $c1 = [System.Drawing.ColorTranslator]::FromHtml('#7c5cff')
    $c2 = [System.Drawing.ColorTranslator]::FromHtml('#22d3ee')
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, $c1, $c2, 45
    $g.FillRectangle($brush, $rect)

    # Wordle-style tiles (3)
    $tileSize = [Math]::Round($Size * 0.235)
    $gap = [Math]::Round($Size * 0.039)
    $total = $tileSize*3 + $gap*2
    $startX = [Math]::Round(($Size - $total) / 2)
    $startY = [Math]::Round($Size * 0.38)
    $r = [Math]::Round($tileSize * 0.18)

    $colors = '#22c55e','#eab308','#475569'
    # Jamo: ㅈ (U+3148), ㅏ (U+314F), ㅁ (U+3141)
    $chars = @([char]0x3148, [char]0x314F, [char]0x3141)

    for ($i=0; $i -lt 3; $i++) {
        $x = $startX + ($tileSize + $gap) * $i
        $rectF = New-Object System.Drawing.RectangleF $x, $startY, $tileSize, $tileSize
        $p = New-RoundedRectPath -Rect $rectF -Radius $r
        $fill = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($colors[$i]))
        $g.FillPath($fill, $p)
        $fill.Dispose(); $p.Dispose()
        # Text
        $fontSize = [Math]::Round($tileSize * 0.68)
        try { $font = New-Object System.Drawing.Font 'Malgun Gothic', $fontSize, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel) }
        catch { $font = New-Object System.Drawing.Font 'Segoe UI Black', $fontSize, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel) }
        $sf = New-Object System.Drawing.StringFormat
        $sf.Alignment = [System.Drawing.StringAlignment]::Center
        $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
        $cx = [float]($x + $tileSize/2)
        $cy = [float]($startY + $tileSize/2 + ($tileSize*0.02))
        $white = [System.Drawing.Brushes]::White
        $g.DrawString($chars[$i], $font, $white, $cx, $cy, $sf)
        $font.Dispose()
    }

    # Save
    $dir = Split-Path $OutPath -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose()
}

New-IconPng -Size 192 -OutPath (Join-Path $PSScriptRoot '..\public\icons\icon-192.png')
New-IconPng -Size 512 -OutPath (Join-Path $PSScriptRoot '..\public\icons\icon-512.png')
New-IconPng -Size 32  -OutPath (Join-Path $PSScriptRoot '..\public\icons\icon-32.png')
New-IconPng -Size 180 -OutPath (Join-Path $PSScriptRoot '..\public\icons\icon-180.png')
Write-Host 'Icons generated.'
