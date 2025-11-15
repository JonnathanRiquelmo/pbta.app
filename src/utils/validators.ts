export function validateSheetUpdate(userUid: string, sheet: { ownerUid?: string } | null | undefined): void {
  const owner = sheet?.ownerUid ?? ''
  if (!userUid || !owner || userUid !== owner) {
    throw new Error('Unauthorized')
  }
}