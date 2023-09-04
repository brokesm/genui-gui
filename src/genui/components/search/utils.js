export async function generateImage(queryRef) {
  const smiles = await window.ketcher.getSmiles()
  await window.ketcher
    .generateImage(smiles, {
      outputFormat: 'svg'
    })
    .then((blob) => {
      const objectURL = URL.createObjectURL(blob);
      queryRef.current.src = objectURL;
    });
}

export async function getSmartsPattern() {
  const smarts = await window.ketcher.getSmarts()
  return smarts
}


export function initActiveTabs(data, accumulator) {
    return data.reduce(
      (acc, item) => ({
        ...acc,
        [item.id]: 'Info',
      }),
      accumulator
    );
  }
