@echo off
echo === AMSAN BTP - Deploiement Vercel ===
cd /d C:\amsan-btp

echo Ce script va ouvrir le navigateur pour connecter votre compte Vercel.
echo Ensuite, il deploiera l'application.
echo.

vercel login
if %errorlevel% neq 0 ( echo ERREUR login Vercel & pause & exit /b 1 )

echo.
echo Deploiement en cours...
vercel --yes
echo.
echo === Deploiement termine ===
echo Votre URL est affichee ci-dessus.
pause
