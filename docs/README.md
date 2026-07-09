# Documentation Site

This folder contains the [Docusaurus](https://docusaurus.io/) documentation site for **Request Mocking Protocol**, published to GitHub Pages at [vitalets.github.io/request-mocking-protocol](https://vitalets.github.io/request-mocking-protocol/).

## Local Development

```sh
cd docs
npm install
npm start
```

This starts a local dev server and opens a browser window. Most changes are reflected live without restarting the server.

## Build

```sh
npm run build
```

Generates static content into the `build` directory. The build fails on broken internal links.

To preview the production build locally:

```sh
npm run serve
```

## Deployment

The site is released separately from package releases via the
[`deploy-docs`](../.github/workflows/deploy-docs.yml) GitHub Actions workflow.
Push the docs source to the `docs` branch to publish it:

```sh
git push origin HEAD:docs
```

The workflow builds this Docusaurus site and deploys the generated output to
GitHub Pages. GitHub Pages should be configured to use **GitHub Actions** as its
source.
