'use strict';

(function () {
  const inputBox = document.getElementById('hashInput');
  const result = document.getElementById('result');
  const message = document.getElementById('message');
  const langToggle = document.getElementById('langToggle');
  let announceTimer;
  let hideTimer;
  // 表示中のトーストの中身は、文言そのものではなくキーで覚える。
  // 言語を切り替えたときに訳し直せるようにするため。
  let messageKey = null;
  let messageValues = {};

  function element(tag, text, className) {
    const node = document.createElement(tag);
    node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  function showMessage(key, values = {}) {
    clearTimeout(announceTimer);
    clearTimeout(hideTimer);
    messageKey = null;
    message.textContent = '';
    message.dataset.key = '';
    message.classList.remove('is-visible');
    // Repeated copies should also be announced by the status live region.
    announceTimer = setTimeout(() => {
      messageKey = key;
      messageValues = values;
      message.textContent = I18n.t(key, values);
      message.dataset.key = key;
      message.classList.add('is-visible');
      hideTimer = setTimeout(() => {
        messageKey = null;
        message.classList.remove('is-visible');
        message.textContent = '';
        message.dataset.key = '';
      }, 3000);
    }, 0);
  }

  async function copyText(text) {
    try {
      if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
        showMessage('copy.failed');
        return;
      }
      await navigator.clipboard.writeText(text);
      showMessage('copy.done');
    } catch {
      showMessage('copy.failed');
    }
  }

  function copyButton(labelKey, accessibleKey, accessibleValues, text) {
    const button = element('button', I18n.t(labelKey));
    button.type = 'button';
    button.setAttribute('aria-label', I18n.t(accessibleKey, accessibleValues));
    button.addEventListener('click', () => copyText(text));
    return button;
  }

  function candidateName(candidate) {
    return candidate.nameKey ? I18n.t(candidate.nameKey) : candidate.name;
  }

  function identifyHash() {
    const identified = HashIdentifier.identify(inputBox.value);
    const caveat = I18n.t(identified.caveat.key, identified.caveat.params);
    result.replaceChildren();
    // 状態は表示中の文言ではなく dataset で持つ（言語を変えても壊れないように）
    result.dataset.kind = identified.input === '' ? 'empty' : identified.kind;
    result.dataset.candidates = String(identified.candidates.length);
    // 空欄はまだ何も尋ねられていない状態。読み上げ領域に「一致しませんでした」を出さない
    if (identified.input === '') return;
    if (identified.candidates.length === 0) {
      const unsupported = identified.kind === 'hex'
        ? I18n.t('result.unsupportedLength', { length: identified.hexLength }) + I18n.t('text.sentenceJoin')
        : '';
      result.append(element('p', unsupported + caveat));
      return;
    }

    result.append(element('h2', I18n.t('result.heading')));
    result.append(element('p', I18n.t(identified.kind === 'prefix' ? 'result.confidencePrefix' : 'result.confidenceHex')));
    result.append(element('p', I18n.t('result.orderNote')));
    for (const candidate of identified.candidates) {
      const name = candidateName(candidate);
      const block = element('section', '', 'candidate');
      block.append(element('h3', name));
      const mode = candidate.hashcat === null ? I18n.t('result.modeUnknown') : String(candidate.hashcat);
      block.append(element('p', I18n.t('result.mode', { mode })));
      block.append(element('p', I18n.t(candidate.note)));
      if (candidate.hashcat !== null) {
        const command = `hashcat -m ${candidate.hashcat} -a 0 hash.txt wordlist.txt`;
        const commandRow = element('div', '', 'command');
        commandRow.append(element('code', command));
        commandRow.append(copyButton('copy.command', 'copy.commandAria', { name }, command));
        block.append(commandRow);
      }
      result.append(block);
    }
    result.append(element('p', caveat, 'caveat'));
    const links = element('p', '', 'reference-links');
    for (const [labelKey, url] of [
      ['link.crackstation', 'https://crackstation.net/'],
      ['link.hashcatExamples', 'https://hashcat.net/wiki/doku.php?id=example_hashes']
    ]) {
      const link = element('a', I18n.t(labelKey));
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      links.append(link);
    }
    result.append(links);
    result.append(copyButton('copy.hash', 'copy.hashAria', {}, identified.input));
  }

  I18n.init();
  langToggle.addEventListener('click', () => I18n.setLanguage(I18n.language === 'ja' ? 'en' : 'ja'));
  document.addEventListener('languagechange', () => {
    identifyHash();
    if (messageKey) message.textContent = I18n.t(messageKey, messageValues);
  });

  inputBox.addEventListener('input', identifyHash);
  document.querySelectorAll('.sample').forEach(button => {
    button.addEventListener('click', () => {
      inputBox.value = button.dataset.hash;
      identifyHash();
    });
  });
  identifyHash();
}());
