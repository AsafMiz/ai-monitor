# WhatsApp Integration (Unipile)

## Overview
WhatsApp integration via Unipile API for QR-code based authentication.

## Key Features (Phase 3)
- QR code generation for account linking
- Inbound webhook processing
- Multi-agent message routing
- Zero per-message fees (uses user's existing WhatsApp account)

## API Reference
- Provider: [Unipile](https://unipile.com)
- Auth: QR code scan (mimics WhatsApp Web)
- Webhooks: POST to `/api/webhooks/whatsapp`
