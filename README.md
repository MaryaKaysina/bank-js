# Сборка

### Prod-сборка
Перейти в папку __./frontend__, открыть терминал и запустить команду `npm run build`.  
Готовые файлы будут лежать в папке __./dist__.  
Перейти в папку __./backend__, открыть терминал и запустить команду `npm start`.  

### Dev-сборка
Перейти в папку __./frontend__, открыть терминал и запустить команду `npm run dev`.   
Открыть в браузере <http://localhost:8080/>.  
Перейти в папку __./backend__, открыть терминал и запустить команду `npm start`.   
Сервер будет находиться на <http://localhost:3000>.  

# Тестирование

Перейти в папку __./backend__, открыть терминал и запустить команду `npm start`.  
Перейти в папку __./frontend__, открыть терминал и запустить команду `npx cypress open`.  
Тесты находятся в __./frontend/cypress/e2e/basic-tests.cy.js__.  