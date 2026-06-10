const fs = require("fs");

// Кастомна помилка: файл не знайдено
class FileNotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = "FileNotFoundError";
    }
}

// Кастомна помилка: невірні дані
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "ValidationError";
    }
}

// Кастомна помилка: помилка трансформації
class TransformError extends Error {
    constructor(message) {
        super(message);
        this.name = "TransformError";
    }
}

// Кастомна помилка: мережева помилка
class NetworkError extends Error {
    constructor(message) {
        super(message);
        this.name = "NetworkError";
    }
}

// Логування операцій
function log(message) {
    console.log(
        `[${new Date().toLocaleTimeString()}] ${message}`
    );
}

// Читання файлу
function readFile(path) {
    return new Promise((resolve, reject) => {
        log(`Читання файлу: ${path}`);

        fs.readFile(path, "utf8", (err, data) => {
            if (err) {
                reject(
                    new FileNotFoundError(
                        "Файл не знайдено"
                    )
                );
                return;
            }

            resolve(data);
        });
    });
}

// Валідація вхідних даних
function validateContent(content) {
    return new Promise((resolve, reject) => {
        log("Перевірка вмісту файлу");

        // Перевірка на порожній файл
        if (!content || content.trim() === "") {
            reject(
                new ValidationError(
                    "Файл порожній"
                )
            );
            return;
        }

        // Перевірка мінімальної довжини
        if (content.trim().length < 5) {
            reject(
                new ValidationError(
                    "Недостатньо даних для обробки"
                )
            );
            return;
        }

        resolve(content);
    });
}

// Трансформація даних
function transformData(data) {
    return new Promise((resolve, reject) => {
        log("Трансформація даних");

        try {
            const transformed =
                data.toUpperCase();

            if (!transformed) {
                reject(
                    new TransformError(
                        "Не вдалося трансформувати дані"
                    )
                );
                return;
            }

            resolve(transformed);
        } catch {
            reject(
                new TransformError(
                    "Помилка трансформації"
                )
            );
        }
    });
}

// Імітація мережевої операції
function networkOperation() {
    return new Promise((resolve, reject) => {

        const success = Math.random() > 0.5;

        if (success) {

            log("Мережева операція успішна");

            resolve(
                "Мережева операція виконана"
            );

        } else {

            reject(
                new NetworkError(
                    "Мережева помилка"
                )
            );

        }
    });
}

// Повторні спроби виконання мережевої операції
function retryNetworkOperation(retries = 3) {
    return new Promise((resolve, reject) => {

        function attempt(count) {

            networkOperation()
                .then(resolve)
                .catch(error => {

                    if (
                        error instanceof NetworkError &&
                        count > 0
                    ) {

                        log(
                            `Повторна спроба. Залишилось: ${count}`
                        );

                        attempt(count - 1);

                    } else {

                        reject(error);

                    }
                });
        }

        attempt(retries);
    });
}

// Збереження файлу
function saveFile(path, data) {
    return new Promise((resolve, reject) => {

        log(`Збереження файлу: ${path}`);

        fs.writeFile(
            path,
            data,
            "utf8",
            (err) => {

                if (err) {
                    reject(
                        new Error(
                            "Permission denied"
                        )
                    );
                    return;
                }

                resolve(
                    "Файл успішно збережено"
                );
            }
        );
    });
}

// Головна логіка програми

readFile("input.txt")

    .then(validateContent)

    .then(transformData)

    .then((data) => {

        return retryNetworkOperation()
            .then(() => data);

    })

    .then((data) => {

        return saveFile(
            "output.txt",
            data
        );

    })

    .then(() => {

        log(
            "Роботу завершено успішно"
        );

    })

    .catch((error) => {

        if (
            error instanceof FileNotFoundError
        ) {

            console.error(
                "Помилка файлу:",
                error.message
            );

        } else if (
            error instanceof ValidationError
        ) {

            console.error(
                "Помилка валідації:",
                error.message
            );

        } else if (
            error instanceof TransformError
        ) {

            console.error(
                "Помилка трансформації:",
                error.message
            );

        } else if (
            error instanceof NetworkError
        ) {

            console.error(
                "Мережеву операцію не вдалося виконати після 3 спроб."
            );

        } else {

            console.error(
                "Невідома помилка:",
                error.message
            );

        }

    })

    .finally(() => {

        log(
            "Cleanup операції завершені"
        );

    });