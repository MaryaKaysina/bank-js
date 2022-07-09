import { setChildren } from 'redom';
import {
  authorization,
  authorizationLoader,
  validateAuthorization,
  fetchAuth,
} from './components/authorization/authorization';
import { getCards } from './components/cards/cards';

setChildren(document.body, authorizationLoader());

setTimeout(() => {
  setChildren(document.body, authorization());

  const loginInput = document.querySelector('input[name="login"]');
  const passInput = document.querySelector('input[name="password"]');
  const loginErr = document.querySelector('input[name="login"] ~ .message');
  const passErr = document.querySelector('input[name="password"] ~ .message');
  const btn = document.querySelector('.form__btn');
  const btnError = document.querySelector('.form__btn .message');

  loginInput.addEventListener('change', () => {
    try {
      validateAuthorization(loginInput.value, 'Логин');
      loginInput.classList.add('valid');
    } catch (err) {
      loginErr.classList.add('error');
      loginErr.textContent = err.message;
      loginErr.classList.remove('hidden');
    }
  });

  loginInput.addEventListener('input', () => {
    loginErr.classList.remove('error');
    loginErr.classList.add('hidden');
    btnError.classList.remove('error');
    btnError.classList.add('hidden');
  });

  passInput.addEventListener('change', () => {
    try {
      validateAuthorization(passInput.value, 'Логин');
      passInput.classList.add('valid');
    } catch (err) {
      passErr.classList.add('error');
      passErr.textContent = err.message;
      passErr.classList.remove('hidden');
    }
  });

  passInput.addEventListener('input', () => {
    passErr.classList.remove('error');
    passErr.classList.add('hidden');
    btnError.classList.remove('error');
    btnError.classList.add('hidden');
  });

  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    const loginInput = document.querySelector('input[name="login"]');
    const passInput = document.querySelector('input[name="password"]');

    if (
      loginInput.classList.contains('valid') &&
      passInput.classList.contains('valid')
    ) {
      const auth = {
        login: loginInput.value.trim(),
        password: passInput.value.trim(),
      };
      try {
        const token = await fetchAuth(auth);
        console.log(token.token);
        getCards(token.token);
      } catch (err) {
        btnError.classList.add('error');
        btnError.textContent = err.message;
        btnError.classList.remove('hidden');
      }
    }
  });
}, 1000);
