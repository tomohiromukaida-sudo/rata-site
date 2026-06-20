// Turso (libSQL) HTTP API への直接アクセス
//
// @libsql/client SDKは一部のデータベース構成で
// "Unexpected status code while fetching migration jobs: 400" という
// 既知の不具合を起こすことがあるため、SDKを使わずTursoのHTTP Pipeline APIに
// 直接アクセスする。ファイル名が "_" で始まるため、Vercelはこれをルートとして扱わない。

function toHttpUrl(libsqlUrl) {
  return libsqlUrl.replace(/^libsql:\/\//, 'https://') + '/v2/pipeline';
}

function toArg(value) {
  if (value === null || value === undefined) return { type: 'null' };
  if (typeof value === 'number') return { type: 'integer', value: String(value) };
  return { type: 'text', value: String(value) };
}

export async function tursoExecute(sql, args = []) {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;
  if (!url || !token) {
    throw new Error('TURSO_DATABASE_URL / TURSO_AUTH_TOKEN が設定されていません。');
  }

  const res = await fetch(toHttpUrl(url), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        { type: 'execute', stmt: { sql, args: args.map(toArg) } },
        { type: 'close' },
      ],
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`Turso HTTP ${res.status}: ${JSON.stringify(data)}`);
  }

  const errorResult = data.results?.find((r) => r.type === 'error');
  if (errorResult) {
    throw new Error(`Turso query error: ${JSON.stringify(errorResult.error)}`);
  }

  return data.results?.[0]?.response?.result ?? null;
}

// Hranaのrows形式 ({cols:[{name}], rows:[[{type,value}]]}) をプレーンなオブジェクト配列に変換
export function rowsToObjects(result) {
  if (!result || !result.rows) return [];
  const cols = result.cols.map((c) => c.name);
  return result.rows.map((row) => {
    const obj = {};
    cols.forEach((name, i) => {
      const cell = row[i];
      obj[name] = cell && cell.type !== 'null' ? cell.value : null;
    });
    return obj;
  });
}
