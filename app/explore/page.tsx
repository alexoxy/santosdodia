import type { Metadata } from 'next';
import SearchExplorer from '../components/SearchExplorer';
export const metadata:Metadata={title:'Find a Patron Saint',description:'Search patron saints by profession, cause, place, date, name and Christian tradition.',alternates:{canonical:'/explore'}};
export default function ExplorePage(){return <SearchExplorer/>}
