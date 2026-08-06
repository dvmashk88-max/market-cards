# Backend CA certificates

`russian-trusted-root-ca.pem` is the public Russian Trusted Root CA distributed by
the official Gosuslugi certificate page: <https://www.gosuslugi.ru/crt>.
The PEM download is hosted at
<https://gu-st.ru/content/lending/russian_trusted_root_ca_pem.crt>.

SHA-256 fingerprint:
`D2:6D:2D:02:31:B7:C3:9F:92:CC:73:85:12:BA:54:10:35:19:E4:40:5D:68:B5:BD:70:3E:97:88:CA:8E:CF:31`.

Railway sets `NODE_EXTRA_CA_CERTS` to this PEM file so Node.js retains normal TLS
verification while trusting the certificate chain used by the Alfa Bank gateway.
