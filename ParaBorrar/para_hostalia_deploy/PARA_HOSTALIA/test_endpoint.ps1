$body = @{
    user_key = "test123"
    level = 5
    coins = 100
    lives = 3
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri 'https://colisan.com/sistema_apps_upload/memoflip/api/save_progress.php' -Method POST -ContentType 'application/json' -Body $body
    Write-Host "✅ EXITO - Status:" $response.StatusCode
    Write-Host "Respuesta:"
    Write-Host $response.Content
} catch {
    Write-Host "❌ ERROR:" $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Respuesta del servidor:"
        Write-Host $responseBody
    }
}

