import { MegaverseService } from './services/megaverseService'

async function main() {
  const service = new MegaverseService()
  await service.createMegaverse()
}

main().catch((error) => {
  console.error('Error creating the megaverse:', error)
})
