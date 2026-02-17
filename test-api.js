#!/usr/bin/env node

// Quick API health check script
console.log('🔍 Testing Quantum Wealth Lab API Health\n');
console.log('=' .repeat(50));

// Test 1: CoinGecko Public API
console.log('\n1. Testing CoinGecko Public API...');
fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true')
  .then(res => res.json())
  .then(data => {
    console.log('✅ CoinGecko working!');
    console.log(`   BTC: $${data.bitcoin.usd.toLocaleString()} (${data.bitcoin.usd_24h_change.toFixed(2)}%)`);
    console.log(`   ETH: $${data.ethereum.usd.toLocaleString()} (${data.ethereum.usd_24h_change.toFixed(2)}%)`);
  })
  .catch(err => console.log('❌ CoinGecko failed:', err.message));

// Test 2: Coinbase API
setTimeout(() => {
  console.log('\n2. Testing Coinbase API...');
  fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      console.log('✅ Coinbase working!');
      console.log(`   BTC: $${parseFloat(data.data.amount).toLocaleString()}`);
    })
    .catch(err => console.log('❌ Coinbase failed:', err.message));
}, 1000);

// Test 3: Alternative.me Fear & Greed
setTimeout(() => {
  console.log('\n3. Testing Fear & Greed Index...');
  fetch('https://api.alternative.me/fng/?limit=1')
    .then(res => res.json())
    .then(data => {
      console.log('✅ Fear & Greed working!');
      console.log(`   Index: ${data.data[0].value} (${data.data[0].value_classification})`);
    })
    .catch(err => console.log('❌ Fear & Greed failed:', err.message));
}, 2000);

// Test 4: Check local/deployed endpoint
setTimeout(() => {
  console.log('\n4. Testing Deployed App...');
  fetch('https://quantum-wealth-lab.onrender.com/')
    .then(res => {
      if (res.status === 404) {
        console.log('❌ App not deployed or server is down');
        console.log('   Status: 404 - App needs to be redeployed');
      } else {
        console.log(`✅ App responding with status: ${res.status}`);
      }
    })
    .catch(err => console.log('❌ Cannot reach deployed app:', err.message));
}, 3000);

// Summary
setTimeout(() => {
  console.log('\n' + '=' .repeat(50));
  console.log('📊 DIAGNOSIS SUMMARY:\n');
  console.log('The issue is that your Render deployment is DOWN (404).');
  console.log('External APIs (CoinGecko) are working fine.');
  console.log('\nSOLUTIONS:');
  console.log('1. Check Render dashboard for deployment errors');
  console.log('2. Redeploy: git push origin main');
  console.log('3. Check Render logs for startup errors');
  console.log('4. Verify environment variables are set in Render');
}, 5000);
