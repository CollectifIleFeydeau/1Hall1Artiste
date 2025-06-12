Get-ChildItem -Path 'netlify/functions' -Filter '*.cjs' | Select-Object Name,Length | Format-Table -AutoSize
