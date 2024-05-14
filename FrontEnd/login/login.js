// Configurar Firebasev
const firebaseConfig = {
  apiKey: "AIzaSyCkvwzlaIESw7BNJqjCjkF1U210wOYTDmk",
  authDomain: "codequest-cace9.firebaseapp.com",
  projectId: "codequest-cace9",
  storageBucket: "codequest-cace9.appspot.com",
  messagingSenderId: "506110927264",
  appId: "1:506110927264:web:d3bcf01853915000ff84c5",
  measurementId: "G-E04HXS6VJ2"
};

let userInfo;

firebase.initializeApp(firebaseConfig);

// Referência para o serviço de autenticação do Firebase
const auth = firebase.auth();

// Referência para o formulário de login
const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');

// Adicionar um listener para o evento de submit no formulário
loginForm.addEventListener('submit', (e) => {
  e.preventDefault(); // Impede o comportamento padrão do formulário
  const email = loginForm.email.value;
  const password = loginForm.password.value;

  // Fazer login com email e senha
  auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
          // Login bem-sucedido
          userInfo = userCredential;
          userCredential.token
          window.location.href="../../pages/telinha.html"
      })
      .catch((error) => {
          // Ocorreu um erro no login
          const errorCode = error.code;
          const errorMessage = "Usuário não encontrado";
          console.error('Erro ao fazer login:', errorMessage);
          document.getElementById('error-message').innerText = errorMessage;
      });
});
