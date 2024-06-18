const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

// Inicialize o Firebase Admin SDK
const serviceAccount = require('./firebaseConfig.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const usersCollection = db.collection('users');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

let loggedInUserId = null;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'acesso.html'));
});

app.post('/receber', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Consulta no Firestore para encontrar o usuário pelo email e senha
        const querySnapshot = await usersCollection
            .where('email', '==', email)
            .where('password', '==', password)
            .get();

        if (querySnapshot.empty) {
            console.log("Email ou senha inválidos");
            return res.status(401).json({ success: false, message: "Email ou senha inválidos" });
        } else {
            const userDoc = querySnapshot.docs[0];
            loggedInUserId = userDoc.id; // Armazena o ID do documento do usuário logado
            const userData = userDoc.data();

            console.log(loggedInUserId);

            // Verifica se o usuário tem a propriedade 'role' definida como true
            if (userData.role === true) {
                console.log("Usuário é administrador");
                return res.json({ success: true, redirectUrl: '/admin' });
            } else {
                console.log("Usuário não é administrador");
                return res.json({ success: true, redirectUrl: '/escolhas' });
            }
        }
    } catch (error) {
        console.error("Erro ao verificar credenciais:", error);
        return res.status(500).json({ success: false, message: "Erro ao verificar credenciais" });
    }
});

app.get('/dados', (req, res) => {
    res.send('Esta é a resposta do servidor para a chamada AJAX.');
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/escolhas', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'escolhas.html'));
});

app.get('/opcao1', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'opcao1.html'));
});

app.get('/opcao2', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'opcao2.html'));
});

app.get('/opcao3', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'opcao3.html'));
});

app.post('/send', async (req, res) => {
    const { iniciante1, iniciante2, iniciante3 } = req.body;

    // Cria um objeto de atualização sem valores undefined
    const updateData = {};
    if (iniciante1 !== undefined) updateData.iniciante1 = iniciante1;
    if (iniciante2 !== undefined) updateData.iniciante2 = iniciante2;
    if (iniciante3 !== undefined) updateData.iniciante3 = iniciante3;

    try {
        if (!loggedInUserId) {
            throw new Error('Usuário não autenticado');
        }
        await db.collection('users').doc(loggedInUserId).update(updateData);
        return res.json('Códigos enviados com sucesso');
    } catch (error) {
        console.error("Erro ao enviar códigos:", error);
        return res.status(500).json({ error: "Erro ao enviar códigos" });
    }
});

app.post('/send-inter', async (req, res) => {
    const { inter1, inter2, inter3 } = req.body;

    // Cria um objeto de atualização sem valores undefined
    const updateData = {};
    if (inter1 !== undefined) updateData.inter1 = inter1;
    if (inter2 !== undefined) updateData.inter2 = inter2;
    if (inter3 !== undefined) updateData.inter3 = inter3;

    try {
        if (!loggedInUserId) {
            throw new Error('Usuário não autenticado');
        }
        await db.collection('users').doc(loggedInUserId).update(updateData);
        return res.json('Códigos enviados com sucesso');
    } catch (error) {
        console.error("Erro ao enviar códigos:", error);
        return res.status(500).json({ error: "Erro ao enviar códigos" });
    }
});

app.post('/send-advanced', async (req, res) => {
    const { advanced1, advanced2, advanced3 } = req.body;

    // Cria um objeto de atualização sem valores undefined
    const updateData = {};
    if (advanced1 !== undefined) updateData.advanced1 = advanced1;
    if (advanced2 !== undefined) updateData.advanced2 = advanced2;
    if (advanced3 !== undefined) updateData.advanced3 = advanced3;

    try {
        if (!loggedInUserId) {
            throw new Error('Usuário não autenticado');
        }
        await db.collection('users').doc(loggedInUserId).update(updateData);
        return res.json('Códigos enviados com sucesso');
    } catch (error) {
        console.error("Erro ao enviar códigos:", error);
        return res.status(500).json({ error: "Erro ao enviar códigos" });
    }
});

// Adiciona o endpoint de registro
app.post('/register', async (req, res) => {
    const { email, password, role } = req.body;
    try {
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
        });

        await db.collection('users').doc(userRecord.uid).set({
            email: email,
            password: password,
            role: role
        });

        console.log('Usuário criado com sucesso', userRecord.uid);
        return res.json("tudo certo");
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        return res.status(500).json({ error: 'Erro ao criar usuário' });
    }
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/respostas', async (req, res) => {
    try {
        // Busca todos os usuários
        const usersSnapshot = await db.collection('users').get();
        const respostas = [];

        usersSnapshot.forEach(userDoc => {
            const userData = userDoc.data();

            // Verifica se o usuário possui respostas para os desafios
            const userResponses = {
                email: userData.email || '',
                iniciante1: userData.iniciante1 || '',
                iniciante2: userData.iniciante2 || '',
                iniciante3: userData.iniciante3 || '',
                inter1: userData.inter1 || '',
                inter2: userData.inter2 || '',
                inter3: userData.inter3 || '',
                advanced1: userData.advanced1 || '',
                advanced2: userData.advanced2 || '',
                advanced3: userData.advanced3 || ''
            };

            respostas.push(userResponses);
        });

        res.status(200).json(respostas);
    } catch (error) {
        console.error('Erro ao buscar respostas dos desafios:', error);
        res.status(500).json({ error: 'Erro ao buscar respostas dos desafios' });
    }
});


app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
