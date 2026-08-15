# AdSense / Search Console runtime values

These values are public identifiers/tokens, not account passwords. Configure them in the normal Cloudflare build/runtime environment; do not hard-code real values in source control.

```text
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
NEXT_PUBLIC_ADSENSE_CODE_ENABLED=true
NEXT_PUBLIC_ADSENSE_ENABLED=false
NEXT_PUBLIC_ADSENSE_TOP_SLOT=
NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT=
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
```

During AdSense review keep `NEXT_PUBLIC_ADSENSE_ENABLED=false`. This publishes the association code and `google-adsense-account` meta tag without enabling manual units.

After the site status is Ready, CMP is configured, and real ad units exist, set the numeric top/sidebar slot IDs and change `NEXT_PUBLIC_ADSENSE_ENABLED=true`.
