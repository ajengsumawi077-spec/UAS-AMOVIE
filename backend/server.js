import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const port = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Backend is running' });
});

app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'Semua field wajib diisi.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Password dan konfirmasi harus sama.' });
  }

  try {
    const user = await prisma.user.create({
      data: { username, email, password },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    return res.status(201).json({ message: 'Registrasi berhasil.', user });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Username atau email sudah terpakai.' });
    }

    return res.status(500).json({ message: 'Gagal memproses registrasi.' });
  }
});
app.get('/api/users', async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const perPageQuery = req.query.perPage ?? req.query.perpage;
  const perPage = Math.max(Number.parseInt(perPageQuery, 10) || 10, 1);
  const skip = (page - 1) * perPage;

  try {
    const [total, users] = await prisma.$transaction([
      prisma.user.count(),
      prisma.user.findMany({
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true,
        },
      }),
    ]);

    return res.json({
      users,
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (_error) {
    return res.status(500).json({ message: 'Gagal mengambil data users.' });
  }
});
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username dan password wajib diisi.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    const isValid = Boolean(user && user.password === password);

    await prisma.loginRecord.create({
      data: {
        username,
        password,
        success: isValid,
        userId: user?.id,
      },
    });

    if (!isValid) {
      return res.status(401).json({ message: 'Username atau password salah.' });
    }

    return res.json({
      message: 'Login berhasil.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (_error) {
    return res.status(500).json({ message: 'Gagal memproses login.' });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email wajib diisi.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    await prisma.forgotPasswordRecord.create({
      data: {
        email,
        userId: user?.id,
      },
    });

    return res.json({ message: 'Permintaan forgot password sudah direkam ke database.' });
  } catch (_error) {
    return res.status(500).json({ message: 'Gagal memproses forgot password.' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  if (!email || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: 'Semua field wajib diisi.' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'Password baru dan konfirmasi harus sama.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    await prisma.resetPasswordRecord.create({
      data: {
        email,
        newPassword,
        userId: user?.id,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User dengan email tersebut tidak ditemukan, tapi request tetap direkam.' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { password: newPassword },
    });

    return res.json({ message: 'Password berhasil direset dan request direkam.' });
  } catch (_error) {
    return res.status(500).json({ message: 'Gagal memproses reset password.' });
  }
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});

const shutdown = async () => {
  await prisma.$disconnect();
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
