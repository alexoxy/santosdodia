import type { Metadata } from 'next';
import LiturgyExplorer from '../components/LiturgyExplorer';

export const metadata:Metadata={
 title:'Liturgy of any day',
 description:'Complete Roman Catholic liturgical information for any selected date, language, national calendar or diocesan calendar.'
};

export default function LiturgyPage(){return <LiturgyExplorer/>}
