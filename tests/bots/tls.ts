// Uçtan uca testin şifreli bağlantısı: test başında kendinden imzalı sertifika üretilir ve
// sunucunun önüne Caddy gibi TLS'i sonlandıran küçük bir vekil konur (A14 "gerçek şifreli
// bağlantı"). Sertifika ve anahtar yalnızca test klasöründe durur, test sonunda silinir.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { connect as netConnect } from 'node:net';
import { join } from 'node:path';
import { createServer, type Server } from 'node:tls';

export interface TestCert {
  key: Buffer;
  cert: Buffer;
}

export function makeSelfSignedCert(dir: string): TestCert {
  const keyPath = join(dir, 'key.pem');
  const certPath = join(dir, 'cert.pem');
  execFileSync(
    'openssl',
    [
      'req',
      '-x509',
      '-newkey',
      'rsa:2048',
      '-nodes',
      '-keyout',
      keyPath,
      '-out',
      certPath,
      '-days',
      '1',
      '-subj',
      '/CN=localhost',
      '-addext',
      'subjectAltName=DNS:localhost',
    ],
    { stdio: 'ignore' },
  );
  return { key: readFileSync(keyPath), cert: readFileSync(certPath) };
}

/** TLS'i sonlandırıp 127.0.0.1:<hedef> kapısına ileten vekil. */
export function startTlsProxy(
  cert: TestCert,
  listenPort: number,
  targetPort: number,
): Promise<Server> {
  const server = createServer(
    { key: cert.key, cert: cert.cert, minVersion: 'TLSv1.2' },
    (client) => {
      const upstream = netConnect(targetPort, '127.0.0.1');
      client.pipe(upstream).pipe(client);
      const close = () => {
        client.destroy();
        upstream.destroy();
      };
      client.on('error', close);
      upstream.on('error', close);
      client.on('close', close);
      upstream.on('close', close);
    },
  );
  return new Promise((resolve) => server.listen(listenPort, '127.0.0.1', () => resolve(server)));
}
