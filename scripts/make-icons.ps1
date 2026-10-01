# Gera os ícones PNG do PWA a partir de desenho vetorial simples (carrinho + check), sem dependências externas.
# Uso: powershell -ExecutionPolicy Bypass -File scripts/make-icons.ps1
Add-Type -AssemblyName System.Drawing

$out = Join-Path $PSScriptRoot "..\public"
New-Item -ItemType Directory -Force $out | Out-Null

function New-Icon([int]$size, [string]$file, [bool]$maskable) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.Clear([System.Drawing.Color]::Transparent)

  $green = [System.Drawing.Color]::FromArgb(255, 5, 150, 105)
  $brush = New-Object System.Drawing.SolidBrush $green

  if ($maskable) {
    # Maskable: fundo preenche tudo; conteúdo dentro da zona segura (80% central)
    $g.FillRectangle($brush, 0, 0, $size, $size)
    $pad = $size * 0.18
  } else {
    # Normal: quadrado arredondado
    $r = $size * 0.22
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc(0, 0, $r, $r, 180, 90)
    $path.AddArc($size - $r, 0, $r, $r, 270, 90)
    $path.AddArc($size - $r, $size - $r, $r, $r, 0, 90)
    $path.AddArc(0, $size - $r, $r, $r, 90, 90)
    $path.CloseFigure()
    $g.FillPath($brush, $path)
    $pad = $size * 0.08
  }

  # Desenho normalizado em um grid 64x64 (mesmo do favicon.svg)
  $scale = ($size - 2 * $pad) / 64
  $g.TranslateTransform($pad, $pad)
  $g.ScaleTransform($scale, $scale)

  $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::White), 4
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

  $cart = [System.Drawing.PointF[]]@(
    (New-Object System.Drawing.PointF 14, 18), (New-Object System.Drawing.PointF 20, 18),
    (New-Object System.Drawing.PointF 25, 40), (New-Object System.Drawing.PointF 45, 40),
    (New-Object System.Drawing.PointF 49, 26), (New-Object System.Drawing.PointF 24, 26)
  )
  $g.DrawLines($pen, $cart)
  $check = [System.Drawing.PointF[]]@(
    (New-Object System.Drawing.PointF 30, 33), (New-Object System.Drawing.PointF 34, 37), (New-Object System.Drawing.PointF 42, 29)
  )
  $g.DrawLines($pen, $check)
  $white = [System.Drawing.Brushes]::White
  $g.FillEllipse($white, 24, 44, 6, 6)
  $g.FillEllipse($white, 40, 44, 6, 6)

  $bmp.Save((Join-Path $out $file), [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose(); $pen.Dispose(); $brush.Dispose()
  Write-Host "ok  $file ($size x $size)"
}

function New-OgImage([string]$file) {
  $w = 1200; $h = 630
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  # Fundo em gradiente verde
  $c1 = [System.Drawing.Color]::FromArgb(255, 4, 120, 87)
  $c2 = [System.Drawing.Color]::FromArgb(255, 16, 185, 129)
  $grad = New-Object System.Drawing.Drawing2D.LinearGradientBrush ([System.Drawing.Point]::new(0, 0)), ([System.Drawing.Point]::new($w, $h)), $c1, $c2
  $g.FillRectangle($grad, 0, 0, $w, $h)

  # Ícone (carrinho) à esquerda, em um grid 64x64 escalado
  $g.TranslateTransform(90, 150)
  $g.ScaleTransform(5.2, 5.2)
  $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::White), 4
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $cart = [System.Drawing.PointF[]]@(
    (New-Object System.Drawing.PointF 14, 18), (New-Object System.Drawing.PointF 20, 18),
    (New-Object System.Drawing.PointF 25, 40), (New-Object System.Drawing.PointF 45, 40),
    (New-Object System.Drawing.PointF 49, 26), (New-Object System.Drawing.PointF 24, 26)
  )
  $g.DrawLines($pen, $cart)
  $check = [System.Drawing.PointF[]]@(
    (New-Object System.Drawing.PointF 30, 33), (New-Object System.Drawing.PointF 34, 37), (New-Object System.Drawing.PointF 42, 29)
  )
  $g.DrawLines($pen, $check)
  $g.FillEllipse([System.Drawing.Brushes]::White, 24, 44, 6, 6)
  $g.FillEllipse([System.Drawing.Brushes]::White, 40, 44, 6, 6)
  $g.ResetTransform()

  # Textos
  $white = [System.Drawing.Brushes]::White
  $soft = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(230, 255, 255, 255))
  $title = New-Object System.Drawing.Font('Segoe UI', 60, [System.Drawing.FontStyle]::Bold)
  $sub = New-Object System.Drawing.Font('Segoe UI', 26, [System.Drawing.FontStyle]::Bold)
  $body = New-Object System.Drawing.Font('Segoe UI', 23, [System.Drawing.FontStyle]::Regular)
  $tag = New-Object System.Drawing.Font('Segoe UI', 21, [System.Drawing.FontStyle]::Bold)

  $textX = 440; $textW = $w - $textX - 60
  $g.DrawString("Lista de Mercado", $title, $white, $textX, 140)
  $g.DrawString("Compare preços e controle seus gastos", $sub, $white, ($textX + 5), 240)
  $bodyRect = New-Object System.Drawing.RectangleF(($textX + 5), 300, $textW, 150)
  $g.DrawString("Registre os preços enquanto compra, veja o total na hora e descubra em qual mês (e em qual mercado) você gastou mais.", $body, $soft, $bodyRect)

  # "Pills" de destaque
  $pills = @("Grátis", "Funciona offline", "Instala no celular")
  $x = $textX + 5
  foreach ($p in $pills) {
    $size = $g.MeasureString($p, $tag)
    $rect = New-Object System.Drawing.RectangleF($x, 470, ($size.Width + 36), 52)
    $pillBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(60, 255, 255, 255))
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $r = 26
    $path.AddArc($rect.X, $rect.Y, $r * 2, $r * 2, 180, 90)
    $path.AddArc($rect.Right - $r * 2, $rect.Y, $r * 2, $r * 2, 270, 90)
    $path.AddArc($rect.Right - $r * 2, $rect.Bottom - $r * 2, $r * 2, $r * 2, 0, 90)
    $path.AddArc($rect.X, $rect.Bottom - $r * 2, $r * 2, $r * 2, 90, 90)
    $path.CloseFigure()
    $g.FillPath($pillBrush, $path)
    $g.DrawString($p, $tag, $white, $x + 18, 481)
    $x += $size.Width + 36 + 14
  }

  $bmp.Save((Join-Path $out $file), [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
  Write-Host "ok  $file (1200 x 630)"
}

New-Icon 192 "pwa-192x192.png" $false
New-Icon 512 "pwa-512x512.png" $false
New-Icon 512 "pwa-maskable-512x512.png" $true
New-Icon 180 "apple-touch-icon.png" $true
New-OgImage "og-image.png"
