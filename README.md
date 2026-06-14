# CareConnect Web

**CareConnect Web** is the central administrative frontend for the CareConnect ecosystem. Built with Next.js and React, it provides an intuitive, high-performance dashboard for hospital administrators to manage their system, oversee doctor and patient records, and configure their white-label branding (which automatically cascades to the mobile apps). It also handles public-facing assets like patient registration and static landing pages.

**Tech Stack**: Next.js 16 (App Router), React 19, Framer Motion for micro-animations, Spline for 3D web elements, and LiveKit Web for desktop-based telehealth interactions.

## Quick Start & Development

To run the Next.js development server:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Copy the example environment file to connect the web app to your local backend API.
   ```bash
   cp .env.example .env.local
   ```

3. **Run the local development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm run start
   ```
