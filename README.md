# Zynema — Movie & TV Discovery App

A React portfolio app to **discover movies and TV series**, **search** with debounce, **filter & sort** via TMDB, **sign in with Appwrite**, and save titles to a **personal watchlist**.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwindcss)

## Screenshots

### Home Page — Search & Discover

![Home Page](docs/screenshots/home.png)

### Home Page — Trending & Filters

![Home Page with Trending](docs/screenshots/home2.PNG)

### Movie Details Page

![Movie Details](docs/screenshots/details.PNG)

### Watchlist Page

![Watchlist](docs/screenshots/watchlist.PNG)

### Alternative Home View

![Home Alternative](docs/screenshots/home3.PNG)

## Features

- Browse **movies** and **TV series** (discover + search)
- **Sort** by popularity, rating, release / first-air date
- **Genre** and **year** filters (media-specific genre lists from TMDB)
- **Trending searches** stored in Appwrite
- **Auth** — email/password sign-up & login (Appwrite)
- **Watchlist** — add/remove titles; filter & sort saved items
- **Code-split routes** — lazy-loaded pages for a smaller initial bundle

## Tech stack

| Layer   | Choice                         |
| ------- | ------------------------------ |
| UI      | React 19, React Router 7       |
| Build   | Vite 7                         |
| Styling | Tailwind CSS v4                |
| Data    | TMDB API, Appwrite (auth + DB) |
| HTTP    | Axios                          |

## Project structure

```
movie-app/
├── src/
│   ├── index.css              # Global styles + Tailwind theme
│   ├── index.components.css   # Auth, filters, pagination, watchlist
│   ├── pages/HomePage.jsx
│   ├── components/
│   ├── context/
│   ├── services/
│   └── appwrite.js
├── docs/screenshots/
└── .env.example
```

## Environment variables

Copy `.env.example` to `.env` (or `.env.local`):

| Variable            | Description                                          |
| ------------------- | ---------------------------------------------------- |
| `VITE_TMDB_API_KEY` | TMDB v4 read access token                            |
| `VITE_APPWRITE_*`   | Appwrite endpoint, project, database, collection IDs |

> For a portfolio/demo, the TMDB key is used from the client via Vite env vars. Do not commit `.env` to git.

## Scripts

| Command           | Description                |
| ----------------- | -------------------------- |
| `npm run dev`     | Start Vite dev server      |
| `npm run build`   | Production build → `dist/` |
| `npm run preview` | Preview production build   |

### Development

```bash
npm install
cp .env.example .env
# Add VITE_TMDB_API_KEY and Appwrite IDs

npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Appwrite setup (summary)

See collections in previous docs: **trending searches** + **watchlist**, with permissions so users only access their own watchlist rows.

## License

Private portfolio project.
