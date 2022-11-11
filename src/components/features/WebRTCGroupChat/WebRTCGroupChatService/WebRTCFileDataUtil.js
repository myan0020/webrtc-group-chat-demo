async function _getUniqueFiles(files) {
  if (!files) {
    return;
  }

  const filesToAdd = {};

  for (const file of Array.from(files)) {
    const fileDataString = file.name + file.type + file.size + file.lastModified;
    const fileDataHash = await _getSHA256(fileDataString);
    filesToAdd[fileDataHash] = file;
  }

  return filesToAdd;
}


async function _getSHA256(string) {
  const strBuffer = new TextEncoder().encode(string);
  const hashBuffer = await crypto.subtle.digest('SHA-256', strBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  const hashHex = hashArray
    .map((b) => {
      return b.toString(16).padStart(2, '0');
    })
    .join('');

  return hashHex;
}

function _formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}

export default { 
  getUniqueFiles: _getUniqueFiles,
  getSHA256: _getSHA256,
  formatBytes: _formatBytes,
};
