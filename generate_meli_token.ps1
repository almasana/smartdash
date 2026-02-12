param(
  [string]$ClientId,
  [string]$ClientSecret
)

$response = Invoke-RestMethod `
  -Method POST `
  -Uri "https://api.mercadolibre.com/oauth/token" `
  -ContentType "application/x-www-form-urlencoded" `
  -Body "grant_type=client_credentials&client_id=$ClientId&client_secret=$ClientSecret"

if ($response.access_token) {
  Write-Output $response.access_token
} else {
  Write-Error "No se pudo generar el token"
}
