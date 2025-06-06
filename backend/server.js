// server.js - Final Correct Version

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Ensure this matches your XAMPP database settings
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'rfid_game_db'
};

// This object holds the live state of the application
let systemState = {
    lastScannedUid: null,
    status: 'IDLE', // Can be IDLE, PENDING_REGISTRATION, PLAYER_LOGGED_IN
};

// =================================================================
// --- API ENDPOINTS ---
// =================================================================

app.post('/api/scan', async (req, res) => {
    // Only allow scans when the system is truly IDLE
    if (systemState.status !== 'IDLE') {
        console.log(`Scan received while system not IDLE (Status: ${systemState.status}). Ignoring.`);
        return res.status(409).json({ message: 'System is not ready for a new scan.' });
    }
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ message: 'UID is required' });

    console.log(`Received scan for UID: ${uid}`);
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM students WHERE rfid_uid = ?', [uid]);
        if (rows.length > 0) {
            systemState.status = 'PLAYER_LOGGED_IN';
            systemState.lastScannedUid = uid;
            res.json({ status: 'login_success', student: rows[0] });
        } else {
            systemState.status = 'PENDING_REGISTRATION';
            systemState.lastScannedUid = uid;
            res.json({ status: 'new_user_detected' });
        }
    } catch (error) {
        console.error('Database Error on /api/scan:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        if (connection) await connection.end();
    }
});

app.post('/api/logout', (req, res) => {
    console.log(`Logout processed. System state is now IDLE.`);
    systemState.status = 'IDLE';
    systemState.lastScannedUid = null;
    res.json({ status: 'logout_success' });
});

app.post('/api/reset', (req, res) => {
    console.log('Frontend requested a system state reset. State is now IDLE.');
    systemState.status = 'IDLE';
    systemState.lastScannedUid = null;
    res.json({ status: 'system_reset' });
});

app.get('/api/game-state', async (req, res) => {
    const { difficulty } = req.query;
    const response = { status: systemState.status, uid: systemState.lastScannedUid, player: null, questions: [] };

    if (systemState.status === 'PLAYER_LOGGED_IN' && systemState.lastScannedUid) {
        let connection;
        try {
            connection = await mysql.createConnection(dbConfig);
            const [playerRows] = await connection.execute('SELECT * FROM students WHERE rfid_uid = ?', [systemState.lastScannedUid]);
            if (playerRows.length > 0) response.player = playerRows[0];

            if (difficulty) {
                console.log(`Fetching questions for difficulty: ${difficulty}`);
                const [questionRows] = await connection.execute(
                    'SELECT id, question_text, option_a, option_b, option_c, correct_answer FROM questions WHERE difficulty = ? ORDER BY RAND() LIMIT 10',
                    [difficulty]
                );
                response.questions = questionRows.map(q => ({
                    id: q.id,
                    question: q.question_text,
                    options: [q.option_a, q.option_b, q.option_c],
                    answer: q.correct_answer
                }));
            }
        } catch (error) {
            console.error('DB Error on /api/game-state:', error);
        } finally {
            if (connection) await connection.end();
        }
    }
    res.json(response);
});

app.post('/api/answer', async (req, res) => {
    const { questionId, answer } = req.body;
    const currentPlayerUid = systemState.lastScannedUid;
    if (systemState.status !== 'PLAYER_LOGGED_IN' || !currentPlayerUid) return res.status(400).json({ message: 'No player logged in.' });
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [questionRows] = await connection.execute('SELECT correct_answer, difficulty FROM questions WHERE id = ?', [questionId]);
        if (questionRows.length === 0) return res.status(404).json({ message: 'Question not found.' });

        const question = questionRows[0];
        let isCorrect = (answer === question.correct_answer);
        let pointsToAdd = 0;

        if (isCorrect) {
            switch (question.difficulty) {
                case 'easy': pointsToAdd = 5; break;
                case 'medium': pointsToAdd = 10; break;
                case 'hard': pointsToAdd = 20; break;
            }
            if (pointsToAdd > 0) {
                await connection.execute('UPDATE students SET points = points + ? WHERE rfid_uid = ?', [pointsToAdd, currentPlayerUid]);
            }
        }

        const [studentRows] = await connection.execute('SELECT * FROM students WHERE rfid_uid = ?', [currentPlayerUid]);
        res.json({ correct: isCorrect, newScore: studentRows[0].points, correctAnswer: question.correct_answer });
    } catch (error) {
        console.error('Database Error on /api/answer:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        if (connection) await connection.end();
    }
});

app.get('/api/leaderboard', async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT rfid_uid, name, student_number, points FROM students ORDER BY points DESC LIMIT 10');
        res.json(rows);
    } catch (error) {
        console.error('Database Error on /api/leaderboard:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        if (connection) await connection.end();
    }
});

app.post('/api/register', async (req, res) => {
    const { uid, name, studentNumber } = req.body;
    if (!uid || !name || !studentNumber) return res.status(400).json({ message: 'All fields are required.' });
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        await connection.execute('INSERT INTO students (rfid_uid, name, student_number, points) VALUES (?, ?, ?, ?)', [uid, name, studentNumber, 0]);
        systemState.status = 'PLAYER_LOGGED_IN';
        systemState.lastScannedUid = uid;
        res.json({ status: 'registration_success' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering student.' });
    } finally { if (connection) await connection.end(); }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});