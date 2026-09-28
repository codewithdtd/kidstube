Add-Type -AssemblyName System.Drawing

function Generate-YouTubeIcon {
    param(
        [int]$size,
        [string]$path,
        [bool]$isForeground = $false,
        [string]$bgColor = '#FFFFFF'
    )
    $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    if (-not $isForeground) {
        $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml($bgColor))
        $g.FillRectangle($bgBrush, 0, 0, $size, $size)
        $bgBrush.Dispose()
    } else {
        $g.Clear([System.Drawing.Color]::Transparent)
    }

    # Proportions for the YouTube red rounded rectangle
    $ratio = if ($isForeground) { 0.58 } else { 0.68 }
    $rectWidth = $size * $ratio
    $rectHeight = $rectWidth * (138.0 / 196.0)
    $rectX = ($size - $rectWidth) / 2.0
    $rectY = ($size - $rectHeight) / 2.0
    $radius = $rectHeight * 0.28

    # Rounded rectangle path
    $pathG = New-Object System.Drawing.Drawing2D.GraphicsPath
    $pathG.AddArc($rectX, $rectY, $radius * 2, $radius * 2, 180, 90)
    $pathG.AddArc($rectX + $rectWidth - ($radius * 2), $rectY, $radius * 2, $radius * 2, 270, 90)
    $pathG.AddArc($rectX + $rectWidth - ($radius * 2), $rectY + $rectHeight - ($radius * 2), $radius * 2, $radius * 2, 0, 90)
    $pathG.AddArc($rectX, $rectY + $rectHeight - ($radius * 2), $radius * 2, $radius * 2, 90, 90)
    $pathG.CloseFigure()

    # YouTube Red fill
    $redBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#FF0000'))
    $g.FillPath($redBrush, $pathG)
    $redBrush.Dispose()
    $pathG.Dispose()

    # Centered white play triangle
    $triWidth = $rectWidth * 0.32
    $triHeight = $triWidth * 1.15
    $centerX = $size / 2.0
    $centerY = $size / 2.0
    $optX = $centerX + ($triWidth * 0.08)

    $p1 = New-Object System.Drawing.PointF(($optX - $triWidth / 2.0), ($centerY - $triHeight / 2.0))
    $p2 = New-Object System.Drawing.PointF(($optX + $triWidth / 2.0), $centerY)
    $p3 = New-Object System.Drawing.PointF(($optX - $triWidth / 2.0), ($centerY + $triHeight / 2.0))

    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.FillPolygon($whiteBrush, [System.Drawing.PointF[]]@($p1, $p2, $p3))
    $whiteBrush.Dispose()

    $g.Dispose()
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Output "Successfully created $path ($size x $size)"
}

# 1. Main App Icon (1024x1024) - Clean white background with authentic YouTube Play button
Generate-YouTubeIcon -size 1024 -path 'e:\study\kidstube\mobile\assets\icon.png' -bgColor '#FFFFFF'

# 2. Android Adaptive Icon Foreground (1024x1024) - Transparent background, safe-zone centered
Generate-YouTubeIcon -size 1024 -path 'e:\study\kidstube\mobile\assets\android-icon-foreground.png' -isForeground $true

# 3. Android Adaptive Icon Background (1024x1024) - Pure White (or #0F0F0F)
$bgBmp = New-Object System.Drawing.Bitmap(1024, 1024, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$bgG = [System.Drawing.Graphics]::FromImage($bgBmp)
$bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$bgG.FillRectangle($bgBrush, 0, 0, 1024, 1024)
$bgBrush.Dispose()
$bgG.Dispose()
$bgBmp.Save('e:\study\kidstube\mobile\assets\android-icon-background.png', [System.Drawing.Imaging.ImageFormat]::Png)
$bgBmp.Dispose()
Write-Output "Successfully created android-icon-background.png"

# 4. Splash Icon (512x512)
Generate-YouTubeIcon -size 512 -path 'e:\study\kidstube\mobile\assets\splash-icon.png' -isForeground $true

# 5. Web Favicon (64x64)
Generate-YouTubeIcon -size 64 -path 'e:\study\kidstube\mobile\assets\favicon.png' -bgColor '#FFFFFF'
