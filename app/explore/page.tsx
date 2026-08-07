import type { Metadata } from 'next';
import SearchExplorer from '../components/SearchExplorer';
export const metadata:Metadata={title:'Find Saints and Observances',description:'Search editorially reviewed saints and Christian observances by name, date and tradition.',alternates:{canonical:'/explore'}};
export default function ExplorePage(){return <SearchExplorer/>}
