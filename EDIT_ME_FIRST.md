# Portfolio v6 — deployment notes

This build is already wired with the eight screenshots you sent. The finished projects use two product states each; FlowLab and Betabot use one current-build state each.

## Project links

`project-links.js` already contains the preview URLs and the public GitHub URLs for NexTrade, QuickShop and Obsidian.

FlowLab and Betabot intentionally have an empty `github` value for now, so the portfolio does not invent a source link. Add those later only if you want them public.

There is deliberately **no global GitHub profile link**. Each project owns its own source URL.

## Contact form

The Formspree endpoint is already wired:

`https://formspree.io/f/mdajvrbw`

The selected intent changes the email subject automatically:

- Hiring → `I'm hiring — Portfolio enquiry`
- Project → `I have a project — Portfolio enquiry`
- Other → `Portfolio enquiry — Other`

The sender email is submitted as `_replyto`.

## Included media

- `nextrade-home.webp`
- `nextrade-market.webp`
- `quickshop-offline.webp`
- `quickshop-storefront.webp`
- `obsidian-key.webp`
- `obsidian-unlock.webp`
- `flowlab-workspace.webp`
- `betabot-signal.webp`
- `moses.jpg`

Do not rename these without updating `index.html`.

## Deploy

Replace the contents of the existing `Moyinks/Portfolio` repository with the complete contents of this folder and keep the same Vercel project/domain.
