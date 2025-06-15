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
    result.textContent = `このハッシュはおそらく「${match.name}」です。`;
  } else {
    result.textContent = 'ハッシュの形式を特定できませんでした。';
  }
}

