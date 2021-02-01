@echo off
set tool=%~dp0/psdex.exe
set prefabpath=%1


cd /d %prefabpath%
call %tool% -c %2
