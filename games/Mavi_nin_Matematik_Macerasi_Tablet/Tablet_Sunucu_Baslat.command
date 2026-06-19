#!/usr/bin/env bash
cd "$(dirname "$0")"
PORT=8082

echo "=========================================="
echo "  Mavi'nin Matematik Macerasi -- Tablet"
echo "=========================================="
echo ""
echo "  Sunucu portu: $PORT"
echo ""
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "192.168.x.x")
echo "  Android tabletinizde Chrome'u acin ve su adresi yazin:"
echo ""
echo "  http://$LOCAL_IP:$PORT"
echo ""
echo "  (Bu Mac'te de http://127.0.0.1:$PORT adresinden oynayabilirsiniz)"
echo ""
echo "  Durdurmak icin bu pencereyi kapatin."
echo "=========================================="
echo ""
python3 -m http.server $PORT --bind 0.0.0.0
