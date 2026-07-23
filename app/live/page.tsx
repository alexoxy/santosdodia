import type { Metadata } from 'next';
import LiveDirectory from '../components/LiveDirectory';

export const metadata:Metadata={title:'Christian Celebrations Live',description:'Official live pages and media archives from Roman Catholic, Orthodox, Anglican and Oriental Orthodox Christian traditions.',alternates:{canonical:'/live'}};
export default function LivePage(){return <LiveDirectory/>}
