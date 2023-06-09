const NETWORK = process.env.ZSH_CHAIN;
const Web3 = require('web3');
const fs = require('fs');
const marketContractABI = JSON.parse(fs.readFileSync('../tokenSalesABI', 'utf8'));
const { writeErrorLogConnection } = require('./logAction');

const chainEndpointMap = {
  klaytn: {
    endPoint: NETWORK === 'test' ? 'wss://node-api.klaytnapi.com/v1/ws/open?chain-id=1001' : 'wss://node-api.klaytnapi.com/v1/ws/open?chain-id=8217',
    marketContractAddress: NETWORK === 'test' ? '0xb34C4319d007e0245B4715839d08f448fE42eA09' : '0x03488dbEdE125106d67216a32A1746fce7947132',
    providerOptions: {
      timeout: 30000, // ms
      headers: {
        authorization: `Basic ${process.env.ZSH_KAS_AUTH}`,
      },
      clientConfig: {
        keepalive: true,
        keepaliveInterval: 60000, // ms
      },
      reconnect: {
        auto: true,
        delay: 3000, // ms
        maxAttempts: 5,
        onTimeout: false,
      },
    },
  },
  polygon: {
    endPoint: NETWORK === 'test' ? `wss://polygon-mumbai.g.alchemy.com/v2/${process.env.ZSH_POLYGON_API_KEY}` : `wss://polygon-mainnet.g.alchemy.com/v2/${process.env.ZSH_POLYGON_API_KEY}`,
    marketContractAddress: NETWORK === 'test' ? '0x11f46E8C1E2Ac861e662A62080ED6dC63041Ff94' : '0x79B9279803c179220A6A78781554B6D62861d812',
    providerOptions: {
      timeout: 30000, // ms
      clientConfig: {
        keepalive: true,
        keepaliveInterval: 60000, // ms
      },
      reconnect: {
        auto: true,
        delay: 5000, // ms
        maxAttempts: 5,
        onTimeout: false,
      },
    },
  },
  bsc: {
    endPoint: NETWORK === 'test' ? `wss://ws-nd-057-809-208.p2pify.com/${process.env.ZSH_BSC_API_KEY}` : `wss://ws-nd-120-875-210.p2pify.com/${process.env.ZSH_BSC_API_KEY}`,
    marketContractAddress: NETWORK === 'test' ? '0x23db713F8539aB8B18AC4A14794e4Ea66469936B' : '0x5D6be6B9179372ecC98b460A7C58bF292f67D9b6',
    providerOptions: {
      timeout: 30000, // ms
      clientConfig: {
        keepalive: true,
        keepaliveInterval: 60000, // ms
      },
      reconnect: {
        auto: true,
        delay: 5000, // ms
        maxAttempts: 5,
        onTimeout: false,
      },
    },
  },
};

function setWebsoketProvider(chain) {
  const { endPoint, marketContractAddress, providerOptions } = chainEndpointMap[chain];
  const provider = new Web3.providers.WebsocketProvider(endPoint, providerOptions);
  const web3 = new Web3(provider);
  const marketContract = new web3.eth.Contract(marketContractABI, marketContractAddress);

  return { provider, web3, marketContract };
}

function connectWebSocekt(provider, chain) {
  function connect() {
    provider.on('connect', () => {
      console.log(`Websocket connected : ${chain}`);
    });

    provider.on('close', (event) => {
      console.log(event);
      console.log('Websocket closed. Reconnecting...');
      writeErrorLogConnection(event, chain);
      setTimeout(connect, 1000);
    });

    provider.on('error', (error) => {
      writeErrorLogConnection(error, chain);
    });
  }
  connect();
}

module.exports = { setWebsoketProvider, connectWebSocekt };
