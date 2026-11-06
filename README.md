# Kevin Weinpel — Portfolio

Plain HTML, CSS and JavaScript. No framework, no build step.

## Run it locally

Pages link to folders (`about/`, `team-app/` …), so use a local server instead of opening the files directly:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Structure

```
index.html                              Home (hero, case studies, about, work history)
just-projects/index.html                Projects list
about/index.html                        About page
american-airlines---choose-flights/     Case study
american-airlines---checkout-app/       Case study
team-app/                               Case study
css/styles.css                          All styles; design tokens at the top (:root)
js/gradient.js                          Interactive WebGL gradient on the home hero
assets/images/                          Images, logos, icons
assets/files/KevinWeinpel_Resume.docx   Resume
```

The folder names match the old Webflow URLs, so existing links keep working.

## Common edits

- **Colors, fonts, widths:** the `:root` variables at the top of `css/styles.css`.
- **Hero gradient colors / speed:** `COLORS`, `SPEED` and `POINTER_STRENGTH` at the top of `js/gradient.js`.
- **Case study accent color:** `--american-airlines`, `--checkout` and `--team-app` in `:root`.
- **Nav or footer:** they're repeated in each page's HTML; update all six `index.html` files.
- **New case study:** copy one of the case study folders, edit its content, and add a `case-card` link to `index.html` and `just-projects/index.html`.

## Deploying

Any static host works: Netlify (drag and drop the folder), GitHub Pages, Vercel, or Cloudflare Pages. Point your domain at the host once you're ready to leave Webflow.
