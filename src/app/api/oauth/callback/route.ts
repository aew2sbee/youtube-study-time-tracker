import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // エラーがある場合の処理
  if (error) {
    return NextResponse.json(
      {
        error: 'OAuth認証がキャンセルされました',
        details: error
      },
      { status: 400 }
    );
  }

  // 認証コードがない場合の処理
  if (!code) {
    return NextResponse.json(
      { error: '認証コードが見つかりません' },
      { status: 400 }
    );
  }

  // 成功時のレスポンス（認証コードを表示）
  return new NextResponse(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>OAuth認証完了</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 600px;
          margin: 50px auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .success {
          color: #22c55e;
          font-size: 24px;
          margin-bottom: 20px;
        }
        .code-container {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          padding: 15px;
          margin: 20px 0;
          word-break: break-all;
          font-family: 'Courier New', monospace;
        }
        .instructions {
          background: #e3f2fd;
          border-left: 4px solid #2196f3;
          padding: 15px;
          margin: 20px 0;
        }
        button {
          background: #2196f3;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          margin: 10px 5px 0 0;
        }
        button:hover {
          background: #1976d2;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="success">✅ OAuth認証が完了しました!</div>

        <div class="instructions">
          <strong>📋 次の手順:</strong><br>
          1. 下記の認証コードをコピーしてください<br>
          2. ターミナルに戻って認証コードを貼り付けてください
        </div>

        <div>
          <strong>🔑 認証コード:</strong>
          <div class="code-container" id="authCode">${code}</div>
        </div>

        <button onclick="copyCode()">📋 コードをコピー</button>
        <button onclick="window.close()">❌ ウィンドウを閉じる</button>
      </div>

      <script>
        function copyCode() {
          const codeElement = document.getElementById('authCode');
          const textArea = document.createElement('textarea');
          textArea.value = codeElement.textContent;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);

          const button = event.target;
          const originalText = button.textContent;
          button.textContent = '✅ コピーしました！';
          button.style.background = '#22c55e';

          setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '#2196f3';
          }, 2000);
        }

        // ページロード時に自動でコードを選択
        window.onload = function() {
          const codeElement = document.getElementById('authCode');
          if (window.getSelection) {
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(codeElement);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        };
      </script>
    </body>
    </html>
  `, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
