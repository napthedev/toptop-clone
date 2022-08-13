export const fetchWithProgress = (
  method: string,
  url: string,
  body: any,
  cb: (percentage: number) => void
): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open(method, url, true);

    xhr.upload.onprogress = (e) => {
      const percentage = Math.round((e.loaded / e.total) * 100);
      cb(percentage);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const json = JSON.parse(xhr.responseText);
        resolve(json);
      } else {
        reject(xhr.responseText);
      }
    };
    xhr.onerror = () => {
      reject(xhr.responseText);
    };
    xhr.send(body);
  });
};
