Param()
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

function New-IconPng {
    Param(
        [int]$Size,
        [string]$OutPath
    )
    $bmp = New-Object System.Drawing.Bitmap $Size, $Size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = 'HighQuality'
    $g.InterpolationMode = 'HighQualityBicubic'
    # Gradient background
    $rect = New-Object System.Drawing.Rectangle 0,0,$Size,$Size
    $c1 = [System.Drawing.ColorTranslator]::FromHtml('#7c5cff')
    $c2 = [System.Drawing.ColorTranslator]::FromHtml('#22d3ee')
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, $c1, $c2, 45
    $g.FillRectangle($brush, $rect)
    # Text K
    $fontSize = [Math]::Round($Size * 0.55)
    $font = New-Object System.Drawing.Font 'Segoe UI Black', $fontSize, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $centerX = [float]($Size / 2)
    $centerY = [float]($Size * 0.56)
    $textBrush = [System.Drawing.Brushes]::Black
    $g.DrawString('K', $font, $textBrush, $centerX, $centerY, $sf)
    # Save
    $dir = Split-Path $OutPath -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose()
}

New-IconPng -Size 192 -OutPath (Join-Path $PSScriptRoot '..\public\icons\icon-192.png')
New-IconPng -Size 512 -OutPath (Join-Path $PSScriptRoot '..\public\icons\icon-512.png')
Write-Host 'Icons generated.'
