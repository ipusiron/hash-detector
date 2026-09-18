'use strict';

(function () {
  const inputBox = document.getElementById('hashInput');
  const result = document.getElementById('result');
  const message = document.getElementById('message');
  let announceTimer;
  let hideTimer;

  function element(tag, text, className) {
    const node = document.createElement(tag);
    node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  function showMessage(text) {
    clearTimeout(announceTimer);
    clearTimeout(hideTimer);
    message.textContent = '';
    message.classList.remove('is-visible');
    // Repeated copies should also be announced by the status live region.
    announceTimer = setTimeout(() => {
      message.textContent = text;
      message.classList.add('is-visible');
      hideTimer = setTimeout(() => {
        message.classList.remove('is-visible');
        message.textContent = '';
      }, 3000);
    }, 0);
  }

  async function copyText(text) {
    try {
      if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
        showMessage('コピーに失敗しました');
        return;
      }
      await navigator.clipboard.writeText(text);
      showMessage('コピーしました');
    } catch {
      showMessage('コピーに失敗しました');
    }
  }

  function copyButton(label, accessibleLabel, text) {
    const button = element('button', label);
    button.type = 'button';
    button.setAttribute('aria-label', accessibleLabel);
    button.addEventListener('click', () => copyText(text));
    return button;
  }

  function identifyHash() {
    const identified = HashIdentifier.identify(inputBox.value);
    result.replaceChildren();
    if (identified.candidates.length === 0) {
      const unsupported = identified.kind === 'hex'
        ? `16進 ${identified.hexLength} 文字ですが、対応表にない長さです。` : '';
      result.append(element('p', unsupported + identified.caveat));
      return;
    }

    result.append(element('h2', '候補（可能性の高い順）'));
    result.append(element('p', identified.kind === 'prefix' ? '確度：高（接頭辞の形式）' : '確度：形式のみ'));
    result.append(element('p', '候補順は対応表の掲載順であり、確率を計算したものではありません。'));
    for (const candidate of identified.candidates) {
      const block = element('section', '', 'candidate');
      block.append(element('h3', candidate.name));
      block.append(element('p', `hashcatモード：${candidate.hashcat === null ? '—（要確認）' : candidate.hashcat}`));
      block.append(element('p', candidate.note));
      if (candidate.hashcat !== null) {
        const command = `hashcat -m ${candidate.hashcat} -a 0 hash.txt wordlist.txt`;
        const commandRow = element('div', '', 'command');
        commandRow.append(element('code', command));
        commandRow.append(copyButton('コマンドをコピー', `hashcat コマンドをコピー: ${candidate.name}`, command));
        block.append(commandRow);
      }
      result.append(block);
    }
    result.append(element('p', identified.caveat, 'caveat'));
    const links = element('p', '', 'reference-links');
    for (const [label, url] of [
      ['🔗 CrackStation を開く', 'https://crackstation.net/'],
      ['🔗 hashcat の例ハッシュ一覧', 'https://hashcat.net/wiki/doku.php?id=example_hashes']
    ]) {
      const link = element('a', label);
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      links.append(link);
    }
    result.append(links);
    result.append(copyButton('📋 ハッシュをコピー', 'ハッシュをコピー', identified.input));
  }

  inputBox.addEventListener('input', identifyHash);
  document.querySelectorAll('.sample').forEach(button => {
    button.addEventListener('click', () => {
      inputBox.value = button.dataset.hash;
      identifyHash();
    });
  });
  identifyHash();
}());
