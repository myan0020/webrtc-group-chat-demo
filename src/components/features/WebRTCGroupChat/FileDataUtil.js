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

export default { 
  getUniqueFiles: _getUniqueFiles,
  getSHA256: _getSHA256,
};
