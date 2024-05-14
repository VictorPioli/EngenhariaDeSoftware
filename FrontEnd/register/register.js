const firebaseConfig = {
  apiKey: "AIzaSyCkvwzlaIESw7BNJqjCjkF1U210wOYTDmk",
  authDomain: "codequest-cace9.firebaseapp.com",
  projectId: "codequest-cace9",
  storageBucket: "codequest-cace9.appspot.com",
  messagingSenderId: "506110927264",
  appId: "1:506110927264:web:d3bcf01853915000ff84c5",
  measurementId: "G-E04HXS6VJ2"
};

firebase.initializeApp(firebaseConfig);

// Referência para o serviço de autenticação do Firebase
const auth = firebase.auth();

// Referência para o formulário de cadastro
const signupForm = document.getElementById('signup-form');
const errorMessage = document.getElementById('error-message');

// Adicionar um listener para o evento de submit no formulário
signupForm.addEventListener('submit', (e) => {
  e.preventDefault(); // Impede o comportamento padrão do formulário
  const campo1 = document.getElementById('admin').checked;
  console.log(campo1)
  const email = signupForm.email.value;
  const password = signupForm.password.value;
  const confirmPassword = signupForm.confirm.value;

  // Verificar se as senhas coincidem
  if (password !== confirmPassword) {
      errorMessage.innerText = "As senhas não coincidem.";
      return;
  }
  auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
          // Cadastro bem-sucedido
          errorMessage.innerText = "Usuário Cadastrado";
          const userId = userCredential.user.uid
          console.log(campo1)
          saveUserDataToFirestore(userId, email, password, campo1)
          // Você pode redirecionar o usuário para outra página, exibir uma mensagem de sucesso, etc.
      })
      .catch((error) => {
          // Ocorreu um erro no cadastro
          const errorCode = error.code;
          const errorMessage = error.message;
          console.error('Erro ao cadastrar usuário:', errorMessage);
          document.getElementById('error-message').innerText = errorMessage;
      });
      
});


function saveUserDataToFirestore(userId, email, password, solicitacao) {
    const db = firebase.firestore();
    db.collection('users').doc(userId).set({
      email: email,
      password: password,
      solicitação: solicitacao // Por padrão, todos os usuários são definidos como usuários comuns
    })
    .then(() => {
      console.log('Dados do usuário salvos com sucesso no Firestore');
      // Redirecionar o usuário para a próxima página, ou fazer qualquer outra coisa que desejar
    })
    .catch((error) => {
      console.error('Erro ao salvar dados do usuário no Firestore:', error);
    });
  }