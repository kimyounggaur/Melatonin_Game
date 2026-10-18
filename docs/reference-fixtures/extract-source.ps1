$ErrorActionPreference = 'Stop'
$fixtureRoot = $PSScriptRoot
$projectRoot = Split-Path (Split-Path $fixtureRoot -Parent) -Parent
$utf8 = [Text.UTF8Encoding]::new($false)
$entries = @()
foreach ($sourceName in @('promptpack', 'design')) {
    $sourcePath = Join-Path $projectRoot "reference/$sourceName.md"
    $sourceText = [IO.File]::ReadAllText($sourcePath, $utf8)
    $matches = [regex]::Matches($sourceText, '(?ms)^```json\r?\n(.*?)^```[ \t]*\r?$')
    $index = 0
    foreach ($match in $matches) {
        $index++
        $raw = $match.Groups[1].Value
        $parsed = ConvertFrom-Json -InputObject $raw -Depth 100 -AsHashtable
        $headingMatches = [regex]::Matches($sourceText.Substring(0, $match.Index), '(?m)^#{2,4} .+$')
        $heading = $headingMatches[$headingMatches.Count - 1].Value.Trim()
        $kind = if ($parsed -is [System.Collections.IDictionary] -and $parsed.Contains('fixtureKind')) { $parsed.fixtureKind } elseif ($parsed -is [array]) { 'level-array' } elseif ($parsed -is [System.Collections.IDictionary] -and $parsed.Contains('$schema')) { 'level-schema' } else { 'object' }
        $stem = '{0}-{1:d2}-{2}' -f $sourceName, $index, $kind
        $sourceFile = "$stem.source.json"
        $parsedFile = "$stem.parsed.json"
        [IO.File]::WriteAllText((Join-Path $fixtureRoot $sourceFile), $raw, $utf8)
        $serialized = ConvertTo-Json -InputObject $parsed -Depth 100
        [IO.File]::WriteAllText((Join-Path $fixtureRoot $parsedFile), $serialized + "`n", $utf8)
        $roundTrip = ConvertFrom-Json -InputObject ([IO.File]::ReadAllText((Join-Path $fixtureRoot $parsedFile), $utf8)) -Depth 100 -AsHashtable
        $equal = (ConvertTo-Json -InputObject $parsed -Depth 100 -Compress) -ceq (ConvertTo-Json -InputObject $roundTrip -Depth 100 -Compress)
        if (-not $equal) { throw "Parsed object mismatch: $stem" }
        $entries += [ordered]@{
            source = "reference/$sourceName.md"
            heading = $heading
            sourceLine = ($sourceText.Substring(0, $match.Index) -split "`n").Count
            fixtureKind = $kind
            sourceFile = $sourceFile
            parsedFile = $parsedFile
            parsedObjectEqual = $equal
            sourceSha256 = (Get-FileHash -LiteralPath (Join-Path $fixtureRoot $sourceFile) -Algorithm SHA256).Hash.ToLowerInvariant()
            parsedSha256 = (Get-FileHash -LiteralPath (Join-Path $fixtureRoot $parsedFile) -Algorithm SHA256).Hash.ToLowerInvariant()
        }
    }
}
$manifest = [ordered]@{ purpose = 'Read-only source excerpt and parsed-equivalent test oracle archive; not implementation-derived expected values'; files = $entries }
[IO.File]::WriteAllText((Join-Path $fixtureRoot 'manifest.json'), (ConvertTo-Json -InputObject $manifest -Depth 100) + "`n", $utf8)
$entries | ForEach-Object { [pscustomobject]$_ } | Select-Object source, heading, fixtureKind, sourceFile, parsedObjectEqual | ConvertTo-Json -Depth 10
