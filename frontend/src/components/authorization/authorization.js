import { el } from 'redom';
import './authorization.scss';

export function authorizationLoader() {
  const app = el('div', {
    id: 'app',
    class: 'ssc ssc-card',
    style: 'max-width: 100%;',
  });

  app.innerHTML = `<div class="ssc-square mb" style="height: 101px; margin-bottom: 0;"></div>
  <div class="ssc-line" style="height: 366px; width: 503px; border-radius: 50px; margin: auto;"></div>
  `;

  return app;
}

export function authorization() {
  const app = el('div', { id: 'app' });

  app.innerHTML = `<header class="header">
      <div class="container">
        <a href="/" class="header__link">Coin.</a>
      </div>
    </header>
    <main class="main">
      <form class="form" method="post">
        <h2 class="form__title">Вход в аккаунт</h2>
        <label class="form__label">
          Логин
          <input type="text" class="form__input" name="login" placeholder="Введите логин">
          <span class="message hidden">Error message</span>
        </label>
        <label class="form__label">
          Пароль
          <input type="password" class="form__input" name="password" placeholder="Введите пароль">
          <span class="message hidden">Success message</span>
        </label>
        <button class="form__btn">
        Войти
        <span class="message auth hidden">Success message</span>
        </button>
      </form>
    </main>
    `;

  return app;
}

export function validateAuthorization(value, name) {
  if (value.trim().length < 7) {
    throw Error(`${name} должен содержать более 6 символов`);
  }
  if (value.trim().includes(' ')) {
    throw Error(`${name} не должен содержать пробелов`);
  }
  return true;
}

export async function fetchAuth(auth) {
  const response = await fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(auth),
  });
  const data = await response.json();
  if (data.error) {
    throw Error('Неправильный логин и/или пароль');
  }
  return data.payload;
}
