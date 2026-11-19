# Mini static web server for the party game (no install needed: uses built-in PowerShell).
# Usage: double-click Mo-web.bat (or: powershell -ExecutionPolicy Bypass -File tools\serve.ps1)
param([int]$Port = 5500, [switch]$NoBrowser)

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$types = @{
  '.html' = 'text/html; charset=utf-8'; '.htm' = 'text/html; charset=utf-8'
  '.js' = 'text/javascript; charset=utf-8'; '.mjs' = 'text/javascript; charset=utf-8'
  '.css' = 'text/css; charset=utf-8'; '.json' = 'application/json; charset=utf-8'
  '.svg' = 'image/svg+xml'; '.png' = 'image/png'; '.jpg' = 'image/jpeg'; '.jpeg' = 'image/jpeg'
  '.gif' = 'image/gif'; '.webp' = 'image/webp'; '.ico' = 'image/x-icon'
  '.woff2' = 'font/woff2'; '.woff' = 'font/woff'; '.mp3' = 'audio/mpeg'; '.ogg' = 'audio/ogg'
  '.wasm' = 'application/wasm'; '.tflite' = 'application/octet-stream'; '.md' = 'text/plain; charset=utf-8'
}

$listener = $null
for ($p = $Port; $p -lt $Port + 20; $p++) {
  $l = New-Object System.Net.HttpListener
  $l.Prefixes.Add("http://localhost:$p/")
  try { $l.Start(); $listener = $l; $Port = $p; break } catch { $l.Close() }
}
if (-not $listener) { Write-Host 'Khong mo duoc cong mang (port). Hay thu lai.' -ForegroundColor Red; Read-Host 'Nhan Enter de dong'; exit 1 }

$url = "http://localhost:$Port/"
Write-Host ''
Write-Host '  Mini game Thoi noi dang chay tai:' -ForegroundColor Yellow
Write-Host "  $url" -ForegroundColor Green
Write-Host ''
Write-Host '  GIU CUA SO NAY MO trong suot buoi tiec. Dong cua so = tat web.' -ForegroundColor Yellow
Write-Host ''
if (-not $NoBrowser) { Start-Process $url }

while ($listener.IsListening) {
  try { $ctx = $listener.GetContext() } catch { break }
  $req = $ctx.Request; $res = $ctx.Response
  try {
    $rel = [Uri]::UnescapeDataString($req.Url.AbsolutePath).TrimStart('/')
    if ($rel -eq '') { $rel = 'index.html' }
    $file = [IO.Path]::GetFullPath((Join-Path $root $rel))
    if (-not $file.StartsWith($root, [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $file -PathType Leaf)) {
      $res.StatusCode = 404
      $bytes = [Text.Encoding]::UTF8.GetBytes('404')
    } else {
      $ext = [IO.Path]::GetExtension($file).ToLower()
      $res.ContentType = if ($types.ContainsKey($ext)) { $types[$ext] } else { 'application/octet-stream' }
      $res.AddHeader('Cache-Control', 'no-cache')
      $bytes = [IO.File]::ReadAllBytes($file)
    }
    if ($req.HttpMethod -ne 'HEAD') { $res.ContentLength64 = $bytes.Length; $res.OutputStream.Write($bytes, 0, $bytes.Length) }
  } catch {
    $res.StatusCode = 500
  } finally {
    try { $res.OutputStream.Close() } catch {}
  }
}
