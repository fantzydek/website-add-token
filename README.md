# Token Manager — Neobrutalism

Website untuk menambah & mengelola Telegram Bot Token.  
Data disimpan di GitHub, website di-deploy ke **Vercel** (tanpa VPS).

## Fitur

### 👤 User
- Login
- Tambah token bot Telegram
- Melihat **hanya token milik sendiri** (masked)

### 🛡️ Admin
- Login dengan kredensial dari Environment Variable
- Melihat **semua token** (full)
- Menghapus token
- Membuat & menghapus akun User
- Dashboard terpisah

## Struktur Data di GitHub

### `tokenv2.json` (otomatis migrasi dari format lama)
```json
{
  "tokens": [
    {
      "id": "uuid",
      "token": "123456:AAH...",
      "owner": "username",
      "createdAt": "2026-08-25T..."
    }
  ]
}
```

### `users.json` (dibuat otomatis)
```json
{
  "users": [
    {
      "username": "user1",
      "passwordHash": "...",
      "role": "user",
      "createdAt": "..."
    }
  ]
}
```

## Setup Lokal

```bash
npm install
cp .env.example .env.local
# isi semua value di .env.local
npm run dev
```

Buka http://localhost:3000

## Deploy ke Vercel

1. Push repo ini ke GitHub
2. Vercel → New Project → Import repo
3. Tambahkan **Environment Variables**:

| Key | Contoh |
|-----|--------|
| `GITHUB_TOKEN` | `ghp_xxxx` (scope: **repo**) |
| `GITHUB_OWNER` | `fantzydek` |
| `GITHUB_REPO` | `database2` |
| `GITHUB_FILE_PATH` | `tokenv2.json` |
| `GITHUB_USERS_PATH` | `users.json` |
| `GITHUB_BRANCH` | `main` |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | password kuat |
| `SESSION_SECRET` | random 32+ karakter |

4. Deploy!

## Cara dapat GitHub Token

1. GitHub → Settings → Developer settings → Personal access tokens → **Tokens (classic)**
2. Generate new token → centang **`repo`**
3. Copy → masukkan ke Vercel Environment Variables

## Catatan Keamanan

- Jangan commit file `.env` / `.env.local`
- Gunakan password admin yang kuat
- Token bot tetap tersimpan di repo public — pertimbangkan private repo jika sensitif
- Password user di-hash dengan bcrypt

## Tech Stack

- Next.js 14 (App Router)
- Tailwind CSS + Neobrutalism design
- jose (JWT session)
- bcryptjs
- GitHub Contents API
