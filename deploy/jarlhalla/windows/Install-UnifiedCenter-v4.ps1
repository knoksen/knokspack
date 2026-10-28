& {
    $ErrorActionPreference = 'Stop'
    Add-Type -AssemblyName System.Windows.Forms
    $plinkPath = (Get-Command plink.exe -ErrorAction SilentlyContinue).Source
    if (-not $plinkPath) { $plinkPath = "$env:ProgramFiles\PuTTY\plink.exe" }
    if (-not (Test-Path $plinkPath)) { throw 'Finner ikke plink.exe.' }
    $pscpPath = Join-Path (Split-Path $plinkPath) 'pscp.exe'
    if (-not (Test-Path $pscpPath)) { throw 'Finner ikke pscp.exe.' }
    $installerPath = Join-Path $PSScriptRoot 'install-unified-center-v4.sh'
    if (-not (Test-Path $installerPath)) {
        $picker = New-Object System.Windows.Forms.OpenFileDialog
        $picker.Title = 'Velg install-unified-center-v4.sh'
        $picker.Filter = 'Installasjon (*.sh)|*.sh'
        if ($picker.ShowDialog() -ne 'OK') { return }
        $installerPath = $picker.FileName
    }
    $expected = 'a5354121a9c11cbd9154ad5ae079a30f020c6acd3df081e07d4975e4f826f36c'
    if ((Get-FileHash -LiteralPath $installerPath -Algorithm SHA256).Hash -ne $expected) {
        throw 'Filkontroll feilet. Last ned riktig v4-fil.'
    }
    $keyPicker = New-Object System.Windows.Forms.OpenFileDialog
    $keyPicker.Title = 'Velg SSH-nokkelen til VPS-en'
    $keyPicker.Filter = 'PuTTY-nokkel (*.ppk)|*.ppk'
    if ($keyPicker.ShowDialog() -ne 'OK') { return }
    & $pscpPath -sftp -P 22 -i $keyPicker.FileName $installerPath 'root@45.132.114.61:/root/install-unified-center-v4.sh'
    if ($LASTEXITCODE -ne 0) { throw 'Opplasting feilet. Installasjonen er ikke startet.' }
    $remoteCommand = "echo '$expected  /root/install-unified-center-v4.sh' | sha256sum -c - && bash /root/install-unified-center-v4.sh"
    & $plinkPath -ssh -P 22 -l root -i $keyPicker.FileName 45.132.114.61 $remoteCommand
    if ($LASTEXITCODE -ne 0) { throw 'Installasjonen feilet. Send resultatet til ChatGPT.' }
    Start-Process 'http://127.0.0.1:18787/workspace#command'
}
