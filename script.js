const inputText = document.getElementById('inputText');
const charCount = document.getElementById('charCount');
const formatSelect = document.getElementById('formatSelect');
const summarizeBtn = document.getElementById('summarizeBtn');
const outputArea = document.getElementById('outputArea');
const copyBtn = document.getElementById('copyBtn');

// 文字数カウント
inputText.addEventListener('input', () => {
    charCount.textContent = inputText.value.length + '文字';
});

// 要約実行
summarizeBtn.addEventListener('click', async () => {
    const text = inputText.value.trim();
    if (!text) {
        outputArea.innerHTML = '<p class="placeholder-text">テキストを入力してください。</p>';
        return;
    }

    summarizeBtn.disabled = true;
    summarizeBtn.textContent = '要約中...';
    copyBtn.style.display = 'none';
    outputArea.innerHTML = '<div class="loading"><div class="loading-dots"><span></span><span></span><span></span></div><span>AIが要約しています</span></div>';

    try {
        const response = await fetch('/api/summarize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: text,
                format: formatSelect.value
            })
        });

        if (!response.ok) throw new Error('APIエラー');

        const data = await response.json();
        outputArea.textContent = data.summary;
        copyBtn.style.display = 'block';
    } catch (error) {
        outputArea.innerHTML = '<p style="color:#c55;">エラーが発生しました。しばらくしてからもう一度お試しください。</p>';
    }

    summarizeBtn.disabled = false;
    summarizeBtn.textContent = '要約する';
});

// コピー
copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(outputArea.textContent).then(() => {
        const original = copyBtn.textContent;
        copyBtn.textContent = 'コピーしました';
        setTimeout(() => { copyBtn.textContent = original; }, 1500);
    });
});
