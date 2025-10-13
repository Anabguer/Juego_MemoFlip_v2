@echo off
echo Añadiendo cache-buster al HTML...
for /f %%i in ('powershell -Command "[DateTimeOffset]::UtcNow.ToUnixTimeSeconds()"') do set TIMESTAMP=%%i
powershell -Command "$html = Get-Content 'PARA_HOSTALIA\sistema_apps_upload\memoflip_static\index.html' -Raw; $html = $html -replace '(index-[a-f0-9]+\.js)', ('$1?v=%TIMESTAMP%'); $html | Set-Content 'PARA_HOSTALIA\sistema_apps_upload\memoflip_static\index.html'"
echo Cache-buster añadido: v=%TIMESTAMP%


