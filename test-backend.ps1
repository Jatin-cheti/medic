# Railway Backend Testing Script
# Replace YOUR_URL with your actual Railway backend URL

$BACKEND_URL = "https://YOUR_URL.railway.app"  # ← UPDATE THIS!

Write-Host "🧪 Testing Railway Backend: $BACKEND_URL" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BACKEND_URL/" -Method GET
    Write-Host "✅ Health Check Passed" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Health Check Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: Patient Signup
Write-Host "Test 2: Patient Signup" -ForegroundColor Yellow
$testEmail = "test$(Get-Random)@example.com"
$signupBody = @{
    email = $testEmail
    password = "Test123!"
    firstName = "John"
    lastName = "Doe"
    phone = "1234567890"
    gender = "Male"
    preferredLanguage = "en"
} | ConvertTo-Json

try {
    $signupResponse = Invoke-RestMethod -Uri "$BACKEND_URL/api/auth/patient/signup" `
        -Method POST `
        -ContentType "application/json" `
        -Body $signupBody
    
    Write-Host "✅ Patient Signup Passed" -ForegroundColor Green
    Write-Host "   UUID: $($signupResponse.user.uuid)" -ForegroundColor Gray
    Write-Host "   Email: $($signupResponse.user.email)" -ForegroundColor Gray
    Write-Host "   Token: $($signupResponse.token.Substring(0, 20))..." -ForegroundColor Gray
    
    # Save token for next tests
    $global:authToken = $signupResponse.token
    $global:testEmail = $testEmail
} catch {
    Write-Host "❌ Patient Signup Failed: $_" -ForegroundColor Red
    Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Gray
}
Write-Host ""

# Test 3: Patient Login
Write-Host "Test 3: Patient Login" -ForegroundColor Yellow
$loginBody = @{
    email = $testEmail
    password = "Test123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BACKEND_URL/api/auth/patient/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody
    
    Write-Host "✅ Patient Login Passed" -ForegroundColor Green
    Write-Host "   UUID: $($loginResponse.user.uuid)" -ForegroundColor Gray
    
    # Update token
    $global:authToken = $loginResponse.token
} catch {
    Write-Host "❌ Patient Login Failed: $_" -ForegroundColor Red
    Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Gray
}
Write-Host ""

# Test 4: Dashboard (Protected Route)
Write-Host "Test 4: Dashboard (Protected Route)" -ForegroundColor Yellow
if ($global:authToken) {
    try {
        $headers = @{
            "Authorization" = "Bearer $($global:authToken)"
        }
        $dashboardResponse = Invoke-RestMethod -Uri "$BACKEND_URL/api/dashboard" `
            -Method GET `
            -Headers $headers
        
        Write-Host "✅ Dashboard Access Passed" -ForegroundColor Green
        Write-Host "   Total Doctors: $($dashboardResponse.totalDoctors)" -ForegroundColor Gray
        Write-Host "   Total Specialties: $($dashboardResponse.totalSpecialties)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Dashboard Access Failed: $_" -ForegroundColor Red
        Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Gray
    }
} else {
    Write-Host "⚠️  Skipped (no auth token from previous tests)" -ForegroundColor Yellow
}
Write-Host ""

# Test 5: Get Specialties (Public Route)
Write-Host "Test 5: Get Specialties (Public Route)" -ForegroundColor Yellow
try {
    $specialties = Invoke-RestMethod -Uri "$BACKEND_URL/api/specialties" -Method GET
    Write-Host "✅ Get Specialties Passed" -ForegroundColor Green
    Write-Host "   Found $($specialties.Count) specialties:" -ForegroundColor Gray
    foreach ($spec in $specialties | Select-Object -First 3) {
        Write-Host "   - $($spec.name)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Get Specialties Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 6: Google OAuth Endpoint
Write-Host "Test 6: Google OAuth Redirect" -ForegroundColor Yellow
Write-Host "   URL: $BACKEND_URL/api/auth/google" -ForegroundColor Gray
Write-Host "   ℹ️  Open this in a browser to test Google OAuth flow" -ForegroundColor Cyan
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🎯 Testing Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend URL: $BACKEND_URL" -ForegroundColor White
Write-Host "Test Email: $testEmail" -ForegroundColor White
if ($global:authToken) {
    Write-Host "Auth Token: $($global:authToken.Substring(0, 30))..." -ForegroundColor White
}
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. ✅ Backend is working on Railway" -ForegroundColor Green
Write-Host "2. 🔜 Deploy frontend to Vercel/Railway" -ForegroundColor White
Write-Host "3. 🔜 Update frontend environment with backend URL" -ForegroundColor White
Write-Host "4. 🔜 Test end-to-end flow" -ForegroundColor White
