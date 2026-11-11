import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Santos do Dia',
    short_name: 'Santos do Dia',
    description: 'Discover who is celebrated today in your place and Christian tradition.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fbf8f1',
    theme_color: '#102a43',
    categories: ['education', 'reference', 'lifestyle'],
    lang: 'en'
  };
}
