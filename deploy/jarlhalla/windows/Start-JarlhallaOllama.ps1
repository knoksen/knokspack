[CmdletBinding()]
param(
    [string]$SessionName,
    [string]$KeyPath,
    [string]$Model = 'qwen3.5:4b'
)
$ErrorActionPreference = 'Stop'
$ollama = Get-Command ollama -ErrorAction Stop
$models = Invoke-RestMethod -Uri 'http://127.0.0.1:11434/api/tags' -TimeoutSec 10
if ($Model -notin @($models.models.name)) {
    throw "Modellen $Model finnes ikke lokalt. Kjor: ollama pull $Model"
}
Write-Host "Ollama svarer. Tester $Model ..."
$body = @{ model = $Model; prompt = 'Reply with OK only.'; stream = $false } | ConvertTo-Json
$reply = Invoke-RestMethod -Uri 'http://127.0.0.1:11434/api/generate' -Method Post -ContentType 'application/json' -Body $body -TimeoutSec 180
if ([string]::IsNullOrWhiteSpace($reply.response)) { throw 'Modellen returnerte ikke tekst.' }
Write-Host "Modelltest bestatt: $($reply.response)"
$plink = Get-Command plink.exe -ErrorAction SilentlyContinue
$plinkPath = if ($plink) { $plink.Source } else { $null }
if (-not $plinkPath) {
    foreach ($candidate in @("$env:ProgramFiles\PuTTY\plink.exe", "${env:ProgramFiles(x86)}\PuTTY\plink.exe")) {
        if (Test-Path $candidate) { $plinkPath = $candidate; break }
    }
}
if (-not $plinkPath) { throw 'plink.exe mangler. Installer PuTTY med Plink inkludert, og kjor skriptet igjen.' }
if (-not $SessionName -and -not $KeyPath) {
    $sessions = @(Get-ChildItem 'HKCU:\Software\SimonTatham\PuTTY\Sessions' -ErrorAction SilentlyContinue | Where-Object {
        (Get-ItemProperty $_.PSPath).HostName -eq '45.132.114.61'
    })
    if ($sessions.Count -ne 1) { throw 'Oppgi -SessionName med navnet pa den lagrede PuTTY-okten, eller -KeyPath med banen til din .ppk-fil.' }
    $SessionName = [uri]::UnescapeDataString($sessions[0].PSChildName)
}
$plinkArgs = @()
if ($SessionName) { $plinkArgs += @('-load', $SessionName) }
if ($KeyPath) {
    if (-not (Test-Path -LiteralPath $KeyPath)) { throw 'Nokkelfilen finnes ikke.' }
    $plinkArgs += @('-i', $KeyPath)
}
# A dedicated port avoids a collision with the earlier PuTTY tunnel on 11435.
$plinkArgs += @('-ssh', '-P', '22', '-l', 'root', '-N', '-T', '-R', '127.0.0.1:11436:127.0.0.1:11434', '45.132.114.61')
Write-Host 'Starter tunnel til VPS-port 11436. La vinduet sta apent. Ctrl+C avslutter.'
Write-Host 'Bruk nokkelpassfrasen dersom Plink spor. Ikke del passfrasen.'
& $plinkPath @plinkArgs
if ($LASTEXITCODE -ne 0) { throw "SSH-tunnelen avsluttet med kode $LASTEXITCODE. Kontroller Plink-meldingen ovenfor." }
