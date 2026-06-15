# Online Traffic Fine Payment System

A digitalized traffic fine payment platform developed for the Sri Lanka Police Department as part of the University of Ruhuna Software Architecture Group Project (2026).

## Overview

When a driver is stopped for a violation, a traffic police officer issues a fine sheet with a unique **fine reference number** and a **fine category identifier**. The driver can pay on-the-spot via the mobile app or later through the driver web portal. Once payment is confirmed, an SMS notification is sent to the officer so the driver can retrieve their license. Senior officials can monitor nationwide fine collections through the admin portal.

## Monorepo Structure

```
.
├── Backend/            # REST API — Java / Spring Boot
├── admin-web-portal/   # Admin dashboard — Next.js (TypeScript)
├── driver-web-portal/  # Driver payment portal — Next.js (TypeScript)
└── mobile-app/         # On-the-spot payment app — Android
```

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | Java, Spring Boot, Spring Security, JPA |
| Database | (TBD) |
| Admin Portal | Next.js (TypeScript) |
| Driver Portal | Next.js (TypeScript) |
| Mobile App | Android |
| Authentication | JWT |
| SMS Notification | (TBD) |

## Features

### Driver Mobile App
- Enter fine reference number and category identifier to look up a fine
- Pay traffic fines on-the-spot

### Driver Web Portal
- Pay a fine online using the reference number and category identifier
- View payment confirmation

### Admin Web Portal
- Monitor traffic fine collections nationwide
- District-wise total collection breakdown
- Breakdown by fine categories

### Backend API
- Issue and manage traffic fines
- Process payments
- Trigger SMS notifications to officers on payment confirmation
- JWT-based authentication

## Getting Started

### Backend
```bash
cd Backend
./mvnw spring-boot:run
```

### Admin Web Portal
```bash
cd admin-web-portal
npm install
npm run dev
```

### Driver Web Portal
```bash
cd driver-web-portal
npm install
npm run dev
```

### Mobile App
Open `mobile-app/` in Android Studio and run on a device or emulator.

## Contributing

All commits must be merged to the `main` branch before evaluation. Commit regularly — do not wait until the last moment.

## License

University of Ruhuna — Software Architecture Group Project 2026
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
