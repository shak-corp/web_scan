# WEB_SCAN – Enterprise Security Scan & Crawler Suite
**Ready for Render deployment. Production-secure, modular, scalable, with PostgreSQL, job queue, analytics, live logs, RBAC, consent and audit logs, Steam-inspired UI.**

## Features

- Multi-engine scan: Nmap via Docker, extensible for OpenVAS, AngryIP, Shodan
- Advanced crawler: Respects robots.txt, quotas, concurrency
- Team compliance (T&C consent, audit logs, user association)
- Realtime logs, analytics, streaming job status
- Secure, modular, Docker/Postgres, Extensible
- Animated dark theme UI (Next.js, Tailwind, Framer Motion)
- Easy Render (via `.render.yaml`) or local dev (via Docker Compose)

## Deploy

1. Provision `webscan-db` PostgreSQL on Render
2. Add backend/ frontend services from `.render.yaml`
3. Set `DATABASE_URL`, `NEXT_PUBLIC_API_ENDPOINT`
4. Run migrations: `npx prisma migrate dev`
5. All users must consent to T&C before usage

**Use for ETHICAL, AUTHORIZED security testing only. All actions logged.**
