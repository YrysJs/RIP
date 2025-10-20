// Альтернативная функция для более надежной обработки Excel файлов
export function downloadExcelFile(base64String, filename = 'file.xlsx') {
    try {
        // Очищаем base64 строку более тщательно
        let cleanBase64 = base64String.trim();
        
        // Удаляем все возможные префиксы
        if (cleanBase64.startsWith('data:')) {
            cleanBase64 = cleanBase64.split(',')[1];
        }
        
        // Удаляем все пробелы, переносы строк и другие невидимые символы
        cleanBase64 = cleanBase64.replace(/[\s\n\r\t]/g, '');
        
        // Проверяем, что строка не пустая
        if (!cleanBase64) {
            throw new Error('Пустая base64 строка');
        }

        // Проверяем валидность base64
        const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
        if (!base64Regex.test(cleanBase64)) {
            throw new Error('Некорректная base64 строка');
        }

        // Декодируем base64
        const binaryString = atob(cleanBase64);
        const bytes = new Uint8Array(binaryString.length);
        
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Создаем blob с правильным MIME типом для Excel
        const blob = new Blob([bytes], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });

        // Создаем ссылку для скачивания
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        // Добавляем в DOM, кликаем и удаляем
        document.body.appendChild(link);
        link.click();
        
        // Очищаем ресурсы
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);

        console.log('Excel файл успешно скачан:', filename);

    } catch (error) {
        console.error('Ошибка при скачивании Excel файла:', error);
        throw new Error('Не удалось скачать Excel файл: ' + error.message);
    }
}

export function downloadBase64File(base64String, filename = 'file.xlsx') {
    // Определяем MIME тип по расширению файла
    const getMimeType = (filename) => {
        const ext = filename.toLowerCase().split('.').pop();
        const mimeTypes = {
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'xls': 'application/vnd.ms-excel',
            'pdf': 'application/pdf',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'doc': 'application/msword',
            'txt': 'text/plain',
            'csv': 'text/csv',
            'json': 'application/json'
        };
        return mimeTypes[ext] || 'application/octet-stream';
    };

    try {
        // Очищаем base64 строку от возможных префиксов и пробелов
        let cleanBase64 = base64String.trim();
        
        // Удаляем data URL префикс если есть
        if (cleanBase64.startsWith('data:')) {
            cleanBase64 = cleanBase64.split(',')[1];
        }
        
        // Удаляем все пробелы и переносы строк
        cleanBase64 = cleanBase64.replace(/\s/g, '');

        // Проверяем, что строка не пустая
        if (!cleanBase64) {
            throw new Error('Пустая base64 строка');
        }

        // Отладочная информация
        console.log('Исходная base64 длина:', base64String.length);
        console.log('Очищенная base64 длина:', cleanBase64.length);
        console.log('Имя файла:', filename);
        console.log('MIME тип:', getMimeType(filename));

        // Проверяем валидность base64 строки
        const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
        if (!base64Regex.test(cleanBase64)) {
            throw new Error('Некорректная base64 строка');
        }

        // Декодируем base64 с правильной обработкой
        const binaryString = atob(cleanBase64);
        const bytes = new Uint8Array(binaryString.length);
        
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        const mimeType = getMimeType(filename);
        const blob = new Blob([bytes], { type: mimeType });

        // Создаем ссылку для скачивания
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        // Добавляем в DOM, кликаем и удаляем
        document.body.appendChild(link);
        link.click();
        
        // Очищаем ресурсы
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);

    } catch (error) {
        console.error('Ошибка при скачивании файла:', error);
        console.error('Base64 строка:', base64String.substring(0, 100) + '...');
        throw new Error('Не удалось скачать файл: ' + error.message);
    }
}