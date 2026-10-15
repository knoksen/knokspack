[CmdletBinding()]
param([string]$KeyPath)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms
function Find-PuttyTool([string]$Name) {
    $tool = Get-Command $Name -ErrorAction SilentlyContinue
    if ($tool) { return $tool.Source }
    foreach ($folder in @($env:ProgramFiles, ${env:ProgramFiles(x86)})) {
        if ($folder) {
            $candidate = Join-Path $folder "PuTTY\$Name"
            if (Test-Path $candidate) { return $candidate }
        }
    }
    throw "Finner ikke $Name i PuTTY-installasjonen."
}
$plinkPath = Find-PuttyTool 'plink.exe'
$pageantPath = Find-PuttyTool 'pageant.exe'
if (Get-NetTCPConnection -State Listen -LocalPort 18787 -ErrorAction SilentlyContinue) {
    throw 'Port 18787 er allerede i bruk. Avslutt det GAMLE tunnelvinduet med Ctrl+C, og kjor dette skriptet igjen.'
}
if (-not $KeyPath) {
    $picker = New-Object System.Windows.Forms.OpenFileDialog
    $picker.Title = 'Velg SSH-nokkelen til Jarlhalla'
    $picker.Filter = 'PuTTY-nokkel (*.ppk)|*.ppk'
    if ($picker.ShowDialog() -ne 'OK') { return }
    $KeyPath = $picker.FileName
}
$KeyPath = (Resolve-Path -LiteralPath $KeyPath).Path
# Only a key FILE PATH is persisted. No passphrase, API key or private key bytes.
$sessionName = 'Jarlhalla-Private-Tunnel'
$sessionPath = "HKCU:\Software\SimonTatham\PuTTY\Sessions\$sessionName"
New-Item -Path $sessionPath -Force | Out-Null
$settings = @{ HostName='45.132.114.61'; UserName='root'; PublicKeyFile=$KeyPath; Protocol='ssh' }
foreach ($name in $settings.Keys) { New-ItemProperty -Path $sessionPath -Name $name -Value $settings[$name] -PropertyType String -Force | Out-Null }
$numbers = @{ PortNumber=22; PingInterval=0; PingIntervalSecs=30; TCPKeepAlives=1; ConnectionSharing=0; AgentFwd=0; TryAgent=1 }
foreach ($name in $numbers.Keys) { New-ItemProperty -Path $sessionPath -Name $name -Value $numbers[$name] -PropertyType DWord -Force | Out-Null }
Start-Process -FilePath $pageantPath -ArgumentList ('"{0}"' -f $KeyPath)
Write-Host 'Last nokkelen i Pageant-vinduet. Passfrasen blir hos Pageant i minnet.'
Read-Host 'Trykk Enter her nar nokkelen er lastet' | Out-Null
# Batch preflight fails closed if the host key is unknown or the agent cannot authenticate.
& $plinkPath -load $sessionName -batch -agent -a -noshare 'echo JARLHALLA_SSH_OK'
if ($LASTEXITCODE -ne 0) {
    throw 'SSH-kontrollen feilet. Kontroller nokkelen i Pageant og kjent servernokkel. Ingen automatiske innloggingsforsok startet.'
}
$logRoot = Join-Path $env:LOCALAPPDATA 'Jarlhalla\Tunnel'
New-Item -ItemType Directory -Path $logRoot -Force | Out-Null
$process = $null
$opened = $false
$quickFailures = 0
try {
    while ($true) {
        $stdout = Join-Path $logRoot 'connection.log'
        $stderr = Join-Path $logRoot 'errors.log'
        $args = @('-load', $sessionName, '-batch', '-agent', '-a', '-noshare', '-N', '-T', '-v', '-L', '127.0.0.1:18787:127.0.0.1:8787', '-R', '127.0.0.1:11436:127.0.0.1:11434')
        Write-Host 'Kobler til Jarlhalla. Ctrl+C avslutter tunnelen.'
        $started = Get-Date
        $process = Start-Process -FilePath $plinkPath -ArgumentList $args -PassThru -NoNewWindow -RedirectStandardOutput $stdout -RedirectStandardError $stderr
        $misses = 0
        while (-not $process.HasExited) {
            Start-Sleep -Seconds 5
            $details = if (Test-Path $stderr) { Get-Content $stderr -Raw -ErrorAction SilentlyContinue } else { '' }
            if ($details -match '(?i)(remote port forwarding|remote port forward|forwarded port).*(failed|refused)|host key.*(changed|not cached)|access denied|unable to authenticate') {
                throw 'SSH meldte port- eller autentiseringsfeil. Se errors.log. Stopp eventuell gammel tunnel og kontroller Pageant.'
            }
            try {
                $health = Invoke-RestMethod -Uri 'http://127.0.0.1:18787/workspace/health' -TimeoutSec 8
                $misses = 0
                if ($health.connected) {
                    Write-Host "$(Get-Date -Format HH:mm:ss) Tilkoblet: VPS og Ollama."
                    if (-not $opened) { Start-Process 'http://127.0.0.1:18787/workspace#command'; $opened = $true }
                } else { Write-Host 'VPS svarer; Ollama er ikke tilgjengelig. Kontroller Ollama pa PC-en.' }
            } catch {
                $misses++
                Write-Host "Ingen kontakt med arbeidsrommet ($misses/3)."
                if ($misses -ge 3 -and -not $process.HasExited) { Stop-Process -Id $process.Id -ErrorAction SilentlyContinue }
            }
            $process.Refresh()
        }
        if (((Get-Date) - $started).TotalSeconds -lt 20) { $quickFailures++ } else { $quickFailures = 0 }
        if ($quickFailures -ge 3) { throw 'Tre raske tilkoblingsfeil. Automatisk gjenoppkobling er stoppet; kontroller errors.log.' }
        Write-Host 'Forbindelsen ble brutt. Prover igjen om 5 sekunder.'
        Start-Sleep -Seconds 5
    }
} finally {
    if ($process -and -not $process.HasExited) { Stop-Process -Id $process.Id -ErrorAction SilentlyContinue }
}
