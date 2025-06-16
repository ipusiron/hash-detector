function identifyHash() {
  const input = document.getElementById('hashInput').value.trim();
  const result = document.getElementById('result');

  const patterns = [
    { name: 'MD5', regex: /^[a-f0-9]{32}$/i },
    { name: 'SHA-1', regex: /^[a-f0-9]{40}$/i },
    { name: 'SHA-256', regex: /^[a-f0-9]{64}$/i },
    { name: 'SHA-512', regex: /^[a-f0-9]{128}$/i },
    { name: 'bcrypt', regex: /^\$2[aby]?\$[0-9]{2}\$[./A-Za-z0-9]{53}$/ },
    { name: 'NTLM', regex: /^[A-F0-9]{32}$/ }
  ];

  const match = patterns.find(p => p.regex.test(input));

  if (match) {
    result.innerHTML = `
  このハッシュはおそらく「${match.name}」です。<br>
  <a href="https://crackstation.net/" target="_blank" rel="noopener noreferrer">🔗 CrackStationを開く</a>
  <button onclick="copyHash()">📋 コピー</button>
`;
  } else {
    result.textContent = 'ハッシュの形式を特定できませんでした。';
  }
}

function setHash(el) {
  const inputBox = document.getElementById('hashInput');
  inputBox.value = el.textContent;
  identifyHash();
}

function copyHash() {
  const hash = document.getElementById('hashInput').value.trim();
  navigator.clipboard.writeText(hash).then(() => {
    alert("ハッシュをコピーしました！");
  }).catch(err => {
    alert("コピーに失敗しました：" + err);
  });
}

// 🔄 入力に応じて即時判定
document.getElementById('hashInput').addEventListener('input', identifyHash);
window.setHash = setHash;


