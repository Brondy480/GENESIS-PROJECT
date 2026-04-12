# Genesis Backend

## Stack
Node.js + Express + MongoDB + JWT

## Base URL
http://localhost:8080/api/v1

## Key Routes
- POST /Auth/registration
- POST /Auth/login
- POST /Auth/logout (protect middleware)
- GET/PATCH /admin/verification/:id
- PATCH /admin/verification/approuve/:id
- PATCH /admin/verification/reject/:id
- PUT /admin/users/suspend/:id
- GET /admin/Projects/GetPendingProject
- PATCH /admin/Projects/approuve/:id
- GET /AdminInvestmentRequest/investment-requests
- PUT /AdminInvestmentRequest/investments/:id/approuve
- GET /admin/escrows
- PATCH /admin/escrows/:id/validate
- PATCH /admin/escrows/:id/release
- POST /negotiation/:id/counter
- GET /negotiation/:id/messages
- PATCH /creator/investments/accept/:id
- POST /payment/deal/:id/pay
- GET /agreements/:id/download
- POST /agreements/:id/creator-sign
- POST /agreements/:id/investor-sign

## Architecture
Layered: routes → controllers → services → models → MongoDB
Domain separation: Auth, Projects, Investments, Escrow, Notifications, Wallet