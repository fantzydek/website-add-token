const owner = process.env.GITHUB_OWNER!;
const repo = process.env.GITHUB_REPO!;
const tokenPath = process.env.GITHUB_FILE_PATH || "tokenv2.json";
const usersPath = process.env.GITHUB_USERS_PATH || "users.json";
const branch = process.env.GITHUB_BRANCH || "main";
const githubToken = process.env.GITHUB_TOKEN!;

export type TokenEntry = {
  id: string;
  token: string;
  owner: string;
  createdAt: string;
};

export type TokensFile = {
  tokens: TokenEntry[];
};

export type UserEntry = {
  username: string;
  passwordHash: string;
  role: "user";
  createdAt: string;
};

export type UsersFile = {
  users: UserEntry[];
};

async function githubFetch(url: string, options: RequestInit = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...options.headers,
    },
    cache: "no-store",
  });
  return res;
}

async function getFile(path: string) {
  const res = await githubFetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`
  );

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Gagal mengambil file ${path} dari GitHub`);
  }

  const data = await res.json();
  const content = Buffer.from(data.content, "base64").toString("utf-8");
  return {
    sha: data.sha as string,
    content: JSON.parse(content),
  };
}

async function putFile(path: string, content: object, sha: string | null, message: string) {
  const body: Record<string, string> = {
    message,
    content: Buffer.from(JSON.stringify(content, null, 2)).toString("base64"),
    branch,
  };
  if (sha) body.sha = sha;

  const res = await githubFetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: "PUT",
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Gagal update file ${path}`);
  }

  return res.json();
}

// ===== TOKENS =====

export async function getTokensFile(): Promise<{ sha: string | null; data: TokensFile }> {
  const file = await getFile(tokenPath);

  if (!file) {
    // Migrate / create empty
    return { sha: null, data: { tokens: [] } };
  }

  const raw = file.content;

  // Support old format: { "tokens": ["string", ...] }
  if (Array.isArray(raw.tokens) && raw.tokens.length > 0 && typeof raw.tokens[0] === "string") {
    const migrated: TokensFile = {
      tokens: raw.tokens.map((t: string, i: number) => ({
        id: `legacy-${i}`,
        token: t,
        owner: "admin",
        createdAt: new Date().toISOString(),
      })),
    };
    return { sha: file.sha, data: migrated };
  }

  return { sha: file.sha, data: raw as TokensFile };
}

export async function saveTokensFile(data: TokensFile, sha: string | null, message: string) {
  return putFile(tokenPath, data, sha, message);
}

export async function addTokenEntry(token: string, ownerUsername: string) {
  const { sha, data } = await getTokensFile();

  if (data.tokens.some((t) => t.token === token)) {
    throw new Error("Token sudah ada di daftar");
  }

  const entry: TokenEntry = {
    id: crypto.randomUUID(),
    token,
    owner: ownerUsername,
    createdAt: new Date().toISOString(),
  };

  data.tokens.push(entry);
  await saveTokensFile(data, sha, `Add token by ${ownerUsername}`);
  return entry;
}

export async function deleteTokenById(id: string) {
  const { sha, data } = await getTokensFile();
  const index = data.tokens.findIndex((t) => t.id === id);

  if (index === -1) {
    throw new Error("Token tidak ditemukan");
  }

  const removed = data.tokens.splice(index, 1)[0];
  await saveTokensFile(data, sha, `Delete token owned by ${removed.owner}`);
  return removed;
}

// ===== USERS =====

export async function getUsersFile(): Promise<{ sha: string | null; data: UsersFile }> {
  const file = await getFile(usersPath);

  if (!file) {
    return { sha: null, data: { users: [] } };
  }

  return { sha: file.sha, data: file.content as UsersFile };
}

export async function saveUsersFile(data: UsersFile, sha: string | null, message: string) {
  return putFile(usersPath, data, sha, message);
}

export async function findUser(username: string) {
  const { data } = await getUsersFile();
  return data.users.find((u) => u.username.toLowerCase() === username.toLowerCase()) || null;
}

export async function createUser(username: string, passwordHash: string) {
  const { sha, data } = await getUsersFile();

  if (data.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    throw new Error("Username sudah digunakan");
  }

  if (username.toLowerCase() === (process.env.ADMIN_USERNAME || "").toLowerCase()) {
    throw new Error("Username tidak tersedia");
  }

  const entry: UserEntry = {
    username,
    passwordHash,
    role: "user",
    createdAt: new Date().toISOString(),
  };

  data.users.push(entry);
  await saveUsersFile(data, sha, `Create user: ${username}`);
  return entry;
}

export async function deleteUser(username: string) {
  const { sha, data } = await getUsersFile();
  const index = data.users.findIndex(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );

  if (index === -1) {
    throw new Error("User tidak ditemukan");
  }

  data.users.splice(index, 1);
  await saveUsersFile(data, sha, `Delete user: ${username}`);
}
