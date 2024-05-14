const express = require('express')
const fs = require('fs');
const app = express()
const admin = require('firebase-admin')
let docId = ''
app.use(express.json())
admin.initializeApp({
  credential: admin.credential.cert('key.json')
});

const db = admin.firestore();
const usersCollection = db.collection('users');

const escreveTxt = (text, name) => {
  fs.appendFile('texto.txt', `Código do ${name}:\n${text}`, (err) => {
    if (err) {
      console.error('Erro ao escrever no arquivo:', err);
    } else {
      console.log('Texto salvo com sucesso em texto.txt!');
    }
  });
  fs.appendFile('texto.txt', '\n-----------\n', (err) => {
  });
}

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  admin.auth().createUser({
    email: email,
    password: password
  })
    .then((userRecord) => {
      db.collection('users').doc(userRecord.uid).set({
        email: email,
        password: password
      })
        .then(() => {
          console.log("Uhuuu")
        })
      console.log('Usuário criado com sucesso', userRecord.uid);
    })
    .catch((error) => {
      console.error('Erro ao criar usuário:', error);
    });
  return res.json("tudo certo")
})

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const querySnapshot = await usersCollection.where('email', '==', email).where('password', '==', password).get();

    if (querySnapshot.empty) {
      console.log("Email ou senha inválidos");
      return res.status(401).json({ error: "Email ou senha inválidos" });
    } else {
      docId = querySnapshot.docs[0].id;
      console.log(docId)
      return res.json("Usuário Logado");
    }
  } catch (error) {
    console.error("Erro ao verificar credenciais:", error);
    return res.status(500).json({ error: "Erro ao verificar credenciais" });
  }
});

app.post('/send', async (req, res) => {
  const { codigo } = req.body;
  db.collection('users').doc(docId).set({codigo: codigo})
  return res.json('Código enviado com sucesso')
})

app.get('/users', (req, res) => {
  usersCollection.get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        console.log(doc.id, '=>', doc.data());
        const jsonString = JSON.stringify(doc.data().codigo, null, 2);
        const stringComQuebraDeLinha = jsonString
          .replace(/\\n/g, '\n')
          .replace(/\\/g, '')
          .replace(/^"|"$/g, '');;
        escreveTxt(stringComQuebraDeLinha, req.body.name)
      });
    })
    .catch((error) => {
      console.error('Erro ao consultar documentos:', error);
    });
  return res.json("Escrito no txt")
})

app.listen(8000, () => {
  console.log(`Servidor rodando na porta 8000`);
});

