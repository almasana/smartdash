param (
    [string]$BaseUrl = $env:BASE_URL
)

if ([string]::IsNullOrEmpty($BaseUrl)) {
    $BaseUrl = "https://mismartdash.vercel.app"
}

Write-Host "Running Smoke Tests against: $BaseUrl" -ForegroundColor Cyan

# 1. Health Check
Write-Host "----------------------------------------"
Write-Host "Check 1: GET /api/mcp/mercadolibre/health"

try {
    $healthRes = Invoke-RestMethod -Uri "$BaseUrl/api/mcp/mercadolibre/health" -Method Get
    $healthJson = $healthRes | ConvertTo-Json -Depth 5
    Write-Host "Response: $healthJson" -ForegroundColor Gray

    # PowerShell automatically parses JSON response into object
    # $healthRes is the object

    if ($healthRes.checks.supabase.init -eq $true) { Write-Host "✅ Supabase Init: OK" -ForegroundColor Green } else { Write-Host "❌ Supabase Init: FAILED" -ForegroundColor Red; exit 1 }
    if ($healthRes.checks.supabase.select -eq $true) { Write-Host "✅ Supabase Select: OK" -ForegroundColor Green } else { Write-Host "❌ Supabase Select: FAILED" -ForegroundColor Red; exit 1 }
    if ($healthRes.checks.token -eq "present") { Write-Host "✅ Token Present: OK" -ForegroundColor Green } else { Write-Host "❌ Token Present: FAILED" -ForegroundColor Red; exit 1 }
    
    # Optional Refresh Token check
    if ($healthRes.checks.hasRefreshToken -eq $true) { 
        Write-Host "✅ Refresh Token: OK" -ForegroundColor Green 
    } else {
        Write-Host "⚠️ Refresh Token: MISSING (Warning only for now)" -ForegroundColor Yellow
        # Not exiting 1 yet to avoid blocking deployment based on runtime state
    }

} catch {
    Write-Host "❌ Health Check Request Failed: $_" -ForegroundColor Red
    exit 1
}

# 2. SSE Headers Check
Write-Host "----------------------------------------"
Write-Host "Check 2: SSE Headers on /api/mcp/mercadolibre"

try {
    # We use Invoke-WebRequest to inspect headers
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/mcp/mercadolibre" -Method Post `
        -Headers @{ "Content-Type" = "application/json"; "Accept" = "application/json, text/event-stream" } `
        -Body '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}'

    $statusCode = $response.StatusCode
    $contentType = $response.Headers["Content-Type"]
    
    # Check Content-Encoding (might be absent)
    if ($response.Headers["Content-Encoding"]) {
        $contentEncoding = $response.Headers["Content-Encoding"]
    } else {
        $contentEncoding = $null
    }

    Write-Host "HTTP Status: $statusCode"
    Write-Host "Content-Type: $contentType"
    Write-Host "Content-Encoding: $contentEncoding"
    
    if ($statusCode -eq 200) { 
        Write-Host "✅ Status 200: OK" -ForegroundColor Green 
    } else { 
        Write-Host "❌ Status ${statusCode}: FAILED" -ForegroundColor Red; exit 1 
    }
    
    if ($contentType -like "*text/event-stream*") { 
        Write-Host "✅ Content-Type text/event-stream: OK" -ForegroundColor Green 
    } else { 
        Write-Host "❌ Content-Type ${contentType}: FAILED (Expected text/event-stream)" -ForegroundColor Red; exit 1 
    }
    
    if ([string]::IsNullOrEmpty($contentEncoding) -or $contentEncoding -notlike "*br*") {
        Write-Host "✅ No Content-Encoding (br) detected: OK" -ForegroundColor Green
    } else {
        Write-Host "❌ Content-Encoding: br DETECTED: ${contentEncoding} (Should be stripped)" -ForegroundColor Red
        exit 1
    }

} catch {
    # If request fails (e.g. 500 error), catch block runs
    Write-Host "❌ SSE Check Request Failed: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $status = $_.Exception.Response.StatusCode
        Write-Host "Status Code: $status" -ForegroundColor Red
    }
    exit 1
}

Write-Host "----------------------------------------"
Write-Host "✅ SMOKE TESTS PASSED" -ForegroundColor Green
exit 0
