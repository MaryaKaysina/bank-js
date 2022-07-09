import { el } from 'redom';

export function cardsLoader() {
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

export function cards() {
  const app = el('div', { id: 'app' });

  app.innerHTML = `<header class="header">
      <div class="container">
        <a href="/" class="header__link">Coin.</a>
      </div>
    </header>
    <main class="main">

    </main>
    `;

  return app;
}

export async function getCards(auth) {
  const response = await fetch('http://localhost:3000/accounts', {
    method: 'GET',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  console.log(data);
  // if (data.error) {
  //   throw Error('Неправильный логин и/или пароль');
  // }
  // return data.payload;
}
