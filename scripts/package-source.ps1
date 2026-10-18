param([string]$Name = 'bamsil-workshop-mvp-1.0.1.zip')
$ErrorActionPreference = 'Stop'
$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$artifactRoot = Join-Path $projectRoot 'artifacts'
New-Item -ItemType Directory -Force -Path $artifactRoot | Out-Null
$zipPath = [System.IO.Path]::GetFullPath((Join-Path $artifactRoot $Name))
if (-not $zipPath.StartsWith($artifactRoot + [System.IO.Path]::DirectorySeparatorChar)) { throw 'Archive path must stay in artifacts.' }
if (Test-Path -LiteralPath $zipPath) { throw 'Archive already exists; choose a new version name.' }
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)
$count = 0
try {
  foreach ($file in Get-ChildItem -LiteralPath $projectRoot -Recurse -File -Force) {
    $relative = [System.IO.Path]::GetRelativePath($projectRoot, $file.FullName).Replace('\','/')
    if ($relative -match '^(node_modules|\.git|artifacts)/|^reports/browser-report/|^output/playwright/test-results/') { continue }
    if ($relative.StartsWith('output/') -and $file.Extension -ne '.png') { continue }
    if ($file.Extension -eq '.log') { continue }
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip,$file.FullName,$relative,[System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
    $count++
  }
} finally { $zip.Dispose() }
$check = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
try {
  $bytes = 0L
  foreach ($entry in $check.Entries) {
    $stream = $entry.Open()
    try { $stream.CopyTo([System.IO.Stream]::Null); $bytes += $entry.Length } finally { $stream.Dispose() }
  }
  if ($check.Entries.Count -ne $count) { throw 'Archive entry count mismatch.' }
} finally { $check.Dispose() }
$result = [PSCustomObject]@{path=$zipPath;entries=$count;uncompressedBytes=$bytes;bytes=(Get-Item -LiteralPath $zipPath).Length;sha256=(Get-FileHash -LiteralPath $zipPath -Algorithm SHA256).Hash.ToLowerInvariant();validation='All entries decompressed successfully';exclusions=@('node_modules','.git','artifacts','HTML reports and browser traces')}
$result | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $artifactRoot 'archive-verification.json') -Encoding utf8
$result | ConvertTo-Json -Depth 4
