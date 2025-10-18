Write-Host "🚀 Subiendo PHPMailer..." -ForegroundColor Green

# Configuración
$ftpHost = "82.194.68.83"
$ftpUser = "sistema_apps_user"
$ftpPass = "GestionUploadSistemaApps!"
$remotePath = "/sistema_apps_upload/memoflip"
$localPath = "PARA_HOSTALIA\sistema_apps_upload\memoflip"

# Función para subir archivo
function Upload-File {
    param($localFile, $remoteFile)
    
    try {
        $ftp = [System.Net.FtpWebRequest]::Create("ftp://$ftpHost$remoteFile")
        $ftp.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
        $ftp.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
        $ftp.UseBinary = $true
        
        $fileContent = [System.IO.File]::ReadAllBytes($localFile)
        $ftp.ContentLength = $fileContent.Length
        
        $requestStream = $ftp.GetRequestStream()
        $requestStream.Write($fileContent, 0, $fileContent.Length)
        $requestStream.Close()
        
        $response = $ftp.GetResponse()
        Write-Host "✅ $remoteFile subido" -ForegroundColor Green
        $response.Close()
        return $true
    }
    catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Crear directorio PHPMailer
Write-Host "📁 Creando directorio..." -ForegroundColor Yellow
try {
    $ftp = [System.Net.FtpWebRequest]::Create("ftp://$ftpHost$remotePath/PHPMailer/")
    $ftp.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
    $ftp.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
    $response = $ftp.GetResponse()
    Write-Host "✅ Directorio creado" -ForegroundColor Green
    $response.Close()
}
catch {
    Write-Host "ℹ️ Directorio ya existe" -ForegroundColor Yellow
}

# Subir archivos PHPMailer
$files = @("DSNConfigurator.php", "Exception.php", "OAuth.php", "OAuthTokenProvider.php", "PHPMailer.php", "POP3.php", "SMTP.php")

foreach ($file in $files) {
    $localFile = "$localPath\PHPMailer\$file"
    $remoteFile = "$remotePath/PHPMailer/$file"
    
    if (Test-Path $localFile) {
        Upload-File $localFile $remoteFile
    } else {
        Write-Host "❌ No encontrado: $localFile" -ForegroundColor Red
    }
}

# Subir enviar_email.php
$localFile = "$localPath\enviar_email.php"
$remoteFile = "$remotePath/enviar_email.php"
if (Test-Path $localFile) {
    Upload-File $localFile $remoteFile
}

# Subir test_phpmailer.php
$localFile = "$localPath\test_phpmailer.php"
$remoteFile = "$remotePath/test_phpmailer.php"
if (Test-Path $localFile) {
    Upload-File $localFile $remoteFile
}

Write-Host "🎉 Deploy completado!" -ForegroundColor Green
Write-Host "Test: https://colisan.com/sistema_apps_upload/memoflip/test_phpmailer.php" -ForegroundColor Cyan




