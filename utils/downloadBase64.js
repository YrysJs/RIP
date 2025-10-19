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
        // Очищаем base64 строку от возможных префиксов
        let cleanBase64 = base64String;
        if (base64String.includes(',')) {
            cleanBase64 = base64String.split(',')[1];
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
        throw new Error('Не удалось скачать файл');
    }
}