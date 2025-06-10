const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const axios = require('axios'); 
const ESP32_IP = "192.168.55.146";
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'rfid_game_db'
};

// The state is now much simpler. It only tracks the current player.
let systemState = {
    lastScannedUid: null,
    status: 'IDLE',
};

// --- API ENDPOINTS ---

app.post('/api/scan', async (req, res) => {
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
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        if (connection) await connection.end();
    }
});

app.post('/api/logout', (req, res) => {
    console.log(`Logout processed. System is now IDLE.`);
    systemState.status = 'IDLE';
    systemState.lastScannedUid = null;
    res.json({ status: 'logout_success' });
});


// Your other endpoints are pasted here for completeness.
app.post('/api/answer', async (req, res) => {
    const { questionId, answer } = req.body;
    const currentPlayerUid = systemState.lastScannedUid;

    if (systemState.status !== 'PLAYER_LOGGED_IN' || !currentPlayerUid) {
        return res.status(400).json({ message: 'No player logged in.' });
    }

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [questionRows] = await connection.execute('SELECT correct_answer, difficulty FROM questions WHERE id = ?', [questionId]);
        if (questionRows.length === 0) {
            return res.status(404).json({ message: 'Question not found.' });
        }

        const question = questionRows[0];
        const isCorrect = (answer === question.correct_answer);

        // --- NEW: TRIGGER ESP32 FEEDBACK ---
        try {
            if (isCorrect) {
                console.log(`Answer CORRECT. Triggering ESP32 at http://${ESP32_IP}/success`);
                await axios.get(`http://${ESP32_IP}/success`);
            } else {
                console.log(`Answer WRONG. Triggering ESP32 at http://${ESP32_IP}/failure`);
                await axios.get(`http://${ESP32_IP}/failure`);
            }
        } catch (espError) {
            // Log if the ESP32 is unreachable, but don't stop the game logic
            console.error(`Failed to trigger ESP32. Is it connected and at IP ${ESP32_IP}?`);
            console.error(espError.message);
        }
        // --- END OF NEW CODE ---

        if (isCorrect) {
            let pointsToAdd = 0;
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
        console.error('Error in /api/answer:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        if (connection) await connection.end();
    }
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
                const [questionRows] = await connection.execute(
                    'SELECT id, question_text, option_a, option_b, option_c, correct_answer FROM questions WHERE difficulty = ? ORDER BY RAND() LIMIT 10',
                    [difficulty]
                );
                response.questions = questionRows.map(q => ({ id: q.id, question: q.question_text, options: [q.option_a, q.option_b, q.option_c], answer: q.correct_answer }));
            }
        } catch (error) { console.error('DB Error on /api/game-state:', error); }
        finally { if (connection) await connection.end(); }
    }
    res.json(response);
});

app.get('/api/leaderboard', async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT rfid_uid, name, student_number, points FROM students ORDER BY points DESC');
        res.json(rows);
    } catch (error) { res.status(500).json({ message: 'Internal server error' }); }
    finally { if (connection) await connection.end(); }
});

app.post('/api/register', async (req, res) => {
    const { uid, name, studentNumber } = req.body;
    if (!uid || !name || !studentNumber) return res.status(400).json({ message: 'All fields are required.' });
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        await connection.execute('INSERT INTO students (rfid_uid, name, student_number, points) VALUES (?, ?, ?, ?)', [uid, name, studentNumber, 0]);
        systemState.status = 'IDLE';
        systemState.lastScannedUid = null;
        res.json({ status: 'registration_success' });
    } catch (error) { res.status(500).json({ message: 'Error registering student.' }); }
    finally { if (connection) await connection.end(); }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});