# nosql2h22-math

## Тестовые пользователи:

Ученик:

Логин - john.doe@example.com

Пароль - password

---

Учитель:

Логин - jane.doe@example.com 

Пароль - password

---

Администратор:

Логин - admin@nosql7.com

Пароль - admin

## Инструкция по запуску:

1. Убедитесь, что порты 5173 и 8000 на машине, где будет разворачиваться система, свободны. Сделать это можно, например, с помощью утилиты `netstat`:
```bash
sudo netstat -tunlp | grep 5173
sudo netstat -tunlp | grep 8000
```
2. Склонируйте репозиторий и перейдите в его корень:
```bash
git clone https://github.com/moevm/nosql2h22-math.git
cd nosql2h22-math/
```
3. Запустите приложение:
```bash
docker-compose build --no-cache
docker-compose up
```

## Демонстрация
Ссылка на демо второго прототипа: [https://drive.google.com/file/d/1I_5AWoBbg32v3b5GxPaxBJEO9L71xIBl/view?usp=share_link](https://drive.google.com/file/d/1I_5AWoBbg32v3b5GxPaxBJEO9L71xIBl/view?usp=share_link)
