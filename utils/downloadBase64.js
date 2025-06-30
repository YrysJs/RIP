export function downloadBase64File(base64String, filename = 'file.xlsx') {
    const mime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const bstr = atob(base64String); // декодируем base64
    const u8arr = new Uint8Array(bstr.length);

    for (let i = 0; i < bstr.length; i++) {
        u8arr[i] = bstr.charCodeAt(i);
    }

    const blob = new Blob([u8arr], { type: mime });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}