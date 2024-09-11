/** @jsxImportSource frog/jsx */
import { Button, Frog, FrameIntent } from 'frog'
import { handle } from 'frog/vercel'
import { neynar } from 'frog/middlewares'
import axios from 'axios'

const app = new Frog({
  basePath: '/api',
  imageOptions: { width: 1200, height: 630 },
  title: 'Music NFT Viewer',
}).use(
  neynar({
    apiKey: 'NEYNAR_FROG_FM',
    features: ['interactor', 'cast'],
  })
)

const MUSIC_NFT_ADDRESS = '0x2953399124F0cBB46d2CbACD8A89cF0599974963'
const MUSIC_NFT_TOKEN_ID = '48322449810511513307546497526911080636141810138909813052644406601835649957889'
const ALCHEMY_API_KEY = 'pe-VGWmYoLZ0RjSXwviVMNIDLGwgfkao'
const ALCHEMY_API_URL = 'https://polygon-mainnet.g.alchemy.com/v2/'
const BACKGROUND_IMAGE = 'https://bafybeichmmtimnjxzhtwedhxwgjyrusqes7zie4glvbdnx6r7clvvc77ne.ipfs.w3s.link/Thumbnail%20(28).png'

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  animation_url?: string;
  external_url?: string;
  attributes: { trait_type: string; value: string }[];
}

async function getMusicNFTMetadata(): Promise<NFTMetadata | null> {
  const url = `${ALCHEMY_API_URL}${ALCHEMY_API_KEY}/getNFTMetadata`
  const params = {
    contractAddress: MUSIC_NFT_ADDRESS,
    tokenId: MUSIC_NFT_TOKEN_ID,
    tokenType: 'erc1155'
  }

  try {
    const response = await axios.get(url, { params })
    return response.data.metadata
  } catch (error) {
    console.error('Error fetching Music NFT:', error)
    return null
  }
}

app.frame('/', (c) => {
  return c.res({
    image: BACKGROUND_IMAGE,
    imageAspectRatio: '1.91:1',
    intents: [
      <Button action="/view-nft">View Music NFT</Button>
    ],
  })
})

app.frame('/view-nft', async (c) => {
  const nftMetadata = await getMusicNFTMetadata();

  if (!nftMetadata) {
    return c.res({
      image: (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #D6271C 0%, #A22219 50%, #871B14 51%, #6D1510 100%)',
          padding: '20px',
        }}>
          <p style={{ color: 'white', fontSize: '24px', textAlign: 'center' }}>Error fetching NFT metadata</p>
        </div>
      ),
      imageAspectRatio: '1.91:1',
      intents: [
        <Button action="/">Back</Button>
      ],
    })
  }

  const intents: FrameIntent[] = [
    <Button action="/">Back</Button>
  ];

  if (nftMetadata.animation_url) {
    intents.push(<Button action="link" value={nftMetadata.animation_url}>Play Music</Button>);
  }

  if (nftMetadata.external_url) {
    intents.push(<Button action="link" value={nftMetadata.external_url}>View on Marketplace</Button>);
  }

  return c.res({
    image: (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #D6271C 0%, #A22219 50%, #871B14 51%, #6D1510 100%)',
        padding: '20px',
      }}>
        <div style={{
          backgroundColor: 'rgba(30, 30, 30, 0.8)',
          padding: '20px',
          borderRadius: '10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: '90%',
        }}>
          <img
            src={nftMetadata.image}
            alt="NFT"
            style={{
              width: '300px',
              height: '300px',
              objectFit: 'contain',
              borderRadius: '5px',
            }}
          />
          <p style={{ color: 'white', fontSize: '24px', marginTop: '20px', textAlign: 'center' }}>
            {nftMetadata.name}
          </p>
          <p style={{ color: 'white', fontSize: '16px', marginTop: '10px', textAlign: 'center' }}>
            {nftMetadata.description}
          </p>
        </div>
      </div>
    ),
    imageAspectRatio: '1.91:1',
    intents: intents,
  })
})

export const GET = handle(app)
export const POST = handle(app)