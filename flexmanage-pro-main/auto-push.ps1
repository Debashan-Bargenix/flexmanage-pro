# Auto-push workflow for Smart-Workout-Center_v1

This script will automatically commit and push all changes to the new GitHub repository every time you save a file in your project directory.

## Instructions
- Place this script in your project root.
- Run it in the background while working.
- It will watch for file changes and push updates to the repo automatically.

---

# Windows PowerShell Script: auto-push.ps1

$repoPath = "$(Get-Location)"
$branch = "main"

Write-Host "Auto-push script started. Monitoring $repoPath for changes..."

while ($true) {
    $changes = git status --porcelain
    if ($changes) {
        git add .
        $msg = "Auto-commit: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        git commit -m $msg
        git push origin $branch
        Write-Host "Changes pushed at $(Get-Date)"
    }
    Start-Sleep -Seconds 10
}
