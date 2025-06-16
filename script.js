function identifyHash() {
  const input = document.getElementById('hashInput').value.trim();
  const result = document.getElementById('result');

  const patterns = [
    { name: 'MD5', regex: /^[a-f0-9]{32}$/i, hashcat: 0 },
    { name: 'SHA-1', regex: /^[a-f0-9]{40}$/i, hashcat: 100 },
    { name: 'SHA-256', regex: /^[a-f0-9]{64}$/i, hashcat: 1400 },
    { name: 'SHA-512', regex: /^[a-f0-9]{128}$/i, hashcat: 1700 },
    { name: 'bcrypt', regex: /^\$2[aby]?\$[0-9]{2}\$[./A-Za-z0-9]{53}$/, hashcat: 3200 },
    { name: 'NTLM', regex: /^[A-F0-9]{32}$/, hashcat: 1000 }
  ];

  if (input === '') {
    result.textContent = '';
    return;
  }

  const match = patterns.find(p => p.regex.test(input));

  if (match) {
    let reason = '';

    if (match.name === 'MD5') {
      reason = '32文字の16進数 → MD5の形式と一致';
    } else if (match.name === 'SHA-1') {
      reason = '40文字の16進数 → SHA-1形式と一致';
    } else if (match.name === 'SHA-256') {
      reason = '64文字の16進数 → SHA-256形式と一致';
    } else if (match.name === 'SHA-512') {
      reason = '128文字の16進数 → SHA-512形式と一致';
    } else if (match.name === 'bcrypt') {
      reason = '先頭が $2a$ / $2b$ など → bcrypt形式';
    } else if (match.name === 'NTLM') {
      reason = '32文字の英大文字 → NTLM形式の可能性';
    }

    result.innerHTML = `
    このハッシュはおそらく「${match.name}」です。<br>
    🔎 判定根拠：${reason}<br>
    💻 Hashcat mode: ${match.hashcat}<br>
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

// 🔁 HTMLから setHash() を呼べるように公開
window.setHash = setHash;

window.copyHash = copyHash;
