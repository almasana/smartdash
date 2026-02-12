

https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=6232687150071082&redirect_uri=https://mismrtdash.vercel.app/auth/callback


curl -X POST https://api.mercadolibre.com/oauth/token \
-H "accept: application/json" \
-H "content-type: application/x-www-form-urlencoded" \
-d "grant_type=client_credentials&client_id=6232687150071082&client_secret=PDxgHORqULLpviNMrxOreOS9fuAhVlKY

curl -Method POST https://api.mercadolibre.com/oauth/token -Headers @{"accept"="application/json";"content-type"="application/x-www-form-urlencoded"} -Body "grant_type=client_credentials&client_id=6232687150071082&client_secret=PDxgHORqULLpviNMrxOreOS9fuAhVlKY"

curl -Method POST https://api.mercadolibre.com/oauth/token -Headers @{"accept"="application/json";"content-type"="application/x-www-form-urlencoded"} -Body "grant_type=client_credentials&client_id=6232687150071082&client_secret=PDxgHORqULLpviNMrxOreOS9fuAhVlKY"


