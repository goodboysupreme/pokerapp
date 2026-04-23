Website summary

Purpose
- Brief overview of the website's sections, features, and operational components for easy reference and editing.

Public-facing pages
- Home: value proposition, hero, CTAs
- About: mission, team, story
- Features/Products: key offerings, comparisons, screenshots
- Pricing: plans, billing FAQs
- Blog/Resources: articles, guides, SEO content
- Contact/Support: form, chat, phone, locations

User flows & auth
- Sign up / Sign in (email, OAuth providers)
- Password reset, email verification
- Onboarding / first-run experience

Authenticated experience
- User dashboard: personalized data, settings
- Account management: profile, billing, subscriptions
- Notifications: in-app and email preferences

Admin & management
- Admin dashboard: user management, content moderation
- Content editor: create/edit pages, posts
- Role & permission system

APIs & integrations
- Public REST/GraphQL endpoints
- Third-party integrations: payment gateway, analytics, email service, OAuth providers
- Webhooks for external events

Data & models
- Core entities: User, Product, Order, Session, Post, Comment
- Relationships, key attributes, and retention policies

Frontend architecture
- Framework: (React/Next.js recommended)
- Component library & design system (tokens, components)
- Routing, client-side state, form handling

Backend architecture
- Framework/service (e.g., FastAPI, Node/Express)
- Auth, session management, background jobs, caching
- Database (Postgres/other), migrations, ORM

Assets & design
- Brand assets: logo, colors, typography
- Media: images, SVGs, icons, optimized formats
- Accessibility considerations (WCAG basics)

Performance & security
- Caching, CDNs, asset optimization
- Rate limiting, input validation, XSS/CSRF protections
- Secret storage, secure config, HTTPS enforcement

Analytics & monitoring
- Page analytics (GA/alternate), events tracking
- Error reporting, logs, uptime monitoring

Testing & quality
- Unit, integration, E2E tests
- Linting, type checking, pre-commit hooks

CI/CD & deployment
- Build pipelines, tests on PRs, staging and prod environments
- Deployment targets (VPS, cloud provider, containers)
- Rollbacks and migration strategy

Operational notes
- Backups and disaster recovery
- Maintenance windows, incident response plan

Next steps / customisation
- Update sections above to reflect this specific website: tech stack, core models, and third-party services.
- Add links to repos, infra manifests, and API docs.

(End of summary)