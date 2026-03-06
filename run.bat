@echo off
cd /d %~dp0
echo [샤이닝 프린세스] 로컬 서버를 시작합니다...
echo 브라우저에서 아래 주소를 여세요:
echo http://localhost:8080
echo 종료하려면 이 창에서 Ctrl + C
python -m http.server 8080
pause
