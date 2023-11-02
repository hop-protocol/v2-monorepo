export function chainIdToSlug (chainId: number) {
  const slugMap: any = {
    5: 'ethereum',
    420: 'optimism'
  }

  return slugMap[chainId]
}
