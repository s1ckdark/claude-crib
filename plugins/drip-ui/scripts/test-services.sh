#!/bin/bash
#
# test-services.sh - Test connectivity to all Drip UI services
#
# Usage: test-services.sh [service]
#
# Without arguments, tests all configured services.
# With service name (v0, gemini, zai), tests only that service.
#

set -euo pipefail

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=== Drip UI Service Test ==="
echo ""

test_v0() {
    echo -n "Testing v0.dev... "
    if [ -z "${V0_API_KEY:-}" ]; then
        echo -e "${RED}❌ V0_API_KEY not set${NC}"
        echo "   Get your key from: https://v0.dev/chat/settings/keys"
        return 1
    fi

    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $V0_API_KEY" \
        "https://api.v0.dev/v1/projects" 2>/dev/null || echo "000")

    if [ "$RESPONSE" = "200" ]; then
        echo -e "${GREEN}✅ Connected${NC}"
        return 0
    elif [ "$RESPONSE" = "401" ]; then
        echo -e "${RED}❌ Unauthorized - check API key${NC}"
        return 1
    elif [ "$RESPONSE" = "403" ]; then
        echo -e "${RED}❌ Forbidden - Premium subscription required${NC}"
        return 1
    else
        echo -e "${RED}❌ Failed (HTTP $RESPONSE)${NC}"
        return 1
    fi
}

test_gemini() {
    echo -n "Testing Gemini... "

    # Try OAuth first
    if command -v gemini &>/dev/null; then
        if gemini auth status &>/dev/null 2>&1; then
            echo -e "${GREEN}✅ OAuth logged in${NC}"
            return 0
        fi
    fi

    # Fall back to API key
    if [ -z "${GOOGLE_API_KEY:-}" ]; then
        echo -e "${RED}❌ Not configured${NC}"
        echo "   Run 'gemini auth login' or set GOOGLE_API_KEY"
        echo "   Get key from: https://aistudio.google.com/apikey"
        return 1
    fi

    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
        "https://generativelanguage.googleapis.com/v1/models?key=$GOOGLE_API_KEY" 2>/dev/null || echo "000")

    if [ "$RESPONSE" = "200" ]; then
        echo -e "${GREEN}✅ API key valid${NC}"
        return 0
    elif [ "$RESPONSE" = "401" ] || [ "$RESPONSE" = "403" ]; then
        echo -e "${RED}❌ Invalid API key${NC}"
        return 1
    else
        echo -e "${RED}❌ Failed (HTTP $RESPONSE)${NC}"
        return 1
    fi
}

test_zai() {
    echo -n "Testing Z.ai... "
    if [ -z "${ZAI_API_KEY:-}" ]; then
        echo -e "${RED}❌ ZAI_API_KEY not set${NC}"
        echo "   Get your key from: https://z.ai/subscribe"
        return 1
    fi

    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $ZAI_API_KEY" \
        "https://api.z.ai/api/paas/v4/models" 2>/dev/null || echo "000")

    if [ "$RESPONSE" = "200" ]; then
        echo -e "${GREEN}✅ Connected${NC}"
        return 0
    elif [ "$RESPONSE" = "401" ]; then
        echo -e "${RED}❌ Invalid API key${NC}"
        return 1
    else
        echo -e "${RED}❌ Failed (HTTP $RESPONSE)${NC}"
        return 1
    fi
}

SERVICE="${1:-all}"
PASS=0
FAIL=0

case "$SERVICE" in
    all)
        test_v0 && ((PASS++)) || ((FAIL++))
        test_gemini && ((PASS++)) || ((FAIL++))
        test_zai && ((PASS++)) || ((FAIL++))
        echo ""
        echo "Summary: $PASS passed, $FAIL failed"
        ;;
    v0)
        test_v0
        ;;
    gemini)
        test_gemini
        ;;
    zai)
        test_zai
        ;;
    *)
        echo "Unknown service: $SERVICE"
        echo "Available: v0, gemini, zai, all"
        exit 1
        ;;
esac
