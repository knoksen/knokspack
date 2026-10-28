& {
    $ErrorActionPreference = 'Stop'
    Add-Type -AssemblyName System.Windows.Forms
    $plinkPath = (Get-Command plink.exe -ErrorAction SilentlyContinue).Source
    if (-not $plinkPath) { $plinkPath = "$env:ProgramFiles\PuTTY\plink.exe" }
    if (-not (Test-Path $plinkPath)) { throw 'Finner ikke plink.exe.' }
    $pscpPath = Join-Path (Split-Path $plinkPath) 'pscp.exe'
    if (-not (Test-Path $pscpPath)) { throw 'Finner ikke pscp.exe.' }
    $installerPath = Join-Path $PSScriptRoot 'install-task-sync-v5.py'
    if (-not (Test-Path $installerPath)) {
        $picker = New-Object System.Windows.Forms.OpenFileDialog
        $picker.Title = 'Velg install-task-sync-v5.py'
        $picker.Filter = 'Installasjon (*.py)|*.py'
        if ($picker.ShowDialog() -ne 'OK') { return }
        $installerPath = $picker.FileName
    }
    $expected = '95afbbfb15b82234284f2aca5db75b45dd5508aa7b7c0e8495e88ca7d9b62d36'
    if ((Get-FileHash -LiteralPath $installerPath -Algorithm SHA256).Hash -ne $expected) {
        throw 'Filkontroll feilet. Last ned riktig v4-fil.'
    }
    $keyPicker = New-Object System.Windows.Forms.OpenFileDialog
    $keyPicker.Title = 'Velg SSH-nokkelen til VPS-en'
    $keyPicker.Filter = 'PuTTY-nokkel (*.ppk)|*.ppk'
    if ($keyPicker.ShowDialog() -ne 'OK') { return }
    & $pscpPath -sftp -P 22 -i $keyPicker.FileName $installerPath 'root@45.132.114.61:/root/install-task-sync-v5.py'
    if ($LASTEXITCODE -ne 0) { throw 'Opplasting feilet. Installasjonen er ikke startet.' }
    $remoteCommand = "echo '$expected  /root/install-task-sync-v5.py' | sha256sum -c - && python3 /root/install-task-sync-v5.py"
    & $plinkPath -ssh -P 22 -l root -i $keyPicker.FileName 45.132.114.61 $remoteCommand
    if ($LASTEXITCODE -ne 0) { throw 'Installasjonen feilet. Send resultatet til ChatGPT.' }
    Start-Process 'http://127.0.0.1:18787/workspace#taskPanel'
}
