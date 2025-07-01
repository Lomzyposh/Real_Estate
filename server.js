const express = require('express');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const nodemailer = require('nodemailer');

const fs = require('fs');
const cloudinary = require('./cloudinary');
const path = require('path');
const { sql, poolPromise, insertProperty, addUserToDB, getUserByEmail, showAgents, addProperty, forgotPassword, findUserId } = require('./db');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

const upload = multer({ dest: 'uploads/' });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cookieParser());

async function processMail(to, subject, message) {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: "NestNova",
            to,
            subject,
            html: message,
        };

        await transporter.sendMail(mailOptions);
        return { success: true, message: 'A reset code has been sent to your email.' }
    } catch (err) {
        console.error('Email sending error:', err);
        return { success: false, message: "Network Failure. Try Again" }
    }
}

app.post('/api/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        const pool = await poolPromise;

        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT * FROM Users WHERE email = @email');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Email not found. Please try again.' });
        }
        console.log("Passed Email exists");

        const code = Math.floor(100000 + Math.random() * 900000).toString();


        const forgotPass = await forgotPassword(email, code);

        if (!forgotPass || !forgotPass.success) {
            return res.status(500).json({ message: 'Failed to generate reset code.' });
        }

        const subject = "Your Password Reset Code";

        const message = `
    <h2>Password Reset Request</h2>
    <p>Your password reset code is:</p>
    <h1 style="color:#1a73e8;">${code}</h1>
    <p>This code will expire in 15 minutes. If you didn’t request this, please ignore it.</p>
    <p>— NestNova Team</p>
  `;
        const mailSent = await processMail(email, subject, message);
        if (!mailSent.success) {
            return res.status(500).json({ message: "Failed to send. " })
        }

        res.status(200).json({ message: 'Reset code sent successfully.' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong. Please try again later.' });
    }
});

app.post('/api/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        const pool = await poolPromise;

        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT * FROM Users WHERE email = @email');

    } catch (err) {

    }
})

// app.post('/api/', async (req, res) => {
//     try {
//         const { email } = req.body;

//         const pool = await poolPromise;

//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ messagee: "Somethign wen wrong" })
//     }
// })

app.post('/upload-profile', upload.single('profileImage'), async (req, res) => {
    try {
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'profile_pictures',
            public_id: `user_${Date.now()}`,
        });

        fs.unlinkSync(req.file.path);


        res.status(200).json({ imageUrl: result.secure_url });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/register', async (req, res) => {
    console.log("Checking registration data:", req.email);
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    // Call your addUserToDB function
    const result = await addUserToDB(email, password);

    if (result.success) {
        res.status(201).json({ message: 'User registered successfully' });
    } else {
        res.status(500).json({ message: 'Failed to register user' });
    }
});

app.post('/login', async (req, res) => {
    console.log("Checking login data:", req.body.email);
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    try {
        const userResult = await getUserByEmail(email, password);
        if (!userResult || !userResult.success) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const userDet = userResult.message;

        console.log("User found:", userDet);

        res.cookie("userSession", JSON.stringify(userDet), {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: 'Login successful',
            role: userDet.role,
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error during login' });
    }
});

function requireAuth(role) {
    return (req, res, next) => {
        const userSession = req.cookies.userSession;
        if (!userSession) {
            return res.status(401).json({ message: 'Not logged in' });
        }

        let parsed;
        try {
            parsed = JSON.parse(userSession);
            req.session = parsed;
        } catch (err) {
            return res.status(400).json({ message: 'Invalid session data' });
        }

        if (parsed.role.toLowerCase() !== role.toLowerCase()) {
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }
        next();
    }
}

app.get('/lender-dashboard', requireAuth("lender"), async (req, res) => {
    try {
        const userResult = await findUserId(req.session.id);

        if (!userResult) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.json({
            id: userResult.userId,
            name: userResult.name,
            email: userResult.email,
            role: userResult.role,
        })
        // res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
    }
    catch (err) {
        console.error("Error in dashboard route:", err);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/logout-dashboard', async (req, res) => {
    res.clearCookie('userSession');
    res.redirect('/');
})

app.post('/add-property', async (req, res) => {
    try {
        await insertProperty(req.body);
        res.send('Property inserted!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to insert property');
    }
});


app.post('/addProp', async (req, res) => {
    try {
        await addProperty(req.body);
        res.status(200).json({ message: "Data submitted successfully." })
    } catch (err) {
        console.error("Error Inserting into DB: " + err);
        res.status(500).send('Failed to insert property');
    }
})

app.get('/api/agents', async (req, res) => {
    try {
        const agents = await showAgents();
        res.status(200).json(agents);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch agents' });
    }
});


app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


