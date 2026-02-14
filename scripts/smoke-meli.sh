#!/bin/bash
# scripts/smoke-meli.sh

# Default verified URL or passed as argument
URL=${BASE_URL:-"https://mismartdash.vercel.app"}

echo "Running Smoke Tests against: $URL"

# 1. Health Check
echo "----------------------------------------"
echo "Check 1: GET /api/mcp/mercadolibre/health"

HEALTH_JSON=$(curl -s "$URL/api/mcp/mercadolibre/health")
echo "Response: $HEALTH_JSON"

# Check Supabase Init
if echo "$HEALTH_JSON" | grep -q '"init":true'; then
  echo "✅ Supabase Init: OK"
else
  echo "❌ Supabase Init: FAILED"
  exit 1
fi

# Check Supabase Select
if echo "$HEALTH_JSON" | grep -q '"select":true'; then
  echo "✅ Supabase Select: OK"
else
  echo "❌ Supabase Select: FAILED"
  exit 1
fi

# Check Token Present
if echo "$HEALTH_JSON" | grep -q '"token":"present"'; then
  echo "✅ Token Present: OK"
else
  echo "❌ Token Present: FAILED"
  exit 1
fi

# Check Refresh Token
if echo "$HEALTH_JSON" | grep -q '"hasRefreshToken":true'; then
  echo "✅ Refresh Token: OK"
else
  echo "⚠️ Refresh Token: MISSING (Warning only for now)"
  # exit 1  <-- Uncomment to enforce strict check
fi

# 2. SSE Headers Check
echo "----------------------------------------"
echo "Check 2: SSE Headers on /api/mcp/mercadolibre"

HEADERS_FILE=$(mktemp)
BODY_FILE=$(mktemp)

# Note: We must send a valid body to get a 200 OK SSE response from the proxy
curl -s -D "$HEADERS_FILE" -o "$BODY_FILE" -X POST "$URL/api/mcp/mercadolibre" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}'

HTTP_STATUS=$(cat "$HEADERS_FILE" | grep "HTTP/" | head -n 1 | awk '{print $2}')
CONTENT_TYPE=$(cat "$HEADERS_FILE" | grep -i "content-type:" | awk '{print $2}' | tr -d '\r')
CONTENT_ENCODING=$(cat "$HEADERS_FILE" | grep -i "content-encoding:")

echo "HTTP Status: $HTTP_STATUS"
echo "Content-Type: $CONTENT_TYPE"

if [ "$HTTP_STATUS" == "200" ]; then
    echo "✅ Status 200: OK"
else
    echo "❌ Status $HTTP_STATUS: FAILED"
    cat "$BODY_FILE"
    rm "$HEADERS_FILE" "$BODY_FILE"
    exit 1
fi

if [[ "$CONTENT_TYPE" == *"text/event-stream"* ]]; then
    echo "✅ Content-Type text/event-stream: OK"
else
    echo "❌ Content-Type $CONTENT_TYPE: FAILED (Expected text/event-stream)"
    rm "$HEADERS_FILE" "$BODY_FILE"
    exit 1
fi

if [[ -z "$CONTENT_ENCODING" ]]; then
    echo "✅ No Content-Encoding (br) detected: OK"
else
    if [[ "$CONTENT_ENCODING" == *"br"* ]]; then
       echo "❌ Content-Encoding: br DETECTED (Should be stripped)"
       rm "$HEADERS_FILE" "$BODY_FILE"
       exit 1
    else
       echo "✅ Content-Encoding safe: $CONTENT_ENCODING"
    fi
fi

rm "$HEADERS_FILE" "$BODY_FILE"
echo "----------------------------------------"
echo "✅ SMOKE TESTS PASSED"
exit 0
