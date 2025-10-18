# Deploy PHPMailer - MemoFlip
Write-Host "🚀 Subiendo PHPMailer a Hostalia..." -ForegroundColor Green

# Configuración FTP
$ftpHost = "82.194.68.83"
$ftpUser = "sistema_apps_user"
$ftpPass = "GestionUploadSistemaApps!"
$remotePath = "/sistema_apps_upload/memoflip"
$localPath = "PARA_HOSTALIA\sistema_apps_upload\memoflip"

# Archivos PHPMailer
$phpmailerFiles = @(
    "DSNConfigurator.php",
    "Exception.php", 
    "OAuth.php",
    "OAuthTokenProvider.php",
    "PHPMailer.php",
    "POP3.php",
    "SMTP.php"
)

# Función para subir archivo via FTP
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
        Write-Host "✅ $remoteFile subido correctamente" -ForegroundColor Green
        $response.Close()
        return $true
    }
    catch {
        Write-Host "❌ Error subiendo $remoteFile : $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Crear directorio PHPMailer
Write-Host "📁 Creando directorio PHPMailer..." -ForegroundColor Yellow
try {
    $ftp = [System.Net.FtpWebRequest]::Create("ftp://$ftpHost$remotePath/PHPMailer/")
    $ftp.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
    $ftp.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
    $response = $ftp.GetResponse()
    Write-Host "✅ Directorio PHPMailer creado" -ForegroundColor Green
    $response.Close()
}
catch {
    Write-Host "ℹ️ Directorio PHPMailer ya existe o error: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Subir archivos PHPMailer
Write-Host "📤 Subiendo archivos PHPMailer..." -ForegroundColor Yellow
foreach ($file in $phpmailerFiles) {
    $localFile = "$localPath\PHPMailer\$file"
    $remoteFile = "$remotePath/PHPMailer/$file"
    
    if (Test-Path $localFile) {
        Upload-File $localFile $remoteFile
    } else {
        Write-Host "❌ Archivo no encontrado: $localFile" -ForegroundColor Red
    }
}

# Subir enviar_email.php
Write-Host "📤 Subiendo enviar_email.php..." -ForegroundColor Yellow
$localFile = "$localPath\enviar_email.php"
$remoteFile = "$remotePath/enviar_email.php"
if (Test-Path $localFile) {
    Upload-File $localFile $remoteFile
}

# Subir test_phpmailer.php
Write-Host "📤 Subiendo test_phpmailer.php..." -ForegroundColor Yellow
$localFile = "$localPath\test_phpmailer.php"
$remoteFile = "$remotePath/test_phpmailer.php"
if (Test-Path $localFile) {
    Upload-File $localFile $remoteFile
}

Write-Host "🎉 Deploy completado!" -ForegroundColor Green
Write-Host "🧪 Test: https://colisan.com/sistema_apps_upload/memoflip/test_phpmailer.php" -ForegroundColor Cyan




